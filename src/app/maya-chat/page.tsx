"use client";

import type { NextPage } from 'next';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatView from '@/components/chat/ChatView';
import ChatInput from '@/components/chat/ChatInput';
import type { Message, AIProfile, MessageStatus, AdSettings, AIMediaAssetsConfig } from '@/types';
import { defaultAIProfile, defaultAdSettings, defaultAIMediaAssetsConfig, DEFAULT_ADSTERRA_DIRECT_LINK, DEFAULT_MONETAG_DIRECT_LINK } from '@/config/ai';
import { getAPIFailureFallback, getEnhancedResponse, type EmotionalStateInput, type EmotionalStateOutput } from '@/ai/flows/emotional-state-simulation';
import { generateOfflineMessage } from '@/ai/actions/offline-message-actions';
import type { OfflineMessageInput } from '@/ai/flows/offline-message-generation';
import { userPersonalization } from '@/lib/userPersonalization';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Video, Info, X, ArrowLeft, Camera, MoreVertical } from 'lucide-react';
import SimulatedAdPlaceholder from '@/components/chat/SimulatedAdPlaceholder';
import BannerAdDisplay from '@/components/chat/BannerAdDisplay';
import { supabase } from '@/lib/supabaseClient';
import { format, isToday } from 'date-fns';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { useAIMediaAssets } from '@/contexts/AIMediaAssetsContext';
import SocialBarAdDisplay from '@/components/SocialBarAdDisplay';
import GlobalAdScripts from '@/components/GlobalAdScripts';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageBubble from '@/components/chat/MessageBubble';
import { aiService } from '@/lib/aiService'; // Assuming aiService is imported from here

const AI_DISCLAIMER_SHOWN_KEY = 'ai_disclaimer_shown_kruthika_chat_v2';
const AI_DISCLAIMER_DURATION = 2000;

// These constants will now be effectively overridden by AdSettings from context
// const MAX_ADS_PER_DAY = 6;
// const MAX_ADS_PER_SESSION = 3;
const MESSAGES_PER_AD_TRIGGER = 15; // Increased from 10 to reduce frequency
const INACTIVITY_AD_TIMEOUT_MS = 90000; // Increased to 1.5 minutes
const INACTIVITY_AD_CHANCE = 0.15; // Reduced to 15% chance
const ENGAGEMENT_THRESHOLD_MESSAGES = 5; // Minimum messages before first ad
const DAILY_FIRST_VISIT_AD_DELAY = 30000; // 30 seconds delay on first daily visit
const REWARD_AD_INTERSTITIAL_DURATION_MS = 3000; // 3 seconds
const USER_MEDIA_INTERSTITIAL_CHANCE = 0.3; // 30% chance to show ad after user sends media

const APP_ADS_DAILY_COUNT_KEY = 'app_ads_daily_count_kruthika_chat';
const APP_ADS_LAST_SHOWN_DATE_KEY = 'app_ads_last_shown_date_kruthika_chat';
const APP_ADS_SESSION_COUNT_KEY = 'app_ads_session_count_kruthika_chat';
const APP_ADS_LAST_SHOWN_NETWORK_KEY = 'app_ads_last_shown_network_kruthika_chat';

const USER_PSEUDO_ID_KEY = 'kruthika_chat_user_pseudo_id';
const LAST_ACTIVE_DATE_KEY = 'kruthika_chat_last_active_date';
const DAILY_VISIT_COUNT_KEY = 'kruthika_daily_visit_count';
const VISIT_STREAK_KEY = 'kruthika_visit_streak';
const SPECIAL_REWARDS_KEY = 'kruthika_special_rewards';

const MESSAGES_KEY = 'messages_kruthika';
const AI_MOOD_KEY = 'aiMood_kruthika';
const RECENT_INTERACTIONS_KEY = 'recentInteractions_kruthika';

const USER_IMAGE_UPLOAD_COUNT_KEY_KRUTHIKA = 'user_image_upload_count_kruthika_v1';
const USER_IMAGE_UPLOAD_LAST_DATE_KEY_KRUTHIKA = 'user_image_upload_last_date_kruthika_v1';
const MAX_USER_IMAGES_PER_DAY = 5;


