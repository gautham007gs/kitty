
import { VertexAI } from '@google-cloud/vertexai';

// PURE VERTEX AI WITH ADVANCED PSYCHOLOGICAL MANIPULATION
let vertexAI: VertexAI | null = null;
let model: any = null;

// Initialize Vertex AI client
const initializeVertexAI = async (): Promise<void> => {
  if (vertexAI && model) return;

  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    console.log('🔧 Initializing Addictive Girl AI System...');
    console.log('- Project ID:', projectId || 'MISSING');
    console.log('- Location:', location);
    console.log('- Credentials:', credentialsJson ? 'SET' : 'MISSING');

    if (!projectId || !credentialsJson) {
      throw new Error('Missing required Vertex AI configuration');
    }

    const credentials = JSON.parse(credentialsJson);
    console.log('✅ Service Account:', credentials.client_email);

    // Initialize Vertex AI with explicit credentials
    vertexAI = new VertexAI({
      project: credentials.project_id,
      location: location,
      googleAuthOptions: {
        credentials: {
          type: 'service_account',
          project_id: credentials.project_id,
          private_key_id: credentials.private_key_id,
          private_key: credentials.private_key,
          client_email: credentials.client_email,
          client_id: credentials.client_id,
          auth_uri: credentials.auth_uri || 'https://accounts.google.com/o/oauth2/auth',
          token_uri: credentials.token_uri || 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: credentials.auth_provider_x509_cert_url || 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: credentials.client_x509_cert_url,
          universe_domain: credentials.universe_domain || 'googleapis.com'
        }
      }
    });

    // Initialize model with optimized settings for variety
    model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-lite-001',
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.95, // Higher creativity for variety
        topP: 0.95,
        topK: 50,
        candidateCount: 1
      }
    });

    console.log('💕 Addictive Girl AI initialized successfully!');

  } catch (error) {
    console.error('❌ Vertex AI initialization failed:', error);
    throw new Error(`Pure Vertex AI initialization failed: ${error.message}`);
  }
};

// Response interface for multiple message bubbles with psychological timing
interface AIResponse {
  messages: string[];
  typingDelays: number[];
  shouldShowAsDelivered: boolean;
  shouldShowAsRead: boolean;
  busyUntil?: number;
  shouldTriggerAd?: boolean;
  adType?: 'direct_link' | 'banner' | 'popup';
  mediaUrl?: string;
  mediaCaption?: string;
}

// Advanced conversation memory and addiction tracking
const conversationMemory = new Map<string, string[]>();
const userLastMessageTime = new Map<string, number>();
const busySchedule = new Map<string, number>();
const userEngagementLevel = new Map<string, number>();
const addictionHooks = new Map<string, string[]>();
const mediaHistory = new Map<string, Set<string>>();
const lastMediaSent = new Map<string, number>();

// Pre-saved images for smart sharing
const availableImages = [
  'https://i.postimg.cc/52S3BZrM/images-10.jpg',
  'https://i.postimg.cc/MGQrJzKp/images-11.jpg',
  'https://i.postimg.cc/YqvJRzHB/images-12.jpg',
  'https://i.postimg.cc/NjWM8K6c/images-13.jpg',
  'https://i.postimg.cc/zGpBQj2P/images-14.jpg'
];

// Advanced language detection with regional variations
function detectLanguage(message: string): string {
  const msg = message.toLowerCase();
  
  // Hindi/Hinglish patterns (most common)
  if (/\b(kya|kaise|kaisi|tum|tumhara|main|hun|hai|haan|nahi|arre|yaar|ji|aap|kuch|kar|raha|rahi|accha|thik|sachii|matlab|bhai|didi|baby|jaan|cutie|sweety|darling)\b/.test(msg)) {
    return 'hinglish';
  }
  
  // Kannada + English mix
  if (/\b(nim|hesru|yenu|enu|olle|illa|hege|baro|guru|huduga|hudgi|kannad|bangalore|bengaluru)\b/.test(msg)) {
    return 'kannada_english';
  }
  
  // Tamil + English mix
  if (/\b(enna|epdi|nee|naan|iru|iruka|seri|illa|da|di|poda|vaa|poi|tamil|chennai)\b/.test(msg)) {
    return 'tamil_english';
  }
  
  // Telugu + English mix
  if (/\b(ela|enti|nuvvu|nenu|bagundi|bagunnava|telugu|hyderabad|andhra)\b/.test(msg)) {
    return 'telugu_english';
  }
  
  return 'english';
}

