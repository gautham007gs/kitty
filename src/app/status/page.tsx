
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Plus, MoreVertical, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAIProfile } from '@/contexts/AIProfileContext';
import { defaultAIProfile } from '@/config/ai';
import BannerAdDisplay from '@/components/chat/BannerAdDisplay';
import SocialBarAdDisplay from '@/components/SocialBarAdDisplay';
import GlobalAdScripts from '@/components/GlobalAdScripts';

interface StatusUpdate {
  id: string;
  content: string;
  timestamp: Date;
  viewed: boolean;
  type: 'text' | 'image';
  imageUrl?: string;
}

export default function StatusPage() {
  const router = useRouter();
  const { aiProfile, isLoadingAIProfile } = useAIProfile();
  const [selectedStatus, setSelectedStatus] = useState<StatusUpdate | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const effectiveProfile = aiProfile || defaultAIProfile;

  // Mock status updates
  const [statusUpdates] = useState<StatusUpdate[]>([
    {
      id: '1',
      content: "Good morning! ☀️ Starting my day with some coffee and positive vibes! 💫",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      viewed: false,
      type: 'text'
    },
    {
      id: '2',
      content: "Just had the most amazing conversation! Love connecting with people 💕",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      viewed: false,
      type: 'text'
    },
    {
      id: '3',
      content: "Weekend mood: Relaxing and enjoying every moment 🌸✨",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      viewed: true,
      type: 'text'
    }
  ]);

  const handleStatusClick = (status: StatusUpdate) => {
    setSelectedStatus(status);
  };

  const handleCloseStatus = () => {
    setSelectedStatus(null);
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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

  if (selectedStatus) {
    return (
      <>
        <GlobalAdScripts />
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Status View Header */}
          <div className="flex items-center justify-between p-4 bg-black text-white">
            <div className="flex items-center space-x-3">
              <ArrowLeft 
                className="h-6 w-6 cursor-pointer" 
                onClick={handleCloseStatus} 
              />
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={effectiveProfile.avatar_url || effectiveProfile.avatarUrl} 
                  alt={effectiveProfile.name}
                />
                <AvatarFallback className="bg-[#25D366] text-white text-sm">
                  {effectiveProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{effectiveProfile.name}</h3>
                <p className="text-xs text-gray-300">{getTimeAgo(selectedStatus.timestamp)}</p>
              </div>
            </div>
            <MoreVertical className="h-5 w-5" />
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-600 h-1 mx-4">
            <div className="bg-white h-full w-full"></div>
          </div>

          {/* Status Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-white text-center max-w-md">
              <p className="text-lg leading-relaxed">{selectedStatus.content}</p>
            </div>
          </div>

          {/* Status Footer */}
          <div className="p-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm">1</span>
            </div>
            <p className="text-xs text-gray-300">
              {selectedStatus.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalAdScripts />
      <SocialBarAdDisplay />

      <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg">
        {/* Header */}
        <div className="bg-[#25D366] text-white px-4 py-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ArrowLeft 
                className="h-6 w-6 cursor-pointer" 
                onClick={() => router.push('/')} 
              />
              <h1 className="text-xl font-bold">Status</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Camera className="h-5 w-5 cursor-pointer hover:text-gray-200" />
              <MoreVertical className="h-5 w-5 cursor-pointer hover:text-gray-200" />
            </div>
          </div>
        </div>

        {/* My Status Section */}
        <div className="p-4 bg-white border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage 
                  src={effectiveProfile.avatar_url || effectiveProfile.avatarUrl} 
                  alt="My Status"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-300 text-gray-600">
                  You
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center border-2 border-white">
                <Plus className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">My status</h3>
              <p className="text-sm text-gray-500">Tap to add status update</p>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="flex-1 bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Recent updates
            </h4>
          </div>

          <div className="overflow-y-auto">
            {statusUpdates.map((status) => (
              <div 
                key={status.id}
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                onClick={() => handleStatusClick(status)}
              >
                <div className="relative">
                  <Avatar className={`h-14 w-14 ${!status.viewed ? 'ring-2 ring-[#25D366] p-0.5' : 'ring-2 ring-gray-300 p-0.5'}`}>
                    <AvatarImage 
                      src={effectiveProfile.avatar_url || effectiveProfile.avatarUrl} 
                      alt={effectiveProfile.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#25D366] text-white">
                      {effectiveProfile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {!status.viewed && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#25D366] rounded-full border-2 border-white">
                      <div className="w-full h-full bg-[#20B858] rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="font-semibold text-gray-800">{effectiveProfile.name}</h3>
                  <p className="text-sm text-gray-500">{getTimeAgo(status.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banner Ad */}
        <div className="bg-white border-t border-gray-100">
          <BannerAdDisplay 
            adType="standard" 
            placementKey="status-bottom" 
            className="w-full py-2"
          />
        </div>
      </div>
    </>
  );
}
