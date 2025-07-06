import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { 
  Message, 
  MessageInsert, 
  Conversation, 
  ConversationWithDetails,
  MessageWithSender,
  Notification,
  NotificationInsert
} from '@/lib/database.types'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import type { 
  SendMessageRequest, 
  AddReactionRequest,
  UseMessagesResult 
} from '@/lib/messaging.types'

// Query Keys
export const MESSAGES_QUERY_KEYS = {
  all: ['messages'] as const,
  conversations: () => [...MESSAGES_QUERY_KEYS.all, 'conversations'] as const,
  conversation: (id: string) => [...MESSAGES_QUERY_KEYS.conversations(), id] as const,
  conversationMessages: (id: string) => [...MESSAGES_QUERY_KEYS.conversation(id), 'messages'] as const,
  notifications: () => ['notifications'] as const,
  unreadCount: () => [...MESSAGES_QUERY_KEYS.notifications(), 'unread'] as const,
}

// Get user conversations
export const useConversations = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.conversations(),
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase.rpc('get_user_conversations', {
        user_id: user.id
      })

      if (error) throw error
      return data
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Get messages for a specific conversation
export const useConversationMessages = (conversationId: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.conversationMessages(conversationId),
    queryFn: async (): Promise<MessageWithSender[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as MessageWithSender[]
    },
    enabled: !!conversationId && !!user,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  })
}

// Get user notifications
export const useNotifications = (limit: number = 50) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...MESSAGES_QUERY_KEYS.notifications(), limit],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return []

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Get unread notifications count
export const useUnreadNotificationsCount = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: MESSAGES_QUERY_KEYS.unreadCount(),
    queryFn: async (): Promise<number> => {
      if (!user) return 0

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error
      return count || 0
    },
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

// Send message mutation
export const useSendMessage = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: {
      receiverId: string
      itemId?: string
      content: string
      messageType?: 'text' | 'image' | 'system'
    }) => {
      if (!user) throw new Error('User not authenticated')

      // Get or create conversation
      let conversationId: string
      if (data.itemId) {
        const { data: conversation, error: convError } = await supabase.rpc(
          'get_or_create_conversation',
          {
            user1_id: user.id,
            user2_id: data.receiverId,
            item_id: data.itemId
          }
        )
        
        if (convError) throw convError
        conversationId = conversation
      } else {
        // Handle direct messages without item context
        const { data: existingConv, error } = await supabase
          .from('conversations')
          .select('id')
          .or(`and(participant_1.eq.${user.id},participant_2.eq.${data.receiverId}),and(participant_1.eq.${data.receiverId},participant_2.eq.${user.id})`)
          .is('item_id', null)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (existingConv) {
          conversationId = existingConv.id
        } else {
          const { data: newConv, error: newConvError } = await supabase
            .from('conversations')
            .insert({
              participant_1: user.id < data.receiverId ? user.id : data.receiverId,
              participant_2: user.id < data.receiverId ? data.receiverId : user.id,
              item_id: null
            })
            .select('id')
            .single()

          if (newConvError) throw newConvError
          conversationId = newConv.id
        }
      }

      // Send message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: data.receiverId,
          item_id: data.itemId || null,
          content: data.content,
          message_type: data.messageType || 'text'
        })
        .select()
        .single()

      if (error) throw error

      // Update conversation last message
      await supabase
        .from('conversations')
        .update({
          last_message_id: message.id,
          last_message_at: message.created_at
        })
        .eq('id', conversationId)

      // Create notification for receiver
      await supabase.rpc('create_notification', {
        p_user_id: data.receiverId,
        p_type: 'message_received',
        p_title: 'New Message',
        p_message: `You have a new message from ${user.email}`,
        p_sender_id: user.id,
        p_item_id: data.itemId || null
      })

      return message
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.conversations() })
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.all })
    },
  })
}

// Mark message as read mutation
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.all })
    },
  })
}

// Mark all notifications as read mutation
export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)

      if (notificationIds) {
        query = query.in('id', notificationIds)
      }

      const { error } = await query

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.notifications() })
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.unreadCount() })
    },
  })
}

// Delete message mutation (soft delete)
export const useDeleteMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.all })
    },
  })
}

// Create notification mutation (for admin/system use)
export const useCreateNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notification: Omit<NotificationInsert, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: notification.user_id,
        p_type: notification.type,
        p_title: notification.title,
        p_message: notification.message,
        p_data: notification.data || null,
        p_item_id: notification.item_id || null,
        p_sender_id: notification.sender_id || null,
        p_action_url: notification.action_url || null
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.notifications() })
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEYS.unreadCount() })
    },
  })
}

