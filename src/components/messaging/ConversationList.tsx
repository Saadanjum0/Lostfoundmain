import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import type { Conversation, ConversationListProps } from '../../lib/messaging.types';

export function ConversationList({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  className
}: ConversationListProps) {
  const { user } = useAuth();

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    if (conversation.item) {
      return conversation.item.title;
    }
    
    // For direct conversations, show other participant's name
    const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id);
    return otherParticipant?.user?.full_name || 'Direct Message';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.item) {
      return conversation.item.item_type === 'lost' ? '🔍' : '✅';
    }
    
    const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id);
    return otherParticipant?.user?.avatar_url;
  };

  const getConversationInitials = (conversation: Conversation) => {
    if (conversation.item) {
      return conversation.item.item_type === 'lost' ? '🔍' : '✅';
    }
    
    const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id);
    const name = otherParticipant?.user?.full_name || 'DM';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.last_message_preview) return 'No messages yet';
    
    return conversation.last_message_preview.length > 40 
      ? `${conversation.last_message_preview.slice(0, 40)}...`
      : conversation.last_message_preview;
  };

  const getLastMessageTime = (conversation: Conversation) => {
    if (!conversation.last_message_at) return '';
    
    try {
      const time = formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false });
      // Format to shorter versions like Instagram
      return time
        .replace('about ', '')
        .replace(' minutes', 'm')
        .replace(' minute', 'm')
        .replace(' hours', 'h')
        .replace(' hour', 'h')
        .replace(' days', 'd')
        .replace(' day', 'd')
        .replace(' weeks', 'w')
        .replace(' week', 'w');
    } catch {
      return '';
    }
  };

  if (conversations.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">No messages yet</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-xs">
          Start a conversation with someone or create a group chat
        </p>
        <button
          onClick={onNewConversation}
          className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
        >
          Send your first message
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onConversationSelect(conversation)}
          className={cn(
            "p-3 cursor-pointer transition-all duration-200 rounded-xl mx-1",
            "hover:bg-gray-50",
            activeConversationId === conversation.id
              ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 shadow-sm"
              : "hover:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Avatar with online indicator */}
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-white shadow-sm">
                <AvatarImage src={getConversationAvatar(conversation)} />
                <AvatarFallback className={cn(
                  "text-sm font-semibold",
                  conversation.item 
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                )}>
                  {getConversationInitials(conversation)}
                </AvatarFallback>
              </Avatar>
              
              {/* Online status for direct messages */}
              {!conversation.item && (
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              )}
              
              {/* Unread badge */}
              {conversation.unread_count && conversation.unread_count > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={cn(
                  "font-semibold truncate text-sm",
                  conversation.unread_count && conversation.unread_count > 0 
                    ? "text-gray-900" 
                    : "text-gray-800"
                )}>
                  {getConversationTitle(conversation)}
                </h4>
                
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                  {getLastMessageTime(conversation)}
                </span>
              </div>

              {/* Item type badge for item conversations */}
              {conversation.item && (
                <div className="flex items-center gap-1 mb-1">
                  <Badge 
                    variant={conversation.item.item_type === 'lost' ? 'secondary' : 'default'}
                    className="text-xs px-2 py-0 h-5"
                  >
                    {conversation.item.item_type === 'lost' ? '🔍 Lost' : '✅ Found'}
                  </Badge>
                </div>
              )}

              {/* Last message preview */}
              <div className="flex items-center gap-1">
                <p className={cn(
                  "text-sm truncate",
                  conversation.unread_count && conversation.unread_count > 0
                    ? "text-gray-900 font-medium"
                    : "text-gray-600"
                )}>
                  {conversation.last_message_sender_id && conversation.last_message_sender_id === user?.id && (
                    <span className="text-gray-500">You: </span>
                  )}
                  {getLastMessagePreview(conversation)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
