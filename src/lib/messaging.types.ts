// Messaging System Types for Lost & Found App

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  item_id?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  last_message_preview?: string;
  last_message_sender_id?: string;
  
  // Populated fields
  participants?: ConversationParticipant[];
  item?: {
    id: string;
    title: string;
    item_type: 'lost' | 'found';
    status: string;
  };
  last_message_sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  left_at?: string;
  is_active: boolean;
  last_read_at: string;
  notification_settings: {
    push: boolean;
    email: boolean;
  };
  
  // Populated fields
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  reply_to_id?: string;
  edited_at?: string;
  deleted_at?: string;
  created_at: string;
  metadata: Record<string, any>;
  
  // Populated fields
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  reply_to?: Message;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
  
  // Populated fields
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  thumbnail_url?: string;
  created_at: string;
}

export interface TypingIndicator {
  id: string;
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  last_typed_at: string;
  
  // Populated fields
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

// API Request/Response Types
export interface SendMessageRequest {
  conversation_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'system';
  reply_to_id?: string;
  metadata?: Record<string, any>;
}

export interface CreateConversationRequest {
  type: 'direct' | 'group';
  title?: string;
  item_id?: string;
  participant_ids: string[];
}

export interface MarkAsReadRequest {
  conversation_id: string;
  message_id?: string;
}

export interface AddReactionRequest {
  message_id: string;
  reaction_type: string;
}

// Component Props
export interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  className?: string;
  onlineUsers?: string[];
}

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onMessageReply?: (message: Message) => void;
  onMessageReact?: (messageId: string, reaction: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}

export interface MessageInputProps {
  onSendMessage: (content: string, type?: string) => void;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
  placeholder?: string;
  className?: string;
  onTyping?: (isTyping: boolean) => void;
}

// Hook Types
export interface UseConversationsResult {
  conversations: Conversation[];
  loading: boolean;
  error?: string;
  createConversation: (request: CreateConversationRequest) => Promise<Conversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
  markAsRead: (request: MarkAsReadRequest) => Promise<void>;
  refetch: () => void;
  onlineUsers: string[];
}

export interface UseMessagesResult {
  messages: Message[];
  loading: boolean;
  hasMore: boolean;
  error?: string;
  sendMessage: (request: SendMessageRequest) => Promise<Message>;
  editMessage: (messageId: string, content: string) => Promise<Message>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (request: AddReactionRequest) => Promise<void>;
  removeReaction: (messageId: string, reactionType: string) => Promise<void>;
  loadMore: () => void;
  refetch: () => void;
  searchMessages?: (query: string) => Promise<Message[]>;
  sendTypingIndicator?: (isTyping: boolean) => void;
  typingUsers?: string[];
}

// Error Types
export interface MessagingError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Utility Types
export type MessageWithSender = Message & {
  sender: NonNullable<Message['sender']>;
};

export type ConversationWithParticipants = Conversation & {
  participants: ConversationParticipant[];
};

export type ConversationWithDetails = Conversation & {
  participants: ConversationParticipant[];
  item?: NonNullable<Conversation['item']>;
  last_message_sender?: NonNullable<Conversation['last_message_sender']>;
  unread_count: number;
};

// Performance optimization types
export interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Search types
export interface SearchResult {
  message: Message;
  highlights: string[];
  context: {
    before: Message[];
    after: Message[];
  };
}

export interface SearchRequest {
  query: string;
  conversationId?: string;
  limit?: number;
  before?: string; // message ID
  after?: string; // message ID
}

// Real-time event types
export interface TypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

export interface PresenceEvent {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface MessageEvent {
  type: 'new' | 'update' | 'delete';
  message: Message;
  conversationId: string;
}

// File upload types
export interface FileUploadRequest {
  file: File;
  conversationId: string;
  messageType: 'image' | 'file';
}

export interface FileUploadProgress {
  percentage: number;
  uploadId: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
} 