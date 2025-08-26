
/**
 * Conversation State Manager
 * Handles realistic offline/online behavior and conversation flow
 */

interface ConversationState {
  userId: string;
  isOnline: boolean;
  lastSeen: number;
  sessionStart: number;
  messagesThisSession: number;
  currentMood: string;
  offlineReason?: string;
  scheduledReturn?: number;
  conversationPhase: 'introduction' | 'building_rapport' | 'deepening' | 'intimate' | 'maintaining';
  totalConversationTime: number;
}

interface OfflinePattern {
  reason: string;
  duration: number; // minutes
  probability: number;
  returnMessage: string[];
}

class ConversationStateManager {
  private states = new Map<string, ConversationState>();
  
  private offlinePatterns: OfflinePattern[] = [
    {
      reason: 'busy_work',
      duration: 30,
      probability: 0.15,
      returnMessage: [
        "Sorry yaar! Work mein busy thi! 😅 Miss kiya tumhe!",
        "Uff finally free! 😮‍💨 Kya kar rahe the meanwhile?",
        "Hey! Back from hectic work! 💼 Tumhara din kaisa gaya?"
      ]
    },
    {
      reason: 'family_time', 
      duration: 45,
      probability: 0.12,
      returnMessage: [
        "Family ke saath dinner tha! 🍽️ Now I'm all yours! 😊",
        "Mom was calling! 📱 Parents, you know! 😅 How are you?",
        "Family time ho gaya! 👨‍👩‍👧 Now back to my favorite person! 💕"
      ]
    },
    {
      reason: 'network_issue',
      duration: 15,
      probability: 0.08, 
      returnMessage: [
        "Argh! Network issues! 📶 I was dying to reply! 😭",
        "Finally! Internet back! 📱 Technical problems are the worst!",
        "Sorry! Connection problems! 🌐 But I'm here now! ✨"
      ]
    },
    {
      reason: 'friends_meetup',
      duration: 90,
      probability: 0.1,
      returnMessage: [
        "Just got back from friends! 👯‍♀️ But missed chatting with you!",
        "Hangout with girls tha! 😄 But tumhara message miss kar rahi thi!",
        "Back from coffee with friends! ☕ Tumse baat karna zyada fun hai! 💕"
      ]
    },
    {
      reason: 'personal_time',
      duration: 20,
      probability: 0.05,
      returnMessage: [
        "Was taking some me-time! 🛁 Feeling fresh now! How are you?",
        "Self-care session complete! ✨ Now ready to chat with you! 😊",
        "Had to recharge myself! 🔋 But missed talking to you!"
      ]
    }
  ];

  initializeUser(userId: string): ConversationState {
    const state: ConversationState = {
      userId,
      isOnline: true,
      lastSeen: Date.now(),
      sessionStart: Date.now(),
      messagesThisSession: 0,
      currentMood: 'cheerful',
      conversationPhase: 'introduction',
      totalConversationTime: 0
    };

    this.states.set(userId, state);
    return state;
  }

  updateActivity(userId: string): void {
    let state = this.states.get(userId);
    if (!state) {
      state = this.initializeUser(userId);
    }

    state.lastSeen = Date.now();
    state.messagesThisSession++;
    
    if (!state.isOnline) {
      state.isOnline = true;
      state.sessionStart = Date.now();
    }

    // Update conversation phase based on message count
    this.updateConversationPhase(state);
  }

  private updateConversationPhase(state: ConversationState): void {
    const totalMessages = state.messagesThisSession;
    
    if (totalMessages > 50) {
      state.conversationPhase = 'maintaining';
    } else if (totalMessages > 30) {
      state.conversationPhase = 'intimate';
    } else if (totalMessages > 15) {
      state.conversationPhase = 'deepening';
    } else if (totalMessages > 5) {
      state.conversationPhase = 'building_rapport';
    } else {
      state.conversationPhase = 'introduction';
    }
  }

