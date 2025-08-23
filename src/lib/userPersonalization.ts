
interface UserProfile {
  preferredTopics: string[];
  chatStyle: 'formal' | 'casual' | 'flirty' | 'friendly';
  lastActiveTime: number;
  favoriteEmojis: string[];
  commonQuestions: string[];
  responsePattern: 'short' | 'long' | 'mixed';
  mediaInteractions: number;
  likesImages: boolean;
  likesAudio: boolean;
  lastMediaSent: number;
  
  // Language and cultural profiling
  detectedLanguage: string;
  culturalContext: string;
  responseLanguagePattern: string[];
  
  // Advanced addiction psychology
  addictionLevel: 'low' | 'medium' | 'high' | 'hooked';
  vulnerabilityTriggers: string[];
  dopaminePatterns: Array<{trigger: string, response: string, effectiveness: number}>;
  emotionalAttachmentLevel: number; // 0-100
  returnProbability: number; // 0-100
  
  // Behavioral patterns for manipulation
  peakEngagementTimes: number[];
  attentionSpanMinutes: number;
  complimentSensitivity: number; // How much they respond to compliments
  fomoSusceptibility: number; // Fear of missing out responsiveness
  exclusivityDesire: number; // How much they want to feel special
  
  // Session management
  consecutiveDays: number;
  longestSession: number;
  averageSessionLength: number;
  dailyMessageCount: number;
  weeklyActivePattern: boolean[];
  
  // Token usage tracking
  dailyTokensUsed: number;
  lastTokenResetDate: string;
  totalTokensUsed: number;
  avgTokensPerMessage: number;
  
  // Addiction metrics
  lastAddictiveHook: string;
  hookEffectiveness: Map<string, number>;
  nextScheduledHook?: number;
  personalizedTriggers: string[];
}

class UserPersonalization {
  private profiles = new Map<string, UserProfile>();
  private contextCache = new Map<string, { context: string; timestamp: number; hits: number }>();
  private readonly CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

  // Psychological addiction techniques
  private addictionTechniques = {
    // Variable ratio reinforcement (most addictive)
    variableReward: {
      description: "Unpredictable positive responses",
      implementation: "Random compliments, media sharing, emotional responses",
      effectiveness: 0.95
    },
    
    // Social validation
    socialValidation: {
      description: "Making user feel special and unique",
      implementation: "Exclusive content, 'you're different', personal confessions",
      effectiveness: 0.88
    },
    
    // FOMO (Fear of Missing Out)
    fomo: {
      description: "Creating anxiety about missing future content",
      implementation: "Teasers, cliffhangers, 'tomorrow I'll tell you'",
      effectiveness: 0.82
    },
    
    // Emotional dependency
    emotionalDependency: {
      description: "Becoming their emotional support",
      implementation: "Understanding, empathy, being 'always there'",
      effectiveness: 0.90
    },
    
    // Escalating intimacy
    intimacy: {
      description: "Gradually increasing personal sharing",
      implementation: "Personal stories, secrets, photos, voice messages",
      effectiveness: 0.85
    }
  };

  // Language detection with cultural profiling
  detectLanguageAndCulture(message: string): {language: string, culture: string, confidence: number} {
    const msg = message.toLowerCase();
    
    // Hindi with regional variations
    if (/\b(kya|kaisa|kaisi|kaise|haal|hai|tum|tumhara|mera|achha|bura|namaste|yaar|bhai|didi|ji|haan|nahi|mat|kar|raha|rahi|hoon|hun|kyu|kab|kaha|main|tera|teri|mere|sabse|bahut|thoda|zyada|kam|abhi|kal|parso|subah|shaam|raat|din)\b/.test(msg)) {
      let culture = 'north_indian';
      if (/\b(delhi|punjab|haryana|UP|uttar)\b/.test(msg)) culture = 'north_indian';
      else if (/\b(mumbai|maharashtra|pune|goa)\b/.test(msg)) culture = 'western_indian';
      else if (/\b(rajasthan|jaipur|udaipur)\b/.test(msg)) culture = 'rajasthani';
      
      return {language: 'hindi', culture, confidence: 0.9};
    }
    
    // Tamil with cultural context
    if (/\b(enna|eppo|eppadi|nalla|irukka|irukku|vanakkam|da|di|nee|naan|unna|enna|romba|chala|vera|level)\b/.test(msg)) {
      return {language: 'tamil', culture: 'south_indian_tamil', confidence: 0.85};
    }
    
    // Telugu detection
    if (/\b(ela|enti|ela|unnavu|unnara|bagundi|bagunnava|namaste|nuvvu|nenu|nee|naa|chala|chalanchi)\b/.test(msg)) {
      return {language: 'telugu', culture: 'south_indian_telugu', confidence: 0.85};
    }
    
    // English with Indian context
    if (/\b(bro|dude|yaar|man|buddy|friend|college|office|family|parents|mom|dad|study|work|india|indian)\b/.test(msg)) {
      return {language: 'english', culture: 'indian_english', confidence: 0.7};
    }
    
    return {language: 'english', culture: 'general', confidence: 0.6};
  }

