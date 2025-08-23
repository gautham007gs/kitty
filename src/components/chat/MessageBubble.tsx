import React, { memo } from 'react';
import Image from 'next/image';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  aiAvatarUrl?: string;
  aiName?: string;
  onImageClick?: (url: string) => void;
  onTriggerAd?: () => void;
}

const MessageBubble = memo(({ message, aiAvatarUrl, aiName = "AI", onImageClick, onTriggerAd }: MessageBubbleProps) => {
  const isAi = message.sender === 'ai';
  const isUser = message.sender === 'user'; // Added isUser flag

  const handleBubbleClick = () => {
    if (onTriggerAd && Math.random() < 0.1) { // 10% chance on message click
      onTriggerAd();
    }
  };

  return (
    <div className={cn("flex gap-2 max-w-[85%]", isAi ? "justify-start" : "justify-end ml-auto")}>
      {isAi && aiAvatarUrl && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
          <Image
            src={aiAvatarUrl}
            alt={`${aiName}'s avatar`}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            data-ai-hint="profile woman small"
            unoptimized
          />
        </div>
      )}

      <div
        className={cn(
          "rounded-2xl px-4 py-2 max-w-full break-words cursor-pointer transition-colors",
          isAi
            ? "bg-white text-gray-900 rounded-bl-md"
            : "bg-[#DCF8C6] text-gray-900 rounded-br-md"
        )}
        onClick={handleBubbleClick}
      >
        {message.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        )}

        {message.userImageUrl && (
          <div className="mt-2">
            <Image
              src={message.userImageUrl}
              alt="User shared image"
              width={200}
              height={200}
              className="rounded-lg max-w-full h-auto cursor-pointer"
              onClick={() => onImageClick?.(message.userImageUrl!)}
              unoptimized
            />
          </div>
        )}

        {message.aiImageUrl && (
          <div className="mt-2">
            <Image
              src={message.aiImageUrl}
              alt={`${aiName} shared image`}
              width={200}
              height={200}
              className="rounded-lg max-w-full h-auto cursor-pointer"
              onClick={() => onImageClick?.(message.aiImageUrl!)}
              data-ai-hint="ai generated"
              unoptimized
            />
          </div>
        )}

        {message.audioUrl && (
          <div className="mt-2">
            <audio
              controls
              className="max-w-full"
              preload="none"
            >
              <source src={message.audioUrl} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        <div className="flex justify-end items-center gap-1 mt-1">
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </span>
          {isUser && (
            <div className="flex items-center">
              {message.status === 'sent' && (
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 15" fill="none">
                  <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.85 4.85 5.824 1.85a.365.365 0 0 0-.51-.063l-.478.372a.377.377 0 0 0-.062.53l3.584 4.134a.365.365 0 0 0 .51.063l.478-.372a.377.377 0 0 0 .062-.53L10.91 3.316z" fill="currentColor"/>
                </svg>
              )}
              {message.status === 'delivered' && (
                <div className="flex">
                  <svg className="w-4 h-4 text-gray-500 -mr-1" viewBox="0 0 16 15" fill="none">
                    <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.85 4.85 5.824 1.85a.365.365 0 0 0-.51-.063l-.478.372a.377.377 0 0 0-.062.53l3.584 4.134a.365.365 0 0 0 .51.063l.478-.372a.377.377 0 0 0 .062-.53L10.91 3.316z" fill="currentColor"/>
                  </svg>
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 15" fill="none">
                    <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.85 4.85 5.824 1.85a.365.365 0 0 0-.51-.063l-.478.372a.377.377 0 0 0-.062.53l3.584 4.134a.365.365 0 0 0 .51.063l.478-.372a.377.377 0 0 0 .062-.53L10.91 3.316z" fill="currentColor"/>
                  </svg>
                </div>
              )}
              {message.status === 'read' && (
                <div className="flex">
                  <svg className="w-4 h-4 text-blue-500 -mr-1" viewBox="0 0 16 15" fill="none">
                    <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.85 4.85 5.824 1.85a.365.365 0 0 0-.51-.063l-.478.372a.377.377 0 0 0-.062.53l3.584 4.134a.365.365 0 0 0 .51.063l.478-.372a.377.377 0 0 0 .062-.53L10.91 3.316z" fill="currentColor"/>
                  </svg>
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 16 15" fill="none">
                    <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.85 4.85 5.824 1.85a.365.365 0 0 0-.51-.063l-.478.372a.377.377 0 0 0-.062.53l3.584 4.134a.365.365 0 0 0 .51.063l.478-.372a.377.377 0 0 0 .062-.53L10.91 3.316z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;