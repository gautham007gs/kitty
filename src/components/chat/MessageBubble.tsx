import React, { memo } from 'react';
import Image from 'next/image';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  isRead?: boolean;
  isDelivered?: boolean;
  aiAvatarUrl?: string;
  userImageUrl?: string;
  aiImageUrl?: string;
  audioUrl?: string;
  onTriggerAd?: () => void;
}

const MessageBubble = memo(({
  message,
  isUser,
  timestamp,
  isRead,
  isDelivered,
  aiAvatarUrl,
  userImageUrl,
  aiImageUrl,
  audioUrl,
  onTriggerAd,
}: MessageBubbleProps) => {

  const handleBubbleClick = () => {
    if (onTriggerAd && Math.random() < 0.1) { // 10% chance on message click
      onTriggerAd();
    }
  };

  return (
    <div className={cn("flex gap-2 max-w-[85%]", isUser ? "justify-end ml-auto" : "justify-start")}>
      { !isUser && aiAvatarUrl && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
          <Image
            src={aiAvatarUrl}
            alt={`AI's avatar`}
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
          isUser
            ? "bg-[#DCF8C6] text-gray-900 rounded-br-md"
            : "bg-white text-gray-900 rounded-bl-md"
        )}
        onClick={handleBubbleClick}
      >
        {message && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        )}

        {userImageUrl && (
          <div className="mt-2">
            <Image
              src={userImageUrl}
              alt="User shared image"
              width={200}
              height={200}
              className="rounded-lg max-w-full h-auto cursor-pointer"
              onClick={() => onTriggerAd?.(userImageUrl!)}
              unoptimized
            />
          </div>
        )}

        {aiImageUrl && (
          <div className="mt-2">
            <Image
              src={aiImageUrl}
              alt={`AI shared image`}
              width={200}
              height={200}
              className="rounded-lg max-w-full h-auto cursor-pointer"
              onClick={() => onTriggerAd?.(aiImageUrl!)}
              data-ai-hint="ai generated"
              unoptimized
            />
          </div>
        )}

        {audioUrl && (
          <div className="mt-2">
            <audio
              controls
              className="max-w-full"
              preload="none"
            >
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        <div className="flex justify-end items-center gap-1 mt-1">
          <span className="text-xs opacity-70">
            {timestamp}
          </span>
          {isUser && (
            <div className="flex items-center ml-1">
              {isDelivered && !isRead && (
                <Check className="h-3 w-3 text-gray-400" />
              )}
              {isRead && (
                <CheckCheck className="h-3 w-3 text-blue-500" />
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