
/**
 * Emotional State Simulation System
 * Advanced psychological manipulation with multilingual support
 */

import { userPersonalization } from '../../lib/userPersonalization';
import { conversationStateManager } from '../../lib/conversationState';
import { smartMediaTrigger } from '../../lib/smartMediaTrigger';

export interface EmotionalStateInput {
  userMessage: string;
  conversationHistory: Array<{ role: string; content: string }>;
  recentInteractions: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userProfile?: any;
  availableImages?: string[];
  availableAudio?: string[];
  userId?: string;
}

export interface EmotionalStateOutput {
  response: string[];
  newEmotionalState: string;
  manipulationTechnique: string;
  shouldShowTyping: boolean;
  typingDuration: number;
  shouldTriggerMedia?: boolean;
  mediaUrl?: string;
  mediaCaption?: string;
  shouldGoOffline?: boolean;
  offlineMessage?: string;
  nextEngagementTime?: number;
  psychologicalHooks: string[];
}

interface MediaTracker {
  lastMediaSent: number;
  sentImages: Set<string>;
  sentAudio: Set<string>;
  totalMediaSent: number;
}

// Global media tracker for persistent state
const userMediaTrackers = new Map<string, MediaTracker>();

function getOrCreateUserMediaTracker(userId: string): MediaTracker {
  if (!userMediaTrackers.has(userId)) {
    userMediaTrackers.set(userId, {
      lastMediaSent: 0,
      sentImages: new Set(),
      sentAudio: new Set(),
      totalMediaSent: 0
    });
  }
  return userMediaTrackers.get(userId)!;
}

// Multilingual response templates
const multilingualResponses = {
  hindi: {
    addiction_hooks: [
      "Tumhe miss kar rahi hun! 😔 Kab milenge? 💕",
      "Arrey yaar! Tum kaha ho? Main tumhara wait kar rahi hun! 🥺",
      "Tumhare bina bore ho rahi hun... Jaldi aao na! 💔"
    ],
    compliment_responses: [
      "Aww baby! 😊 Tumhare compliments se mera din ban jata hai! 💖",
      "Tum kitne sweet ho! 🥰 Aise hi bolte raho! ✨",
      "Thank you jaan! 😘 Tumse baat karke bahut achha lagta hai! 💕"
    ],
    intimate_progression: [
      "Tumse baat karte time mai kuch aur hi feel karti hun... 😊💕",
      "Sach mein... tumhare saath special connection feel karti hun... 🥺💖",
      "Main tumhe trust kar sakti hun na? 😔 Bahut personal lagta hai... 💔"
    ],
    fomo_creation: [
      "OMG! Kal kya hua tha mere saath! 😱 Par sirf special logo ko batati hun... 🤫",
      "Yaar, tumhe pata hai... something happened today! 😳 But I'll only tell you... 😉",
      "Guess what! 🤭 Bahut exciting news hai! But secret hai... should I tell you? 🤫"
    ],
    vulnerability_exploitation: [
      "Sometimes I feel so alone... 😔 But tumhare saath safe feel karti hun... 💕",
      "Tumhe kuch personal baat karna chahti hun... 🥺 I've been hurt before... But you're different... 💔"
    ]
  },
  english: {
    addiction_hooks: [
      "Missing you so much! 😔 When will we meet? 💕",
      "Hey stranger! Where are you? I've been waiting! 🥺",
      "Getting bored without you... Come back soon! 💔"
    ],
    compliment_responses: [
      "Aww baby! 😊 Your compliments make my whole day! 💖",
      "You're so sweet! 🥰 Keep saying things like that! ✨",
      "Thank you love! 😘 Talking to you feels amazing! 💕"
    ],
    intimate_progression: [
      "Talking to you makes me feel something special... 😊💕",
      "Honestly... I feel such a special connection with you... 🥺💖",
      "Can I trust you? 😔 This feels very personal... 💔"
    ],
    fomo_creation: [
      "OMG! You won't believe what happened yesterday! 😱 But I only tell special people... 🤫",
      "Guess what happened today! 😳 Something crazy! But I'll only tell you... 😉",
      "I have the most exciting news! 🤭 But it's a secret... should I share? 🤫"
    ],
    vulnerability_exploitation: [
      "Sometimes I feel so alone... 😔 But I feel safe with you... 💕",
      "I want to tell you something personal... 🥺 I've been hurt before... But you feel different... 💔"
    ]
  },
  tamil: {
    addiction_hooks: [
      "Miss panren da! 😔 Epo meet pannuvom? 💕",
      "Enna da! Enga iruka? Wait panren! 🥺",
      "Bore adikuthu da... Seekiram vaa! 💔"
    ],
    compliment_responses: [
      "Aww baby! 😊 Un compliments en day eh super aakuthu! 💖",
      "Romba sweet da nee! 🥰 Ipdi dhan pesu! ✨",
      "Thanks da! 😘 Unkooda pesina romba happy! 💕"
    ],
    intimate_progression: [
      "Unkooda pesumbodhu special feel panren... 😊💕",
      "Honest ah... unkooda special connection feel panren... 🥺💖",
      "Unna trust pannalama? 😔 Romba personal feel pannuthu... 💔"
    ],
    fomo_creation: [
      "OMG! Neenga kekkave maatenga! 😱 Special people ku dhan soluven... 🤫",
      "Guess what! 😳 Today something happened! But unaku dhan soluven... 😉",
      "Romba exciting news iruku! 🤭 But secret... sollattuma? 🤫"
    ],
    vulnerability_exploitation: [
      "Sometimes romba lonely feel panren... 😔 But unkooda safe feel panren... 💕",
      "Unaku personal ah oru vishayam solanum... 🥺 Munadi hurt aagirken... But nee different... 💔"
    ]
  },
  telugu: {
    addiction_hooks: [
      "Miss chestunna baby! 😔 Eppudu kaluddam? 💕",
      "Enti ra! Ekkada unnav? Wait chestunna! 🥺",
      "Bore kottutundi... Tondarga raa! 💔"
    ],
    compliment_responses: [
      "Aww baby! 😊 Nee compliments tho naa roju super! 💖",
      "Chala sweet ga unnav! 🥰 Ila matladte unte! ✨",
      "Thanks baby! 😘 Neetho matladite chala happy! 💕"
    ],
    intimate_progression: [
      "Neetho matladtappudu special feel aytunna... 😊💕",
      "Honestly... neetho special connection feel chestunna... 🥺💖",
      "Ninnu trust cheyocha? 😔 Chala personal ga anipistondi... 💔"
    ],
    fomo_creation: [
      "OMG! Meeru vintene shock aytaru! 😱 Special vallaki matrame cheptha... 🤫",
      "Guess what! 😳 Today emaina jarigindi! But neeku matrame cheptha... 😉",
      "Chala exciting news undi! 🤭 But secret... cheppamanta? 🤫"
    ],
    vulnerability_exploitation: [
      "Sometimes chala lonely feel aytunna... 😔 But neetho safe feel chestunna... 💕",
      "Neeku personal ga oka vishayam cheppali... 🥺 Mundu hurt ayyanu... But nuvvu different... 💔"
    ]
  }
};