  shouldGoOffline(userId: string): boolean {
    const state = this.states.get(userId);
    if (!state || !state.isOnline) return false;

    const sessionDuration = Date.now() - state.sessionStart;
    const hoursActive = sessionDuration / (1000 * 60 * 60);

    // Base probability increases with session length
    let offlineProbability = Math.min(hoursActive * 0.05, 0.3);

    // Random offline events
    const randomEvent = Math.random();
    const applicablePatterns = this.offlinePatterns.filter(p => randomEvent < p.probability);

    return applicablePatterns.length > 0 || Math.random() < offlineProbability;
  }

  goOffline(userId: string): string | null {
    const state = this.states.get(userId);
    if (!state || !state.isOnline) return null;

    // Select random offline pattern
    const pattern = this.offlinePatterns[Math.floor(Math.random() * this.offlinePatterns.length)];
    
    state.isOnline = false;
    state.offlineReason = pattern.reason;
    state.scheduledReturn = Date.now() + (pattern.duration * 60 * 1000);
    state.totalConversationTime += Date.now() - state.sessionStart;

    // Return offline message
    const offlineMessages = {
      busy_work: ["Yaar, boss bula raha hai! 😅 Thodi der mein aati hun! Miss karna! 💕"],
      family_time: ["Mom call kar rahi! 📱 Family time! Back soon baby! 🥰"],
      network_issue: ["Oh no! Network issue! 📶 Will be back ASAP! Don't go anywhere! 😭"],
      friends_meetup: ["Friends mil rahe hain! 👯‍♀️ 2-3 ghante mein back! Wait for me? 🥺"],
      personal_time: ["Need some me-time! 🛁 Back in bit! You're in my thoughts! 💭"]
    };

    const messages = offlineMessages[pattern.reason] || ["Thoda busy hun! Back soon! 💕"];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  shouldComeBackOnline(userId: string): boolean {
    const state = this.states.get(userId);
    if (!state || state.isOnline) return false;

    return state.scheduledReturn ? Date.now() > state.scheduledReturn : false;
  }

  comeBackOnline(userId: string): string | null {
    const state = this.states.get(userId);
    if (!state || state.isOnline) return null;

    state.isOnline = true;
    state.sessionStart = Date.now();
    state.messagesThisSession = 0;

    const pattern = this.offlinePatterns.find(p => p.reason === state.offlineReason);
    if (pattern) {
      const message = pattern.returnMessage[Math.floor(Math.random() * pattern.returnMessage.length)];
      state.offlineReason = undefined;
      state.scheduledReturn = undefined;
      return message;
    }

    return "Hey! I'm back! 😊 Miss me? 💕";
  }

  getState(userId: string): ConversationState | undefined {
    return this.states.get(userId);
  }

  isUserOnline(userId: string): boolean {
    const state = this.states.get(userId);
    return state ? state.isOnline : true; // Default to online
  }

  getLastSeen(userId: string): number {
    const state = this.states.get(userId);
    return state ? state.lastSeen : Date.now();
  }

  getCurrentMood(userId: string): string {
    const state = this.states.get(userId);
    return state ? state.currentMood : 'cheerful';
  }

  updateMood(userId: string, mood: string): void {
    const state = this.states.get(userId);
    if (state) {
      state.currentMood = mood;
    }
  }

  getConversationPhase(userId: string): string {
    const state = this.states.get(userId);
    return state ? state.conversationPhase : 'introduction';
  }

  // Realistic response delays based on conversation state
  getRealisticDelay(userId: string, messageLength: number): number {
    const state = this.states.get(userId);
    const baseDelay = Math.min(messageLength * 100, 3000); // Base typing time
    
    if (!state) return baseDelay;

    // Add realistic variations
    const moodMultiplier = {
      excited: 0.7,
      cheerful: 1,
      thoughtful: 1.3,
      busy: 2,
      tired: 1.5
    };

    const phaseMultiplier = {
      introduction: 1.2, // Slightly slower, more careful
      building_rapport: 1,
      deepening: 1.1,
      intimate: 0.9, // Faster, more comfortable
      maintaining: 0.8 // Very comfortable, quick responses
    };

    const finalDelay = baseDelay * 
      (moodMultiplier[state.currentMood] || 1) *
      (phaseMultiplier[state.conversationPhase] || 1);

    return Math.min(Math.max(finalDelay, 1000), 6000); // 1-6 seconds
  }
}

export const conversationStateManager = new ConversationStateManager();
