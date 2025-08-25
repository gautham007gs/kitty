import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  avatarUrl: string;
  aiName?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ avatarUrl, aiName = "Kruthika" }) => {
  return (
    <div className="flex items-start space-x-3 p-3 animate-fade-in">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={avatarUrl} alt={`${aiName}'s Avatar`} data-ai-hint="profile woman" />
        <AvatarFallback className="bg-pink-100 text-pink-600">
          {aiName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center space-x-1 bg-white text-gray-600 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border max-w-20">
        <div className="flex space-x-1">
          <div className="typing-dot bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="typing-dot bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="typing-dot bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      <style jsx>{`
        .typing-dot {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation-duration: 1.2s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
