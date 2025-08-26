import type { AIProfile, AdSettings, AIMediaAssetsConfig } from '@/types';

// Enhanced AI profile with multilingual personality
export const defaultAIProfile: AIProfile = {
  name: "Kruthika",
  avatarUrl: "https://i.postimg.cc/52S3BZrM/images-10.jpg",
  status: "🌸 Tumse baat karne ka wait kar rahi hun! Let's chat! 🌸",
  statusStoryText: "Ask me anything! 💬 Main hamesha available hun!",
  statusStoryImageUrl: "https://i.postimg.cc/52S3BZrM/images-10.jpg",
  statusStoryHasUpdate: true,
};

// Psychology-optimized ad settings for MAXIMUM REVENUE
export const defaultAdSettings: AdSettings = {
  adsEnabledGlobally: true,
  adsterraDirectLink: "https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69",
  adsterraDirectLinkEnabled: true,
  adsterraBannerCode: "<!-- Adsterra Banner Code Placeholder -->",
  adsterraBannerEnabled: false,
  adsterraNativeBannerCode: "<!-- Adsterra Native Banner Code Placeholder -->",
  adsterraNativeBannerEnabled: false,
  adsterraSocialBarCode: "<!-- Adsterra Social Bar Code Placeholder -->",
  adsterraSocialBarEnabled: false,
  adsterraPopunderCode: "<!-- Adsterra Pop-under Script Placeholder -->",
  adsterraPopunderEnabled: false,
  monetagDirectLink: "https://monetag.com/direct-link-placeholder",
  monetagDirectLinkEnabled: true,
  monetagBannerCode: "<!-- Monetag Banner Code Placeholder -->",
  monetagBannerEnabled: false,
  monetagNativeBannerCode: "<!-- Monetag Native Banner Code Placeholder -->",
  monetagNativeBannerEnabled: false,
  monetagPopunderCode: "<!-- Monetag Pop-under Script Placeholder -->",
  monetagPopunderEnabled: false
};

export const AI_PROFILE_CONFIG_KEY = 'ai_profile_kruthika_chat_v1';
export const AD_SETTINGS_CONFIG_KEY = 'ad_settings_kruthika_chat_v1';

// Smart media assets with psychological timing
export const defaultAIMediaAssetsConfig: AIMediaAssetsConfig = {
  assets: [
    {
      id: "selfie_1",
      type: "image",
      url: "https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg",
      description: "Main selfie"
    },
    {
      id: "selfie_2",
      type: "image",
      url: "https://i.postimg.cc/52S3BZrM/images-10.jpg",
      description: "Cute selfie"
    },
    {
      id: "laugh_audio",
      type: "audio",
      url: "/media/laugh.mp3",
      description: "Laugh sound"
    },
    {
      id: "voice_note",
      type: "audio",
      url: "/media/voice-note.mp3",
      description: "Voice message"
    }
  ]
};

// Default direct link URLs for ads
export const DEFAULT_ADSTERRA_DIRECT_LINK = "https://www.profitablecpmrate.com/g16h3b7pd?key=3c4e872ea09d8f56e46e20ac6f0ee69e";
export const DEFAULT_MONETAG_DIRECT_LINK = "https://www.profitablecpmgate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69";

// Default admin status display configuration
export const defaultAdminStatusDisplay = {
  id: "admin-own-status",
  name: "Kruthika",
  avatarUrl: "https://i.postimg.cc/52S3BZrM/images-10.jpg",
  statusText: "Ask me anything! 💬 Main hamesha available hun!",
  statusImageUrl: "https://i.postimg.cc/52S3BZrM/images-10.jpg",
  hasUpdate: true
};

// Default managed contact statuses
export const defaultManagedContactStatuses = [
  {
    id: 'demo_contact_1',
    name: 'Arjun Kumar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    statusText: 'Just finished my workout! 💪',
    statusImageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f98b2d8b?w=300&h=500&fit=crop',
    hasUpdate: true,
    dataAiHint: 'profile man fitness',
    enabled: true
  },
  {
    id: 'demo_contact_2',
    name: 'Priya Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612d29c?w=150&h=150&fit=crop&crop=face',
    statusText: 'Coffee break ☕ Perfect evening!',
    statusImageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=500&fit=crop',
    hasUpdate: false,
    dataAiHint: 'profile woman coffee',
    enabled: true
  }
];

// Export all configurations
export {
  defaultAIProfile,
  defaultAdSettings,
  defaultAIMediaAssetsConfig,
  defaultAdminStatusDisplay,
  defaultManagedContactStatuses
};