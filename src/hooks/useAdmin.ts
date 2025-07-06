import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Item, 
  ItemWithDetails, 
  Profile, 
  AdminAction, 
  AdminActionType,
  NotificationInsert 
} from '@/lib/database.types';

// Admin Statistics Hook
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        pendingItemsResult,
        approvedItemsResult,
        resolvedItemsResult,
        rejectedItemsResult,
        totalUsersResult,
        totalViewsResult,
        recentActionsResult
      ] = await Promise.all([
        supabase.from('items').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('items').select('id', { count: 'exact' }).eq('status', 'approved'),
        supabase.from('items').select('id', { count: 'exact' }).eq('status', 'resolved'),
        supabase.from('items').select('id', { count: 'exact' }).eq('status', 'rejected'),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('item_views').select('id', { count: 'exact' }),
        supabase.from('admin_actions').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      return {
        pending: pendingItemsResult.count || 0,
        approved: approvedItemsResult.count || 0,
        resolved: resolvedItemsResult.count || 0,
        rejected: rejectedItemsResult.count || 0,
        totalUsers: totalUsersResult.count || 0,
        totalViews: totalViewsResult.count || 0,
        recentActions: recentActionsResult.data || []
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
};

// Log Admin Action Helper
const logAdminAction = async (
  adminId: string,
  action: AdminActionType,
  targetType: string,
  targetId: string,
  reason?: string,
  details?: any
) => {
  const { error } = await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    reason: reason || null,
    details: details || null,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error('Failed to log admin action:', error);
  }
};

// Create Notification Helper
const createNotification = async (
  userId: string,
  type: 'item_approved' | 'item_rejected' | 'item_resolved' | 'admin_action',
  title: string,
  message: string,
  itemId?: string,
  adminId?: string
) => {
  try {
    await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_message: message,
      p_item_id: itemId || null,
      p_sender_id: adminId || null
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// Approve Item Hook
export const useApproveItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get item details first
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('*, profiles!user_id(*)')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      if (!item) throw new Error('Item not found');

      // Update item status
      const { error: updateError } = await supabase
        .from('items')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Log admin action
      await logAdminAction(
        user.id,
        'approve_item',
        'item',
        itemId,
        'Item approved for public listing'
      );

      // Create notification for user
      await createNotification(
        item.user_id,
        'item_approved',
        'Item Approved!',
        `Your ${item.item_type} item "${item.title}" has been approved and is now live on the site.`,
        itemId,
        user.id
      );

      return item;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-count'] });
    },
  });
};

// Reject Item Hook
export const useRejectItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ itemId, reason }: { itemId: string; reason: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Get item details first
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('*, profiles!user_id(*)')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      if (!item) throw new Error('Item not found');

      // Update item status
      const { error: updateError } = await supabase
        .from('items')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Log admin action
      await logAdminAction(
        user.id,
        'reject_item',
        'item',
        itemId,
        reason
      );

      // Create notification for user
      await createNotification(
        item.user_id,
        'item_rejected',
        'Item Rejected',
        `Your ${item.item_type} item "${item.title}" has been rejected. Reason: ${reason}`,
        itemId,
        user.id
      );

      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-count'] });
    },
  });
};

// Delete Item Hook
export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get item details first for logging
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('*, profiles!user_id(*)')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      if (!item) throw new Error('Item not found');

      // Delete item
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (deleteError) throw deleteError;

      // Log admin action
      await logAdminAction(
        user.id,
        'delete_item',
        'item',
        itemId,
        `Permanently deleted ${item.item_type} item: "${item.title}"`
      );

      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

// Resolve Item Hook
export const useResolveItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get item details first
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('*, profiles!user_id(*)')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      if (!item) throw new Error('Item not found');

      // Update item status
      const { error: updateError } = await supabase
        .from('items')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Log admin action
      await logAdminAction(
        user.id,
        'resolve_item',
        'item',
        itemId,
        'Item marked as resolved - successfully reunited'
      );

      // Create notification for user
      await createNotification(
        item.user_id,
        'item_resolved',
        'Item Resolved!',
        `Your ${item.item_type} item "${item.title}" has been marked as resolved. Congratulations!`,
        itemId,
        user.id
      );

      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

// Ban User Hook
export const useBanUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Get user details first
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!targetUser) throw new Error('User not found');

      // Update user status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_banned: true,
          ban_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Log admin action
      await logAdminAction(
        user.id,
        'ban_user',
        'user',
        userId,
        reason,
        { user_email: targetUser.email, user_name: targetUser.full_name }
      );

      return targetUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

// Unban User Hook
export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get user details first
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!targetUser) throw new Error('User not found');

      // Update user status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_banned: false,
          ban_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Log admin action
      await logAdminAction(
        user.id,
        'unban_user',
        'user',
        userId,
        'User unbanned and access restored',
        { user_email: targetUser.email, user_name: targetUser.full_name }
      );

      return targetUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

// Change User Role Hook
export const useChangeUserRole = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Get user details first
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!targetUser) throw new Error('User not found');

      // Update user role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: newRole as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Log admin action (role change doesn't have a specific type, so we'll skip logging for now)
      // TODO: Add role change to admin_action_type enum in database
      console.log(`Admin ${user.id} changed role for user ${userId} from ${targetUser.role} to ${newRole}`);

      return targetUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

// Get All Users Hook
export const useAdminUsers = (filters?: {
  role?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async (): Promise<Profile[]> => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }

      if (filters?.status) {
        if (filters.status === 'banned') {
          query = query.eq('is_banned', true);
        } else if (filters.status === 'active') {
          query = query.eq('is_banned', false);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Client-side search filtering
      let filteredData = data;
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = data.filter(user => 
          user.full_name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.student_id?.toLowerCase().includes(searchTerm)
        );
      }

      return filteredData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get Pending Items Count Hook (for real-time updates)
export const usePendingItemsCount = () => {
  return useQuery({
    queryKey: ['admin-pending-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('items')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');
      
      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
};

// Get Recent Admin Actions Hook
export const useRecentAdminActions = (limit: number = 10) => {
  return useQuery({
    queryKey: ['admin-actions', limit],
    queryFn: async (): Promise<(AdminAction & { admin?: Profile })[]> => {
      const { data, error } = await supabase
        .from('admin_actions')
        .select(`
          *,
          admin:profiles!admin_id(id, full_name, email, role)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}; 