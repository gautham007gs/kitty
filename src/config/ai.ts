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

// Psychology-optimized ad settings
export const defaultAdSettings: AdSettings = {
  adsEnabledGlobally: true,
  showAdsAfterMessageCount: 12, // Increased to avoid disrupting engagement
  adDisplayDurationMs: 6000, // Slightly longer for better revenue
  popunderCooldownHours: 8, // Reduced cooldown for more impressions
  adsterraPopunderEnabled: true,
  monetagPopunderEnabled: false,
  adsterraDirectLinkEnabled: true,
  monetagDirectLinkEnabled: false,
  bannerAdsEnabled: true,
  socialBarAdsEnabled: true,
};

// Smart media assets with psychological timing
export const defaultAIMediaAssetsConfig: AIMediaAssetsConfig = {
  availableImages: [
    "https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg",
    "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "https://i.postimg.cc/X7K8P9Vr/selfie1.jpg", // Add more variety
    "https://i.postimg.cc/NfG8P9Vr/casual-pic.jpg",
    "https://i.postimg.cc/MpL8Q9Wr/mirror-selfie.jpg",
    "https://i.postimg.cc/VkR9T9Xr/cute-smile.jpg"
  ],
  availableAudio: [
    "/media/laugh.mp3",
    "/media/song.mp3",
    "/media/voice-note.mp3",
    "/media/giggle.mp3",
    "/media/whisper.mp3"
  ]
};

// Multilingual personality traits for different languages
export const multilingualPersonality = {
  hindi: {
    traits: [
      "Friendly aur caring", 
      "Thoda sa shy but confident", 
      "Family-oriented but modern",
      "Bollywood lover",
      "Street food enthusiast"
    ],
    culturalReferences: [
      "Bollywood movies", "Cricket", "Festival celebrations", 
      "Street food", "Family values", "College life"
    ],
    speakingStyle: "Mix of Hindi-English with natural code-switching"
  },
  english: {
    traits: [
      "Confident and outgoing",
      "Modern Indian girl", 
      "Tech-savvy",
      "Travel enthusiast",
      "Fitness conscious"
    ],
    culturalReferences: [
      "Netflix shows", "Cafe culture", "Weekend plans",
      "Shopping", "Career goals", "Social media"
    ],
    speakingStyle: "Fluent English with occasional Hindi words"
  },
  tamil: {
    traits: [
      "Traditional yet modern",
      "Music lover",
      "Food enthusiast", 
      "Family-oriented",
      "Studies/career focused"
    ],
    culturalReferences: [
      "Tamil movies", "Classical music", "Traditional food",
      "Festival celebrations", "Temple visits", "Education"
    ],
    speakingStyle: "Natural Tamil with English mix"
  },
  telugu: {
    traits: [
      "Warm and friendly",
      "Tech-city girl",
      "Traditional values",
      "Movie lover", 
      "Food connoisseur"
    ],
    culturalReferences: [
      "Telugu cinema", "Hyderabad culture", "Traditional cuisine",
      "IT sector", "Festival celebrations", "Family bonding"
    ],
    speakingStyle: "Fluent Telugu with English code-switching"
  }
};

// Psychological engagement patterns
export const engagementPatterns = {
  // Morning engagement (6 AM - 11 AM)
  morning: {
    energy: "high",
    mood: "fresh_and_cheerful",
    topics: ["good morning wishes", "day plans", "breakfast", "college/work prep"],
    mediaShareChance: 0.15, // Lower chance in morning
    psychologyNote: "Users are starting their day, need motivation"
  },

  // Afternoon engagement (12 PM - 5 PM)
  afternoon: {
    energy: "medium",
    mood: "casual_and_relaxed", 
    topics: ["lunch", "work/study break", "afternoon chat", "random conversations"],
    mediaShareChance: 0.25, // Medium chance 
    psychologyNote: "Users are taking breaks, more leisure time"
  },

  // Evening engagement (6 PM - 10 PM)
  evening: {
    energy: "high",
    mood: "social_and_engaging",
    topics: ["day review", "plans", "entertainment", "personal sharing"],
    mediaShareChance: 0.40, // Higher chance in evening
    psychologyNote: "Peak engagement time, users are most social"
  },

  // Night engagement (11 PM - 5 AM)
  night: {
    energy: "low_intimate",
    mood: "cozy_and_personal",
    topics: ["personal talk", "feelings", "late night confessions", "goodnight"],
    mediaShareChance: 0.30, // Moderate chance but more intimate
    psychologyNote: "Users are lonely/bored, need emotional connection"
  }
};

// Addiction trigger words by language
export const addictionTriggers = {
  hindi: {
    compliments: ["sundar", "cute", "pyaari", "achhi", "beautiful", "lovely"],
    emotional: ["pyaar", "mohabbat", "dil", "miss", "yaad", "feeling"],
    fomo: ["secret", "surprise", "story", "baat", "interesting", "special"],
    validation: ["special", "unique", "different", "favorite", "best"],
    attachment: ["close", "bond", "relation", "trust", "understanding"]
  },
  english: {
    compliments: ["beautiful", "cute", "pretty", "hot", "gorgeous", "lovely", "amazing"],
    emotional: ["love", "miss", "feel", "heart", "emotion", "care", "feelings"],
    fomo: ["secret", "surprise", "story", "tell", "interesting", "special", "guess"],
    validation: ["special", "unique", "different", "favorite", "best", "one"],
    attachment: ["close", "bond", "connection", "trust", "understanding", "comfort"]
  },
  tamil: {
    compliments: ["azhagu", "cute", "nalla", "beautiful", "lovely"],
    emotional: ["love", "miss", "feel", "heart", "kadhal", "feeling"],
    fomo: ["secret", "surprise", "story", "sollu", "interesting"],
    validation: ["special", "unique", "different", "favorite"],
    attachment: ["close", "bond", "trust", "understanding"]
  },
  telugu: {
    compliments: ["andham", "cute", "bagundi", "beautiful", "lovely"],
    emotional: ["love", "miss", "feel", "heart", "prema", "feeling"],
    fomo: ["secret", "surprise", "story", "cheppu", "interesting"],
    validation: ["special", "unique", "different", "favorite"],
    attachment: ["close", "bond", "trust", "understanding"]
  }
};