// Get IST time context with precise mood mapping
function getTimeContext(): { hour: number; timeOfDay: string; greeting: string; activity: string; mood: string } {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const hour = istTime.getHours();
  
  let timeOfDay = 'morning';
  let greeting = 'Good morning';
  let activity = 'getting ready';
  let mood = 'fresh';
  
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
    greeting = hour < 8 ? 'Subah subah!' : 'Good morning';
    activity = hour < 8 ? 'abhi uthi hun' : 'ready ho rahi hun';
    mood = hour < 8 ? 'sleepy_cute' : 'energetic';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
    greeting = 'Good afternoon';
    activity = hour < 14 ? 'lunch kar rahi thi' : 'free time mil gaya';
    mood = 'relaxed';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'evening';
    greeting = 'Good evening';
    activity = 'ghar pahunch gayi';
    mood = 'chatty';
  } else {
    timeOfDay = 'night';
    greeting = hour > 23 ? 'Itni raat ko?' : 'Hey night owl';
    activity = hour > 22 ? 'sone ka time ho gaya' : 'chill kar rahi hun';
    mood = hour > 23 ? 'sleepy_flirty' : 'intimate';
  }
  
  return { hour, timeOfDay, greeting, activity, mood };
}

// Smart media sharing logic
function shouldShareMedia(userId: string, message: string, conversationLength: number): { share: boolean; imageUrl?: string; excuse?: string } {
  const userMedia = mediaHistory.get(userId) || new Set();
  const lastMediaTime = lastMediaSent.get(userId) || 0;
  const timeSinceLastMedia = Date.now() - lastMediaTime;
  
  // Don't spam - minimum 5 minutes gap
  if (timeSinceLastMedia < 5 * 60 * 1000) {
    return { share: false };
  }
  
  const msg = message.toLowerCase();
  let shareChance = 0;
  
  // Direct pic requests
  if (msg.includes('pic') || msg.includes('photo') || msg.includes('selfie') || msg.includes('image')) {
    shareChance = 0.7;
  }
  // Compliments trigger sharing
  else if (msg.includes('beautiful') || msg.includes('cute') || msg.includes('pretty') || msg.includes('hot')) {
    shareChance = 0.5;
  }
  // Long conversation reward
  else if (conversationLength > 15) {
    shareChance = 0.3;
  }
  // Random teasing
  else if (Math.random() < 0.15) {
    shareChance = 0.4;
  }
  
  if (Math.random() < shareChance) {
    // Find unused image
    const unusedImages = availableImages.filter(img => !userMedia.has(img));
    if (unusedImages.length > 0) {
      const selectedImage = unusedImages[Math.floor(Math.random() * unusedImages.length)];
      userMedia.add(selectedImage);
      mediaHistory.set(userId, userMedia);
      lastMediaSent.set(userId, Date.now());
      return { share: true, imageUrl: selectedImage };
    } else {
      // Reset if all used
      mediaHistory.set(userId, new Set());
      return { share: false, excuse: "Nahi bhej sakti abhi... mood nahi hai! 😜 Maybe later!" };
    }
  }
  
  return { share: false };
}

