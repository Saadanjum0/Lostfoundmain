import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useConversations } from '../../hooks/useMessagingSystem';

export function MessagingButton() {
  const navigate = useNavigate();
  const { conversations } = useConversations();

  // Calculate total unread messages
  const totalUnread = conversations.reduce((total, conv) => {
    return total + (conv.unread_count || 0);
  }, 0);

  const handleClick = () => {
    navigate('/messages');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={handleClick}
    >
      <MessageCircle className="h-5 w-5" />
      {totalUnread > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {totalUnread > 99 ? '99+' : totalUnread}
        </Badge>
      )}
    </Button>
  );
}
