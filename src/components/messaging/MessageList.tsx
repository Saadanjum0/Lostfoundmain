import React, { useEffect, useRef } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Reply, MoreVertical, Heart, ThumbsUp, Laugh, Frown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import type { Message, MessageListProps } from '../../lib/messaging.types';

const REACTION_EMOJIS = [
  { type: 'heart', icon: Heart, emoji: '❤️' },
  { type: 'thumbs_up', icon: ThumbsUp, emoji: '👍' },
  { type: 'laugh', icon: Laugh, emoji: '😂' },
  { type: 'sad', icon: Frown, emoji: '😢' },
];

export function MessageList({
  messages,
  currentUserId,
  onMessageReply,
  onMessageReact,
  onLoadMore,
  hasMore,
  isLoading,
  className
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwnMessage = message.sender_id === currentUserId;

    return (
      <div key={message.id} className="flex gap-3 group mb-4">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback className="text-xs">
            {message.sender?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* Message content */}
        <div className="flex-1 max-w-md">
          {/* Sender name and time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {isOwnMessage ? 'You' : message.sender?.full_name}
            </span>
            <span className="text-xs text-gray-500">
              {formatMessageTime(message.created_at)}
            </span>
            {message.edited_at && (
              <Badge variant="outline" className="text-xs h-4">
                edited
              </Badge>
            )}
          </div>

          {/* Message bubble */}
          <Card className={cn(
            "p-3 shadow-sm",
            isOwnMessage 
              ? "bg-blue-600 text-white border-blue-600" 
              : "bg-white border-gray-200"
          )}>
            {/* Reply preview */}
            {message.reply_to && (
              <div className="mb-2 pl-4 border-l-2 border-gray-300 bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-600 mb-1">
                  Replying to {message.reply_to.sender?.full_name}
                </div>
                <div className="text-sm text-gray-700 truncate">
                  {message.reply_to.content}
                </div>
              </div>
            )}

            {/* Message content */}
            <div className="text-sm">
              {message.message_type === 'system' ? (
                <em className="text-gray-500">{message.content}</em>
              ) : (
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {Object.entries(
                  message.reactions.reduce((acc, reaction) => {
                    if (!acc[reaction.reaction_type]) {
                      acc[reaction.reaction_type] = [];
                    }
                    acc[reaction.reaction_type].push(reaction);
                    return acc;
                  }, {} as Record<string, typeof message.reactions>)
                ).map(([type, reactions]) => {
                  const hasUserReacted = reactions.some(r => r.user_id === currentUserId);
                  const reactionEmoji = REACTION_EMOJIS.find(e => e.type === type);
                  
                  return (
                    <Button
                      key={type}
                      variant={hasUserReacted ? "default" : "outline"}
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onMessageReact(message.id, type)}
                    >
                      <span className="mr-1">
                        {reactionEmoji?.emoji || type}
                      </span>
                      {reactions.length}
                    </Button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Message actions */}
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Quick reactions */}
            <div className="flex gap-1">
              {REACTION_EMOJIS.map((reaction) => (
                <Button
                  key={reaction.type}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-xs"
                  onClick={() => onMessageReact(message.id, reaction.type)}
                >
                  {reaction.emoji}
                </Button>
              ))}
            </div>

            {/* Action buttons */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onMessageReply(message)}
            >
              <Reply className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-16 w-full max-w-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-center", className)}>
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No messages yet
        </h3>
        <p className="text-gray-500">
          Start the conversation by sending the first message!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center mb-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? "Loading..." : "Load older messages"}
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-1">
        {messages.map((message, index) => renderMessage(message, index))}
      </div>

      {/* Auto-scroll target */}
      <div ref={messagesEndRef} />
    </div>
  );
}