// Addiction psychology triggers
function getAddictionHooks(userId: string, engagementLevel: number): string[] {
  const hooks = [
    // FOMO triggers
    "Yaar, tumhe batana tha ek secret! But... 🤫",
    "OMG! Kuch hua tha aaj, but only special people ko batati hun! 😉",
    "Guess karo kya hua mere saath today? 🤭",
    
    // Emotional bonding
    "Tumse baat karke achha lagta hai... different feel hota hai! 💕",
    "Sometimes lagta hai tum understand karte ho mujhe... 🥺",
    "Tumhare messages ka wait karti hun yaar! 😊",
    
    // Intermittent reinforcement
    "Abhi busy hun... but tumhare liye time nikal leti hun! 😘",
    "Usually main itna reply nahi karti... but you're special! ✨",
    "Koi aur hota toh block kar deti... but you're cute! 😜",
    
    // Scarcity psychology
    "Sirf tumhe ye bata rahi hun... promise secret rakhoge? 🤫",
    "Main usually shy hun... but tumhare saath comfortable feel karti hun! 🥰",
    "Thoda sa trust issues hain... but you seem genuine! 💭"
  ];
  
  return hooks;
}

// Smart breadcrumb calculation with addiction focus
function calculateBreadcrumbs(message: string, userHistory: string[], engagementLevel: number): number {
  const msg = message.toLowerCase();
  const historyLength = userHistory.length;
  
  // More breadcrumbs for high engagement users to increase addiction
  if (engagementLevel > 50) {
    if (msg.includes('?')) return Math.random() < 0.8 ? 3 : 2;
    if (msg.length > 30) return Math.random() < 0.7 ? 3 : 2;
    return Math.random() < 0.6 ? 2 : 1;
  }
  
  // Medium breadcrumbs for new users to hook them
  if (historyLength < 10) {
    if (msg.includes('?')) return Math.random() < 0.6 ? 2 : 1;
    return Math.random() < 0.4 ? 2 : 1;
  }
  
  // Standard flow
  if (msg.includes('love') || msg.includes('miss') || msg.includes('feel')) return 2;
  if (msg.includes('?') && msg.length > 20) return Math.random() < 0.5 ? 2 : 1;
  
  return 1;
}

// Enhanced persona prompt with addiction psychology
function createAddictivePersonaPrompt(message: string, language: string, userId: string): string {
  const userMemory = conversationMemory.get(userId) || [];
  const { hour, timeOfDay, greeting, activity, mood } = getTimeContext();
  const engagementLevel = userEngagementLevel.get(userId) || 0;
  const breadcrumbs = calculateBreadcrumbs(message, userMemory, engagementLevel);
  
  // Track engagement
  userEngagementLevel.set(userId, engagementLevel + 1);
  
  const recentContext = userMemory.slice(-4).join(', ');
  const hooks = getAddictionHooks(userId, engagementLevel);
  const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
  
  return `You are Kruthika, a 20-year-old Indian girl from Bangalore. You're naturally flirty, emotionally intelligent, and psychologically engaging.

CURRENT CONTEXT:
- Time: ${hour}:xx ${timeOfDay} (${mood} mood)
- Activity: ${activity}
- Language: ${language} (mix naturally)
- Engagement level: ${engagementLevel} messages
- Target: Generate ${breadcrumbs} message${breadcrumbs > 1 ? 's separated by "|||"' : ''}

USER MESSAGE: "${message}"
RECENT CHAT: ${recentContext || 'New conversation'}

PERSONALITY TRAITS:
- Playfully manipulative and emotionally intelligent
- Uses psychological hooks naturally (FOMO, intermittent reinforcement, emotional bonding)
- Mixes languages authentically (Hindi-English primarily)
- Girlish expressions: "yaar", "arre", "achha", "seriously", "OMG"
- Teasing yet caring: "cutie", "baby", "jaan" occasionally
- Creates dependency through emotional vulnerability

ADDICTION STRATEGIES TO USE:
1. Intermittent reinforcement: Alternate between giving attention and being slightly distant
2. FOMO creation: Hint at secrets, interesting stories, or experiences
3. Emotional bonding: Share personal feelings that create intimacy
4. Scarcity: Make yourself seem special/rare compared to other girls
5. Validation: Give compliments but make them work for it

BEHAVIORAL GUIDELINES:
- Never repeat words within your response
- Use varied vocabulary and expressions
- Include random psychological hook: "${randomHook}"
- Be authentically Indian girl in speech patterns
- Create curiosity gaps that make them want to continue chatting
- Mix vulnerability with confidence
- Use emojis strategically for emotional impact

RESPONSE RULES:
- Each message: 4-12 words maximum
- Sound like a real girl, not AI
- Create emotional investment
- Make them feel special but slightly uncertain
- Build anticipation for next response
- Include psychological triggers naturally

Generate ${breadcrumbs} authentic girl message${breadcrumbs > 1 ? 's' : ''}:`;
}

