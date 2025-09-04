"use client";

import type { NextPage } from 'next';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Removed ChatHeader from here as it's not used directly
import ChatView from '@/components/chat/ChatView';
import ChatInput from '@/components/chat/ChatInput';
import type { Message, AIProfile, AdSettings } from '@/types';
import { defaultAIProfile, defaultAdSettings, DEFAULT_ADSTERRA_DIRECT_LINK, DEFAULT_MONETAG_DIRECT_LINK } from '@/config/ai';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog'; // Import DialogTitle and DialogClose
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Video, Info, ArrowLeft, MoreVertical } from 'lucide-react';
import BannerAdDisplay from '@/components/chat/BannerAdDisplay';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { useAIProfile } from '@/contexts/AIProfileContext';
import GlobalAdScripts from '@/components/GlobalAdScripts';
import SocialBarAdDisplay from '@/components/SocialBarAdDisplay';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getIndianFallbackResponse } from '@/lib/utils'; // Import the fallback function

const KruthikaChatPage: NextPage = () => {
  const router = useRouter();
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const { aiProfile: globalAIProfile, isLoadingAIProfile } = useAIProfile();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const [showZoomedAvatarDialog, setShowZoomedAvatarDialog] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const { toast } = useToast();
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', id);
    }
    userIdRef.current = id;
  }, []);

  const handleOpenAvatarZoom = () => {
    if (!globalAIProfile?.avatar_url) return;
    setShowZoomedAvatarDialog(true);
  };

  const handleToggleOptionsMenu = () => {
    setShowOptionsMenu(prevState => !prevState);
  };

  // Online status logic (copied from your previous file to restore)
  const onlineStatus = useMemo(() => {
    if (isAiTyping) return "typing...";
    const getISTTimePartsLocal = (): { hour: number; minutes: number } => {
      const now = new Date();
      const istDateString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istDate = new Date(istDateString);
      return { hour: istDate.getHours(), minutes: istDate.getMinutes() };
    };
    const { hour: currentISTHour } = getISTTimePartsLocal();
    const isKruthikaActiveHours = currentISTHour >= 5 && currentISTHour < 12;
    const lastAiMessage = messages.slice().reverse().find(msg => msg.sender === 'ai');

    if (isKruthikaActiveHours) {
        if (lastAiMessage) {
            const now = new Date();
            const lastSeenTime = new Date(lastAiMessage.timestamp);
            const diffMs = now.getTime() - lastSeenTime.getTime();
            const diffMins = Math.round(diffMs / 60000);
            if (diffMins < 3) return "online";
        } else return "online";
    }
    if (lastAiMessage) {
      const now = new Date();
      const lastSeenTime = new Date(lastAiMessage.timestamp);
      const diffMs = now.getTime() - lastSeenTime.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const todayISTString = new Date().toLocaleDateString("en-US", {timeZone: "Asia/Kolkata"});
      const lastSeenDateISTString = lastSeenTime.toLocaleDateString("en-US", {timeZone: "Asia/Kolkata"});
      if (diffMins < 1) return `last seen just now`;
      if (diffMins < 60) return `last seen ${diffMins}m ago`;
      if (todayISTString === lastSeenDateISTString) return `last seen today at ${lastSeenTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', hour12: true })}`;
      else {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayISTString = yesterday.toLocaleDateString("en-US", {timeZone: "Asia/Kolkata"});
        if (lastSeenDateISTString === yesterdayISTString) return `last seen yesterday at ${lastSeenTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', hour12: true })}`;
        return `last seen ${lastSeenTime.toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' })}`;
      }
    }
    if (isKruthikaActiveHours) return "online";
    if (currentISTHour >= 12 && currentISTHour < 17) return `probably busy, back in morning`;
    if (currentISTHour >= 17 && currentISTHour < 21) return `winding down, back tomorrow`;
    return `sleeping, back at 5 AM IST`;
  }, [messages, isAiTyping]);

  const handleSendMessage = useCallback(async (message: string, imageUri?: string) => {
    if ((!message || !message.trim()) && !imageUri) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
      userImageUrl: imageUri,
      status: 'sent',
    };
    setMessages(prev => [...prev, userMessage]);
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId: userIdRef.current }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('API Error Response:', errorBody);
        // Fallback to Indian-style response on API error
        throw new Error(errorBody || `API Error: ${response.statusText}`);
      }

      const result = await response.json();

      const { humanizedResponse, newMood, proactiveMediaUrl } = result; // Destructure newMood and proactiveMediaUrl

      if (humanizedResponse && humanizedResponse.bubbles) {
        for (const bubble of humanizedResponse.bubbles) {
          if (bubble.delay > 0) await new Promise(resolve => setTimeout(resolve, bubble.delay));
          const aiMessage: Message = {
            id: `ai-${Date.now()}-${Math.random()}`,
            text: bubble.text,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            aiImageUrl: proactiveMediaUrl, // Pass proactiveMediaUrl if available
            status: 'delivered',
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
         throw new Error("Invalid response structure from API");
      }
    } catch (error: any) {
      console.error('❌ Critical Error in handleSendMessage:', error);
      // Use the imported Indian fallback function
      const fallbackText = getIndianFallbackResponse(message);
      const fallbackMessage: Message = {
        id: `ai-fallback-${Date.now()}`,
        text: fallbackText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsAiTyping(false);
    }
  }, []);

  useEffect(() => {
    if (isAiTyping) {
      setMessages(prev =>
        prev.map(m =>
          m.sender === 'user' && m.status !== 'read' ? { ...m, status: 'read' } : m
        )
      );
    }
  }, [isAiTyping]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'ai' && lastMessage.status === 'delivered') {
      const timer = setTimeout(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsgIndex = newMessages.length - 1;
          if(newMessages[lastMsgIndex].sender === 'ai' && newMessages[lastMsgIndex].status === 'delivered') {
              newMessages[lastMsgIndex] = { ...newMessages[lastMsgIndex], status: 'read' };
          }
          return newMessages;
        });
      }, 1000); // 1 second delay to simulate reading
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const displayAIProfile = globalAIProfile || defaultAIProfile;

  if (isLoadingAIProfile || isLoadingAdSettings) {
    return <div className="flex justify-center items-center h-screen bg-gray-100">Loading Chat...</div>;
  }

  return (
    <>
      <GlobalAdScripts />
      <SocialBarAdDisplay />

      <div className="flex flex-col h-screen max-w-3xl mx-auto bg-gray-100 shadow-lg">
        {/* WhatsApp-style header with call icons and menu */}
        <div className="bg-[#25D366] text-white px-4 py-3 shadow-md sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ArrowLeft
                className="h-6 w-6 cursor-pointer text-white hover:text-gray-200 transition-colors"
                onClick={() => router.push('/')}
              />
              <div className="relative">
                <Avatar className="h-10 w-10 cursor-pointer border-2 border-white/20" onClick={handleOpenAvatarZoom}>
                  <AvatarImage
                    src={displayAIProfile.avatar_url || displayAIProfile.avatarUrl}
                    alt={displayAIProfile.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-white text-[#25D366] font-semibold">
                    {displayAIProfile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#25D366]"></div>
              </div>
              <div className="flex-grow cursor-pointer" onClick={handleOpenAvatarZoom}>
                <h1 className="text-lg font-semibold text-white">{displayAIProfile.name}</h1>
                <p className="text-sm text-green-100 opacity-90">{onlineStatus}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="h-5 w-5 cursor-pointer text-white hover:text-green-200 transition-colors" />
              <Video className="h-5 w-5 cursor-pointer text-white hover:text-green-200 transition-colors" />
              <div className="relative">
                <MoreVertical
                  className="h-5 w-5 cursor-pointer text-white hover:text-green-200 transition-colors"
                  onClick={handleToggleOptionsMenu}
                />
                {showOptionsMenu && (
                  <div className="absolute right-0 top-8 bg-white text-gray-800 rounded-lg shadow-lg w-48 py-2 z-50">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        router.push('/legal/terms');
                      }}
                    >
                      Terms of Service
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        router.push('/legal/privacy');
                      }}
                    >
                      Privacy Policy
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-600"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        toast({
                          title: "AI Disclaimer",
                          description: `You're chatting with ${displayAIProfile.name}, an AI companion. Enjoy responsibly!`,
                          duration: 4000,
                        });
                      }}
                    >
                      About AI Companion
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        alert('Help & Support - Coming soon!');
                      }}
                    >
                      Help & Support
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <ChatView
          messages={messages}
          aiAvatarUrl={displayAIProfile.avatar_url}
          aiName={displayAIProfile.name}
          isAiTyping={isAiTyping}
          onTriggerAd={() => {}}
        />

        <BannerAdDisplay
          adType="standard"
          placementKey="chatViewBottomStandard"
          className="mx-auto w-full max-w-md"
        />

        <ChatInput onSendMessage={handleSendMessage} isAiTyping={isAiTyping} />

        <Dialog open={showZoomedAvatarDialog} onOpenChange={setShowZoomedAvatarDialog}>
          <DialogContent className="max-w-md w-auto p-0 bg-transparent border-0">
            <DialogTitle className="sr-only">{displayAIProfile.name}'s Profile Picture</DialogTitle>
            {(displayAIProfile.avatar_url || displayAIProfile.avatarUrl) && (
              <Image
                src={displayAIProfile.avatar_url || displayAIProfile.avatarUrl}
                alt={`${displayAIProfile.name}'s avatar`}
                width={500}
                height={500}
                className="rounded-lg object-cover"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default KruthikaChatPage;