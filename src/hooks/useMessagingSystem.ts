import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { 
  Conversation, 
  Message,
  SendMessageRequest, 
  CreateConversationRequest, 
  MarkAsReadRequest,
  AddReactionRequest,
  UseConversationsResult,
  UseMessagesResult 
} from '../lib/messaging.types';

// Constants for performance optimization
const PAGE_SIZE = 50;
const TYPING_DEBOUNCE_MS = 1000;
const SEARCH_DEBOUNCE_MS = 300;

// Enhanced conversations hook with better performance and features
export function useConversations(): UseConversationsResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Query to fetch user's conversations with optimized caching
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
            user:profiles(id, full_name, avatar_url, email, last_seen, is_online)
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

      // Calculate unread counts for each conversation using batch RPC (with fallback)
      const conversationIds = data.map(conv => conv.id);
      let conversationsWithUnread;
      
      try {
        const { data: unreadCounts } = await supabase
          .rpc('get_multiple_unread_counts', {
            user_uuid: user.id,
            conversation_uuids: conversationIds
          });

        // Merge unread counts with conversations
        conversationsWithUnread = data.map(conversation => {
          const unreadCount = unreadCounts?.find((uc: any) => uc.conversation_id === conversation.id)?.count || 0;
          return {
            ...conversation,
            unread_count: unreadCount
          };
        });
      } catch (error) {
        console.warn('Batch unread count function not available, using fallback:', error);
        
        // Fallback: Calculate unread counts individually
        conversationsWithUnread = await Promise.all(
          data.map(async (conversation) => {
            try {
              const { data: unreadData } = await supabase
                .rpc('get_unread_count', {
                  user_uuid: user.id,
                  conversation_uuid: conversation.id
                });

              return {
                ...conversation,
                unread_count: unreadData || 0
              };
            } catch (fallbackError) {
              console.warn('Individual unread count function also not available:', fallbackError);
              return {
                ...conversation,
                unread_count: 0
              };
            }
          })
        );
      }

      return conversationsWithUnread as Conversation[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 30, // 30 seconds for real-time feel
  });

  // Mutation to create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (request: CreateConversationRequest) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: request.type,
          title: request.title,
          item_id: request.item_id,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const participants = [
        { conversation_id: conversation.id, user_id: user.id, role: 'admin' },
        ...request.participant_ids.map(id => ({
          conversation_id: conversation.id,
          user_id: id,
          role: 'member' as const
        }))
      ];

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

  // Mutation to mark messages as read with optimistic updates
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
    onMutate: async (request) => {
      // Optimistic update - immediately mark conversation as read
      queryClient.setQueryData(['conversations', user?.id], (oldData: Conversation[] = []) => {
        return oldData.map(conv => 
          conv.id === request.conversation_id 
            ? { ...conv, unread_count: 0 }
            : conv
        );
      });
    },
    onError: () => {
      // Revert optimistic update on error
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

  // Set up real-time subscriptions with presence tracking
  useEffect(() => {
    if (!user?.id) return;

    // Main conversation channel
    const conversationChannel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
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

    // Presence tracking for online users
    const presenceChannel = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineUserIds = new Set(
          Object.values(state).flat().map((presence: any) => presence.user_id)
        );
        setOnlineUsers(onlineUserIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const userIds = newPresences.map((presence: any) => presence.user_id);
        setOnlineUsers(prev => new Set([...prev, ...userIds]));
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const userIds = leftPresences.map((presence: any) => presence.user_id);
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          userIds.forEach(id => newSet.delete(id));
          return newSet;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      conversationChannel.unsubscribe();
      presenceChannel.unsubscribe();
    };
  }, [user?.id, queryClient]);

  return {
    conversations,
    loading,
    error: error?.message,
    createConversation: createConversationMutation.mutateAsync,
    deleteConversation: deleteConversationMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutateAsync,
    refetch,
    onlineUsers: Array.from(onlineUsers),
  };
}

