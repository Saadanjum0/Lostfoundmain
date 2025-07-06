import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import type { Message } from '../../lib/messaging.types';

interface MessageInputProps {
  onSendMessage: (content: string, type?: string) => void;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
  placeholder?: string;
  className?: string;
  onTyping?: (isTyping: boolean) => void;
}

export function MessageInput({
  onSendMessage,
  replyToMessage,
  onCancelReply,
  placeholder = 'Type a message...',
  className = '',
  onTyping,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle typing indicator with debouncing
  const handleTypingIndicator = useCallback((typing: boolean) => {
    if (!onTyping) return;

    if (typing && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1000);
  }, [isTyping, onTyping]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSendMessage(trimmedMessage);
    setMessage('');
    
    // Reset typing indicator
    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;

    // Handle typing indicator
    if (value.trim()) {
      handleTypingIndicator(true);
    } else if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }
  };

  // Handle file upload (placeholder)
  const handleFileUpload = () => {
    // TODO: Implement file upload
    console.log('File upload not implemented yet');
  };

  return (
    <div className="space-y-3">
      {/* Reply Preview */}
      {replyToMessage && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Replying to {replyToMessage.sender?.full_name}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {replyToMessage.content}
            </p>
          </div>
          {onCancelReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className={`flex items-end gap-3 p-4 bg-white rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all ${className}`}>
        
        {/* File Upload Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFileUpload}
          className="h-10 w-10 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 flex-shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Message Input */}
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="min-h-[2.5rem] max-h-[7.5rem] resize-none border-0 p-0 text-sm leading-relaxed placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ height: 'auto' }}
          />
        </div>

        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 flex-shrink-0"
          onClick={() => {
            // TODO: Implement emoji picker
            console.log('Emoji picker not implemented yet');
          }}
        >
          <Smile className="h-5 w-5" />
        </Button>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed p-0 flex-shrink-0"
        >
          <Send className="h-4 w-4 text-white" />
        </Button>
      </div>

      {/* Character count for long messages */}
      {message.length > 500 && (
        <div className="text-right">
          <span className={`text-xs ${message.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
            {message.length}/1000
          </span>
        </div>
      )}
    </div>
  );
}