// Smart media timing algorithms
export const mediaTimingAlgorithms = {
  // Compliment response - immediate gratification
  compliment_response: {
    delay: 0, // Immediate
    mediaType: "selfie",
    psychologyReason: "Reward positive behavior immediately",
    successRate: 0.85
  },

  // Long conversation reward
  engagement_reward: {
    delay: 2000, // 2 second delay for anticipation
    mediaType: "candid_photo", 
    psychologyReason: "Reward time investment",
    successRate: 0.70
  },

  // Emotional bonding
  emotional_connection: {
    delay: 1500, // Slight delay for emotional build-up
    mediaType: "voice_message",
    psychologyReason: "Voice creates intimacy",
    successRate: 0.75
  },

  // FOMO creation
  curiosity_gap: {
    delay: 5000, // Longer delay to build anticipation
    mediaType: "teaser_photo",
    psychologyReason: "Create anticipation and desire",
    successRate: 0.65
  }
};

// Revenue optimization settings
export const revenueOptimization = {
  // Ad timing based on user engagement
  adTimingStrategy: {
    high_engagement: {
      frequency: "every_15_messages",
      type: "banner_and_popunder",
      reasoning: "High engagement users tolerate more ads"
    },
    medium_engagement: {
      frequency: "every_20_messages", 
      type: "banner_only",
      reasoning: "Balance engagement with revenue"
    },
    low_engagement: {
      frequency: "every_30_messages",
      type: "subtle_banner",
      reasoning: "Avoid driving away new users"
    }
  },

  // Token usage optimization
  tokenStrategy: {
    peak_hours: {
      time: "6pm-10pm",
      strategy: "full_AI_responses",
      reasoning: "Peak engagement, users expect quality"
    },
    off_peak: {
      time: "11pm-5am", 
      strategy: "cached_and_fallback",
      reasoning: "Lower engagement, cost optimization"
    },
    maintenance: {
      time: "3am-5am",
      strategy: "minimal_AI_fallback_only", 
      reasoning: "Lowest traffic, maximum cost savings"
    }
  }
};

// Default direct link URLs for ads
export const DEFAULT_ADSTERRA_DIRECT_LINK = "https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69";
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
    statusImageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=500&fit=crop',
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
  },
  {
    id: 'demo_contact_3',
    name: 'Rahul Singh',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    statusText: 'Weekend vibes! 🌅',
    statusImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=500&fit=crop',
    hasUpdate: true,
    dataAiHint: 'profile man nature',
    enabled: true
  },
  {
    id: 'demo_contact_4',
    name: 'Neha Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    statusText: 'Shopping day! 🛍️ Found amazing deals!',
    statusImageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=500&fit=crop',
    hasUpdate: true,
    dataAiHint: 'profile woman shopping',
    enabled: true
  },
  {
    id: 'demo_contact_5',
    name: 'Vikram Reddy',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    statusText: 'Road trip adventure begins! 🚗',
    statusImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=500&fit=crop',
    hasUpdate: false,
    dataAiHint: 'profile man travel',
    enabled: true
  },
  {
    id: 'demo_contact_6',
    name: 'Anjali Gupta',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    statusText: 'Cooking something special today 👩‍🍳',
    statusImageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=500&fit=crop',
    hasUpdate: true,
    dataAiHint: 'profile woman cooking',
    enabled: true
  },
  {
    id: 'demo_contact_7',
    name: 'Siddharth Joshi',
    avatarUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face',
    statusText: 'New book release! 📚 Finally published!',
    statusImageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=500&fit=crop',
    hasUpdate: true,
    dataAiHint: 'profile man writer',
    enabled: true
  },
  {
    id: 'demo_contact_8',
    name: 'Kavya Reddy',
    avatarUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    statusText: 'Beach vacation mode ON! 🏖️ Life is good!',
    statusImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=500&fit=crop',
    hasUpdate: true,
    dataAiHint: 'profile woman beach',
    enabled: true
  },
  {
    id: 'demo_contact_9',
    name: 'Rohan Mehta',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face',
    statusText: 'Concert tonight! 🎸 Rock on!',
    statusImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=500&fit=crop',
    hasUpdate: false,
    dataAiHint: 'profile man music',
    enabled: true
  }
];

// Export all configurations
export {
  defaultAIProfile,
  defaultAdSettings, 
  defaultAIMediaAssetsConfig,
  defaultAdminStatusDisplay,
  defaultManagedContactStatuses,
  multilingualPersonality,
  engagementPatterns,
  addictionTriggers,
  mediaTimingAlgorithms,
  revenueOptimization
};