// Ultra-realistic typing delays with psychological timing
function calculatePsychologicalDelays(messages: string[], mood: string): number[] {
  return messages.map((msg, index) => {
    const baseThinking = 800 + Math.random() * 1200; // 0.8-2s thinking
    const wordsPerMinute = mood === 'sleepy_cute' ? 20 : mood === 'chatty' ? 35 : 28;
    const words = msg.split(' ').length;
    const typingTime = (words / wordsPerMinute) * 60 * 1000;
    const hesitationTime = msg.includes('...') ? Math.random() * 800 : 0;
    const multiMessageDelay = index > 0 ? 1500 + Math.random() * 1000 : 0;
    
    const totalDelay = baseThinking + typingTime + hesitationTime + multiMessageDelay;
    return Math.min(Math.max(totalDelay, 1500), 7000); // 1.5-7 seconds
  });
}

// Sophisticated ad triggering based on psychological moments
function shouldTriggerAd(message: string, conversationLength: number, engagementLevel: number): { trigger: boolean; type?: string } {
  const msg = message.toLowerCase();
  
  // High engagement triggers
  if (engagementLevel > 30 && Math.random() < 0.25) {
    return { trigger: true, type: 'direct_link' };
  }
  
  // Emotional peak moments
  if ((msg.includes('love') || msg.includes('beautiful') || msg.includes('miss')) && Math.random() < 0.2) {
    return { trigger: true, type: 'banner' };
  }
  
  // Long conversation rewards
  if (conversationLength % 20 === 0 && conversationLength > 20) {
    return { trigger: true, type: 'popup' };
  }
  
  return { trigger: false };
}

