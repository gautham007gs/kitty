
/**
 * Smart Media Triggering System
 * Optimized for maximum psychological impact with minimal AI token usage
 */

import { userPersonalization } from './userPersonalization';

interface MediaAsset {
  id: string;
  type: 'image' | 'audio';
  url: string;
  trigger: string;
  psychologyType: 'validation' | 'intimacy' | 'fomo' | 'emotional' | 'casual';
  timing: 'immediate' | 'delayed' | 'random';
  effectiveness: number;
  description: string;
}

// Pre-optimized media assets for Indian girl persona
const MEDIA_ASSETS: MediaAsset[] = [
  // Validation triggers (when user compliments)
  {
    id: 'selfie_1',
    type: 'image',
    url: 'https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg',
    trigger: 'compliment_received',
    psychologyType: 'validation',
    timing: 'immediate',
    effectiveness: 0.9,
    description: 'Cute selfie - reward for compliments'
  },
  {
    id: 'mirror_selfie',
    type: 'image', 
    url: 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    trigger: 'deep_conversation',
    psychologyType: 'intimacy',
    timing: 'delayed',
    effectiveness: 0.85,
    description: 'Mirror selfie - creates intimacy'
  },
  
  // Audio for emotional connection
  {
    id: 'giggle_audio',
    type: 'audio',
    url: '/media/giggle.mp3',
    trigger: 'funny_conversation',
    psychologyType: 'emotional',
    timing: 'immediate',
    effectiveness: 0.8,
    description: 'Cute giggle - builds emotional bond'
  },
  {
    id: 'voice_note',
    type: 'audio',
    url: '/media/voice-note.mp3', 
    trigger: 'emotional_moment',
    psychologyType: 'intimacy',
    timing: 'delayed',
    effectiveness: 0.95,
    description: 'Personal voice note - maximum intimacy'
  },
  
  // FOMO creation
  {
    id: 'tease_pic',
    type: 'image',
    url: 'https://i.postimg.cc/X7K8P9Vr/selfie1.jpg',
    trigger: 'leaving_conversation',
    psychologyType: 'fomo',
    timing: 'random',
    effectiveness: 0.75,
    description: 'Teaser image to create FOMO'
  }
];

class SmartMediaTrigger {
  private userMediaHistory = new Map<string, Set<string>>();
  private lastTriggerTime = new Map<string, number>();

  shouldTriggerMedia(
    userId: string,
    userMessage: string,
    conversationContext: string,
    messageCount: number
  ): MediaAsset | null {
    const profile = userPersonalization['profiles']?.get(userId);
    const now = Date.now();
    const lastTrigger = this.lastTriggerTime.get(userId) || 0;
    
    // Minimum 2 minute gap between media
    if (now - lastTrigger < 2 * 60 * 1000) return null;
    
    const userHistory = this.userMediaHistory.get(userId) || new Set();
    const msg = userMessage.toLowerCase();
    
    // Compliment detection - immediate reward
    if (this.detectCompliment(msg)) {
      const asset = this.findUnusedAsset(userHistory, 'compliment_received');
      if (asset) {
        this.markAsUsed(userId, asset.id);
        this.lastTriggerTime.set(userId, now);
        return asset;
      }
    }
    
    // Long conversation reward (15+ messages)
    if (messageCount > 15 && messageCount % 8 === 0) {
      const asset = this.findUnusedAsset(userHistory, 'deep_conversation');
      if (asset) {
        this.markAsUsed(userId, asset.id);
        this.lastTriggerTime.set(userId, now);
        return asset;
      }
    }
    
    // Emotional moment detection
    if (this.detectEmotionalWords(msg)) {
      const asset = this.findUnusedAsset(userHistory, 'emotional_moment');
      if (asset && Math.random() < 0.4) { // 40% chance
        this.markAsUsed(userId, asset.id);
        this.lastTriggerTime.set(userId, now);
        return asset;
      }
    }
    
    // Random engagement (every 12-20 messages)
    if (messageCount > 10 && Math.random() < 0.15) {
      const availableAssets = MEDIA_ASSETS.filter(a => !userHistory.has(a.id));
      if (availableAssets.length > 0) {
        const asset = availableAssets[Math.floor(Math.random() * availableAssets.length)];
        this.markAsUsed(userId, asset.id);
        this.lastTriggerTime.set(userId, now);
        return asset;
      }
    }
    
    return null;
  }
  
  private detectCompliment(msg: string): boolean {
    const complimentWords = [
      'beautiful', 'cute', 'pretty', 'hot', 'gorgeous', 'lovely', 'amazing', 'perfect', 'sweet',
      'sundar', 'pyari', 'achhi', 'khubsurat'
    ];
    return complimentWords.some(word => msg.includes(word));
  }
  
