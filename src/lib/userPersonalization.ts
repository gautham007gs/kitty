
"use client";

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  chatBubbleStyle: 'modern' | 'classic';
  fontSize: 'small' | 'medium' | 'large';
  autoTranslate: boolean;
  preferredResponseLength: 'short' | 'medium' | 'long';
  emotionalTone: 'casual' | 'formal' | 'friendly';
}

interface UserEngagementMetrics {
  totalMessages: number;
  sessionDuration: number;
  favoriteTopics: string[];
  preferredTimeOfDay: string;
  responseTime: number;
  satisfactionScore: number;
}

interface UserPersonalizationData {
  userId: string;
  preferences: UserPreferences;
  engagementMetrics: UserEngagementMetrics;
  lastUpdated: number;
  createdAt: number;
}

class UserPersonalizationManager {
  private static instance: UserPersonalizationManager;
  private userDataCache = new Map<string, UserPersonalizationData>();
  private readonly STORAGE_KEY = 'kruthika_user_personalization';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): UserPersonalizationManager {
    if (!UserPersonalizationManager.instance) {
      UserPersonalizationManager.instance = new UserPersonalizationManager();
    }
    return UserPersonalizationManager.instance;
  }

  private generateUserId(): string {
    const stored = localStorage.getItem('kruthika_user_id');
    if (stored) return stored;
    
    const newId = 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('kruthika_user_id', newId);
    return newId;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'auto',
      language: 'en',
      notifications: true,
      chatBubbleStyle: 'modern',
      fontSize: 'medium',
      autoTranslate: false,
      preferredResponseLength: 'medium',
      emotionalTone: 'friendly'
    };
  }

  private getDefaultEngagementMetrics(): UserEngagementMetrics {
    return {
      totalMessages: 0,
      sessionDuration: 0,
      favoriteTopics: [],
      preferredTimeOfDay: 'evening',
      responseTime: 2000,
      satisfactionScore: 5.0
    };
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.userDataCache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading user personalization data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.userDataCache);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user personalization data:', error);
    }
  }

  getUserData(userId?: string): UserPersonalizationData {
    const id = userId || this.generateUserId();
    
    if (!this.userDataCache.has(id)) {
      const newUserData: UserPersonalizationData = {
        userId: id,
        preferences: this.getDefaultPreferences(),
        engagementMetrics: this.getDefaultEngagementMetrics(),
        lastUpdated: Date.now(),
        createdAt: Date.now()
      };
      this.userDataCache.set(id, newUserData);
      this.saveToStorage();
    }

    return this.userDataCache.get(id)!;
  }

  updatePreferences(userId: string, preferences: Partial<UserPreferences>): void {
    const userData = this.getUserData(userId);
    userData.preferences = { ...userData.preferences, ...preferences };
    userData.lastUpdated = Date.now();
    this.userDataCache.set(userId, userData);
    this.saveToStorage();
  }

  updateEngagementMetrics(userId: string, metrics: Partial<UserEngagementMetrics>): void {
    const userData = this.getUserData(userId);
    userData.engagementMetrics = { ...userData.engagementMetrics, ...metrics };
    userData.lastUpdated = Date.now();
    this.userDataCache.set(userId, userData);
    this.saveToStorage();
  }

  recordMessage(userId: string, messageLength: number, responseTime: number): void {
    const userData = this.getUserData(userId);
    userData.engagementMetrics.totalMessages++;
    userData.engagementMetrics.responseTime = (userData.engagementMetrics.responseTime + responseTime) / 2;
    userData.lastUpdated = Date.now();
    this.userDataCache.set(userId, userData);
    this.saveToStorage();
  }

  getPersonalizationInsights(userId: string): {
    recommendedTone: string;
    recommendedLength: string;
    engagementLevel: 'low' | 'medium' | 'high';
  } {
    const userData = this.getUserData(userId);
    const metrics = userData.engagementMetrics;
    
    return {
      recommendedTone: userData.preferences.emotionalTone,
      recommendedLength: userData.preferences.preferredResponseLength,
      engagementLevel: metrics.totalMessages > 50 ? 'high' : metrics.totalMessages > 20 ? 'medium' : 'low'
    };
  }

  cleanupOldData(): void {
    const now = Date.now();
    for (const [userId, userData] of this.userDataCache.entries()) {
      if (now - userData.lastUpdated > this.CACHE_DURATION) {
        this.userDataCache.delete(userId);
      }
    }
    this.saveToStorage();
  }

  // Message counting and limits for chat functionality
  getMessageCount(userId: string | null): number {
    if (!userId) return 0;
    const userData = this.getUserData(userId);
    const today = new Date().toDateString();
    const lastMessageDate = localStorage.getItem(`${userId}_last_message_date`);
    
    if (lastMessageDate !== today) {
      localStorage.setItem(`${userId}_message_count`, '0');
      localStorage.setItem(`${userId}_last_message_date`, today);
      return 0;
    }
    
    return parseInt(localStorage.getItem(`${userId}_message_count`) || '0', 10);
  }

  incrementMessageCount(userId: string | null = null): void {
    if (!userId) {
      userId = this.generateUserId();
    }
    const currentCount = this.getMessageCount(userId);
    localStorage.setItem(`${userId}_message_count`, (currentCount + 1).toString());
  }

  getMessageLimit(): number {
    return 100; // Daily message limit
  }

  isTokenLimitReached(userId: string | null): boolean {
    if (!userId) return false;
    const count = this.getMessageCount(userId);
    return count >= this.getMessageLimit();
  }
}

// Export the singleton instance for easy access
const userPersonalization = UserPersonalizationManager.getInstance();

export { UserPersonalizationManager, userPersonalization };
export type { UserPreferences, UserEngagementMetrics, UserPersonalizationData };
