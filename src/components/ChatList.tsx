"use client";

import { useRouter } from 'next/navigation';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClientOnlyTimestamp } from '@/components/ClientOnlyTimestamp'; // Import the new component
import { useAIMediaAssets } from '@/contexts/AIMediaAssetsContext';

interface Chat {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
}

export const ChatList = () => {
    const router = useRouter();
    const { aiProfile } = useAIProfile();
    const { mediaAssetsConfig } = useAIMediaAssets();

    // Create a static chat item using the AI profile information
    const chat: Chat = {
        id: 'ai-chat',
        name: aiProfile.name || 'AI Assistant',
        avatar: aiProfile.avatar_url || '/default-avatar.png',
        lastMessage: aiProfile.status || 'Ready to chat',
        timestamp: new Date().toISOString(), // Use current time
        unreadCount: 1, // Example unread count
    };

    const handleChatClick = () => {
        router.push('/chat');
    };

    return (
        <div className="flex-grow overflow-y-auto">
            <div
                className="flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={handleChatClick}
            >
                <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-lg">{chat.name}</h2>
                        {/* MODIFIED: Use the ClientOnlyTimestamp component to prevent hydration mismatch */}
                        <ClientOnlyTimestamp 
                            timestamp={chat.timestamp} 
                            className="text-xs text-gray-500 dark:text-gray-400"
                        />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unreadCount > 0 && (
                    <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-500 rounded-full">
                            {chat.unreadCount}
                        </span>
                    </div>
                )}
            </div>

            {/* Example of a separator for other chats if you were to map over an array */}
            <hr className="border-gray-200 dark:border-gray-700" />
        </div>
    );
};