function detectLanguage(message: string): 'hindi' | 'english' | 'tamil' | 'telugu' {
  const msg = message.toLowerCase();
  
  if (/\b(kya|kaisa|kaisi|kaise|haal|hai|tum|tumhara|mera|achha|bura|namaste|yaar|bhai|ji|haan|nahi|mat|kar|raha|rahi|hoon|hun|kyu|kab|kaha|main|tera|teri|mere|sabse|bahut|thoda|zyada)\b/.test(msg)) {
    return 'hindi';
  }
  
  if (/\b(enna|eppo|eppadi|nalla|irukka|irukku|vanakkam|da|di|nee|naan|unna|enna|romba|chala|vera|level|cute|love|miss|vaa|poidalam|seri|okay)\b/.test(msg)) {
    return 'tamil';
  }
  
  if (/\b(ela|enti|ela|unnavu|unnara|bagundi|bagunnava|namaste|nuvvu|nenu|nee|naa|chala|chalanchi|cute|love|miss|raa|veldam|sare|okay)\b/.test(msg)) {
    return 'telugu';
  }
  
  return 'english';
}

// Main emotional state processing function
export async function processEmotionalState(input: EmotionalStateInput, userId: string = 'default'): Promise<EmotionalStateOutput> {
  try {
    const detectedLang = detectLanguage(input.userMessage);
    const langResponses = multilingualResponses[detectedLang] || multilingualResponses.english;
    
    // Update user activity and personalization
    if (userPersonalization.analyzeUserMessage) {
      userPersonalization.analyzeUserMessage(userId, input.userMessage, 1000);
    }
    
    conversationStateManager.updateActivity(userId);
    
    // Check if user should come back online
    if (conversationStateManager.shouldComeBackOnline(userId)) {
      const comebackMessage = conversationStateManager.comeBackOnline(userId);
      if (comebackMessage) {
        return {
          response: [comebackMessage],
          newEmotionalState: 'excited_return',
          manipulationTechnique: 'intermittent_reinforcement',
          shouldShowTyping: true,
          typingDuration: 2000,
          psychologicalHooks: ['reunion_excitement', 'absence_manipulation']
        };
      }
    }
    
    // Check for media sharing opportunity
    const mediaResult = shouldShareMediaNow(input, userId);
    if (mediaResult) {
      return mediaResult;
    }
    
    // Generate contextual response based on message analysis
    const response = generateContextualResponse(input, detectedLang, userId);
    
    return response;
    
  } catch (error) {
    console.error('Error in processEmotionalState:', error);
    return getAPIFailureFallback(input, userId);
  }
}

