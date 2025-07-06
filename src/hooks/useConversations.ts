import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  Conversation, 
  CreateConversationRequest, 
  MarkAsReadRequest,
  UseConversationsResult 
} from '@/lib/messaging.types';

export function useConversations(): UseConversationsResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch user's conversations
  const {
    data: conversations = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants!inner(
            *,
            user:profiles(id, full_name, avatar_url, email)
          ),
          item:items(id, title, item_type, status),
          last_message_sender:profiles!conversations_last_message_sender_id_fkey(
            id, full_name, avatar_url
          )
        `)
        .eq('conversation_participants.user_id', user.id)
        .eq('conversation_participants.is_active', true)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      // Calculate unread counts for each conversation
      const conversationsWithUnread = await Promise.all(
        data.map(async (conversation) => {
          const { data: unreadData } = await supabase
            .rpc('get_unread_count', {
              user_uuid: user.id,
              conversation_uuid: conversation.id
            });

          return {
            ...conversation,
            unread_count: unreadData || 0
          };
        })
      );

      return conversationsWithUnread as Conversation[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (request: CreateConversationRequest) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create the conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          type: request.type,
          title: request.title,
          item_id: request.item_id,
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Add participants (including current user)
      const participantIds = [...new Set([user.id, ...request.participant_ids])];
      const participants = participantIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member'
      }));

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      return conversation as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Mutation to mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (request: MarkAsReadRequest) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', request.conversation_id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Mutation to delete a conversation (leave it)
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('conversation_participants')
        .update({ 
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to conversation changes
    const conversationSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `id=in.(${conversations.map(c => c.id).join(',')})`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    // Subscribe to new messages (to update last_message_at)
    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      conversationSubscription.unsubscribe();
      messageSubscription.unsubscribe();
    };
  }, [user?.id, conversations, queryClient]);

  return {
    conversations,
    loading,
    error: error?.message,
    createConversation: createConversationMutation.mutateAsync,
    deleteConversation: deleteConversationMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutateAsync,
    refetch,
  };
} 