export const tryShowRotatedAd = (activeAdSettings: AdSettings | null): boolean => {
  if (typeof window === 'undefined' || !activeAdSettings || !activeAdSettings.adsEnabledGlobally) {
    return false;
  }

  const todayStr = new Date().toDateString();
  const lastShownDate = localStorage.getItem(APP_ADS_LAST_SHOWN_DATE_KEY);
  let currentDailyCount = parseInt(localStorage.getItem(APP_ADS_DAILY_COUNT_KEY) || '0', 10);
  let currentSessionCount = parseInt(sessionStorage.getItem(APP_ADS_SESSION_COUNT_KEY) || '0', 10);

  if (lastShownDate !== todayStr) {
    currentDailyCount = 0;
    localStorage.setItem(APP_ADS_LAST_SHOWN_DATE_KEY, todayStr);
    currentSessionCount = 0;
    sessionStorage.setItem(APP_ADS_SESSION_COUNT_KEY, '0');
  }
  localStorage.setItem(APP_ADS_DAILY_COUNT_KEY, currentDailyCount.toString());

  // Use limits from AdSettings
  const maxAdsPerDay = activeAdSettings.maxDirectLinkAdsPerDay ?? defaultAdSettings.maxDirectLinkAdsPerDay;
  const maxAdsPerSession = activeAdSettings.maxDirectLinkAdsPerSession ?? defaultAdSettings.maxDirectLinkAdsPerSession;

  if (currentSessionCount >= maxAdsPerSession || currentDailyCount >= maxAdsPerDay) {
    return false;
  }

  const lastShownNetwork = localStorage.getItem(APP_ADS_LAST_SHOWN_NETWORK_KEY);
  let networkToTry: 'adsterra' | 'monetag' | null = null;
  let adLinkToShow: string | null = null;

  const adsterraDirectEnabled = activeAdSettings.adsterraDirectLinkEnabled;
  const monetagDirectEnabled = activeAdSettings.monetagDirectLinkEnabled;

  const adsterraLink = activeAdSettings.adsterraDirectLink;
  const monetagLink = activeAdSettings.monetagDirectLink;

  if (!adsterraDirectEnabled && !monetagDirectEnabled) {
    console.warn("Ad display: No direct link networks enabled in settings.");
    return false;
  }

  if (adsterraDirectEnabled && monetagDirectEnabled) {
    networkToTry = lastShownNetwork === 'adsterra' ? 'monetag' : 'adsterra';
  } else if (adsterraDirectEnabled) {
    networkToTry = 'adsterra';
  } else if (monetagDirectEnabled) {
    networkToTry = 'monetag';
  }

  if (networkToTry === 'adsterra') {
    adLinkToShow = adsterraLink;
  } else if (networkToTry === 'monetag') {
    adLinkToShow = monetagLink;
  }

  const isValidLink = (link: string | null | undefined): boolean => !!link && (link.startsWith('http://') || link.startsWith('https://')) && link !== DEFAULT_ADSTERRA_DIRECT_LINK && link !== DEFAULT_MONETAG_DIRECT_LINK && !link.toLowerCase().includes("placeholder");

  if (!isValidLink(adLinkToShow)) {
    const originalNetworkAttempt = networkToTry;
    if (networkToTry === 'adsterra' && monetagDirectEnabled && isValidLink(monetagLink)) {
      networkToTry = 'monetag';
      adLinkToShow = monetagLink;
      console.warn(`Ad display: Adsterra link invalid/default ("${adsterraLink}"), falling back to Monetag: ${adLinkToShow}`);
    } else if (networkToTry === 'monetag' && adsterraDirectEnabled && isValidLink(adsterraLink)) {
      networkToTry = 'adsterra';
      adLinkToShow = adsterraLink;
      console.warn(`Ad display: Monetag link invalid/default ("${monetagLink}"), falling back to Adsterra: ${adLinkToShow}`);
    } else {
      console.warn(`Ad display: Primary choice (${originalNetworkAttempt}) link invalid or default placeholder. Fallback network not viable or also has invalid/default link. No ad shown. Adsterra Link: "${adsterraLink}", Monetag Link: "${monetagLink}"`);
      return false;
    }
    if (!isValidLink(adLinkToShow)) {
      console.warn(`Ad display: Fallback link for (${networkToTry}) is also invalid or default placeholder. No ad shown. Link: "${adLinkToShow}"`);
      return false;
    }
  }

  try {
    const anchor = document.createElement('a');
    anchor.href = adLinkToShow!;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch (e) {
    console.error("Error opening ad link via anchor click, falling back to window.open:", e);
    try {
        window.open(adLinkToShow!, '_blank');
    } catch (openError) {
        console.error("Error opening ad link via window.open fallback:", openError);
        return false;
    }
  }

  currentDailyCount++;
  localStorage.setItem(APP_ADS_DAILY_COUNT_KEY, currentDailyCount.toString());
  currentSessionCount++;
  sessionStorage.setItem(APP_ADS_SESSION_COUNT_KEY, currentSessionCount.toString());
  if (networkToTry) localStorage.setItem(APP_ADS_LAST_SHOWN_NETWORK_KEY, networkToTry);
  return true;
};


const KruthikaChatPage: NextPage = () => {
  const router = useRouter();
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const { aiProfile: globalAIProfile, isLoadingAIProfile } = useAIProfile();
  const { mediaAssetsConfig, isLoadingMediaAssets } = useAIMediaAssets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [aiMood, setAiMood] = useState<string>("neutral");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [recentInteractions, setRecentInteractions] = useState<string[]>([]);
  const [showZoomedAvatarDialog, setShowZoomedAvatarDialog] = useState(false);
  const [zoomedAvatarUrl, setZoomedAvatarUrl] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const { toast } = useToast();
  const initialLoadComplete = useRef(false);
  const [isLoadingChatState, setIsLoadingChatState] = useState(true);

  const [messageCountSinceLastAd, setMessageCountSinceLastAd] = useState(0);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [interstitialAdMessage, setInterstitialAdMessage] = useState("Loading content...");
  const [tokenUsageStatus, setTokenUsageStatus] = useState<{used: number; limit: number; percentage: number} | null>(null);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const interstitialAdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userSentMediaThisTurnRef = useRef(false);
  const typingIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for managing typing indicator timeout

  // User session tracking and personalization
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    userIdRef.current = localStorage.getItem('userId');
    if (!userIdRef.current) {
      userIdRef.current = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', userIdRef.current);
    }
  }, []);

  const triggerBriefInterstitialMessage = (message: string, duration: number = REWARD_AD_INTERSTITIAL_DURATION_MS) => {
    setInterstitialAdMessage(message);
    setShowInterstitialAd(true);
    if (interstitialAdTimerRef.current) clearTimeout(interstitialAdTimerRef.current);
    interstitialAdTimerRef.current = setTimeout(() => {
      setShowInterstitialAd(false);
    }, duration);
  };

  const tryShowAdAndMaybeInterstitial = useCallback((interstitialMsg?: string): boolean => {
    if (isLoadingAdSettings || !adSettings) {
      return false;
    }
    const adShown = tryShowRotatedAd(adSettings);
    if (adShown && interstitialMsg) {
        triggerBriefInterstitialMessage(interstitialMsg, REWARD_AD_INTERSTITIAL_DURATION_MS);
    }
    return adShown;
  }, [adSettings, isLoadingAdSettings]);

  const handleBubbleAdTrigger = useCallback(() => {
    if (isLoadingAdSettings || !adSettings) {
      toast({title: "Ad Link", description: "Ad settings are loading. Try again shortly.", duration: 3000});
      return;
    }
    if (adSettings.adsEnabledGlobally) {
      tryShowRotatedAd(adSettings);
    } else {
      toast({title: "Ad Link", description: "This link would normally open an ad if enabled.", duration: 3000});
    }
  }, [adSettings, isLoadingAdSettings]);


  useEffect(() => {
    if (typeof window !== 'undefined' && supabase && userIdRef.current) {
      const userPseudoId = userIdRef.current;
      const today = format(new Date(), 'yyyy-MM-dd');
      const lastActiveDate = localStorage.getItem(LAST_ACTIVE_DATE_KEY);
      const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

      if (lastActiveDate !== today) {
        // Update streak
        let currentStreak = parseInt(localStorage.getItem(VISIT_STREAK_KEY) || '0', 10);
        if (lastActiveDate === yesterday) {
          currentStreak++;
        } else {
          currentStreak = 1; // Reset streak if not consecutive
        }
        localStorage.setItem(VISIT_STREAK_KEY, currentStreak.toString());

        // Daily visit count
        let dailyVisits = parseInt(localStorage.getItem(DAILY_VISIT_COUNT_KEY) || '0', 10);
        dailyVisits++;
        localStorage.setItem(DAILY_VISIT_COUNT_KEY, dailyVisits.toString());

        // Show engagement rewards
        if (currentStreak === 3) {
          toast({
            title: "3 Day Streak! 🔥",
            description: "Kruthika is so happy you visit daily! Keep it up! ✨",
            duration: 5000,
          });
        } else if (currentStreak === 7) {
          toast({
            title: "Week Warrior! 👑",
            description: "7 days in a row! Kruthika thinks you're amazing! 💕",
            duration: 5000,
          });
        } else if (currentStreak >= 14) {
          toast({
            title: "Superfan Alert! 🌟",
            description: "2+ weeks! Kruthika's best friend forever! 🥰",
            duration: 5000,
          });
        }

        try {
          const { error: activityError } = supabase
            .from('daily_activity_log')
            .upsert([{
              date: today,
              user_id: userIdRef.current,
              first_visit_timestamp: new Date().toISOString(),
              last_visit_timestamp: new Date().toISOString(),
            }], {
              onConflict: 'date,user_id',
              ignoreDuplicates: false
            });

          if (activityError) {
            console.warn('Database activity logging unavailable - continuing normally:', activityError.message);
          } else {
            localStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
          }
        } catch (e: any) {
          console.warn('Daily activity logging failed - continuing normally:', e?.message || String(e));
        }
      }
    }
  }, [userIdRef.current, toast]);

  const loadInitialChatState = useCallback(async () => {
    setIsLoadingChatState(true);
    const effectiveAIProfile = globalAIProfile || defaultAIProfile;

    try {
      const savedMessages = localStorage.getItem(MESSAGES_KEY);
      if (savedMessages) {
        const parsedMessages: Message[] = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } else {
         setMessages([{
          id: Date.now().toString(),
          text: `Hi! I'm ${effectiveAIProfile.name}. Kaise ho aap? 😊 Let's chat!`,
          sender: 'ai',
          timestamp: new Date(),
          status: 'read',
          aiImageUrl: undefined,
          userImageUrl: undefined,
        }]);
      }

      const savedMood = localStorage.getItem(AI_MOOD_KEY);
      if (savedMood) setAiMood(savedMood);

      const savedInteractions = localStorage.getItem(RECENT_INTERACTIONS_KEY);
      if (savedInteractions) setRecentInteractions(JSON.parse(savedInteractions));

       const disclaimerShown = localStorage.getItem(AI_DISCLAIMER_SHOWN_KEY);
      if (!disclaimerShown && effectiveAIProfile.name) {
        toast({
          title: `Meet ${effectiveAIProfile.name}!`,
          description: `You're chatting with ${effectiveAIProfile.name}, a friendly AI companion. Enjoy your conversation!`,
          duration: AI_DISCLAIMER_DURATION,
        });
        localStorage.setItem(AI_DISCLAIMER_SHOWN_KEY, 'true');
      }
    } catch (error: any) {
      let errorDescription = "Failed to load chat state from localStorage.";
       if (error?.message) errorDescription += ` Details: ${error.message}`;
      console.error(errorDescription, error);
       toast({
        title: "Loading Error",
        description: "Couldn't load previous chat data. Starting fresh!",
        variant: "destructive"
       });
       setMessages([{
          id: Date.now().toString(),
          text: `Hi! I'm ${effectiveAIProfile.name}. Kaise ho aap? 😊 (Had a little trouble loading our old chat!)`,
          sender: 'ai',
          timestamp: new Date(),
          status: 'read',
        }]);
    } finally {
        setIsLoadingChatState(false);
    }
  }, [toast, globalAIProfile]);

  useEffect(() => {
    if (!isLoadingAIProfile && globalAIProfile) {
        loadInitialChatState();
    } else if (!isLoadingAIProfile && !globalAIProfile) {
        console.warn("[KruthikaChatPage] AI Profile context loaded, but profile is null. Using defaults for chat init.");
        loadInitialChatState();
    }
  }, [isLoadingAIProfile, globalAIProfile, loadInitialChatState]);


  useEffect(() => {
    const timer = setTimeout(() => {
      initialLoadComplete.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initialLoadComplete.current && !isLoadingChatState && (messages.length > 1 || (messages.length === 1 && messages[0].sender === 'user') || aiMood !== "neutral" || recentInteractions.length > 0)) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
        localStorage.setItem(AI_MOOD_KEY, aiMood);
        localStorage.setItem(RECENT_INTERACTIONS_KEY, JSON.stringify(recentInteractions));
    }
  }, [messages, aiMood, recentInteractions, isLoadingChatState]);

  const getISTTimeParts = (): { hour: number; minutes: number } => {
    const now = new Date();
    const istDateString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istDateString);
    return { hour: istDate.getHours(), minutes: istDate.getMinutes() };
  };

  const getTimeOfDay = (): EmotionalStateInput['timeOfDay'] => {
    const { hour } = getISTTimeParts();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const maybeTriggerAdOnMessageCount = useCallback(() => {
    if (isLoadingAdSettings || !adSettings || !adSettings.adsEnabledGlobally) return;

    setMessageCountSinceLastAd(prev => {
      const newCount = prev + 1;
      const totalMessages = messages.length;

      // Only show ads after user has engaged sufficiently
      if (totalMessages < ENGAGEMENT_THRESHOLD_MESSAGES) return newCount;

      // Adaptive trigger based on session length
      const adaptiveTrigger = totalMessages > 30 ? MESSAGES_PER_AD_TRIGGER - 3 : MESSAGES_PER_AD_TRIGGER;

      if (newCount >= adaptiveTrigger) {
        const encouragingMessages = [
          "Thanks for the great conversation!",
          "Hope you're enjoying our chat!",
          "You're awesome to talk with!",
          "Let's keep this conversation going!"
        ];
        const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        tryShowAdAndMaybeInterstitial(randomMessage);
        return 0;
      }
      return newCount;
    });
  }, [tryShowAdAndMaybeInterstitial, adSettings, isLoadingAdSettings, messages.length]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (adSettings && adSettings.adsEnabledGlobally) {
        inactivityTimerRef.current = setTimeout(() => {
            if (Math.random() < INACTIVITY_AD_CHANCE) {
                tryShowAdAndMaybeInterstitial("Still there? Here's something interesting!");
            }
        }, INACTIVITY_AD_TIMEOUT_MS);
    }
  }, [tryShowAdAndMaybeInterstitial, adSettings]);

  // Check if this is first visit of the day
  const checkFirstDailyVisit = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastActiveDate = localStorage.getItem(LAST_ACTIVE_DATE_KEY);
    const isFirstDailyVisit = lastActiveDate !== today;

    if (isFirstDailyVisit) {
      localStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
      // Delay first ad on first daily visit
      setTimeout(() => {
        if (Math.random() < 0.4) { // 40% chance for welcome ad
          tryShowAdAndMaybeInterstitial("Welcome back! Hope you have a great day!");
        }
      }, DAILY_FIRST_VISIT_AD_DELAY);
    }
  }, [tryShowAdAndMaybeInterstitial]);

  useEffect(() => {
    checkFirstDailyVisit();
    resetInactivityTimer();

    // Close options menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (interstitialAdTimerRef.current) clearTimeout(interstitialAdTimerRef.current);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [messages, resetInactivityTimer, checkFirstDailyVisit, showOptionsMenu]);

  const addMessage = (content: string, isUser: boolean, status: Message['status'] = 'sent') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: content, // Changed from 'content' to 'text' to match Message type
      sender: isUser ? 'user' : 'ai',
      timestamp: new Date(),
      status: isUser ? status : undefined,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessageStatus = (messageId: string, status: Message['status']) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      )
    );
  };

  // Helper function to chunk AI responses into realistic message parts
  const chunkResponse = (response: string): string[] => {
    // Split by natural breaking points
    const sentences = response.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      // If adding this sentence would make the chunk too long, start a new chunk
      if (currentChunk && (currentChunk.length + sentence.length) > 80) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    // If no natural breaks found, split by length
    if (chunks.length === 0 && response.length > 80) {
      const words = response.split(' ');
      currentChunk = '';

      for (const word of words) {
        if (currentChunk && (currentChunk.length + word.length + 1) > 80) {
          chunks.push(currentChunk.trim());
          currentChunk = word;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + word;
        }
      }

      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
    }

    return chunks.length > 0 ? chunks : [response];
  };

  // Calculate realistic typing delay based on message length
  const calculateTypingDelay = (message: string): number => {
    const baseDelay = 1000; // 1 second minimum
    const charsPerSecond = 3; // Realistic typing speed
    const readingTime = message.length * 30; // Time to "think" about response
    return baseDelay + (message.length * charsPerSecond * 100) + readingTime;
  };

  const handleSendMessage = useCallback(async (message: string, imageUri?: string) => {
    if (!message.trim() && !imageUri) return;

    // Check if user has reached daily message limit
    const messageCount = userPersonalization.getMessageCount(userIdRef.current);

    if (userPersonalization.isTokenLimitReached(userIdRef.current)) {
      toast({
        title: "Daily Limit Reached",
        description: `You've reached your daily limit of ${userPersonalization.getMessageLimit()} messages. Come back tomorrow!`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const userMessageId = addMessage(message, true, imageUri);
    userSentMediaThisTurnRef.current = !!imageUri;
    updateMessageStatus(userMessageId, 'sending');

    const newInteraction = message.substring(0, 50); // Use the actual message content
    setRecentInteractions(prev => [...prev.slice(-4), newInteraction]);

    // Realistic delay before showing typing indicator
    const initialDelay = 500 + Math.random() * 800; // 0.5-1.3 seconds

    const typingIndicatorTimeout = setTimeout(() => {
      setIsAiTyping(true);
    }, initialDelay);

    try {
      // Mark user message as delivered immediately, then read after short delay
      setTimeout(() => {
        updateMessageStatus(userMessageId, 'delivered');
      }, 200);

      setTimeout(() => {
        updateMessageStatus(userMessageId, 'read');
      }, 1000);

      // Call the chat API
      console.log('📤 Sending chat request to API...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          userImageUri: imageUri,
          timeOfDay: getTimeOfDay(),
          mood: aiMood,
          recentInteractions: recentInteractions,
          userId: userIdRef.current
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      const result = await response.json();
      console.log('📥 API Response:', result);

      if (result.responses && Array.isArray(result.responses)) {
        // Process AI responses with natural delay between messages
      const processAIResponses = async (responses: any[]) => {
        for (let i = 0; i < responses.length; i++) {
          const response = responses[i];

          // Use the natural delay calculated by AI (or fallback)
          const naturalDelay = response.delay || (i === 0 ? 1000 : 1500);

          console.log(`⏱️ Natural delay for message ${i + 1}: ${naturalDelay}ms`);

          // Add typing indicator for first message
          if (i === 0) {
            setIsAiTyping(true);
            console.log('⌨️ Started typing indicator');
          }

          // Wait for NATURAL typing delay
          await new Promise(resolve => setTimeout(resolve, naturalDelay));

          // Add the message with natural timing
          const aiMessageId = addMessage(response.message, false);
          console.log('📝 Added AI message with natural timing:', response.message);

          // Remove typing indicator after last message
          if (i === responses.length - 1) {
            setIsAiTyping(false);
            console.log('⌨️ Stopped typing indicator');
          }

          // Show read status after natural delay
          setTimeout(() => {
            setMessages(prev => prev.map(msg => 
              msg.id === aiMessageId ? { ...msg, status: 'read' } : msg
            ));
          }, 600);
        }
      };
        await processAIResponses(result.responses);

        const newMood = result.newMood;
        setAiMood(newMood);
        const aiInteraction = `AI: ${result.responses.map((res:any) => res.message).join(' ')}`;
        setRecentInteractions(prev => [...prev.slice(-9), aiInteraction]);

      } else {
        setIsAiTyping(false);
      }

      if (adSettings && adSettings.adsEnabledGlobally) maybeTriggerAdOnMessageCount();
      userSentMediaThisTurnRef.current = false;

    } catch (error) {
      console.error('❌ Error sending message:', error);
      clearTimeout(typingIndicatorTimeout);
      setIsAiTyping(false);
      updateMessageStatus(userMessageId, 'read'); // Ensure user message is marked as read even on error

      // Generate contextual fallback response like a real Indian girl
      const generateContextualFallback = (userMsg: string): string => {
        const msg = userMsg.toLowerCase();

        // Greeting responses
        if (msg.includes('hi') || msg.includes('hello') || msg.includes('namaste')) {
          return Math.random() > 0.5 ?
            "Hii! Sorry network issue tha... Kaise ho? 😊" :
            "Hello ji! Connection problem thi, ab theek hai! ✨";
        }

        // Question responses
        if (msg.includes('?') || msg.includes('kya') || msg.includes('how') || msg.includes('what')) {
          return Math.random() > 0.5 ?
            "Arre wait! Internet slow chal rahi, phir se pucho na? 🤔" :
            "Oops! Technical issue... Question repeat kar do please? 💭";
        }

        // Love/romantic context
        if (msg.includes('love') || msg.includes('pyaar') || msg.includes('miss') || msg.includes('beautiful')) {
          return Math.random() > 0.5 ?
            "Aww! Server down tha... Tumhara message miss ho gaya, again bolo na? 💕" :
            "Sorry sweetheart! Network problem... Kya keh rahe the? 🥰";
        }

        // Casual conversation
        if (msg.includes('kaise') || msg.includes('kaisi') || msg.includes('how are')) {
          return Math.random() > 0.5 ?
            "Main thik hun! Sorry connection issue tha... Tum kaise ho? 😌" :
            "Bas network slow thi! Ab sab theek... Tumhara din kaisa gaya? ✨";
        }

        // Default responses with variety
        const defaultResponses = [
          "Arre yaar! Technical problem aa gayi thi... Phir se bolo na? 😅",
          "Sorry babu! Internet slow chal rahi... Repeat karo please? 🙈",
          "Oops! Server down tha... Tumhara message miss ho gaya! 😊",
          "Connection issue thi! Ab theek hai, bolo kya kehna tha? 💭",
          "Technical glitch hui thi! Now I'm back... Kya bol rahe the? ✨",
          "Network problem thi yaar! Phir se message bhejo na? 🌸",
          "Sorry! Server restart ho raha tha... Again try karo? 💕"
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      };

      const contextualFallback = generateContextualFallback(message);
      const errorAiMessageId = addMessage(contextualFallback, false);

      if (adSettings && adSettings.adsEnabledGlobally) maybeTriggerAdOnMessageCount();
      userSentMediaThisTurnRef.current = false;
    }
  }, [getTimeOfDay, aiMood, recentInteractions, userIdRef, globalAIProfile, adSettings, isLoadingAdSettings, maybeTriggerAdOnMessageCount, toast, messages]); // Fixed dependencies

  const currentAiNameForOfflineMsg = globalAIProfile?.name || defaultAIProfile.name;

  useEffect(() => {
    if (!initialLoadComplete.current || isLoadingChatState || isLoadingAdSettings || isLoadingAIProfile || isLoadingMediaAssets) return;

    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    const lastInteractionTime = lastMessage ? new Date(lastMessage.timestamp).getTime() : 0;
    const now = Date.now();
    const timeSinceLastInteraction = now - lastInteractionTime;
    let timeoutId: NodeJS.Timeout | undefined = undefined;

    // Trigger offline message if user hasn't messaged in a while and it's during active hours
    if (messages.some(m => m.sender === 'user') && lastMessage && lastMessage.sender === 'user' && timeSinceLastInteraction > 2 * 60 * 60 * 1000 && Math.random() < 0.3) {
      const { hour: currentISTHour } = getISTTimeParts();
      // Only send this type of ping during morning hours
      if (!(currentISTHour >= 5 && currentISTHour < 12)) return;

      const generateAndAddOfflineMessage = async () => {
        setIsAiTyping(true);
        try {
          const offlineInput: OfflineMessageInput = {
            offlineMessageContext: "User has returned after being away for a while, or hasn't messaged recently.",
            previousMessageHistory: recentInteractions.join('\n'),
            aiName: currentAiNameForOfflineMsg,
          };
          const offlineResult = await generateOfflineMessage(offlineInput);
          const typingDelay = Math.min(Math.max(offlineResult.message.length * 60, 1000), 3500); // Shorter typing time
          await new Promise<void>(resolve => setTimeout(resolve, typingDelay));
          const newOfflineMsgId = (Date.now() + Math.random()).toString();
          const offlineMessage: Message = {
            id: newOfflineMsgId,
            text: offlineResult.message,
            sender: 'ai',
            timestamp: new Date(),
            status: 'read',
          };
          setMessages(prev => [...prev, offlineMessage]);
          if(adSettings && adSettings.adsEnabledGlobally) maybeTriggerAdOnMessageCount();
          setRecentInteractions(prev => [...prev, `AI: ${offlineResult.message}`].slice(-10));
          if (supabase && userIdRef.current) {
            try {
                const { error: offlineLogError } = await supabase.from('messages_log').insert([{
                    message_id: newOfflineMsgId, sender_type: 'ai', chat_id: 'kruthika_chat_offline_ping',
                    user_id: userIdRef.current,
                    message_content: offlineResult.message.substring(0, 500), has_image: false,
                }]);
                if (offlineLogError) console.error('Supabase error logging offline AI message:', offlineLogError.message);
            } catch (e: any) { console.error('Supabase offline AI message logging failed:', e?.message || String(e)); }
          }
        } catch (error) { console.error("Error generating offline message:", error);
        } finally { setIsAiTyping(false); }
      };
      timeoutId = setTimeout(generateAndAddOfflineMessage, 1800 + Math.random() * 1300);
    }
    return () => { if (timeoutId) clearTimeout(timeoutId); }
  }, [messages, currentAiNameForOfflineMsg, recentInteractions, isLoadingChatState, toast, maybeTriggerAdOnMessageCount, isLoadingAdSettings, isLoadingAIProfile, isLoadingMediaAssets, adSettings]);

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

  const handleOpenAvatarZoom = () => {
    if (isLoadingAIProfile || !globalAIProfile?.avatarUrl) return;
    setZoomedAvatarUrl(globalAIProfile.avatarUrl);
    setShowZoomedAvatarDialog(true);
  };

  const handleCallVideoClick = () => {
    if (isLoadingAdSettings || !adSettings) return;
    if (adSettings && adSettings.adsEnabledGlobally) {
        tryShowAdAndMaybeInterstitial("Connecting...");
    } else {
        toast({title: "Call Feature", description: "Calls are simulated and may trigger ads if enabled.", duration: 3000});
    }
  };

  const displayAIProfile = globalAIProfile || defaultAIProfile;

  if (isLoadingAIProfile || !globalAIProfile || isLoadingAdSettings || isLoadingMediaAssets || isLoadingChatState ) {
    return <div className="flex justify-center items-center h-screen bg-chat-bg-default text-foreground">Loading Whatapp...</div>;
  }

  return (
    <>
      <GlobalAdScripts />
      <SocialBarAdDisplay />

      <div className="flex flex-col h-screen max-w-3xl mx-auto bg-chat-bg-default shadow-2xl">
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
                    src={displayAIProfile.avatarUrl}
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
              <Phone className="h-5 w-5 cursor-pointer text-white hover:text-green-200 transition-colors" onClick={handleCallVideoClick} />
              <Video className="h-5 w-5 cursor-pointer text-white hover:text-green-200 transition-colors" onClick={handleCallVideoClick} />
              <div className="relative">
                <MoreVertical
                  className="h-5 w-5 cursor-pointer text-white hover:text-green-200 transition-colors"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
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

        {/* Ad Space - Top of Chat */}
        <BannerAdDisplay
          adType="standard"
          placementKey="chatViewBottomStandard"
          className="mx-auto w-full max-w-md"
        />

        <ChatView
          messages={messages}
          aiAvatarUrl={displayAIProfile.avatarUrl}
          aiName={displayAIProfile.name}
          isAiTyping={isAiTyping}
          onTriggerAd={handleBubbleAdTrigger}
        />

        {/* Ad Space - Bottom of Chat */}
        <div className="my-1 mx-auto w-full max-w-md">
          <BannerAdDisplay
            adType="native"
            placementKey="chatViewBottomNative"
            contextual={true}
            delayMs={messages.length > 10 ? 5000 : 10000} // Show after 5s if engaged, 10s if new
          />
        </div>

        {/* Native Banner Ad before input */}
        <BannerAdDisplay
          adType="native"
          placementKey="chat-bottom"
          className="mb-2 mx-4"
        />

        <ChatInput onSendMessage={handleSendMessage} isAiTyping={isAiTyping} />

       <Dialog open={showZoomedAvatarDialog} onOpenChange={setShowZoomedAvatarDialog}>
          <DialogContent
            className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-xs translate-x-[-50%] translate-y-[-50%] border bg-neutral-900 p-0 shadow-lg duration-200 sm:rounded-lg flex flex-col overflow-hidden aspect-square max-h-[90vw] sm:max-h-[70vh]"
          >
              <DialogHeader className="flex flex-row items-center space-x-2 p-3 bg-neutral-800/80 backdrop-blur-sm sticky top-0 z-10">
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-white h-9 w-9">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </DialogClose>
                <DialogTitle className="text-lg font-semibold text-white">{displayAIProfile.name}</DialogTitle>
              </DialogHeader>

              <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
                {zoomedAvatarUrl && (
                  <Image
                    key={`zoomed-${zoomedAvatarUrl}`}
                    src={zoomedAvatarUrl}
                    alt={`${displayAIProfile.name}'s zoomed avatar`}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-sm"
                    data-ai-hint="profile woman large"
                    priority={true}
                    unoptimized // For original quality as requested for status, applying here too
                  />
                )}
              </div>

              <DialogFooter className="p-3 bg-neutral-800/80 backdrop-blur-sm flex flex-row justify-around items-center border-t border-neutral-700 sticky bottom-0 z-10 mt-auto">
                <Button variant="ghost" size="icon" className="text-neutral-200 hover:text-white hover:bg-neutral-700/70 flex flex-col items-center h-auto p-2" onClick={() => setShowZoomedAvatarDialog(false)}>
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs mt-1">Message</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-neutral-200 hover:text-white hover:bg-neutral-700/70 flex flex-col items-center h-auto p-2" onClick={handleCallVideoClick}>
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs mt-1">Audio</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-neutral-200 hover:text-white hover:bg-neutral-700/70 flex flex-col items-center h-auto p-2" onClick={handleCallVideoClick}>
                  <Video className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs mt-1">Video</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-neutral-200 hover:text-white hover:bg-neutral-700/70 flex flex-col items-center h-auto p-2" onClick={() => alert('View contact info - Not implemented')}>
                  <Info className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs mt-1">Info</span>
                </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default KruthikaChatPage;