// Enhanced messages hook with infinite scrolling and advanced features
export function useMessagingMessages(conversationId: string): UseMessagesResult & {
  searchMessages: (query: string) => Promise<Message[]>;
  sendTypingIndicator: (isTyping: boolean) => void;
  typingUsers: string[];
} {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch messages with pagination using React Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['messaging-messages', conversationId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id, full_name, avatar_url
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
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      return {
        messages: data.reverse() as Message[], // Reverse to get chronological order
        nextCursor: data.length === PAGE_SIZE ? pageParam + 1 : null,
      };
    },
    enabled: !!conversationId && !!user?.id,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // Flatten all messages from all pages
  const messages = data?.pages.flatMap(page => page.messages) || [];
  const hasMore = hasNextPage;

  // Enhanced send message mutation with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: async (request: SendMessageRequest) => {
      if (!user?.id) throw new Error('User not authenticated');

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
          )
        `)
        .single();

      if (error) throw error;
      return data as Message;
    },
    onMutate: async (request) => {
      // Optimistic update - immediately add message to UI
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: request.conversation_id,
        sender_id: user?.id || '',
        content: request.content,
        message_type: request.message_type || 'text',
        reply_to_id: request.reply_to_id,
        created_at: new Date().toISOString(),
        metadata: request.metadata || {},
        sender: {
          id: user?.id || '',
          full_name: user?.user_metadata?.full_name || 'You',
          avatar_url: user?.user_metadata?.avatar_url,
        },
      };

      queryClient.setQueryData(['messaging-messages', conversationId], (oldData: any) => {
        if (!oldData) return { pages: [{ messages: [tempMessage], nextCursor: null }], pageParams: [0] };
        
        const newPages = [...oldData.pages];
        newPages[newPages.length - 1] = {
          ...newPages[newPages.length - 1],
          messages: [...newPages[newPages.length - 1].messages, tempMessage]
        };
        
        return { ...oldData, pages: newPages };
      });
    },
    onSuccess: (newMessage) => {
      // Replace temporary message with real one
      queryClient.setQueryData(['messaging-messages', conversationId], (oldData: any) => {
        if (!oldData) return;
        
        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: Message) => 
            msg.id.startsWith('temp-') ? newMessage : msg
          )
        }));
        
        return { ...oldData, pages: newPages };
      });
      
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      // Remove failed message
      queryClient.setQueryData(['messaging-messages', conversationId], (oldData: any) => {
        if (!oldData) return;
        
        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.filter((msg: Message) => !msg.id.startsWith('temp-'))
        }));
        
        return { ...oldData, pages: newPages };
      });
    },
  });

  // Message reactions mutations
  const addReactionMutation = useMutation({
    mutationFn: async (request: AddReactionRequest) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: request.message_id,
          user_id: user.id,
          reaction_type: request.reaction_type,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-messages', conversationId] });
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async (messageId: string, reactionType: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-messages', conversationId] });
    },
  });

  // Search messages function
  const searchMessages = useCallback(async (query: string): Promise<Message[]> => {
    if (!conversationId || !query.trim()) return [];

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(
          id, full_name, avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .textSearch('content', query, { type: 'websearch' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error searching messages:', error);
      return [];
    }

    return data as Message[];
  }, [conversationId]);

  // Typing indicator function with debouncing
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!conversationId || !user?.id) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      // Send typing start
      supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: true,
          last_typed_at: new Date().toISOString(),
        })
        .then(() => {
          // Auto-stop typing after timeout
          typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
          }, TYPING_DEBOUNCE_MS);
        });
    } else {
      // Send typing stop
      supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: false,
          last_typed_at: new Date().toISOString(),
        });
    }
  }, [conversationId, user?.id]);

  // Set up real-time subscriptions for messages and typing
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    // Messages subscription
    const messagesChannel = supabase
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
          // Only add message if it's not from current user (to avoid duplicates)
          if (payload.new.sender_id !== user.id) {
            // Fetch the full message with relations
            const { data: newMessage } = await supabase
              .from('messages')
              .select(`
                *,
                sender:profiles!messages_sender_id_fkey(
                  id, full_name, avatar_url
                ),
                attachments:message_attachments(*),
                reactions:message_reactions(
                  *,
                  user:profiles(id, full_name, avatar_url)
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (newMessage) {
              queryClient.setQueryData(['messaging-messages', conversationId], (oldData: any) => {
                if (!oldData) return { pages: [{ messages: [newMessage], nextCursor: null }], pageParams: [0] };
                
                const newPages = [...oldData.pages];
                newPages[newPages.length - 1] = {
                  ...newPages[newPages.length - 1],
                  messages: [...newPages[newPages.length - 1].messages, newMessage as Message]
                };
                
                return { ...oldData, pages: newPages };
              });
            }
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
          // Refetch on message updates (edits, etc.)
          queryClient.invalidateQueries({ queryKey: ['messaging-messages', conversationId] });
        }
      )
      .subscribe();

    // Typing indicators subscription
    const typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          // Fetch current typing users
          const { data } = await supabase
            .from('typing_indicators')
            .select(`
              user_id,
              is_typing,
              user:profiles(full_name)
            `)
            .eq('conversation_id', conversationId)
            .eq('is_typing', true)
            .neq('user_id', user.id);

          setTypingUsers(data?.map(t => t.user?.full_name || 'Someone') || []);
        }
      )
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
      typingChannel.unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, user?.id, queryClient]);

  return {
    messages,
    loading: isLoading,
    hasMore,
    error: error?.message,
    sendMessage: sendMessageMutation.mutateAsync,
    editMessage: async () => {}, // TODO: Implement
    deleteMessage: async () => {}, // TODO: Implement
    addReaction: addReactionMutation.mutateAsync,
    removeReaction: removeReactionMutation.mutateAsync,
    loadMore: fetchNextPage,
    refetch,
    searchMessages,
    sendTypingIndicator,
    typingUsers,
  };
}

// Hook for item-specific conversations with auto-creation
export function useItemConversation(itemId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createOrFindConversation = useCallback(async (): Promise<string | null> => {
    if (!user?.id || !itemId) return null;

    // First try to find existing conversation
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('item_id', itemId)
      .eq('conversation_participants.user_id', user.id)
      .eq('conversation_participants.is_active', true)
      .single();

    if (existingConv) {
      return existingConv.id;
    }

    // Get item details to find owner
    const { data: item } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', itemId)
      .single();

    if (!item || item.user_id === user.id) {
      return null; // Can't create conversation with yourself
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        type: 'direct',
        item_id: itemId,
      })
      .select()
      .single();

    if (error) throw error;

    // Add participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: user.id, role: 'member' },
        { conversation_id: conversation.id, user_id: item.user_id, role: 'member' }
      ]);

    if (participantsError) throw participantsError;

    // Invalidate conversations cache
    queryClient.invalidateQueries({ queryKey: ['conversations'] });

    return conversation.id;
  }, [itemId, user?.id, queryClient]);

  const mutation = useMutation({
    mutationFn: createOrFindConversation,
  });

  return {
    createOrFindConversation: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error?.message,
  };
} 