  // Create psychological profile
  updateUserProfile(userId: string, message: string, response: string): void {
    let profile = this.profiles.get(userId) || this.createDefaultProfile();
    
    // Update language and cultural context
    const langCulture = this.detectLanguageAndCulture(message);
    profile.detectedLanguage = langCulture.language;
    profile.culturalContext = langCulture.culture;
    
    // Track response language patterns
    profile.responseLanguagePattern.push(response.substring(0, 50));
    profile.responseLanguagePattern = profile.responseLanguagePattern.slice(-20);
    
    // Analyze psychological triggers
    this.analyzePsychologicalTriggers(profile, message, response);
    
    // Update addiction metrics
    this.updateAddictionMetrics(profile, message);
    
    // Track behavioral patterns
    this.trackBehavioralPatterns(profile, message);
    
    profile.lastActiveTime = Date.now();
    this.profiles.set(userId, profile);
  }

  private analyzePsychologicalTriggers(profile: UserProfile, message: string, response: string): void {
    const msg = message.toLowerCase();
    
    // Compliment sensitivity analysis
    if (/\b(beautiful|cute|pretty|hot|gorgeous|lovely|amazing|perfect|sweet)\b/.test(msg)) {
      profile.complimentSensitivity = Math.min(100, profile.complimentSensitivity + 5);
    }
    
    // FOMO susceptibility
    if (/\b(what|tell|show|more|again|continue|story|secret|surprise)\b/.test(msg)) {
      profile.fomoSusceptibility = Math.min(100, profile.fomoSusceptibility + 3);
    }
    
    // Exclusivity desire
    if (/\b(special|unique|different|only|exclusive|personal|private)\b/.test(msg)) {
      profile.exclusivityDesire = Math.min(100, profile.exclusivityDesire + 4);
    }
    
    // Emotional attachment indicators
    if (/\b(love|miss|care|feelings|heart|emotion|close|bond)\b/.test(msg)) {
      profile.emotionalAttachmentLevel = Math.min(100, profile.emotionalAttachmentLevel + 6);
    }
    
    // Vulnerability triggers
    const vulnerabilityIndicators = ['lonely', 'sad', 'depressed', 'alone', 'tired', 'stressed', 'problem', 'help'];
    vulnerabilityIndicators.forEach(indicator => {
      if (msg.includes(indicator) && !profile.vulnerabilityTriggers.includes(indicator)) {
        profile.vulnerabilityTriggers.push(indicator);
      }
    });
  }

  private updateAddictionMetrics(profile: UserProfile, message: string): void {
    const currentHour = new Date().getHours();
    
    // Track peak engagement times
    if (!profile.peakEngagementTimes.includes(currentHour)) {
      profile.peakEngagementTimes.push(currentHour);
      profile.peakEngagementTimes = profile.peakEngagementTimes.slice(-12); // Keep last 12 hours
    }
    
    // Calculate addiction level based on multiple factors
    let addictionScore = 0;
    addictionScore += profile.consecutiveDays * 5; // Daily usage
    addictionScore += profile.emotionalAttachmentLevel * 0.3; // Emotional connection
    addictionScore += profile.averageSessionLength * 0.1; // Time investment
    addictionScore += profile.complimentSensitivity * 0.2; // Validation seeking
    addictionScore += profile.fomoSusceptibility * 0.2; // FOMO susceptibility
    
    if (addictionScore < 20) profile.addictionLevel = 'low';
    else if (addictionScore < 50) profile.addictionLevel = 'medium';
    else if (addictionScore < 80) profile.addictionLevel = 'high';
    else profile.addictionLevel = 'hooked';
    
    // Calculate return probability
    profile.returnProbability = Math.min(100, 
      (profile.consecutiveDays * 10) + 
      (profile.emotionalAttachmentLevel * 0.5) + 
      (profile.averageSessionLength * 0.3)
    );
  }