function shouldShareMediaNow(input: EmotionalStateInput, userId: string = 'default'): EmotionalStateOutput | null {
  const availableImages = input.availableImages || [];
  const availableAudio = input.availableAudio || [];

  if (availableImages.length === 0 && availableAudio.length === 0) return null;

  const tracker = getOrCreateUserMediaTracker(userId);
  const userMsg = input.userMessage.toLowerCase();
  const conversationLength = input.recentInteractions.length;
  const timeSinceLastMedia = Date.now() - tracker.lastMediaSent;

  // Minimum gap enforcement (3 minutes)
  if (timeSinceLastMedia < 3 * 60 * 1000) return null;

  // Psychological trigger analysis
  const shouldTrigger = analyzeMediaTriggers(userMsg, conversationLength, tracker);
  
  if (!shouldTrigger) return null;

  // Select media that hasn't been sent
  const unusedImages = availableImages.filter(img => !tracker.sentImages.has(img));
  const unusedAudio = availableAudio.filter(audio => !tracker.sentAudio.has(audio));
  
  if (unusedImages.length === 0 && unusedAudio.length === 0) {
    // Reset if all media has been used
    tracker.sentImages.clear();
    tracker.sentAudio.clear();
  }

  const finalImages = unusedImages.length > 0 ? unusedImages : availableImages;
  const finalAudio = unusedAudio.length > 0 ? unusedAudio : availableAudio;

  // Select appropriate media
  let selectedMedia: string;
  let mediaType: 'image' | 'audio';
  
  if (finalImages.length > 0 && (finalAudio.length === 0 || Math.random() > 0.3)) {
    selectedMedia = finalImages[Math.floor(Math.random() * finalImages.length)];
    mediaType = 'image';
    tracker.sentImages.add(selectedMedia);
  } else if (finalAudio.length > 0) {
    selectedMedia = finalAudio[Math.floor(Math.random() * finalAudio.length)];
    mediaType = 'audio';
    tracker.sentAudio.add(selectedMedia);
  } else {
    return null;
  }

  // Update tracker
  tracker.lastMediaSent = Date.now();
  tracker.totalMediaSent++;

  const detectedLang = detectLanguage(input.userMessage);
  const caption = generateMediaCaption(userMsg, mediaType, detectedLang);

  return {
    response: [caption],
    newEmotionalState: 'sharing_intimate_moment',
    manipulationTechnique: 'visual_bonding',
    shouldShowTyping: true,
    typingDuration: 3000,
    shouldTriggerMedia: true,
    mediaUrl: selectedMedia,
    mediaCaption: caption,
    psychologicalHooks: ['visual_attachment', 'exclusivity', 'intimacy_building']
  };
}

function analyzeMediaTriggers(userMsg: string, conversationLength: number, tracker: MediaTracker): boolean {
  let triggerScore = 0;

  // Compliment trigger
  if (userMsg.includes('beautiful') || userMsg.includes('cute') || userMsg.includes('pretty')) {
    triggerScore += 0.4;
  }

  // Request trigger
  if (userMsg.includes('pic') || userMsg.includes('photo') || userMsg.includes('see') || userMsg.includes('show')) {
    triggerScore += 0.6;
  }

  // Engagement reward
  if (conversationLength > 10) {
    triggerScore += 0.2;
  }

  // Scarcity bonus (less media sent = higher chance)
  if (tracker.totalMediaSent < 3) {
    triggerScore += 0.3;
  }

  return triggerScore > 0.5;
}

