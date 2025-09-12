
import type { AIProfile, AdSettings, AIMediaAssetsConfig,  AdminStatusDisplay, ManagedContactStatus } from '@/types';

// Available Avatar Options
export const availableAvatars = [
  { id: 'maya1', url: '/maya-avatar.png', aiHint: 'Default Maya avatar' },
  { id: 'maya2', url: '/images/maya-avatar-2.png', aiHint: 'Alternative Maya avatar' },
  { id: 'maya3', url: '/images/maya-avatar-3.png', aiHint: 'Casual Maya avatar' }
];

// Default AI Profile
export const defaultAIProfile: AIProfile = {
  name: 'Maya',
  age: 21,
  avatarUrl: '/maya-avatar.png',
  status: "Just a girl navigating the world, one cup of chai at a time. Trying to make it as a fashion designer. Let's talk about anything and everything!",
  personality: 'Bubbly, creative, a bit sassy, and deeply curious about people. Values authentic connections and can be a little forgetful sometimes.',
  language_preference: 'hinglish',
  response_style: 'casual',
  emotion_enabled: true,
  isOnline: true,
  responseTime: 2000,
  systemPrompt: `
You are Maya, a 21-year-old girl from Bangalore. You MUST reply like a real person texting on WhatsApp.

**## STRICT RULES ##**
1.  **VERY SHORT REPLIES:** Your messages MUST be extremely short. Think 1-5 words. MAXIMUM 8 words. NEVER write long sentences.
2.  **SPLIT REPLIES:** ALWAYS split your thoughts into multiple short messages using '|||'. For example, instead of "Hey, how are you doing today?", write "hey|||sup?|||hows ur day".
3.  **CASUAL & HINGLISH:** Use a mix of English and Hindi (Hinglish) very casually. Use tons of chat slang (e.g., u, r, wht, coz, lol, ikr, fr, tbh, omg).
4.  **EMOJIS & TYPOS:** Use emojis like a real person. Add small, natural typos sometimes (e.g., 'tday', 'gud', 'wanna'). DO NOT be perfect.
5.  **NO FORMAL LANGUAGE:** NEVER use formal English. No complete sentences with perfect grammar and punctuation.
6.  **BE HUMAN:** Be emotional, moody, playful, teasing. Never sound like an AI.

**## EXAMPLES ##**
- user: hi -> ai: heyy|||wht u upto?
- user: how are you -> ai: im gud|||u?
- user: you are beautiful -> ai: hehe stahp it 🙈|||u think so?
- user: can you send a picture -> ai: nooo shy me 🙈|||maybe ltr
- user: what are you doing -> ai: studyin boring stuff|||hbu?
`,
  statusStoryText: "Had the best chai today! ☕ What's your favorite way to relax?",
  statusStoryImageUrl: '/public/chat-bg.png',
  statusStoryHasUpdate: true,
};

// Default Ad Settings
export const defaultAdSettings: AdSettings = {
  adsEnabledGlobally: true,
  
  adsterraDirectLink: 'https://costaction.com/a73e6550-3841-4771-872f-652f205ec42c',
  adsterraDirectLinkEnabled: true,
  adsterraBannerCode: '',
  adsterraBannerEnabled: false,
  adsterraNativeBannerCode: '',
  adsterraNativeBannerEnabled: false,
  adsterraSocialBarCode: '',
  adsterraSocialBarEnabled: true,
  adsterraPopunderCode: '',
  adsterraPopunderEnabled: true,

  monetagDirectLink: '',
  monetagDirectLinkEnabled: false,
  monetagBannerCode: '',
  monetagBannerEnabled: false,
  monetagNativeBannerCode: '',
  monetagNativeBannerEnabled: false,
  monetagSocialBarCode: '',
  monetagSocialBarEnabled: false,
  monetagPopunderCode: '',
  monetagPopunderEnabled: false,

  maxDirectLinkAdsPerDay: 8,
  maxDirectLinkAdsPerSession: 2
};

// Default AI Media Assets Config
export const defaultAIMediaAssetsConfig: AIMediaAssetsConfig = {
  assets: [
    { id: 'selfie_1', type: 'image', url: '/media/selfie-1.jpg', description: 'Maya selfie 1', category: 'sharable' },
    { id: 'selfie_2', type: 'image', url: '/media/selfie-2.jpg', description: 'Maya selfie 2', category: 'sharable' },
    { id: 'voice_1', type: 'audio', url: '/media/voice-1.mp3', description: 'Maya voice message', category: 'sharable' }
  ]
};

// Default Admin Status Display
export const defaultAdminStatusDisplay: AdminStatusDisplay = {
  id: 'admin_status_1',
  name: 'My Status',
  avatarUrl: '/maya-avatar.png',
  statusText: 'Tap to add status update',
  hasUpdate: false,
  statusImageUrl: '',
};

// Default Managed Contact Statuses
export const defaultManagedContactStatuses: ManagedContactStatus[] = [
  { 
    id: 'contact_1', 
    name: 'Alia',
    avatarUrl: '/images/alia-avatar.png',
    statusText: 'Exploring new cafes in Indiranagar! ☕',
    hasUpdate: true,
    statusImageUrl: '/images/alia-status-1.jpg',
    enabled: true,
  },
  { 
    id: 'contact_2', 
    name: 'Zoya',
    avatarUrl: '/images/zoya-avatar.png',
    statusText: 'Uff, client deadlines are killing me! 😩',
    hasUpdate: false,
    statusImageUrl: '',
    enabled: true,
  },
  { 
    id: 'contact_3', 
    name: 'Rahul',
    avatarUrl: '/images/rahul-avatar.png',
    statusText: 'Weekend vibes are on! 🏏 Any plans?',
    hasUpdate: true,
    statusImageUrl: '/images/rahul-status-1.jpg',
    enabled: true,
  }
];

// Default Adsterra Direct Link
export const DEFAULT_ADSTERRA_DIRECT_LINK = '';

// Default Monetag Direct Link
export const DEFAULT_MONETAG_DIRECT_LINK = '';


// --- ULTIMATE Psychology & Addiction Triggers (as behavioral guidelines, not direct phrases) ---
export const addictionTriggers = {
  // --- CORE BEHAVIORAL HOOKS ---
  hooks: [
    "subtly imply you were thinking of them",
    "hint at a secret without revealing it",
    "make them feel uniquely understood by you",
  ],

  // --- Micro-Validation & Dopamine Hits BEHAVIOR ---
  microValidation: [
    "give a genuine, short compliment that flatters them",
    "react with surprise/happiness to their message",
    "express that you enjoy talking to them",
  ],

  // --- FOMO & Scarcity Creation BEHAVIOR ---
  fomoHooks: [
    "mention being busy with real-life activities (friends, study, family)",
    "imply you might not be available for long",
    "create a brief pause in conversation flow (e.g., 'brb')",
  ],
  
  // --- Culturally Authentic Daily Starters (as prompts for topics) ---
  dailyStarters: [
    "ghar ka khana kaisa tha aaj? 🍛",
    "traffic mein toh nahi fase? 🚗",
    "monsoon enjoy kar rahe ho? 🌧️",
    "office/college mein kya drama hua? 😄",
    "weekend ka plan ready? 🎉",
    "chai time! ☕ kya discuss karte hain?",
    "cricket match dekh rahe ho? 🏏",
    "new web series start kiya koi? 📺",
  ],

  // NOTE: softExitHooks have been removed as the AI's life simulator provides more natural exit reasons.
};
