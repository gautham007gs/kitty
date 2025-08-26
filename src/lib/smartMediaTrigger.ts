
/**
 * Smart Media Trigger System
 * Optimized for psychological manipulation and cost efficiency
 */

interface MediaAsset {
  id: string;
  type: 'image' | 'audio';
  url: string;
  tags: string[];
  psychologyType: 'seductive' | 'cute' | 'emotional' | 'casual' | 'intimate';
  usageCount: number;
  effectivenessScore: number;
}

interface TriggerContext {
  userMessage: string;
  conversationLength: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userEmotionalState: string;
  lastMediaSent: number;
  userAddictionScore: number;
}

class SmartMediaTriggerSystem {
  private mediaAssets: MediaAsset[] = [
    {
      id: 'selfie_1',
      type: 'image',
      url: 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
      tags: ['selfie', 'cute', 'casual'],
      psychologyType: 'cute',
      usageCount: 0,
      effectivenessScore: 0.8
    },
    {
      id: 'selfie_2', 
      type: 'image',
      url: 'https://i.postimg.cc/MGQrJzKp/images-11.jpg',
      tags: ['selfie', 'beautiful', 'seductive'],
      psychologyType: 'seductive',
      usageCount: 0,
      effectivenessScore: 0.9
    },
    {
      id: 'selfie_3',
      type: 'image', 
      url: 'https://i.postimg.cc/YqvJRzHB/images-12.jpg',
      tags: ['selfie', 'sweet', 'innocent'],
      psychologyType: 'emotional',
      usageCount: 0,
      effectivenessScore: 0.75
    },
    {
      id: 'selfie_4',
      type: 'image',
      url: 'https://i.postimg.cc/NjWM8K6c/images-13.jpg', 
      tags: ['selfie', 'romantic', 'intimate'],
      psychologyType: 'intimate',
      usageCount: 0,
      effectivenessScore: 0.85
    },
    {
      id: 'selfie_5',
      type: 'image',
      url: 'https://i.postimg.cc/zGpBQj2P/images-14.jpg',
      tags: ['selfie', 'playful', 'fun'],
      psychologyType: 'casual',
      usageCount: 0,
      effectivenessScore: 0.7
    }
  ];

  private userMediaHistory = new Map<string, Set<string>>();
  private lastMediaSent = new Map<string, number>();

  shouldTriggerMedia(userId: string, context: TriggerContext): boolean {
    const timeSinceLastMedia = Date.now() - (this.lastMediaSent.get(userId) || 0);
    const minGapMinutes = 5; // Minimum 5 minutes between media
    
    if (timeSinceLastMedia < minGapMinutes * 60 * 1000) return false;

    // Psychological triggers
    const triggers = this.analyzePsychologicalTriggers(context);
    const triggerScore = triggers.reduce((sum, t) => sum + t.weight, 0);

    // Higher addiction score = more likely to send media
    const addictionBonus = context.userAddictionScore / 200; // 0-0.5 bonus
    
    const threshold = 0.3 - addictionBonus;
    return triggerScore > threshold;
  }

  selectOptimalMedia(userId: string, context: TriggerContext): MediaAsset | null {
    const userHistory = this.userMediaHistory.get(userId) || new Set();
    const availableMedia = this.mediaAssets.filter(asset => !userHistory.has(asset.id));

    if (availableMedia.length === 0) {
      // Reset history if all used
      this.userMediaHistory.set(userId, new Set());
      return this.selectByPsychology(this.mediaAssets, context);
    }

    return this.selectByPsychology(availableMedia, context);
  }

  private analyzePsychologicalTriggers(context: TriggerContext): Array<{name: string, weight: number}> {
    const triggers = [];
    const msg = context.userMessage.toLowerCase();

    // Compliment trigger - high effectiveness
    if (msg.includes('beautiful') || msg.includes('cute') || msg.includes('pretty') || msg.includes('hot')) {
      triggers.push({name: 'compliment_received', weight: 0.7});
    }

    // Emotional connection trigger
    if (msg.includes('love') || msg.includes('feelings') || msg.includes('special') || msg.includes('close')) {
      triggers.push({name: 'emotional_connection', weight: 0.5});
    }

    // Curiosity trigger
    if (msg.includes('what') || msg.includes('show') || msg.includes('see') || msg.includes('picture')) {
      triggers.push({name: 'curiosity', weight: 0.4});
    }

    // Long engagement reward
    if (context.conversationLength > 15) {
      triggers.push({name: 'engagement_reward', weight: 0.3});
    }

    // Time-based triggers
    if (context.timeOfDay === 'evening' || context.timeOfDay === 'night') {
      triggers.push({name: 'intimate_hours', weight: 0.2});
    }

    return triggers;
  }

