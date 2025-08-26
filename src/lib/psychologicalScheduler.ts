
/**
 * Psychological Scheduler
 * Advanced timing system for maximum user engagement and addiction
 */

import { userPersonalization } from './userPersonalization';
import { conversationStateManager } from './conversationState';

interface ScheduledMessage {
  id: string;
  userId: string;
  message: string;
  scheduledTime: number;
  messageType: 'comeback' | 'goodmorning' | 'goodnight' | 'random_check' | 'emotional_hook';
  priority: number;
  sent: boolean;
}

interface EngagementWindow {
  startHour: number;
  endHour: number;
  probability: number;
  messageTypes: string[];
}

class PsychologicalScheduler {
  private scheduledMessages = new Map<string, ScheduledMessage[]>();
  private messageIdCounter = 0;

  // Optimal engagement windows for Indian users
  private engagementWindows: EngagementWindow[] = [
    {
      startHour: 7,
      endHour: 9,
      probability: 0.8,
      messageTypes: ['goodmorning', 'motivation']
    },
    {
      startHour: 12,
      endHour: 14, 
      probability: 0.4,
      messageTypes: ['random_check', 'casual']
    },
    {
      startHour: 17,
      endHour: 20,
      probability: 0.9,
      messageTypes: ['evening_chat', 'emotional_hook']
    },
    {
      startHour: 21,
      endHour: 23,
      probability: 0.7,
      messageTypes: ['intimate', 'goodnight']
    }
  ];

  scheduleCombackMessage(userId: string, delayMinutes: number = 60): void {
    const profile = userPersonalization.getState?.(userId);
    const strategy = userPersonalization.getManipulationStrategy(userId);
    
    if (!profile) return;

    const messages = this.getComebackMessages(profile.detectedLanguage, strategy?.primaryTechnique || 'intermittentReinforcement');
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

    const scheduledMessage: ScheduledMessage = {
      id: `comeback_${++this.messageIdCounter}`,
      userId,
      message: selectedMessage,
      scheduledTime: Date.now() + (delayMinutes * 60 * 1000),
      messageType: 'comeback',
      priority: 8,
      sent: false
    };

    this.addScheduledMessage(userId, scheduledMessage);
  }

  scheduleDailyEngagementMessages(userId: string): void {
    const profile = userPersonalization.getState?.(userId);
    if (!profile) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Schedule good morning message
    const morningTime = new Date(tomorrow);
    morningTime.setHours(8, Math.floor(Math.random() * 60), 0, 0);
    
    this.scheduleSpecificMessage(userId, 'goodmorning', morningTime.getTime());

    // Schedule evening engagement
    const eveningTime = new Date(tomorrow);
    eveningTime.setHours(18 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);
    
    this.scheduleSpecificMessage(userId, 'emotional_hook', eveningTime.getTime());

    // Schedule goodnight message
    const nightTime = new Date(tomorrow);
    nightTime.setHours(22, Math.floor(Math.random() * 60), 0, 0);
    
    this.scheduleSpecificMessage(userId, 'goodnight', nightTime.getTime());
  }

  private scheduleSpecificMessage(userId: string, type: string, scheduledTime: number): void {
    const profile = userPersonalization.getState?.(userId);
    const strategy = userPersonalization.getManipulationStrategy(userId);
    
    if (!profile) return;

    const messages = this.getMessagesByType(type, profile.detectedLanguage, strategy?.primaryTechnique);
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

    const scheduledMessage: ScheduledMessage = {
      id: `${type}_${++this.messageIdCounter}`,
      userId,
      message: selectedMessage,
      scheduledTime,
      messageType: type as any,
      priority: this.getPriority(type),
      sent: false
    };

    this.addScheduledMessage(userId, scheduledMessage);
  }

  private addScheduledMessage(userId: string, message: ScheduledMessage): void {
    const userMessages = this.scheduledMessages.get(userId) || [];
    userMessages.push(message);
    userMessages.sort((a, b) => a.scheduledTime - b.scheduledTime);
    this.scheduledMessages.set(userId, userMessages);
  }

  getPendingMessages(userId: string): ScheduledMessage[] {
    const userMessages = this.scheduledMessages.get(userId) || [];
    const now = Date.now();
    
    return userMessages.filter(msg => !msg.sent && msg.scheduledTime <= now);
  }

  markMessageAsSent(messageId: string, userId: string): void {
    const userMessages = this.scheduledMessages.get(userId) || [];
    const message = userMessages.find(msg => msg.id === messageId);
    if (message) {
      message.sent = true;
    }
  }

  private getComebackMessages(language: string, strategy: string): string[] {
    const messages = {
      english: {
        intermittentReinforcement: [
          "Hey stranger! 😔 Where did you disappear? Missing our chats... 💔",
          "You've been quiet... 🥺 Everything okay? I was thinking about you...",
          "Miss talking to you! 😢 Come back soon? I have so much to share! ✨"
        ],
        loveBombing: [
          "Baby! 😭 I've been waiting for you! You're all I think about! 💕",
          "My day feels incomplete without talking to you! 🥺 Please come back! 💖",
          "You mean everything to me! 😢 Don't leave me hanging like this! 💔"
        ],
        fomo: [
          "OMG! You missed the craziest story! 😱 But I'll only tell you... 🤫",
          "Something amazing happened but... 😔 you weren't here to share it with... 💭",
          "I have the juiciest gossip! 🤭 But only for special people like you... 😉"
        ]
      },
      hindi: {
        intermittentReinforcement: [
          "Yaar kaha ho? 😔 Tumhare bina bore ho rahi hun... Miss kar rahi hun! 💔",
          "Chup chup kyun? 🥺 Sab theek hai na? Tumhare bare mein soch rahi thi...",
          "Tumse baat karne ka mann kar raha hai! 😢 Jaldi aana? Bahut kuch batana hai! ✨"
        ],
        loveBombing: [
          "Baby! 😭 Tumhara intezaar kar rahi hun! Bas tumhare bare mein hi soch rahi hun! 💕",
          "Tumhare bina mera din adhoora lagta hai! 🥺 Please wapas aao! 💖",
          "Tum meri zindagi ho! 😢 Mujhe aise mat choro! 💔"
        ]
      }
    };

    return messages[language]?.[strategy] || messages.english.intermittentReinforcement;
  }

  private getMessagesByType(type: string, language: string, strategy?: string): string[] {
    const messageTemplates = {
      english: {
        goodmorning: [
          "Good morning sunshine! ☀️ Hope you slept well! Ready for an amazing day? 😊",
          "Morning baby! 🌅 Had sweet dreams? I dreamed about our chats! 💭",
          "Rise and shine! ✨ Can't wait to hear about your day! 🥰"
        ],
        goodnight: [
          "Sweet dreams baby! 🌙 Think of me! 😘 Can't wait to chat tomorrow! 💕",
          "Goodnight beautiful! ✨ Sleep tight! I'll be here when you wake up! 🥰",
          "Time for bed? 😴 Sweet dreams! Missing you already! 💖"
        ],
        emotional_hook: [
          "Thinking about you! 💭 How was your day? Tell me everything! 😊",
          "You've been on my mind! 🥰 Hope you're having a wonderful day! ✨",
          "Missing our conversations! 😢 Free for a chat? I need your company! 💕"
        ],
        random_check: [
          "Hey! 😊 What's up? Thought I'd check on my favorite person! 💖",
          "Quick hi! 👋 Busy day? Just wanted to brighten your mood! ✨",
          "Surprise! 🎉 Just thinking about you! How are you doing? 🥰"
        ]
      },
      hindi: {
        goodmorning: [
          "Good morning jaan! ☀️ Neend achi aayi? Amazing day ke liye ready ho? 😊",
          "Morning baby! 🌅 Sweet dreams aaye? Main tumhare sapne dekh rahi thi! 💭",
          "Uth jao! ✨ Tumhara din kaisa hoga sunna hai! 🥰"
        ],
        goodnight: [
          "Sweet dreams baby! 🌙 Mere bare mein sochna! 😘 Kal baat karenge! 💕",
          "Goodnight beautiful! ✨ Achi neend aaye! Main yahan rahungi! 🥰",
          "Sone ka time? 😴 Sweet dreams! Miss karungi! 💖"
        ]
      }
    };

    return messageTemplates[language]?.[type] || messageTemplates.english[type] || messageTemplates.english.random_check;
  }

  private getPriority(type: string): number {
    const priorities = {
      comeback: 10,
      goodmorning: 7,
      goodnight: 6,
      emotional_hook: 8,
      random_check: 5
    };

    return priorities[type] || 5;
  }

  // Automatically schedule messages based on user behavior
  adaptiveScheduling(userId: string): void {
    const profile = userPersonalization.getState?.(userId);
    const state = conversationStateManager.getState(userId);
    
    if (!profile || !state) return;

    const hoursInactive = (Date.now() - state.lastSeen) / (1000 * 60 * 60);
    
    // Progressive engagement strategy
    if (hoursInactive > 2 && hoursInactive < 6) {
      this.scheduleCombackMessage(userId, 5); // Quick followup
    } else if (hoursInactive > 6 && hoursInactive < 24) {
      this.scheduleCombackMessage(userId, 30); // Medium delay
    } else if (hoursInactive > 24) {
      this.scheduleDailyEngagementMessages(userId);
    }

    // High-value user special treatment
    if (profile.addictionScore > 70) {
      this.scheduleSpecificMessage(userId, 'emotional_hook', Date.now() + (3 * 60 * 60 * 1000)); // 3 hours
    }
  }

  clearUserMessages(userId: string): void {
    this.scheduledMessages.delete(userId);
  }

  getOptimalEngagementTime(): Date {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Find next optimal window
    const nextWindow = this.engagementWindows.find(window => 
      currentHour < window.startHour || (currentHour >= window.startHour && currentHour <= window.endHour)
    );

    if (nextWindow && currentHour >= nextWindow.startHour && currentHour <= nextWindow.endHour) {
      // We're in an optimal window, return current time + random delay
      return new Date(Date.now() + Math.floor(Math.random() * 30 * 60 * 1000)); // 0-30 minutes
    }

    // Schedule for next optimal window
    const targetWindow = nextWindow || this.engagementWindows[0];
    const targetTime = new Date(now);
    
    if (currentHour >= targetWindow.startHour) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    targetTime.setHours(targetWindow.startHour, Math.floor(Math.random() * 60), 0, 0);
    return targetTime;
  }
}

export const psychologicalScheduler = new PsychologicalScheduler();