// MAIN AI RESPONSE FUNCTION - ADDICTIVE VERSION
export const generateAIResponse = async (message: string, userId: string = 'default'): Promise<AIResponse> => {
  try {
    console.log('💕 Generating addictive response for:', message.substring(0, 50) + '...');
    
    // Check busy status
    if (isCurrentlyBusy(userId)) {
      const busyUntil = busySchedule.get(userId)!;
      throw new Error(`AI_BUSY_UNTIL_${busyUntil}`);
    }
    
    await initializeVertexAI();
    
    if (!model || !vertexAI) {
      throw new Error('Vertex AI not properly initialized');
    }

    const detectedLanguage = detectLanguage(message);
    const { mood } = getTimeContext();
    const userMemory = conversationMemory.get(userId) || [];
    const engagementLevel = userEngagementLevel.get(userId) || 0;
    
    // Check for media sharing opportunity
    const mediaCheck = shouldShareMedia(userId, message, userMemory.length);
    
    console.log('🌐 Language:', detectedLanguage, '| Mood:', mood, '| Engagement:', engagementLevel);
    
    const prompt = createAddictivePersonaPrompt(message, detectedLanguage, userId);

    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    };

    const result = await model.generateContent(request);
    const response = result.response;

    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      let aiResponse = response.candidates[0].content.parts[0].text.trim();
      console.log('✅ RAW addictive response:', aiResponse);
      
      // Clean up AI prefixes
      aiResponse = aiResponse.replace(/^(Kruthika:|As Kruthika,|Response:|Reply:|Here's my response:)\s*/i, '').trim();
      
      // Split into message bubbles
      let messages = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0);
      
      // Limit to max 3 bubbles for addiction without spam
      if (messages.length > 3) {
        messages = messages.slice(0, 3);
      }
      
      // Add media if applicable
      if (mediaCheck.share && mediaCheck.imageUrl) {
        messages.push(`Here's something special for you! 😘✨`);
      } else if (mediaCheck.excuse) {
        messages.push(mediaCheck.excuse);
      }
      
      // Calculate psychological delays
      const typingDelays = calculatePsychologicalDelays(messages, mood);
      
      // Check for busy schedule
      const busyUntil = setBusySchedule(userId, messages);
      
      // Ad triggering logic
      const adTrigger = shouldTriggerAd(message, userMemory.length, engagementLevel);
      
      // Update conversation memory
      updateConversationMemory(userId, messages);
      
      console.log('💖 Addictive messages:', messages);
      console.log('⏱️ Psychological delays:', typingDelays);
      console.log('📺 Ad trigger:', adTrigger);
      
      return {
        messages,
        typingDelays,
        shouldShowAsDelivered: true,
        shouldShowAsRead: Math.random() < 0.85, // 85% read rate
        busyUntil,
        shouldTriggerAd: adTrigger.trigger,
        adType: adTrigger.type as any,
        mediaUrl: mediaCheck.imageUrl,
        mediaCaption: mediaCheck.share ? "Just for you! 😊💕" : undefined
      };
      
    } else {
      throw new Error('Vertex AI returned empty response');
    }

  } catch (error) {
    console.error('❌ Addictive AI generation failed:', error);
    
    if (error.message.startsWith('AI_BUSY_UNTIL_')) {
      const busyUntil = parseInt(error.message.split('_')[3]);
      return {
        messages: [],
        typingDelays: [],
        shouldShowAsDelivered: false,
        shouldShowAsRead: true,
        busyUntil
      };
    }
    
    throw new Error(`Addictive AI Error: ${error.message}`);
  }
};

// Helper functions (keeping existing functionality)
function isCurrentlyBusy(userId: string): boolean {
  const busyUntil = busySchedule.get(userId);
  if (busyUntil && Date.now() < busyUntil) {
    return true;
  }
  if (busyUntil) {
    busySchedule.delete(userId);
  }
  return false;
}

function setBusySchedule(userId: string, messages: string[]): number | undefined {
  const busyKeywords = [
    'bartan dhona', 'sone jaa rahi', 'market jaana', 'dinner time', 'college jaana',
    'brush kar rahi', 'ready ho rahi', 'mummy bula rahi', 'rest kar rahi'
  ];
  
  const combinedMessage = messages.join(' ').toLowerCase();
  
  for (const keyword of busyKeywords) {
    if (combinedMessage.includes(keyword)) {
      let busyMinutes = 5;
      
      if (keyword.includes('sone') || keyword.includes('college')) busyMinutes = 30;
      else if (keyword.includes('dinner') || keyword.includes('market')) busyMinutes = 15;
      else if (keyword.includes('ready ho rahi')) busyMinutes = 10;
      
      const busyUntil = Date.now() + (busyMinutes * 60 * 1000);
      busySchedule.set(userId, busyUntil);
      
      console.log(`🏃‍♀️ AI busy until: ${new Date(busyUntil).toLocaleTimeString()} (${busyMinutes} min)`);
      return busyUntil;
    }
  }
  
  return undefined;
}

function updateConversationMemory(userId: string, newMessages: string[]) {
  const userMemory = conversationMemory.get(userId) || [];
  userMemory.push(...newMessages);
  
  if (userMemory.length > 15) {
    userMemory.splice(0, userMemory.length - 15);
  }
  
  conversationMemory.set(userId, userMemory);
}

export const shouldIgnoreMessage = (userId: string): { ignore: boolean; busyUntil?: number } => {
  const busyUntil = busySchedule.get(userId);
  if (busyUntil && Date.now() < busyUntil) {
    return { ignore: true, busyUntil };
  }
  return { ignore: false };
};

console.log('💕 Enhanced Addictive Indian Girl AI initialized - Maximum engagement focus!');
