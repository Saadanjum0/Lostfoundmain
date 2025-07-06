import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ItemWithDetails } from '@/lib/database.types';

interface UseUserItemsOptions {
  status?: string;
  item_type?: 'lost' | 'found';
  limit?: number;
}

export const useUserItems = (options: UseUserItemsOptions = {}) => {
  const { user } = useAuth();
  const { status, item_type, limit = 50 } = options;

  return useQuery({
    queryKey: ['user-items', user?.id, status, item_type, limit],
    queryFn: async (): Promise<ItemWithDetails[]> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('items')
        .select(`
          *,
          category:categories(*),
          location:locations(*),
          profiles!user_id(id, full_name, avatar_url, student_id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (item_type) {
        query = query.eq('item_type', item_type);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user items:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}; 