  private detectEmotionalWords(msg: string): boolean {
    const emotionalWords = [
      'love', 'miss', 'feel', 'heart', 'emotion', 'care', 'feelings', 'sad', 'happy', 'excited',
      'pyaar', 'mohabbat', 'dil', 'yaad'
    ];
    return emotionalWords.some(word => msg.includes(word));
  }
  
  private findUnusedAsset(userHistory: Set<string>, trigger: string): MediaAsset | null {
    const availableAssets = MEDIA_ASSETS.filter(
      asset => asset.trigger === trigger && !userHistory.has(asset.id)
    );
    
    if (availableAssets.length === 0) {
      // Reset if all used, but prioritize high effectiveness
      const resetAssets = MEDIA_ASSETS.filter(asset => asset.trigger === trigger);
      return resetAssets.sort((a, b) => b.effectiveness - a.effectiveness)[0] || null;
    }
    
    return availableAssets.sort((a, b) => b.effectiveness - a.effectiveness)[0];
  }
  
  private markAsUsed(userId: string, assetId: string): void {
    if (!this.userMediaHistory.has(userId)) {
      this.userMediaHistory.set(userId, new Set());
    }
    this.userMediaHistory.get(userId)!.add(assetId);
  }
  
  generatePsychologicalCaption(asset: MediaAsset, language: string): string {
    const captions = {
      hindi: {
        validation: [
          "Tumne itni tareef ki toh socha share kar dun! 😊 Kaisi lag rahi hun? 💕",
          "Aww thanks baby! 🥰 Tumhare liye specially! ✨",
          "Itna sweet comment ke baad I had to! 😄 Hope you like it! 🌟"
        ],
        intimacy: [
          "Bas tumhare saath comfortable feel karti hun share karne mein... 😊💕",
          "Long conversations ki reward! 🎁 Just for you! ✨",
          "Sirf close friends ke liye... You're special! 🥰"
        ],
        emotional: [
          "Tumhare liye kuch special! 🎵 Dil se! 💖",
          "Words nahi express kar sakte... This says it better! 🥰",
          "Emotional moment capture kar liya! 📸💕"
        ],
        fomo: [
          "Kal kuch aur interesting bataungi! 😉 Don't miss it! ✨",
          "This is just a preview... Tomorrow ka plan bigger hai! 🤫",
          "Sneak peek! Full story kal! 📚💕"
        ]
      },
      english: {
        validation: [
          "Your compliment made my day! 😊 What do you think? 💕",
          "Since you were so sweet! 🥰 Just for you! ✨", 
          "Had to share after that cute comment! 😄 Hope you love it! 🌟"
        ],
        intimacy: [
          "Only feel comfortable sharing with you... 😊💕",
          "Reward for our amazing conversation! 🎁 Exclusive for you! ✨",
          "For close friends only... You're special! 🥰"
        ],
        emotional: [
          "Something from the heart! 🎵 Just for you! 💖",
          "Words aren't enough sometimes... This says it better! 🥰",
          "Captured this emotional moment! 📸💕"
        ],
        fomo: [
          "Tomorrow's surprise will be even better! 😉 Don't miss it! ✨",
          "This is just a teaser... Bigger plans for tomorrow! 🤫",
          "Sneak peek! Full reveal tomorrow! 📚💕"
        ]
      }
    };
    
    const langCaptions = captions[language] || captions.english;
    const typeCaptions = langCaptions[asset.psychologyType] || langCaptions.validation;
    
    return typeCaptions[Math.floor(Math.random() * typeCaptions.length)];
  }
}

export const smartMediaTrigger = new SmartMediaTrigger();

// Recommended media assets to store on server:
export const RECOMMENDED_MEDIA_ASSETS = {
  images: [
    'Cute selfies (5-7 different angles)',
    'Mirror selfies (2-3)',
    'Casual photos (3-4)',
    'Outfit photos (2-3)', 
    'Study/work setup photos (2)',
    'Food photos (Indian dishes, 2-3)',
    'Evening/night photos (2)',
    'Traditional wear photos (1-2)'
  ],
  audio: [
    'Cute giggle (3-5 seconds)',
    'Sweet laugh (2-4 seconds)', 
    'Voice saying "Hi baby" in Hindi/English (2-3 versions)',
    'Humming a tune (5-7 seconds)',
    'Saying "Miss you" emotionally (2 versions)',
    'Whispering "Secret time" (3 seconds)',
    'Excited "Guess what!" (2 seconds)',
    'Sleepy "Good night" (3 seconds)'
  ]
};