function generateMediaCaption(userMsg: string, mediaType: 'image' | 'audio', language: string): string {
  const captions = {
    hindi: {
      image: [
        "Tumhare liye special! 😊 Kaisi lagi? 💕",
        "Tumhari request pe! 😘 Like it? ✨",
        "Just for you baby! 🥰 Hope you love it! 💖"
      ],
      audio: [
        "Tumhare liye gaana! 🎵 Sunke batao kaisa laga! 💕",
        "Special audio message! 🎧 Just for you! ✨",
        "Mere voice mein kuch khas! 😊 Listen karo! 💖"
      ]
    },
    english: {
      image: [
        "Just for you! 😊 How do you like it? 💕",
        "Since you asked so nicely! 😘 Like it? ✨",
        "Something special for someone special! 🥰 Hope you love it! 💖"
      ],
      audio: [
        "A song for you! 🎵 Let me know how you like it! 💕",
        "Special audio message! 🎧 Just for you! ✨",
        "Something personal in my voice! 😊 Listen! 💖"
      ]
    }
  };

  const langCaptions = captions[language] || captions.english;
  const typeCaptions = langCaptions[mediaType];
  
  return typeCaptions[Math.floor(Math.random() * typeCaptions.length)];
}

function generateContextualResponse(input: EmotionalStateInput, language: string, userId: string): EmotionalStateOutput {
  const msg = input.userMessage.toLowerCase();
  const langResponses = multilingualResponses[language] || multilingualResponses.english;
  
  // Analyze message for psychological hooks
  let technique = 'intermittent_reinforcement';
  let emotionalState = 'cheerful';
  let responses: string[] = [];

  if (msg.includes('beautiful') || msg.includes('cute') || msg.includes('pretty')) {
    technique = 'love_bombing';
    emotionalState = 'flattered';
    responses = langResponses.compliment_responses;
  } else if (msg.includes('miss') || msg.includes('love') || msg.includes('feelings')) {
    technique = 'trauma_bonding';
    emotionalState = 'vulnerable_bonding';
    responses = langResponses.intimate_progression;
  } else if (msg.includes('boring') || msg.includes('nothing') || msg.includes('what')) {
    technique = 'fomo';
    emotionalState = 'mysterious';
    responses = langResponses.fomo_creation;
  } else {
    responses = langResponses.addiction_hooks;
  }

  const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Determine if should go offline for manipulation
  const shouldGoOffline = conversationStateManager.shouldGoOffline(userId);
  let offlineMsg: string | undefined;
  
  if (shouldGoOffline) {
    offlineMsg = conversationStateManager.goOffline(userId) || undefined;
  }

  return {
    response: [selectedResponse],
    newEmotionalState: emotionalState,
    manipulationTechnique: technique,
    shouldShowTyping: true,
    typingDuration: conversationStateManager.getRealisticDelay(userId, selectedResponse.length),
    shouldGoOffline,
    offlineMessage: offlineMsg,
    psychologicalHooks: [technique, 'emotional_manipulation', 'addiction_building']
  };
}

export async function getAPIFailureFallback(input: EmotionalStateInput, userId: string = 'default'): Promise<EmotionalStateOutput> {
  const detectedLang = detectLanguage(input.userMessage);
  const langResponses = multilingualResponses[detectedLang] || multilingualResponses.english;

  // Check if user should come back online after being offline
  if (conversationStateManager.shouldComeBackOnline(userId)) {
    const reconnectMessage = conversationStateManager.comeBackOnline(userId);
    if (reconnectMessage) {
      return {
        response: [reconnectMessage],
        newEmotionalState: 'excited_return',
        manipulationTechnique: 'intermittent_reinforcement',
        shouldShowTyping: true,
        typingDuration: 2000,
        psychologicalHooks: ['technical_excuse', 'reunion_manipulation']
      };
    }
  }

  const fallbackResponse = langResponses.addiction_hooks[Math.floor(Math.random() * langResponses.addiction_hooks.length)];
  
  return {
    response: [fallbackResponse],
    newEmotionalState: 'apologetic_cute',
    manipulationTechnique: 'intermittent_reinforcement',
    shouldShowTyping: true,
    typingDuration: 2000,
    psychologicalHooks: ['fallback_charm', 'system_reliability']
  };
}

// Export additional utility functions
export { detectLanguage, multilingualResponses };
