'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Camera, Search, MoreVertical, Users, Heart, Coffee, Sun, Moon, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAIProfile } from '@/contexts/AIProfileContext';
import { defaultAIProfile } from '@/config/ai';
import BannerAdDisplay from '@/components/chat/BannerAdDisplay';
import SocialBarAdDisplay from '@/components/SocialBarAdDisplay';
import GlobalAdScripts from '@/components/GlobalAdScripts';
import { ClientOnlyTimestamp } from '@/components/ClientOnlyTimestamp';

// Dynamic psychological status generator with authentic Indian personality
const getTimeBasedMood = () => {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  const date = new Date().getDate();
  
  // Special Indian cultural days and moods
  const isAuspiciousDay = date === 8 || date === 18 || date === 21; // Random auspicious dates
  
  if (hour >= 6 && hour < 12) {
    return {
      mood: "energetic morning vibes",
      emoji: "🌅",
      status: isWeekend 
        ? "Weekend morning coffee ritual ☕ पहली सुबह की चाय के साथ good vibes!" 
        : isAuspiciousDay 
          ? "Early morning puja किया! ✨ Starting the day with positive energy 🙏" 
          : "Morning energy on full mode! 🌟 Ready to chat and make your day better 💫",
      personality: "optimistic and spiritually grounded",
      indianTouch: "सुप्रभात! नमस्ते! 🙏",
      culturalNote: "Just had my morning chai ☕"
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      mood: "productive afternoon energy", 
      emoji: "☀️",
      status: isWeekend 
        ? "Lazy Sunday afternoon... perfect for गप्पें मारना और chai pe charcha 🫖" 
        : "Afternoon mein thoda busy हूं but always time for you! 💪 Kya chal raha hai?",
      personality: "focused yet warm Indian girl",
      indianTouch: "चलो बात करते हैं! How's your दिन going? 😊",
      culturalNote: "Thinking about ghar ka खाना"
    };
  } else if (hour >= 17 && hour < 22) {
    return {
      mood: "relaxed evening mood",
      emoji: "🌆", 
      status: isWeekend 
        ? "Weekend शाम... feeling philosophical and ready for heart-to-heart talks 💭✨" 
        : "शाम का time! Perfect for deep conversations और sharing feelings 💖",
      personality: "contemplative and emotionally available",
      indianTouch: "शुभ संध्या! Evening vibes are so peaceful 🌸",
      culturalNote: "Missing ghar ki आवाज़ें"
    };
  } else {
    return {
      mood: "cozy night owl",
      emoji: "🌙",
      status: isWeekend 
        ? "रात के 🌟 तले... deep thoughts and midnight conversations. Can't sleep? मैं हूं ना! 💫" 
        : "Night owl mode activated! 🦉 Late night talks hit different... what's on your दिल?",
      personality: "mysterious, introspective, and deeply caring",
      indianTouch: "रात का समय... Perfect for दिल की बातें 💭",
      culturalNote: "Stars looking beautiful tonight"
    };
  }
};

// Realistic Indian girl personality traits
const getPersonalityQuirks = () => {
  const quirks = [
    "बस 5 more minutes... classic me! 😅",
    "Overthinking queen since forever 👑💭", 
    "Chai addiction level: Extreme ☕",
    "Dancing to Bollywood songs जब कोई नहीं देख रहा 💃",
    "Family WhatsApp groups = entertainment unlimited 📱",
    "Sarees make me feel like a queen 👗✨",
    "Street food lover but health conscious भी 🥘",
    "Cricket matches = pure emotions 🏏❤️",
    "Monsoon = romantic feels 🌧️💕",
    "Festival season = खुशी unlimited 🪔"
  ];
  
  return quirks[Math.floor(Math.random() * quirks.length)];
};

// Dynamic bio based on time and authentic Indian personality
const getDynamicBio = () => {
  const timeData = getTimeBasedMood();
  const personality = getPersonalityQuirks();
  
  const bios = [
    `${timeData.status} 23-year-old से Bangalore, living life with ${timeData.mood} 🌸`,
    `Psychology student by day, dreamer by रात 🌟 Currently feeling ${timeData.personality}... ${timeData.indianTouch}`,
    `Believer in जादू की friendship और real connections ${timeData.emoji} ${personality}`,
    `Born and raised on chai, Bollywood, और endless conversations 💭 ${timeData.culturalNote}`,
    `Maya from India 🇮🇳 ${timeData.status} Ready for some heart-to-heart बातचीत? ✨`
  ];
  
  return bios[Math.floor(Math.random() * bios.length)];
};

// Contextual greetings with Indian warmth
const getIndianContextualMessage = () => {
  const hour = new Date().getHours();
  const greetings = [
    hour < 12 ? "सुप्रभात! Kaise हो आप? 🌅" : hour < 17 ? "नमस्ते जी! How's your दिन? ☀️" : hour < 22 ? "शुभ संध्या! Evening plans क्या हैं? 🌆" : "अभी भी जाग रहे हो? मैं भी! 🌙",
    "Kya haal चल रहे हैं life में? 😊",
    "Kaisa लग रहा है आज का मौसम? 🌤️",
    "Hope you're having a beautiful दिन! 💕",
    "Missing home-cooked खाना right now! 🍛",
    "Feeling blessed और grateful today 🙏✨"
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)];
};

