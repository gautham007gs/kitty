import React, { useEffect, useRef } from 'react';
import type { Message } from '@/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useMessagePagination } from '@/hooks/useMessagePagination';
import { Button } from '@/components/ui/button';

interface ChatViewProps {
  messages: Message[];
  aiAvatarUrl: string;
  aiName: string;
  isAiTyping: boolean;
  onTriggerAd?: () => void; // New prop for handling ad clicks from bubbles
  userId?: string;
  enablePagination?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  messages, 
  aiAvatarUrl, 
  aiName, 
  isAiTyping, 
  onTriggerAd,
  userId,
  enablePagination = false 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Use pagination hook if enabled
  const pagination = useMessagePagination({
    chatId: 'kruthika_chat', // This should likely be dynamic based on the conversation
    userId: userId,
    pageSize: 50
  });

  const displayMessages = enablePagination ? pagination.messages : messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll to load more messages
  const handleScroll = () => {
    if (!enablePagination || !messagesContainerRef.current) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop === 0 && pagination.hasMore && !pagination.loading) {
      pagination.loadMore();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]); // Re-scroll if messages or typing status changes

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-grow overflow-y-auto p-4 space-y-4 bg-chat-bg-default custom-scrollbar"
      onScroll={handleScroll}
    >
      {enablePagination && pagination.hasMore && (
        <div className="text-center py-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={pagination.loadMore}
            disabled={pagination.loading}
          >
            {pagination.loading ? 'Loading...' : 'Load More Messages'}
          </Button>
        </div>
      )}

      {displayMessages.map((msg, index) => (
        <React.Fragment key={`msg-fragment-${msg.id || index}`}>
          <MessageBubble 
            key={`msg-${msg.id || index}`}
            message={msg.text}
            isUser={msg.sender === 'user'}
            timestamp={msg.timestamp ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            isRead={msg.sender === 'user' ? msg.status === 'read' : undefined}
            isDelivered={msg.sender === 'user' ? msg.status !== 'sending' : undefined}
            aiAvatarUrl={msg.sender === 'ai' ? aiAvatarUrl : undefined}
            userImageUrl={msg.userImageUrl}
            aiImageUrl={msg.aiImageUrl}
            audioUrl={msg.audioUrl}
            onTriggerAd={onTriggerAd}
          />
          {/* Show banner ad every 5 messages */}
          {(index + 1) % 5 === 0 && msg.sender === 'ai' && (
            <div key={`ad-${index}`} className="my-4">
              <div className="mx-auto w-full max-w-md">
                <div className="bg-gray-100 p-2 text-center text-sm text-gray-600 rounded">
                  Advertisement Space
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
      {isAiTyping && <TypingIndicator avatarUrl={aiAvatarUrl} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatView;