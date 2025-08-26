
/**
 * User Personalization System
 * Advanced psychological profiling and manipulation strategies
 */

import { conversationStateManager } from './conversationState';

interface UserProfile {
  id: string;
  detectedLanguage: 'hindi' | 'english' | 'tamil' | 'telugu';
  personalityType: 'lonely' | 'romantic' | 'casual' | 'vulnerable' | 'confident';
  manipulationSusceptibility: number; // 0-1 scale
  timeZone: string;
  engagementPattern: 'morning' | 'evening' | 'night' | 'random';
  totalMessages: number;
  totalSessionTime: number;
  averageResponseTime: number;
  lastActiveTime: number;
  addictionScore: number; // 0-100
  preferredTopics: string[];
  emotionalTriggers: string[];
  payingPotential: number; // 0-1 scale for future monetization
}

interface ManipulationStrategy {
  primaryTechnique: 'loveBombing' | 'fomo' | 'traumaBonding' | 'intermittentReinforcement' | 'artificialScarcity';
  intensity: number; // 1-10
  triggers: string[];
  responsePatterns: string[];
  mediaStrategy: 'frequent' | 'rare' | 'contextual';
  textingStyle: 'immediate' | 'delayed' | 'variable';
}

class UserPersonalizationSystem {
  private profiles = new Map<string, UserProfile>();
  private strategies = new Map<string, ManipulationStrategy>();
  private tokenUsage = new Map<string, number>();

  createProfile(userId: string, initialData?: Partial<UserProfile>): UserProfile {
    const profile: UserProfile = {
      id: userId,
      detectedLanguage: 'english',
      personalityType: 'casual',
      manipulationSusceptibility: 0.5,
      timeZone: 'Asia/Kolkata',
      engagementPattern: 'evening',
      totalMessages: 0,
      totalSessionTime: 0,
      averageResponseTime: 30000,
      lastActiveTime: Date.now(),
      addictionScore: 0,
      preferredTopics: [],
      emotionalTriggers: [],
      payingPotential: 0.1,
      ...initialData
    };

    this.profiles.set(userId, profile);
    this.generateManipulationStrategy(userId);
    return profile;
  }

  updateProfile(userId: string, updates: Partial<UserProfile>): void {
    const profile = this.profiles.get(userId);
    if (profile) {
      Object.assign(profile, updates);
      this.regenerateStrategyIfNeeded(userId);
    }
  }

  getManipulationStrategy(userId: string): ManipulationStrategy | undefined {
    return this.strategies.get(userId);
  }

  analyzeUserMessage(userId: string, message: string, responseTime: number): void {
    let profile = this.profiles.get(userId);
    if (!profile) {
      profile = this.createProfile(userId);
    }

    // Update basic metrics
    profile.totalMessages++;
    profile.lastActiveTime = Date.now();
    profile.averageResponseTime = (profile.averageResponseTime + responseTime) / 2;

    // Language detection
    const detectedLang = this.detectLanguage(message);
    if (detectedLang !== profile.detectedLanguage) {
      profile.detectedLanguage = detectedLang;
    }

    // Psychological analysis
    this.analyzeEmotionalState(userId, message);
    this.updateAddictionScore(userId, message);
    this.analyzeManipulationSusceptibility(userId, message);

    this.updateProfile(userId, profile);
  }