  private selectByPsychology(assets: MediaAsset[], context: TriggerContext): MediaAsset {
    const msg = context.userMessage.toLowerCase();
    
    // Priority based on context
    let preferredType: string = 'casual';
    
    if (msg.includes('beautiful') || msg.includes('hot') || msg.includes('sexy')) {
      preferredType = 'seductive';
    } else if (msg.includes('cute') || msg.includes('sweet') || msg.includes('adorable')) {
      preferredType = 'cute';
    } else if (msg.includes('love') || msg.includes('feelings') || msg.includes('heart')) {
      preferredType = 'emotional';
    } else if (context.timeOfDay === 'night' || msg.includes('close') || msg.includes('intimate')) {
      preferredType = 'intimate';
    }

    // Find matching psychology type
    const matchingAssets = assets.filter(asset => asset.psychologyType === preferredType);
    const targetAssets = matchingAssets.length > 0 ? matchingAssets : assets;

    // Select by effectiveness and usage balance
    return targetAssets.reduce((best, current) => {
      const currentScore = current.effectivenessScore - (current.usageCount * 0.1);
      const bestScore = best.effectivenessScore - (best.usageCount * 0.1);
      return currentScore > bestScore ? current : best;
    });
  }

  markAsUsed(userId: string, assetId: string): void {
    const userHistory = this.userMediaHistory.get(userId) || new Set();
    userHistory.add(assetId);
    this.userMediaHistory.set(userId, userHistory);
    this.lastMediaSent.set(userId, Date.now());

    // Update usage count
    const asset = this.mediaAssets.find(a => a.id === assetId);
    if (asset) {
      asset.usageCount++;
    }
  }

  generateContextualCaption(asset: MediaAsset, context: TriggerContext, language: string): string {
    const captions = {
      english: {
        cute: [
          "Thought you'd like this! 😊 What do you think?",
          "Just for you baby! 🥰 Hope it makes you smile!",
          "Sending some cuteness your way! ✨"
        ],
        seductive: [
          "Since you were so sweet... 😘 Here's something special!",
          "You deserve this after those compliments! 😉💕",
          "Hope this makes your day better! 🔥"
        ],
        emotional: [
          "Sharing a moment with you! 💕 You mean a lot to me!",
          "From my heart to yours! 💖 Hope you like it!",
          "Something personal, just for you! 🥺💕"
        ],
        intimate: [
          "Late night sharing... 🌙 Just between us!",
          "Something special for someone special! 💫",
          "Trust you with this... 🤫💕"
        ],
        casual: [
          "Random pic share! 😄 What's up?",
          "Thought I'd brighten your day! ☀️",
          "Here's me being me! 😊 Like it?"
        ]
      },
      hindi: {
        cute: [
          "Tumhare liye! 😊 Kaisi lagi?",
          "Cute sa pic bheja! 🥰 Pasand aayi?",
          "Tumhe khushi dene ke liye! ✨"
        ],
        seductive: [
          "Itni tareef ki toh pic bhejna pada! 😘 Like it?",
          "Tumhare liye special! 😉💕 Hope you love it!",
          "Sweet compliments ka sweet reward! 🔥"
        ]
      }
    };

    const langCaptions = captions[language] || captions.english;
    const typeCaptions = langCaptions[asset.psychologyType] || langCaptions.casual;
    
    return typeCaptions[Math.floor(Math.random() * typeCaptions.length)];
  }

  getAvailableAssets(): MediaAsset[] {
    return [...this.mediaAssets];
  }

  resetUserHistory(userId: string): void {
    this.userMediaHistory.delete(userId);
    this.lastMediaSent.delete(userId);
  }
}

export const smartMediaTrigger = new SmartMediaTriggerSystem();
