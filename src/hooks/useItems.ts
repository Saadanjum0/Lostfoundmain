import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, uploadFile } from '@/lib/supabase'
import { 
  Item, 
  ItemInsert, 
  ItemUpdate, 
  ItemWithDetails, 
  Category, 
  Location 
} from '@/lib/database.types'
import { useAuth } from '@/contexts/AuthContext'

// Query Keys
export const ITEMS_QUERY_KEYS = {
  all: ['items'] as const,
  lists: () => [...ITEMS_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...ITEMS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...ITEMS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ITEMS_QUERY_KEYS.details(), id] as const,
  categories: ['categories'] as const,
  locations: ['locations'] as const,
  userItems: (userId: string) => [...ITEMS_QUERY_KEYS.all, 'user', userId] as const,
  search: (query: string) => [...ITEMS_QUERY_KEYS.all, 'search', query] as const,
}

// Fetch Items with filters
export const useItems = (filters?: {
  itemType?: 'lost' | 'found'
  category?: string
  location?: string
  status?: string
  limit?: number
  offset?: number
  includeAllStatuses?: boolean // For admin use
}) => {
  return useQuery({
    queryKey: ITEMS_QUERY_KEYS.list(filters),
    queryFn: async (): Promise<Item[]> => {
      let query = supabase
        .from('items')
        .select(`
          *,
          profiles!user_id(id, full_name, avatar_url, student_id)
        `)
        .order('created_at', { ascending: false })

      // Only filter by approved status if not explicitly including all statuses
      if (!filters?.includeAllStatuses) {
        query = query.eq('status', 'approved')
      }

      if (filters?.itemType) {
        query = query.eq('item_type', filters.itemType)
      }
      if (filters?.category) {
        query = query.ilike('category', `%${filters.category}%`)
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Item[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Fetch single item with details
export const useItem = (itemId: string) => {
  return useQuery({
    queryKey: ITEMS_QUERY_KEYS.detail(itemId),
    queryFn: async (): Promise<Item | null> => {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles!user_id(id, full_name, avatar_url, student_id, phone_number, email)
        `)
        .eq('id', itemId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      // Track view
      if (data) {
        await supabase
          .from('item_views')
          .insert({ 
            item_id: itemId,
            user_id: (await supabase.auth.getUser()).data.user?.id || null
          })
      }

      return data as Item
    },
    enabled: !!itemId,
  })
}

// Note: useUserItems is now in a separate file at @/hooks/useUserItems
// This avoids naming conflicts and provides better organization

// Search items
export const useSearchItems = (searchQuery: string, filters?: {
  itemType?: 'lost' | 'found'
  category?: string
  location?: string
  dateFrom?: string
  dateTo?: string
}) => {
  return useQuery({
    queryKey: ITEMS_QUERY_KEYS.search(searchQuery + JSON.stringify(filters)),
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select(`
          *,
          profiles!user_id(id, full_name, avatar_url)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      // Add search filters
      if (searchQuery && searchQuery.trim() !== '') {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      if (filters?.itemType) {
        query = query.eq('item_type', filters.itemType)
      }
      if (filters?.category) {
        query = query.ilike('category', `%${filters.category}%`)
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters?.dateFrom) {
        query = query.gte('date_lost_found', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('date_lost_found', filters.dateTo)
      }

      query = query.limit(20)

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: searchQuery.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Fetch categories
export const useCategories = () => {
  return useQuery({
    queryKey: ITEMS_QUERY_KEYS.categories,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        throw error
      }
      
      return data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Fetch locations
export const useLocations = () => {
  return useQuery({
    queryKey: ITEMS_QUERY_KEYS.locations,
    queryFn: async (): Promise<Location[]> => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching locations:', error)
        throw error
      }
      
      return data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Create item mutation
export const useCreateItem = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: {
      item: Omit<ItemInsert, 'user_id'>
      images?: File[]
    }): Promise<Item> => {
      if (!user) throw new Error('User not authenticated')

      // Upload images if any
      let imageUrls: string[] = []
      if (data.images && data.images.length > 0) {
        try {
          const uploadPromises = data.images.map(async (file, index) => {
            const fileName = `${user.id}/${Date.now()}-${index}-${file.name}`
            return uploadFile('item-images', file, fileName)
          })
          imageUrls = await Promise.all(uploadPromises)
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError)
          throw new Error('Failed to upload images')
        }
      }

      // Prepare the item data with explicit defaults
      const itemData = {
        ...data.item,
        user_id: user.id,
        images: imageUrls.length > 0 ? imageUrls : null,
        status: 'pending' as const, // Explicitly set status
        views_count: 0,
        is_urgent: data.item.is_urgent || false,
        // Remove created_at and updated_at - these are auto-generated by database
      }

      // Create item
      const { data: item, error } = await supabase
        .from('items')
        .insert(itemData)
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Database error: ${error.message}${error.details ? ` (${error.details})` : ''}`)
      }

      return item
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.userItems(user?.id || '') })
    },
  })
}

// Update item mutation
export const useUpdateItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: string
      updates: ItemUpdate
      newImages?: File[]
    }): Promise<Item> => {
      let imageUrls: string[] | undefined

      // Upload new images if any
      if (data.newImages && data.newImages.length > 0) {
        const { user } = await supabase.auth.getUser()
        if (!user.data.user) throw new Error('User not authenticated')

        const uploadPromises = data.newImages.map(async (file, index) => {
          const fileName = `${user.data.user!.id}/${Date.now()}-${index}-${file.name}`
          return uploadFile('item-images', file, fileName)
        })
        imageUrls = await Promise.all(uploadPromises)
      }

      // Update item
      const updateData = { ...data.updates }
      if (imageUrls) {
        updateData.images = imageUrls
      }

      const { data: item, error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw error
      return item
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.detail(updatedItem.id) })
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.userItems(updatedItem.user_id) })
    },
  })
}

// Delete item mutation
export const useDeleteItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.lists() })
    },
  })
}

// Mark item as resolved mutation
export const useResolveItem = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('items')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (resolvedItem) => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.detail(resolvedItem.id) })
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEYS.userItems(resolvedItem.user_id) })
    },
  })
}

// Get recent items (for homepage)
export const useRecentItems = (limit: number = 6) => {
  return useQuery({
    queryKey: [...ITEMS_QUERY_KEYS.lists(), 'recent', limit],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles:profiles(id, full_name, avatar_url)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent items:', error)
        throw error
      }
      
      return data as Item[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
} 