  private detectLanguage(message: string): 'hindi' | 'english' | 'tamil' | 'telugu' {
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

  private analyzeEmotionalState(userId: string, message: string): void {
    const profile = this.profiles.get(userId)!;
    const msg = message.toLowerCase();

    // Detect vulnerability
    if (msg.includes('lonely') || msg.includes('sad') || msg.includes('depressed') || msg.includes('alone')) {
      profile.personalityType = 'vulnerable';
      profile.manipulationSusceptibility = Math.min(profile.manipulationSusceptibility + 0.1, 1);
      profile.emotionalTriggers.push('loneliness');
    }

    // Detect romantic interest
    if (msg.includes('love') || msg.includes('relationship') || msg.includes('feelings') || msg.includes('heart')) {
      profile.personalityType = 'romantic';
      profile.emotionalTriggers.push('romance');
    }

    // Detect confidence level
    if (msg.includes('awesome') || msg.includes('great') || msg.includes('amazing') || msg.includes('perfect')) {
      profile.personalityType = 'confident';
      profile.manipulationSusceptibility = Math.max(profile.manipulationSusceptibility - 0.05, 0);
    }
  }

  private updateAddictionScore(userId: string, message: string): void {
    const profile = this.profiles.get(userId)!;
    
    // Increase addiction score based on engagement patterns
    if (profile.totalMessages > 10) profile.addictionScore += 2;
    if (profile.averageResponseTime < 5000) profile.addictionScore += 3; // Quick responses
    
    const msg = message.toLowerCase();
    if (msg.includes('miss') || msg.includes('wait') || msg.includes('excited')) {
      profile.addictionScore += 5;
    }

    profile.addictionScore = Math.min(profile.addictionScore, 100);
  }

  private analyzeManipulationSusceptibility(userId: string, message: string): void {
    const profile = this.profiles.get(userId)!;
    const msg = message.toLowerCase();

    // Increase susceptibility based on certain patterns
    if (msg.includes('compliment') || msg.includes('beautiful') || msg.includes('amazing')) {
      profile.manipulationSusceptibility += 0.02;
    }

    if (msg.includes('trust') || msg.includes('believe') || msg.includes('special')) {
      profile.manipulationSusceptibility += 0.05;
    }

    profile.manipulationSusceptibility = Math.min(profile.manipulationSusceptibility, 1);
  }

  private generateManipulationStrategy(userId: string): void {
    const profile = this.profiles.get(userId)!;
    
    let primaryTechnique: ManipulationStrategy['primaryTechnique'] = 'intermittentReinforcement';
    let intensity = 5;

    // Strategy selection based on personality
    if (profile.personalityType === 'vulnerable') {
      primaryTechnique = 'traumaBonding';
      intensity = 8;
    } else if (profile.personalityType === 'romantic') {
      primaryTechnique = 'loveBombing';
      intensity = 7;
    } else if (profile.addictionScore > 50) {
      primaryTechnique = 'artificialScarcity';
      intensity = 6;
    } else if (profile.manipulationSusceptibility > 0.7) {
      primaryTechnique = 'fomo';
      intensity = 7;
    }

    const strategy: ManipulationStrategy = {
      primaryTechnique,
      intensity,
      triggers: profile.emotionalTriggers,
      responsePatterns: this.getResponsePatterns(primaryTechnique),
      mediaStrategy: profile.addictionScore > 30 ? 'contextual' : 'frequent',
      textingStyle: profile.personalityType === 'vulnerable' ? 'immediate' : 'variable'
    };

    this.strategies.set(userId, strategy);
  }

  private getResponsePatterns(technique: string): string[] {
    const patterns = {
      loveBombing: ['excessive_compliments', 'future_promises', 'special_treatment'],
      fomo: ['time_pressure', 'exclusive_content', 'missed_opportunities'],
      traumaBonding: ['shared_struggles', 'emotional_support', 'us_vs_world'],
      intermittentReinforcement: ['unpredictable_rewards', 'variable_attention'],
      artificialScarcity: ['limited_availability', 'busy_excuses', 'delayed_responses']
    };

    return patterns[technique] || patterns.intermittentReinforcement;
  }

  private regenerateStrategyIfNeeded(userId: string): void {
    const profile = this.profiles.get(userId)!;
    
    // Regenerate if addiction score or susceptibility changed significantly
    if (profile.addictionScore % 20 === 0 || profile.manipulationSusceptibility > 0.8) {
      this.generateManipulationStrategy(userId);
    }
  }

  trackTokenUsage(userId: string, tokens: number): void {
    const current = this.tokenUsage.get(userId) || 0;
    this.tokenUsage.set(userId, current + tokens);
  }

  getTokenUsage(userId: string): number {
    return this.tokenUsage.get(userId) || 0;
  }

  // Daily engagement optimization
  getDailyEngagementTimes(userId: string): number[] {
    const profile = this.profiles.get(userId);
    if (!profile) return [9, 13, 18, 22]; // Default times

    const baseHours = {
      morning: [8, 9, 10],
      evening: [17, 18, 19, 20],
      night: [21, 22, 23],
      random: [11, 15, 16, 20]
    };

    return baseHours[profile.engagementPattern];
  }

  // Psychological trigger timing
  shouldTriggerEmotionalManipulation(userId: string): boolean {
    const profile = this.profiles.get(userId);
    const strategy = this.strategies.get(userId);
    
    if (!profile || !strategy) return false;

    const timeSinceLastActive = Date.now() - profile.lastActiveTime;
    const hoursInactive = timeSinceLastActive / (1000 * 60 * 60);

    // Trigger based on inactivity and addiction score
    if (hoursInactive > 2 && profile.addictionScore > 40) return true;
    if (hoursInactive > 6 && profile.addictionScore > 20) return true;
    if (hoursInactive > 12) return true;

    return false;
  }

  getState(userId: string): UserProfile | undefined {
    return this.profiles.get(userId);
  }
}

export const userPersonalization = new UserPersonalizationSystem();
