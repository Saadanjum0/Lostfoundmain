import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for item-specific conversations with auto-creation
 * This handles creating or finding a conversation about a specific item
 */
export function useItemConversation(itemId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createOrFindConversation = useCallback(async (): Promise<string | null> => {
    if (!user?.id || !itemId) return null;

    try {
      // First try to find existing conversation using a simpler query
      const { data: existingConvs, error: findError } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_participants!inner(user_id, is_active)
        `)
        .eq('item_id', itemId)
        .eq('conversation_participants.user_id', user.id)
        .eq('conversation_participants.is_active', true)
        .limit(1);
      
      if (findError) {
        console.error("Error finding conversation:", findError);
        // If there's a schema error, try a different approach
        if (findError.code === '42P17') {
          console.log("Trying alternative query approach...");
          
          // Alternative approach: Get all conversations for this item and filter
          const { data: itemConvs, error: altError } = await supabase
            .from('conversations')
            .select('id')
            .eq('item_id', itemId);
            
          if (altError) {
            throw altError;
          }
          
          if (itemConvs && itemConvs.length > 0) {
            // Check if user is participant in any of these conversations
            for (const conv of itemConvs) {
              const { data: participant } = await supabase
                .from('conversation_participants')
                .select('id')
                .eq('conversation_id', conv.id)
                .eq('user_id', user.id)
                .eq('is_active', true)
                .limit(1);
                
              if (participant && participant.length > 0) {
                return conv.id;
              }
            }
          }
        } else {
          throw findError;
        }
      } else if (existingConvs && existingConvs.length > 0) {
        return existingConvs[0].id;
      }

      // Get item details to find owner
      const { data: item, error: itemError } = await supabase
        .from('items')
        .select('user_id, title')
        .eq('id', itemId)
        .single();

      if (itemError) {
        console.error("Error finding item:", itemError);
        throw itemError;
      }

      if (!item || item.user_id === user.id) {
        console.log("Cannot message yourself or item not found");
        return null; // Can't create conversation with yourself
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          item_id: itemId,
          title: `About: ${item.title || 'Item'}`,
        })
        .select()
        .single();

      if (convError) {
        console.error("Error creating conversation:", convError);
        throw convError;
      }

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: user.id, role: 'member' },
          { conversation_id: conversation.id, user_id: item.user_id, role: 'member' }
        ]);

      if (participantsError) {
        console.error("Error adding participants:", participantsError);
        throw participantsError;
      }

      // Invalidate conversations cache
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      return conversation.id;
    } catch (error) {
      console.error("Error in createOrFindConversation:", error);
      throw error;
    }
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