// Hook for real-time message updates
export const useRealtimeMessages = (conversationId: string) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['realtime-messages', conversationId],
    queryFn: () => null,
    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    meta: {
      subscriptionSetup: () => {
        if (!user || !conversationId) return null

        const subscription = supabase
          .channel(`messages-${conversationId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `item_id=eq.${conversationId}`
            },
            () => {
              queryClient.invalidateQueries({ 
                queryKey: MESSAGES_QUERY_KEYS.conversationMessages(conversationId) 
              })
              queryClient.invalidateQueries({ 
                queryKey: MESSAGES_QUERY_KEYS.conversations() 
              })
            }
          )
          .subscribe()

        return subscription
      }
    }
  })
}

// Hook for real-time notifications
export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['realtime-notifications'],
    queryFn: () => null,
    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    meta: {
      subscriptionSetup: () => {
        if (!user) return null

        const subscription = supabase
          .channel(`notifications-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              queryClient.invalidateQueries({ 
                queryKey: MESSAGES_QUERY_KEYS.notifications() 
              })
              queryClient.invalidateQueries({ 
                queryKey: MESSAGES_QUERY_KEYS.unreadCount() 
              })
            }
          )
          .subscribe()

        return subscription
      }
    }
  })
}

export function useMessages(conversationId: string): UseMessagesResult {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  // Query to fetch messages for a conversation
  const {
    data: messages = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: async () => {
      if (!conversationId || !user?.id) return []
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id, full_name, avatar_url
          ),
          reply_to:messages!messages_reply_to_id_fkey(
            id, content, created_at,
            sender:profiles!messages_sender_id_fkey(
              id, full_name, avatar_url
            )
          ),
          attachments:message_attachments(*),
          reactions:message_reactions(
            *,
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (error) {
        console.error('Error fetching messages:', error)
        throw error
      }

      // Check if there are more messages
      if (data.length < PAGE_SIZE) {
        setHasMore(false)
      }

      // Return messages in chronological order (oldest first)
      return data.reverse() as Message[]
    },
    enabled: !!conversationId && !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Mutation to send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (request: SendMessageRequest) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: request.conversation_id,
          sender_id: user.id,
          content: request.content,
          message_type: request.message_type || 'text',
          reply_to_id: request.reply_to_id,
          metadata: request.metadata || {},
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id, full_name, avatar_url
          ),
          reply_to:messages!messages_reply_to_id_fkey(
            id, content, created_at,
            sender:profiles!messages_sender_id_fkey(
              id, full_name, avatar_url
            )
          )
        `)
        .single()

      if (error) throw error
      return data as Message
    },
    onSuccess: (newMessage) => {
      // Add the new message to the query cache
      queryClient.setQueryData(['messages', conversationId, page], (oldData: Message[] = []) => {
        return [...oldData, newMessage]
      })
      
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // Mutation to edit a message
  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('messages')
        .update({
          content,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', user.id)
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id, full_name, avatar_url
          )
        `)
        .single()

      if (error) throw error
      return data as Message
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })

  // Mutation to delete a message (soft delete)
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('messages')
        .update({
          deleted_at: new Date().toISOString(),
          content: '[This message was deleted]',
        })
        .eq('id', messageId)
        .eq('sender_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })

  // Mutation to add a reaction
  const addReactionMutation = useMutation({
    mutationFn: async (request: AddReactionRequest) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: request.message_id,
          user_id: user.id,
          reaction_type: request.reaction_type,
        })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })

  // Mutation to remove a reaction
  const removeReactionMutation = useMutation({
    mutationFn: async ({ messageId, reactionType }: { messageId: string; reactionType: string }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })

  // Function to load more messages (pagination)
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  // Set up real-time subscriptions for new messages
  useEffect(() => {
    if (!conversationId || !user?.id) return

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the full message with relations
          const { data: newMessage } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(
                id, full_name, avatar_url
              ),
              reply_to:messages!messages_reply_to_id_fkey(
                id, content, created_at,
                sender:profiles!messages_sender_id_fkey(
                  id, full_name, avatar_url
                )
              ),
              attachments:message_attachments(*),
              reactions:message_reactions(
                *,
                user:profiles(id, full_name, avatar_url)
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (newMessage && newMessage.sender_id !== user.id) {
            // Add new message to cache if it's not from current user
            queryClient.setQueryData(['messages', conversationId, page], (oldData: Message[] = []) => {
              return [...oldData, newMessage as Message]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // Refetch messages on update (for edits, reactions, etc.)
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId, user?.id, queryClient, page])

  return {
    messages,
    loading,
    hasMore,
    error: error?.message,
    sendMessage: sendMessageMutation.mutateAsync,
    editMessage: async (messageId: string, content: string) => 
      editMessageMutation.mutateAsync({ messageId, content }),
    deleteMessage: deleteMessageMutation.mutateAsync,
    addReaction: addReactionMutation.mutateAsync,
    removeReaction: async (messageId: string, reactionType: string) => 
      removeReactionMutation.mutateAsync({ messageId, reactionType }),
    loadMore,
    refetch,
  }
} 