
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { useMessagePagination } from '@/hooks/useMessagePagination';

// Define the structure of a single message bubble
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string | Date; // Allow both string and Date
  proactiveMediaUrl?: string;
  aiImageUrl?: string;
  userImageUrl?: string;
  audioUrl?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatViewProps {
  messages: Message[];
  aiAvatarUrl: string;
  aiName: string;
  isAiTyping: boolean;
  onTriggerAd: () => void;
}

function ChatView({ messages, aiAvatarUrl, aiName, isAiTyping, onTriggerAd }: ChatViewProps) {
  const { scrollRef } = useMessagePagination(messages);

  // Helper to format timestamp
  const formatTimestamp = (timestamp: string | Date): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            layout
          >
            <MessageBubble
              message={msg.text}
              isUser={msg.sender === 'user'}
              timestamp={formatTimestamp(msg.timestamp)}
              isRead={msg.status === 'read'}
              isDelivered={msg.status === 'delivered' || msg.status === 'read'}
              aiAvatarUrl={msg.sender === 'ai' ? aiAvatarUrl : undefined}
              aiImageUrl={msg.sender === 'ai' ? msg.aiImageUrl : undefined}
              userImageUrl={msg.sender === 'user' ? msg.userImageUrl : undefined}
              audioUrl={msg.audioUrl}
              onTriggerAd={onTriggerAd}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {isAiTyping && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            layout
        >
            <TypingIndicator avatarUrl={aiAvatarUrl} aiName={aiName} />
        </motion.div>
      )}
    </div>
  );
}

export default ChatView;
