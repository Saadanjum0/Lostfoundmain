import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useItemConversation } from '../../hooks/useItemConversation';

interface ItemMessagingButtonProps {
  itemId: string;
  ownerId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ItemMessagingButton({ 
  itemId, 
  ownerId, 
  variant = 'default',
  size = 'md',
  className = '' 
}: ItemMessagingButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createOrFindConversation, loading } = useItemConversation(itemId);

  const handleClick = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (user.id === ownerId) {
      // Can't message yourself
      return;
    }

    try {
      console.log("Creating or finding conversation for item:", itemId);
      const conversationId = await createOrFindConversation();
      console.log("Got conversation ID:", conversationId);
      
      if (conversationId) {
        // Navigate to messages page with the conversation active
        navigate(`/messages?conversation=${conversationId}`);
      }
    } catch (error) {
      console.error('Failed to create/find conversation:', error);
    }
  };

  // Don't show button if user is the owner
  if (user?.id === ownerId) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      disabled={loading}
      className={`${sizeClasses[size]} ${className}`}
    >
      <MessageCircle className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} mr-2`} />
      {loading ? 'Starting...' : 'Message Owner'}
    </Button>
  );
}
