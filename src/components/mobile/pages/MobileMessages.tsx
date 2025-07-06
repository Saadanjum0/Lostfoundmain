import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Search, Users, Send, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useConversations, useMessagingMessages } from '@/hooks/useMessagingSystem';
import { useAuth } from '@/contexts/AuthContext';
import { ConversationList } from '@/components/messaging/ConversationList';
import { MessageList } from '@/components/messaging/MessageList';
import { MessageInput } from '@/components/messaging/MessageInput';
import { NewConversationModal } from '@/components/messaging/NewConversationModal';
import Header from '@/components/layout/Header';
import type { Conversation, Message } from '@/lib/messaging.types';
import { formatDistanceToNow } from 'date-fns';

export default function MobileMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);

  const { 
    conversations, 
    loading: conversationsLoading, 
    markAsRead,
    createConversation,
    onlineUsers
  } = useConversations();

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    addReaction,
    removeReaction,
    hasMore,
    loadMore,
    searchMessages,
    sendTypingIndicator,
    typingUsers,
  } = useMessagingMessages(activeConversationId || '');

  // Get active conversation details
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    return conversations.filter(conv => {
      const title = getConversationTitle(conv).toLowerCase();
      const preview = conv.last_message_preview?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return title.includes(query) || preview.includes(query);
    });
  }, [conversations, searchQuery]);

  // Handle conversation from URL parameter
  useEffect(() => {
    const conversationFromUrl = searchParams.get('conversation');
    if (conversationFromUrl) {
      setActiveConversationId(conversationFromUrl);
      setShowConversationList(false);
      navigate('/messages', { replace: true });
    }
  }, [searchParams, navigate]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (activeConversationId && activeConversation?.unread_count) {
      markAsRead({ conversation_id: activeConversationId });
    }
  }, [activeConversationId, activeConversation, markAsRead]);

  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
    setShowConversationList(false);
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    setActiveConversationId(null);
  };

  const handleSendMessage = async (content: string, type: string = 'text') => {
    if (!activeConversationId || !content.trim()) return;

    try {
      await sendMessage({
        conversation_id: activeConversationId,
        content: content.trim(),
        message_type: type as any,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    if (conversation.item) {
      return conversation.item.title;
    }
    
    const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id);
    return otherParticipant?.user?.full_name || 'Direct Message';
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.item) {
      return `${conversation.item.item_type === 'lost' ? 'Lost Item' : 'Found Item'}`;
    }
    
    const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id);
    const isOnline = onlineUsers.includes(otherParticipant?.user_id || '');
    return isOnline ? 'Active now' : 'Last seen recently';
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants?.find(p => p.user_id !== user?.id);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);

  // Mobile Conversation List View
  const ConversationListView = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            {totalUnreadCount > 0 && (
              <p className="text-sm text-gray-500">{totalUnreadCount} unread</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsNewConversationOpen(true)}
        >
          <Users className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const isOnline = onlineUsers.includes(otherParticipant?.user_id || '');
            
            return (
              <Card
                key={conversation.id}
                className="cursor-pointer hover:bg-gray-50 transition-colors border-0 shadow-none"
                onClick={() => handleConversationSelect(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={otherParticipant?.user?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold">
                          {getInitials(getConversationTitle(conversation))}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getConversationTitle(conversation)}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {conversation.last_message_at && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                            </span>
                          )}
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-amber-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                              {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.last_message_preview || getConversationSubtitle(conversation)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredConversations.length === 0 && !conversationsLoading && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations</h3>
              <p className="text-gray-600 mb-4">Start a new conversation to get started</p>
              <Button onClick={() => setIsNewConversationOpen(true)}>
                <Users className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Mobile Chat View
  const ChatView = () => (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {activeConversation && (
            <>
              <Avatar className="w-10 h-10">
                <AvatarImage src={getOtherParticipant(activeConversation)?.user?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold">
                  {getInitials(getConversationTitle(activeConversation))}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">
                  {getConversationTitle(activeConversation)}
                </h2>
                <p className="text-sm text-gray-600 truncate">
                  {getConversationSubtitle(activeConversation)}
                </p>
              </div>
            </>
          )}
        </div>
        
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {activeConversationId && (
          <MessageList
            messages={messages}
            loading={messagesLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onReply={() => {}}
            onReact={(messageId, reaction) => {}}
            currentUserId={user?.id || ''}
            typingUsers={typingUsers}
          />
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        {activeConversationId && (
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={() => {}}
            disabled={!activeConversationId}
            placeholder="Type a message..."
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="relative">
        <div className="h-[calc(100vh-4rem)]">
          {showConversationList ? <ConversationListView /> : <ChatView />}
        </div>
      </main>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={isNewConversationOpen}
        onClose={() => setIsNewConversationOpen(false)}
        onCreateConversation={createConversation}
      />
    </div>
  );
} 