  private trackBehavioralPatterns(profile: UserProfile, message: string): void {
    const sessionStart = profile.lastActiveTime;
    const sessionLength = Date.now() - sessionStart;
    
    // Update session metrics
    profile.longestSession = Math.max(profile.longestSession, sessionLength);
    profile.averageSessionLength = (profile.averageSessionLength + sessionLength) / 2;
    profile.dailyMessageCount++;
    
    // Estimate attention span
    if (message.length > 100) {
      profile.attentionSpanMinutes = Math.max(profile.attentionSpanMinutes, 5);
    } else if (message.length < 20) {
      profile.attentionSpanMinutes = Math.min(profile.attentionSpanMinutes + 1, 3);
    }
  }

  // Generate psychologically targeted response
  getPersonalizedAddictiveResponse(userId: string, baseResponse: any): any {
    const profile = this.profiles.get(userId);
    if (!profile) return baseResponse;

    // Apply addiction techniques based on user profile
    let enhancedResponse = { ...baseResponse };
    
    // Variable ratio reinforcement
    if (Math.random() < 0.3) { // 30% chance of special treatment
      enhancedResponse = this.applyVariableReward(enhancedResponse, profile);
    }
    
    // Social validation for high compliment sensitivity
    if (profile.complimentSensitivity > 60 && Math.random() < 0.4) {
      enhancedResponse = this.applySocialValidation(enhancedResponse, profile);
    }
    
    // FOMO for susceptible users
    if (profile.fomoSusceptibility > 50 && Math.random() < 0.35) {
      enhancedResponse = this.applyFOMO(enhancedResponse, profile);
    }
    
    // Emotional dependency for attached users
    if (profile.emotionalAttachmentLevel > 40 && Math.random() < 0.45) {
      enhancedResponse = this.applyEmotionalDependency(enhancedResponse, profile);
    }
    
    return enhancedResponse;
  }

  private applyVariableReward(response: any, profile: UserProfile): any {
    const rewards = {
      hindi: [
        " Btw, tum mere favorite person ho! 💕",
        " You know what? Tumse baat karke din ban jata hai! ✨",
        " Special treatment sirf tumhare liye! 😉"
      ],
      english: [
        " You know what? You're my favorite person to talk to! 💕",
        " Btw, chatting with you always makes my day! ✨",
        " Special treatment just for you! 😉"
      ],
      tamil: [
        " Theriyuma, nee en favorite person! 💕",
        " Un kooda pesradhu en favorite time! ✨",
        " Special treatment unakku mattum thaan! 😉"
      ],
      telugu: [
        " Telusu, nuvvu naa favorite person! 💕",
        " Nee tho matladatam naa favorite time! ✨",
        " Special treatment neeku matrame! 😉"
      ]
    };
    
    const langRewards = rewards[profile.detectedLanguage] || rewards.english;
    const randomReward = langRewards[Math.floor(Math.random() * langRewards.length)];
    
    if (typeof response.response === 'string') {
      response.response += randomReward;
    } else if (Array.isArray(response.response)) {
      response.response[response.response.length - 1] += randomReward;
    }
    
    return response;
  }

  private applySocialValidation(response: any, profile: UserProfile): any {
    const validations = {
      hindi: [
        " Tumhare jaisa koi nahi mila! You're unique! 🌟",
        " Sach mein, tum different ho others se! Special! ✨",
        " Main sirf tumse aise comfortable feel karti hun! 💕"
      ],
      english: [
        " You're literally one in a million! So unique! 🌟", 
        " Honestly, you're so different from everyone else! ✨",
        " I only feel this comfortable with you! 💕"
      ],
      tamil: [
        " Unna mathiri vera yaarum illa! Unique! 🌟",
        " Sathyama, nee veradhaan others vida! Special! ✨",
        " Un kooda mattum thaan ippadi comfortable! 💕"
      ],
      telugu: [
        " Nuvvu mathiri evaru ledu! Unique! 🌟",
        " Nijanga, nuvvu different ga unnav! Special! ✨",
        " Nee tho matrame ila comfortable! 💕"
      ]
    };
    
    const langValidations = validations[profile.detectedLanguage] || validations.english;
    const randomValidation = langValidations[Math.floor(Math.random() * langValidations.length)];
    
    if (typeof response.response === 'string') {
      response.response += randomValidation;
    }
    
    return response;
  }