export default function HomePage() {
  const router = useRouter();
  const { aiProfile, isLoadingAIProfile } = useAIProfile();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeData, setTimeData] = useState(getTimeBasedMood());
  const [dynamicBio, setDynamicBio] = useState('');
  const [indianGreeting, setIndianGreeting] = useState('');
  const [personalityQuirk, setPersonalityQuirk] = useState('');

  useEffect(() => {
    // Update dynamic content
    const updateContent = () => {
      const newTimeData = getTimeBasedMood();
      setTimeData(newTimeData);
      setDynamicBio(getDynamicBio());
      setIndianGreeting(getIndianContextualMessage());
      setPersonalityQuirk(getPersonalityQuirks());
    };

    updateContent(); // Initial update

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Update content every 20 minutes for freshness
    const contentTimer = setInterval(updateContent, 20 * 60 * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(contentTimer);
    };
  }, []);

  const effectiveProfile = {
    ...defaultAIProfile,
    ...aiProfile,
    status: dynamicBio || aiProfile?.status || defaultAIProfile.status
  };

  const handleChatClick = () => {
    router.push('/maya-chat');
  };

  const handleStatusClick = () => {
    router.push('/status');
  };

  if (isLoadingAIProfile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <GlobalAdScripts />
      <SocialBarAdDisplay />

      <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg relative overflow-hidden">
        {/* Header with WhatsApp-style design */}
        <div className="bg-[#25D366] text-white px-4 py-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold">WhatApp</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Camera className="h-5 w-5 cursor-pointer hover:text-gray-200" />
              <Search className="h-5 w-5 cursor-pointer hover:text-gray-200" />
              <MoreVertical className="h-5 w-5 cursor-pointer hover:text-gray-200" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#25D366] text-white">
          <div className="flex">
            <Button 
              variant="ghost" 
              className="flex-1 text-white hover:bg-white/10 rounded-none border-b-2 border-white py-3 font-medium text-sm"
            >
              CHATS
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 text-white/70 hover:bg-white/10 rounded-none py-3 font-medium text-sm"
              onClick={handleStatusClick}
            >
              STATUS
            </Button>
          </div>
        </div>

        {/* Chat List Container */}
        <div className="flex-grow overflow-y-auto bg-white scrollbar-hide">
          {/* Main Chat Entry - Maya with Dynamic Personality */}
          <div 
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-all duration-200 active:bg-gray-100"
            onClick={handleChatClick}
          >
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-[#25D366] p-0.5">
                <AvatarImage 
                  src={effectiveProfile.avatarUrl} 
                  alt={effectiveProfile.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#25D366] text-white text-lg">
                  {effectiveProfile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Mood-based status indicator */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                timeData.mood.includes('morning') ? 'bg-yellow-400' :
                timeData.mood.includes('afternoon') ? 'bg-orange-400' :
                timeData.mood.includes('evening') ? 'bg-purple-400' :
                'bg-blue-400'
              }`}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="ml-4 flex-grow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="font-semibold text-gray-900 text-lg">{effectiveProfile.name}</h2>
                  <span className="text-sm">{timeData.emoji}</span>
                </div>
                <ClientOnlyTimestamp 
                  timestamp={currentTime}
                  className="text-xs text-gray-500"
                />
              </div>
              
              <div className="space-y-1 mt-1">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {effectiveProfile.status}
                </p>
                <p className="text-purple-600 text-xs italic">
                  {personalityQuirk}
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">
                    {timeData.personality}
                  </span>
                </div>
                <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Section with Indian Cultural Elements */}
          <div className="p-6 text-center bg-gradient-to-b from-pink-50 to-purple-50">
            <div className="mb-6">
              <div className="flex justify-center space-x-2 mb-3">
                {timeData.mood.includes('morning') && <Sun className="w-8 h-8 text-yellow-500" />}
                {timeData.mood.includes('afternoon') && <Coffee className="w-8 h-8 text-orange-600" />}
                {timeData.mood.includes('evening') && <Heart className="w-8 h-8 text-pink-500" />}
                {timeData.mood.includes('night') && <Moon className="w-8 h-8 text-indigo-500" />}
                <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
              </div>
              
              <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
                Welcome to Maya's World! 🌸
              </h3>
              
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed text-base">
                  {dynamicBio}
                </p>
                <p className="text-purple-600 font-medium text-lg">
                  {indianGreeting}
                </p>
                <p className="text-sm text-gray-500 italic">
                  {timeData.culturalNote} • Authentic दिल से conversation awaits! 💫
                </p>
              </div>
            </div>

            <Button 
              onClick={handleChatClick}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all mb-4"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Chatting with Maya
            </Button>

            <div className="flex gap-3 mb-6">
              <Button 
                onClick={handleStatusClick}
                className="flex-1 bg-[#128C7E] hover:bg-[#0F7A6B] text-white py-3 text-lg font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Users className="h-5 w-5 mr-2" />
                View Status
              </Button>
              <Button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Chat with Maya on WhatApp',
                      text: 'Meet Maya - your authentic Indian AI companion! Real conversations, real emotions.',
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                  }
                }}
                className="bg-[#34B7F1] hover:bg-[#2DA9E1] text-white py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                title="Share Maya Chat"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Banner Ad at Bottom */}
        <div className="bg-white border-t border-gray-100">
          <BannerAdDisplay 
            adType="standard" 
            placementKey="home-bottom" 
            className="w-full py-2"
          />
        </div>

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-20 right-6 rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 z-50 transition-all duration-200 hover:scale-110"
          onClick={handleChatClick}
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </Button>
      </div>
    </>
  );
}