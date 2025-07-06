import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Search, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { useConversations, useMessagingMessages } from '../hooks/useMessagingSystem';
import { useAuth } from '../contexts/AuthContext';
import { ConversationList } from '../components/messaging/ConversationList';
import { MessageList } from '../components/messaging/MessageList';
import { MessageInput } from '../components/messaging/MessageInput';
import { NewConversationModal } from '../components/messaging/NewConversationModal';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import type { Conversation, Message } from '../lib/messaging.types';
import SplitText from '../components/ui/SplitText';
import ResponsiveWrapper from '../components/ResponsiveWrapper';
import MobileMessages from '../components/mobile/pages/MobileMessages';

function DesktopMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
      // Clear the URL parameter after setting the conversation
      navigate('/messages', { replace: true });
    }
  }, [searchParams, navigate]);

  // Auto-select first conversation if none selected and no URL parameter
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0 && !searchParams.get('conversation')) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, searchParams]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (activeConversationId && activeConversation?.unread_count) {
      markAsRead({ conversation_id: activeConversationId });
    }
  }, [activeConversationId, activeConversation, markAsRead]);

  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
    setReplyToMessage(null);
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleSendMessage = async (content: string, type: string = 'text') => {
    if (!activeConversationId || !content.trim()) return;

    try {
      await sendMessage({
        conversation_id: activeConversationId,
        content: content.trim(),
        message_type: type as any,
        reply_to_id: replyToMessage?.id,
      });
      setReplyToMessage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleMessageReply = (message: Message) => {
    setReplyToMessage(message);
  };

  const handleMessageReact = async (messageId: string, reaction: string) => {
    try {
      const existingReaction = messages
        .find(m => m.id === messageId)
        ?.reactions?.find(r => r.user_id === user?.id && r.reaction_type === reaction);

      if (existingReaction) {
        await removeReaction(messageId, reaction);
      } else {
        await addReaction({ message_id: messageId, reaction_type: reaction });
      }
    } catch (error) {
      console.error('Failed to react to message:', error);
    }
  };

  // Debounced search function
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || !activeConversationId) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMessages(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [activeConversationId, searchMessages]);

  // Handle typing indicator
  const handleTyping = useCallback((isTyping: boolean) => {
    if (activeConversationId) {
      sendTypingIndicator(isTyping);
    }
  }, [activeConversationId, sendTypingIndicator]);

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
      return `${conversation.item.item_type === 'lost' ? 'Lost Item' : 'Found Item'} • ${conversation.item.status}`;
    }
    
    const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id);
    const isOnline = onlineUsers.includes(otherParticipant?.user_id || '');
    return isOnline ? 'Active now' : 'Last seen recently';
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants?.find(p => p.user_id !== user?.id);
  };

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Back Button */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="md:hidden border-b border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <SplitText
                text="Messages"
                className="text-xl font-semibold"
                delay={60}
                duration={0.4}
                ease="power2.out"
                splitType="chars"
                from={{ opacity: 0, x: -20 }}
                to={{ opacity: 1, x: 0 }}
                threshold={0.8}
                rootMargin="-50px"
                textAlign="left"
              />
              {totalUnreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {totalUnreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNewConversationOpen(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

      {/* Main Layout */}
      <div className="flex h-screen md:h-[calc(100vh-4rem)]">
        
        {/* Left Sidebar - Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col ${
          activeConversationId && 'hidden md:flex'
        }`}>
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <SplitText
                  text="Messages"
                  className="text-2xl font-bold text-gray-900"
                  delay={70}
                  duration={0.5}
                  ease="power2.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 20 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.4}
                  rootMargin="-80px"
                  textAlign="left"
                />
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                  {totalUnreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-2 text-xs">
                      {totalUnreadCount} unread
                    </Badge>
                  )}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                {/* Settings icon removed */}
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <Button 
              onClick={() => setIsNewConversationOpen(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-xl font-medium shadow-lg h-12"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              New Message
            </Button>
          </div>
          
          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              {conversationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length > 0 ? (
                <ConversationList
                  conversations={filteredConversations}
                  activeConversationId={activeConversationId}
                  onConversationSelect={handleConversationSelect}
                  onNewConversation={() => setIsNewConversationOpen(true)}
                />
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </p>
                  {!searchQuery && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsNewConversationOpen(true)}
                      className="mt-2 text-blue-600 hover:text-blue-700"
                    >
                      Start your first conversation
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side - Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50 ${
          !activeConversationId && 'hidden md:flex'
        }`}>
          
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Back button for mobile */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden"
                      onClick={() => setActiveConversationId(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                        <AvatarImage 
                          src={
                            activeConversation.item 
                              ? '/placeholder.svg' 
                              : getOtherParticipant(activeConversation)?.user?.avatar_url
                          } 
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                          {activeConversation.item ? 
                            (activeConversation.item.item_type === 'lost' ? '🔍' : '✅') :
                            (getConversationTitle(activeConversation).charAt(0))
                          }
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Online indicator */}
                      {!activeConversation.item && getOtherParticipant(activeConversation) && 
                        onlineUsers.includes(getOtherParticipant(activeConversation)?.user_id || '') && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 truncate text-lg">
                        {getConversationTitle(activeConversation)}
                      </h2>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 truncate">
                          {getConversationSubtitle(activeConversation)}
                        </p>
                        {typingUsers.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <div className="flex gap-1">
                              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" />
                              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                            <span>
                              {typingUsers.length === 1 
                                ? `${typingUsers[0]} is typing...`
                                : `${typingUsers.length} people are typing...`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Search in conversation */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        const query = prompt('Search in this conversation:');
                        if (query) handleSearch(query);
                      }}
                      className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                    
                    {/* Action buttons */}
                    {/* Phone and Video buttons removed */}
                    {/* Info button removed */}
                  </div>
                </div>
                
                {/* Item info for item conversations */}
                {activeConversation.item && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Badge 
                      variant={activeConversation.item.item_type === 'lost' ? 'secondary' : 'default'}
                      className="text-sm px-3 py-1"
                    >
                      {activeConversation.item.item_type === 'lost' ? '🔍 Lost Item' : '✅ Found Item'}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {activeConversation.item.status}
                    </Badge>
                  </div>
                )}
                
                {/* Search results banner */}
                {searchResults.length > 0 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-blue-600">
                      Found {searchResults.length} message{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSearchResults([])}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 px-6 py-4">
                  {/* Load more button */}
                  {hasMore && (
                    <div className="text-center mb-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={loadMore}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full px-4"
                      >
                        Load earlier messages
                      </Button>
                    </div>
                  )}
                  
                  <MessageList
                    messages={searchResults.length > 0 ? searchResults : messages}
                    currentUserId={user?.id || ''}
                    onMessageReply={handleMessageReply}
                    onMessageReact={handleMessageReact}
                    onLoadMore={loadMore}
                    hasMore={hasMore}
                    isLoading={messagesLoading || isSearching}
                    className="space-y-3"
                  />
                  
                  {messagesLoading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    </div>
                  )}
                </ScrollArea>

                {/* Reply Preview */}
                {replyToMessage && (
                  <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-600 font-medium">Replying to</span>
                        <span className="text-gray-600">{replyToMessage.sender?.full_name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setReplyToMessage(null)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {replyToMessage.content}
                    </p>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-6 bg-white border-t border-gray-200">
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    replyToMessage={replyToMessage}
                    onCancelReply={() => setReplyToMessage(null)}
                    placeholder={`Message ${getConversationTitle(activeConversation)}...`}
                    className="rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    onTyping={handleTyping}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-8">
                <MessageCircle className="w-16 h-16 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Your Messages
              </h2>
              <p className="text-gray-500 mb-8 max-w-md text-lg">
                Send private messages to friends and colleagues, or start conversations about items.
              </p>
              
              {/* Quick stats */}
              <div className="flex items-center gap-6 mb-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{onlineUsers.length} online</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>{conversations.length} conversations</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setIsNewConversationOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-xl px-8 py-3 text-lg font-medium"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Send Message
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={isNewConversationOpen}
        onClose={() => setIsNewConversationOpen(false)}
        onCreateConversation={createConversation}
      />
      </div>
      
      <Footer />
    </div>
  );
}

export default function Messages() {
  return (
    <ResponsiveWrapper
      mobileComponent={<MobileMessages />}
      desktopComponent={<DesktopMessages />}
    />
  );
}