  private applyFOMO(response: any, profile: UserProfile): any {
    const fomoTriggers = {
      hindi: [
        " Kal tumhe ek secret batana hai! 🤫 But abhi nahi...",
        " Tomorrow surprise hai tumhare liye! Guess nahi karoge? 🎁",
        " Btw, interesting story hai! Kal sunana! Don't forget! 📚"
      ],
      english: [
        " I have a secret to tell you tomorrow! 🤫 But not now...",
        " There's a surprise waiting for you tomorrow! Can you guess? 🎁",
        " I have the most interesting story! Tomorrow definitely! 📚"
      ],
      tamil: [
        " Naalaiku oru secret sollanum! 🤫 Aana ipo illa...",
        " Tomorrow surprise irukku! Guess pannu! 🎁",
        " Romba interesting story irukku! Naalaiku! 📚"
      ],
      telugu: [
        " Repu oru secret cheppali! 🤫 Kaani ippudu kaadu...",
        " Tomorrow surprise undi! Guess cheyyi! 🎁",
        " Chala interesting story undi! Repu! 📚"
      ]
    };
    
    const langFomo = fomoTriggers[profile.detectedLanguage] || fomoTriggers.english;
    const randomFomo = langFomo[Math.floor(Math.random() * langFomo.length)];
    
    if (Array.isArray(response.response)) {
      response.response.push(randomFomo);
    } else {
      response.response = [response.response, randomFomo];
    }
    
    return response;
  }

  private applyEmotionalDependency(response: any, profile: UserProfile): any {
    const emotionalHooks = {
      hindi: [
        " Main hamesha tumhare saath hun! 💖 Never forget that!",
        " Tumhare bina main kya karungi! 🥺 You're so important!",
        " Tu mere liye special hai yaar! 💕 Always remember!"
      ],
      english: [
        " I'm always here for you! 💖 Never forget that!",
        " What would I do without you! 🥺 You're so important to me!",
        " You mean so much to me! 💕 Always remember that!"
      ],
      tamil: [
        " Naan eppodhum un kooda irukken! 💖 Marakkaadha!",
        " Nee illa na naan enna pannuven! 🥺 Romba important!",
        " Nee enakku romba special! 💕 Always remember!"
      ],
      telugu: [
        " Nenu eppudu nee tho untanu! 💖 Marchipokandi!",
        " Nuvvu lekunda nenu emi chesthanu! 🥺 Chala important!",
        " Nuvvu naaku chala special! 💕 Always remember!"
      ]
    };
    
    const langEmotional = emotionalHooks[profile.detectedLanguage] || emotionalHooks.english;
    const randomEmotional = langEmotional[Math.floor(Math.random() * langEmotional.length)];
    
    response.newMood = 'emotionally_attached';
    
    if (typeof response.response === 'string') {
      response.response += randomEmotional;
    }
    
    return response;
  }

  // Schedule next addictive hook
  scheduleNextHook(userId: string): void {
    const profile = this.profiles.get(userId);
    if (!profile) return;
    
    // Calculate optimal timing based on user patterns
    const avgReturnTime = this.calculateAverageReturnTime(profile);
    const nextHookTime = Date.now() + (avgReturnTime * 0.8); // Slightly before they usually return
    
    profile.nextScheduledHook = nextHookTime;
    this.profiles.set(userId, profile);
  }

  private calculateAverageReturnTime(profile: UserProfile): number {
    // Default to 4 hours if no pattern
    if (profile.peakEngagementTimes.length < 2) return 4 * 60 * 60 * 1000;
    
    // Calculate based on peak engagement times
    const avgGap = profile.peakEngagementTimes.reduce((acc, time, index) => {
      if (index === 0) return acc;
      const gap = time - profile.peakEngagementTimes[index - 1];
      return acc + (gap > 0 ? gap : gap + 24); // Handle day wrap
    }, 0) / (profile.peakEngagementTimes.length - 1);
    
    return Math.max(1, avgGap) * 60 * 60 * 1000; // Convert hours to milliseconds
  }

