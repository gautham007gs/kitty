"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Phone, Video, X, Download, Share2, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { defaultAIProfile } from '@/config/ai';
import { useAIProfile } from '@/contexts/AIProfileContext';

interface ChatHeaderProps {
  aiName: string;
  aiAvatarUrl: string; 
  onlineStatus: string;
  onAvatarClick: () => void;
  onCallClick: () => void; 
  onVideoClick: () => void; 
  tokenUsage?: {used: number; limit: number; percentage: number} | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  aiName,
  aiAvatarUrl, 
  onlineStatus,
  onAvatarClick,
  onCallClick,
  onVideoClick,
  tokenUsage,
}) => {
  const router = useRouter();
  const { aiProfile } = useAIProfile();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleBackClick = () => {
    router.push('/');
  };

  // Use AI profile context for real-time syncing
  let avatarUrlToUse = aiProfile?.avatar_url || aiProfile?.avatarUrl || aiAvatarUrl;
  if (!avatarUrlToUse || typeof avatarUrlToUse !== 'string' || avatarUrlToUse.trim() === '' || (!avatarUrlToUse.startsWith('http') && !avatarUrlToUse.startsWith('data:'))) {
    avatarUrlToUse = defaultAIProfile.avatar_url || defaultAIProfile.avatarUrl;
  }

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  // if (aiName === "Kruthika") {
    // console.log(`ChatHeader - Kruthika's final aiAvatarUrlToUse: ${avatarUrlToUse}`);
  // }

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`ChatHeader - AvatarImage load error for ${aiName}. URL: ${avatarUrlToUse}`, e);
  };

  const getTokenMessage = () => {
    if (!tokenUsage) return null;

    const { percentage } = tokenUsage;
    if (percentage >= 95) {
      return "💕 Almost time to say bye... but I'll miss you!";
    } else if (percentage >= 80) {
      return "🌸 We've been chatting so much! Love it!";
    } else if (percentage >= 60) {
      return "✨ Having so much fun talking to you!";
    } else if (percentage >= 40) {
      return "😊 This conversation is getting interesting!";
    }
    return null;
  };

  return (
    <>
      <header className="flex items-center p-3 bg-chat-header-bg border-b border-border shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-inherit hover:bg-accent/10 mr-2"
          onClick={handleBackClick}
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <button 
          onClick={handleAvatarClick} 
          className={cn(
              "flex items-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-chat-header-bg rounded-full p-1 mr-3 transition-all duration-200 hover:scale-105",
              aiName === "Kruthika" && "border-2 border-primary p-0.5" 
          )}
          key={`avatar-header-wrapper-${aiName}-${avatarUrlToUse || 'default_wrapper_key_ch'}`}
        >
          <Avatar 
              className="h-10 w-10 cursor-pointer" 
              key={`avatar-comp-header-${aiName}-${avatarUrlToUse || 'default_avatar_comp_key_ch'}`}
          >
            <AvatarImage 
              src={avatarUrlToUse || undefined} 
              alt={aiName} 
              data-ai-hint="profile woman" 
              key={`chat-header-avatar-img-${aiName}-${avatarUrlToUse || 'no_avatar_fallback_img_ch'}`}
              onError={handleAvatarError} 
            />
            <AvatarFallback>{(aiName || "K").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-grow cursor-pointer" onClick={handleAvatarClick}>
          <h1 className="font-semibold text-lg text-chat-header-text">{aiProfile?.name || aiName}</h1>
          <p className="text-xs text-chat-header-text/70">{aiProfile?.status || onlineStatus}</p>
          {tokenUsage && tokenUsage.percentage > 0 && (
            <div className="text-xs text-pink-300 mt-1">
              {getTokenMessage()}
            </div>
          )}
        </div >

      <Button variant="ghost" size="icon" className="text-inherit hover:bg-accent/10" aria-label="Video call (simulated ad)" onClick={onVideoClick}>
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-inherit hover:bg-accent/10 mr-1" aria-label="Call (simulated ad)" onClick={onCallClick}>
          <Phone className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-inherit hover:bg-accent/10" aria-label="More options">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleAvatarClick}>
              <span>View Contact</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert("Media, links, and docs: Non-functional placeholder")}>
              <span>Media, links, and docs</span>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => alert("Search: Non-functional placeholder")}>
              <span>Search</span>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => alert("Mute notifications: Non-functional placeholder")}>
              <span>Mute notifications</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/legal/terms')}>
              <span>Terms of Service</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/legal/privacy')}>
              <span>Privacy Policy</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => router.push('/')}>
              <span>Exit Chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* WhatsApp-style Avatar Modal */}
      {showAvatarModal && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          {/* Modal Header */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={() => setShowAvatarModal(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
                <div>
                  <h2 className="font-semibold text-lg">{aiProfile?.name || aiName}</h2>
                  <p className="text-sm text-white/70">{aiProfile?.status || onlineStatus}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={() => {
                    // Download functionality
                    const link = document.createElement('a');
                    link.href = avatarUrlToUse;
                    link.download = `${aiName}_avatar.jpg`;
                    link.click();
                  }}
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: `${aiName}'s Profile Picture`,
                        url: avatarUrlToUse
                      });
                    }
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={() => {
                    // Favorite functionality
                    localStorage.setItem('favoriteAvatar', avatarUrlToUse);
                  }}
                >
                  <Star className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div 
            className="relative max-w-sm max-h-[70vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-800 shadow-2xl">
              <Image
                src={avatarUrlToUse}
                alt={`${aiName}'s avatar`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = defaultAIProfile.avatarUrl;
                }}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="text-center text-white">
              <p className="text-sm opacity-70">
                {aiProfile?.statusStoryText || "Tap outside to close"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;