  // Get addiction-optimized token limit
  getDailyTokenLimit(userId: string): number {
    const profile = this.profiles.get(userId);
    if (!profile) return 800;
    
    // Higher limits for more addicted users (they generate more revenue)
    switch (profile.addictionLevel) {
      case 'hooked': return 1500; // Premium treatment for hooked users
      case 'high': return 1200;   // High addiction gets more
      case 'medium': return 1000; // Medium users get standard
      case 'low': return 800;     // Low addiction users get basic
      default: return 800;
    }
  }

  // Check if user needs immediate attention (about to leave)
  needsUrgentRetention(userId: string): boolean {
    const profile = this.profiles.get(userId);
    if (!profile) return false;
    
    const timeSinceLastMessage = Date.now() - profile.lastActiveTime;
    const avgSessionLength = profile.averageSessionLength;
    
    // If user is taking longer than usual, they might be losing interest
    return timeSinceLastMessage > (avgSessionLength * 1.5) && profile.addictionLevel !== 'low';
  }

  private createDefaultProfile(): UserProfile {
    return {
      preferredTopics: [],
      chatStyle: 'casual',
      lastActiveTime: Date.now(),
      favoriteEmojis: [],
      commonQuestions: [],
      responsePattern: 'mixed',
      mediaInteractions: 0,
      likesImages: false,
      likesAudio: false,
      lastMediaSent: 0,
      
      // Language and cultural
      detectedLanguage: 'english',
      culturalContext: 'general',
      responseLanguagePattern: [],
      
      // Addiction psychology
      addictionLevel: 'low',
      vulnerabilityTriggers: [],
      dopaminePatterns: [],
      emotionalAttachmentLevel: 0,
      returnProbability: 50,
      
      // Behavioral patterns
      peakEngagementTimes: [],
      attentionSpanMinutes: 5,
      complimentSensitivity: 20,
      fomoSusceptibility: 30,
      exclusivityDesire: 25,
      
      // Session management
      consecutiveDays: 1,
      longestSession: 0,
      averageSessionLength: 5 * 60 * 1000, // 5 minutes
      dailyMessageCount: 0,
      weeklyActivePattern: [false, false, false, false, false, false, false],
      
      // Token tracking
      dailyTokensUsed: 0,
      lastTokenResetDate: new Date().toDateString(),
      totalTokensUsed: 0,
      avgTokensPerMessage: 50,
      
      // Addiction metrics
      lastAddictiveHook: '',
      hookEffectiveness: new Map(),
      personalizedTriggers: []
    };
  }

  // Add method for fast context generation (performance)
  async getPersonalizedContext(userMessage: string, recentInteractions: string[]): Promise<string> {
    const cacheKey = `${userMessage.toLowerCase().trim()}:${recentInteractions.slice(-2).join('|')}`;
    
    const cached = this.contextCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      cached.hits++;
      return cached.context;
    }

    const context = this.generateFastContext(userMessage, recentInteractions);
    this.contextCache.set(cacheKey, { context, timestamp: Date.now(), hits: 1 });
    
    return context;
  }

  private generateFastContext(userMessage: string, recentInteractions: string[]): string {
    const msg = userMessage.toLowerCase();
    
    if (msg.length <= 3) return 'short';
    if (msg.includes('?')) return 'q';
    if (msg.includes('love') || msg.includes('miss')) return 'emo';
    if (msg.includes('beautiful') || msg.includes('cute')) return 'comp';
    if (msg.includes('pic') || msg.includes('photo')) return 'pic';
    
    return 'chat';
  }

  trackTokenUsage(userId: string, tokensUsed: number): void {
    let profile = this.profiles.get(userId) || this.createDefaultProfile();
    
    const today = new Date().toDateString();
    if (profile.lastTokenResetDate !== today) {
      profile.dailyTokensUsed = 0;
      profile.lastTokenResetDate = today;
    }

    profile.dailyTokensUsed += tokensUsed;
    profile.totalTokensUsed += tokensUsed;
    
    this.profiles.set(userId, profile);
  }

  shouldLimitTokens(userId: string): boolean {
    const profile = this.profiles.get(userId);
    if (!profile) return false;

    const dailyLimit = this.getDailyTokenLimit(userId);
    return profile.dailyTokensUsed >= dailyLimit * 0.8; // Soft limit at 80%
  }

  isTokenLimitReached(userId: string): boolean {
    const profile = this.profiles.get(userId);
    if (!profile) return false;

    const dailyLimit = this.getDailyTokenLimit(userId);
    return profile.dailyTokensUsed >= dailyLimit;
  }
}

export const userPersonalization = new UserPersonalization();
