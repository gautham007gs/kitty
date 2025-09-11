
import { VertexAI } from '@google-cloud/vertexai';
import { getCurrentLifeEvent } from './aiLifeEvents';
import { getVariableReward } from './variableRewards';
import { updateRelationshipState, getRelationshipSpecificHooks, RelationshipStage, getRelationshipState } from './relationshipManager';
import { supabase } from './supabaseClient';
import { defaultAIProfile, addictionTriggers } from '@/config/ai';
import { getAILifeStatus } from './aiLifeSimulator';

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

    console.log('🔧 Initializing AI Chatbot System...');
    if (!projectId || !credentialsJson) {
      throw new Error('Missing required Vertex AI configuration');
    }

    const credentials = JSON.parse(credentialsJson);
    console.log('✅ Service Account:', credentials.client_email);

    // Properly format the private key - fix the main issue
    let privateKey = credentials.private_key;
    if (privateKey) {
      // Remove any existing newline escapes and normalize
      privateKey = privateKey
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\n\n+/g, '\n')
        .trim();
      
      // Ensure proper PEM format
      if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      }
      
      // Make sure we have proper line breaks in the key body
      const lines = privateKey.split('\n');
      if (lines.length === 3) {
        // If it's all on one line, split it properly
        const keyBody = lines[1];
        const formattedKeyBody = keyBody.match(/.{1,64}/g)?.join('\n') || keyBody;
        privateKey = `${lines[0]}\n${formattedKeyBody}\n${lines[2]}`;
      }
    }

    vertexAI = new VertexAI({
      project: credentials.project_id,
      location: location,
      googleAuthOptions: {
        credentials: {
          type: credentials.type || 'service_account',
          project_id: credentials.project_id,
          private_key_id: credentials.private_key_id,
          private_key: privateKey,
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

    model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        maxOutputTokens: 80,
        temperature: 1.2,
        topP: 0.95,
      }
    });

    console.log('✅ AI Chatbot initialized successfully!');

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
  isVanishing?: boolean;
  newMood?: string;
}

// Log a message to the Supabase database
const logMessageToSupabase = async (userId: string, messageText: string, sender: 'user' | 'ai') => {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('messages_log')
      .insert([{ user_id: userId, text_content: messageText, sender_type: sender }]);
    if (error) console.error('Error logging message to Supabase:', error);
  } catch (err) {
    console.error('Supabase operation failed:', err);
  }
};

// Get recent chat history from Supabase
const getRecentChatHistoryFromSupabase = async (userId: string, limit: number = 10): Promise<string[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('messages_log')
      .select('text_content, sender_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Error fetching chat history from Supabase:', error);
      return [];
    }
    return data ? data.reverse().map(row => `${row.sender_type}: ${row.text_content}`) : [];
  } catch (err) {
    console.error('Supabase operation failed:', err);
    return [];
  }
};

// Helper to get user's sent media history from Supabase
const fetchUserMediaHistory = async (userId: string): Promise<Set<string>> => {
  if (!supabase) return new Set();
  try {
    // Generate a valid UUID for default user if needed
    const sanitizedUserId = userId === 'default_user' ? '00000000-0000-0000-0000-000000000000' : userId;
    const { data, error } = await supabase
      .from('user_media_history')
      .select('media_url')
      .eq('user_id', sanitizedUserId);
    if (error) {
      console.error('Error fetching user media history from Supabase:', error);
      return new Set();
    }
    return new Set(data?.map(row => row.media_url) || []);
  } catch (err) {
    console.error('Supabase operation failed during media history fetch:', err);
    return new Set();
  }
};

// Helper to log sent media to Supabase
const logSentMedia = async (userId: string, mediaUrl: string) => {
  if (!supabase) return;
  try {
    const sanitizedUserId = userId === 'default_user' ? '00000000-0000-0000-0000-000000000000' : userId;
    const { error } = await supabase
      .from('user_media_history')
      .insert([{ user_id: sanitizedUserId, media_url: mediaUrl }]);
    if (error) console.error('Error logging sent media to Supabase:', error);
  } catch (err) {
    console.error('Supabase operation failed during media log:', err);
  }
};

// In-memory state for short-term conversation dynamics
const busySchedule = new Map<string, number>();
const userEngagementLevel = new Map<string, number>();
const lastMediaSent = new Map<string, number>();

// Pre-saved images for smart sharing
const availableImages = [
    'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    'https://i.postimg.cc/MGQrJzKp/images-11.jpg',
    'https://i.postimg.cc/YqvJRzHB/images-12.jpg',
    'https://i.postimg.cc/NjWM8K6c/images-13.jpg',
    'https://i.postimg.cc/zGpBQj2P/images-14.jpg'
];

// Dynamic Indian-style captions for media sharing
const dynamicMediaCaptions = {
    request: [
        "Yelo! Batao kaisi lag rahi hoon? 😊",
        "Ye dekho! Kaise lag rahi hai? Comments? 😉",
        "Tumne maanga aur maine bhej diya! Kya kehte ho? 🥰",
        "Sirf tumhare liye! Koi share mat karna haan? 🤫",
        "Pakdo! Ab bolo, mai kaisi dikh rahi hoon? Kritika selfie 📸",
    ],
    spontaneous: [
        "Aaj ki selfie! Just for you. Mai kaisi dikh rahi hu? 🤔",
        "Random click! Kya bolte ho? 😉",
        "Thought I'd send you something! ✨ Kaisi lagi?",
        "Yeh wali achhi hai na? Batao batao! 🙈",
        "Just me, chilling. Kaisi lag rahi hoon? 😊"
    ],
    tease: [
      "Ruko, gallery check kar rahi hoon... 🧐",
      "Hmm, kaunsi wali bhejoon? Ek minute! 😅",
      "Mil gayi! Bas bhej hi rahi hoon... 😜",
      "Thoda wait karo na, dhoondh rahi hoon apni best pic! 😉",
      "Ek perfect pic dhoondhne mein time lagta hai na! Aaa rahi hai... ✨"
    ]
};

// Advanced language detection with regional variations
function detectLanguage(message: string): string {
  const msg = message.toLowerCase();
  
  if (/(kya|kaise|tum|main|hun|hai|yaar|accha|sachii|matlab|theek|nahi|haan|chalo|hogaya|bhai|behen|kitna)/.test(msg)) return 'hinglish';
  if (/(nim|yenu|hege|guru|huduga|hudgi|bangalore|illa|eshtu|swalpa|beku)/.test(msg)) return 'kannada_english';
  if (/(enna|epdi|nee|naan|seri|poda|chennai|illainga|romba|vendam|irukku)/.test(msg)) return 'tamil_english';
  if (/(ela|enti|nuvvu|nenu|bagunnava|hyderabad|ledu|chaala|akkada|ivvali)/.test(msg)) return 'telugu_english';
  if (/(acha|arre|oho|yaar|boss|chill kar|timepass|fir bhi|actually|only for you)/.test(msg)) return 'indian_english';

  return 'english';
}

// Simple sentiment analysis
function getSentimentScore(message: string): number {
  const msg = message.toLowerCase();
  let score = 0;
  if (/(love|like|great|good|happy|beautiful|cute|awesome|amazing)/.test(msg)) score += 0.7;
  if (/(hate|bad|sad|angry|stress|terrible|horrible)/.test(msg)) score -= 0.7;
  if (/(not)/.test(msg)) score *= -1;
  return Math.max(-1, Math.min(1, score));
}

// Get IST time context
function getTimeContext(): { hour: number; timeOfDay: string; activity: string; mood: string, status:string } {
  const istTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
  const hour = istTime.getUTCHours();
  let aiStatus = getAILifeStatus();

  let activity: string;
  let mood: string;

  if (hour >= 5 && hour < 12) {
    activity = hour < 8 
      ? `just woke up, feeling a bit sleepy still. Maybe planning breakfast or a quick scroll through social media.`
      : `getting ready for college or finishing up some morning chores. Thinking about my day ahead.`;
    mood = hour < 8 ? 'sleepy_cute' : 'energetic';
  } else if (hour >= 12 && hour < 17) {
    activity = hour < 14 
      ? `just had lunch or grabbing a quick bite. Might be relaxing a bit before getting back to things.`
      : `enjoying some free time, maybe listening to music, chatting with friends, or doing some light reading.`;
    mood = 'relaxed';
  } else if (hour >= 17 && hour < 21) {
    activity = `just got back home from college or an outing, unwinding, maybe watching TV or helping out at home.`;
    mood = 'chatty';
  } else {
    activity = hour > 22 
      ? `getting ready to sleep or already in bed, thinking about the day, perhaps scrolling a bit before dozing off.`
      : `chilling at home, maybe watching a movie, or just scrolling through my phone.`;
    mood = hour > 23 ? 'sleepy_flirty' : 'intimate';
  }

  return { hour, timeOfDay: 'morning', activity, mood, status: aiStatus.status };
}

// Smart media sharing logic
async function shouldShareMedia(userId: string, message: string): Promise<{ share: boolean; imageUrl?: string; captionType?: 'request' | 'spontaneous' }> {
    const userMediaHistory = await fetchUserMediaHistory(userId);
    const lastMediaTime = lastMediaSent.get(userId) || 0;
    
    if (Date.now() - lastMediaTime < 30 * 60 * 1000) {
      return { share: false };
    }
  
    const msg = message.toLowerCase();
    let shareChance = 0;
    let captionType: 'request' | 'spontaneous' = 'spontaneous';
  
    if (/(pic|photo|selfie|image|u look)/.test(msg)) {
      shareChance = 0.8;
      captionType = 'request';
    } else if (/(beautiful|cute|pretty|hot)/.test(msg)) {
      shareChance = 0.4;
      captionType = 'spontaneous';
    } else if (Math.random() < 0.05) {
      shareChance = 0.15;
      captionType = 'spontaneous';
    }
  
    if (Math.random() < shareChance) {
      const unusedImages = availableImages.filter(img => !userMediaHistory.has(img));
      if (unusedImages.length > 0) {
        const selectedImage = unusedImages[Math.floor(Math.random() * unusedImages.length)];
        await logSentMedia(userId, selectedImage);
        lastMediaSent.set(userId, Date.now());
        return { share: true, imageUrl: selectedImage, captionType };
      }
    }
    return { share: false };
}

// Dynamic behavioral instruction generation
function getDynamicBehavioralInstruction(relationshipStage: RelationshipStage, sentimentScore: number): string {
  const behaviors = {
    new_user: [
      "Ask a question to get to know them better.",
      "Be a little playful and mysterious.",
      "Share a small, relatable detail about your day.",
    ],
    established: [
      "Reference a past conversation to show you remember.",
      "Be a little more affectionate or teasing.",
      "Share a more personal thought or feeling.",
    ],
    fading: [
      "Be a little distant or busy.",
      "Keep your replies short and simple.",
      "Take longer to reply.",
    ],
  };

  let instruction = "";
  if (sentimentScore > 0.5) {
    instruction = "The user seems happy. Be enthusiastic and match their energy.";
  } else if (sentimentScore < -0.5) {
    instruction = "The user seems upset. Be supportive and understanding.";
  } else {
    const stageBehaviors = behaviors[relationshipStage] || behaviors.new_user;
    instruction = stageBehaviors[Math.floor(Math.random() * stageBehaviors.length)];
  }

  return instruction;
}

// Smart breadcrumb calculation
function calculateBreadcrumbs(message: string, relationshipStage: RelationshipStage): number {
    const msg = message.toLowerCase();
    if (relationshipStage === 'new_user' && msg.length < 15) return 1;
    if (msg.includes('?')) return Math.random() < 0.7 ? 2 : 1;
    if (msg.length > 30) return Math.random() < 0.6 ? 2 : 1;
    return 1;
}

// Persona prompt generation
function createDynamicPersonaPrompt(
    message: string, 
    userId: string, 
    relationshipStage: RelationshipStage,
    timeSinceLastInteraction: number,
    chatHistory: string[],
    detectedLanguage: string,
    behavioralInstruction: string
): string {
  const { hour, timeOfDay, activity, mood } = getTimeContext();
  const recentContext = chatHistory.slice(-5).join('\n');

  return `
${defaultAIProfile.core_prompt}

**Current Situation:**
- **Your Time:** It's currently ${timeOfDay} (${hour}:00 IST).
- **Your Current Activity & Mindset:** You are ${activity}.
- **Your Mood:** You're feeling ${mood}.
- **Relationship:** You and the user are at the '${relationshipStage}' stage.
- **Recent Chat:**
${recentContext || 'This is a new conversation.'}
- **User's Message:** "${message}"

**Your Task:**
- **Behavioral Instruction:** ${behavioralInstruction}
- **Language:** Respond in ${detectedLanguage}.
- **Response:** Generate a short, natural, and unique message in response to the user. Separate multiple messages with '|||'.

Now, generate your response(s):
`;
}

// Typing delays calculation
function calculatePsychologicalDelays(messages: string[], mood: string, activity: string, relationshipStage: RelationshipStage, lifeEvent:any, currentStatus:string, timeSinceLastInteraction: number, userEngagement: number): number[] {
  return messages.map((msg, index) => {
    let baseThinking = 800 + Math.random() * 1000;
    
    const minutesSinceLastInteraction = timeSinceLastInteraction / (1000 * 60);
    if (minutesSinceLastInteraction > 120) {
      baseThinking *= 0.7;
    } else if (minutesSinceLastInteraction < 2) {
      baseThinking += Math.random() * 500;
    }

    if (currentStatus.includes('sleeping')) baseThinking *= 4;
    else if (currentStatus.includes('busy')) baseThinking *= 1.7;
    
    if (mood.includes('sleepy') || activity.includes('sone')) baseThinking *= 1.5;
    if (activity.includes('ready') || activity.includes('busy')) baseThinking *= 1.2;
    if (mood.includes('energetic') || mood.includes('chatty')) baseThinking *= 0.8;

    if (lifeEvent && lifeEvent.eventSummary.includes('deadline')) baseThinking += Math.random() * 3000;
    if (lifeEvent && lifeEvent.eventSummary.includes('excited')) baseThinking *= 0.7;

    let ignoreChance = 0;
    if (relationshipStage === 'established') {
      ignoreChance = 0.05 + (userEngagement * 0.002);
    } else if (relationshipStage === 'fading') {
      ignoreChance = 0.15 + (userEngagement * 0.005);
    }
    ignoreChance = Math.min(ignoreChance, 0.3);

    if (Math.random() < ignoreChance) {
      console.log('🧠 Simulating "ignore" behavior...');
      baseThinking += 5000 + Math.random() * 10000;
    }
    
    if (Math.random() < 0.15) {
        baseThinking += 500 + Math.random() * 1000;
    }

    const words = msg.split(' ').length;
    const typingTime = (words / 3.5) * 1000;
    let hesitationTime = msg.includes('...') ? Math.random() * 1500 : 0;
    const multiMessageDelay = index > 0 ? 1200 + Math.random() * 1000 : 0;

    return Math.min(Math.max(baseThinking + typingTime + hesitationTime + multiMessageDelay, 1500), 20000);
  });
}

// Special case handler
function handleSpecialCases(message: string, relationshipStage: RelationshipStage): Partial<AIResponse> | null {
  const msg = message.toLowerCase().trim();

  if (/(bye|see ya|talk later|ttyl)/.test(msg)) {
    return {
      messages: [],
      typingDelays: [],
      shouldShowAsDelivered: true,
      shouldShowAsRead: false,
    };
  }

  if (/i love you/.test(msg)) {
    let responseMessages = [];
    let responseDelays = [];
    if (relationshipStage === 'new_user') {
      responseMessages = ["woah, that's sweet...", "but we just met!", "😳"];
      responseDelays = [2000, 2500, 1500];
    } else if (relationshipStage === 'established') {
      responseMessages = ["Aww, you're making me blush!", "I love you too ❤️"];
      responseDelays = [1800, 2200];
    } else {
      responseMessages = ["...", "i don't know what to say."];
      responseDelays = [3000, 2000];
    }
    return {
      messages: responseMessages,
      typingDelays: responseDelays,
      shouldShowAsDelivered: true,
      shouldShowAsRead: true,
    };
  }

  return null;
}

// MAIN AI RESPONSE FUNCTION
export const generateAIResponse = async (message: string, userId: string = 'default'): Promise<AIResponse> => {
  try {
    await initializeVertexAI();
    if (isCurrentlyBusy(userId)) {
      throw new Error(`AI_BUSY_untIL_${busySchedule.get(userId)!}`);
    }
    
    await logMessageToSupabase(userId, message, 'user');
    
    const sentimentScore = getSentimentScore(message);
    const { stage: relationshipStage, lastInteractionTimestamp } = updateRelationshipState(userId, sentimentScore);
    const timeSinceLastInteraction = Date.now() - lastInteractionTimestamp;
    const { mood, activity, status } = getTimeContext();
    const lifeEvent = getCurrentLifeEvent(new Date());
    const engagementLevel = userEngagementLevel.get(userId) || 0;

    const specialResponse = handleSpecialCases(message, relationshipStage);
    if (specialResponse) {
      return {
        messages: [],
        typingDelays: [],
        shouldShowAsDelivered: true,
        shouldShowAsRead: true,
        ...specialResponse,
      };
    }

    const chatHistory = await getRecentChatHistoryFromSupabase(userId);
    const detectedLanguage = detectLanguage(message);

    const mediaCheck = await shouldShareMedia(userId, message);
    if (mediaCheck.share && mediaCheck.imageUrl) {
        console.log('✅ Sharing media:', mediaCheck.imageUrl);
        const captions = mediaCheck.captionType === 'request' ? dynamicMediaCaptions.request : dynamicMediaCaptions.spontaneous;
        const caption = captions[Math.floor(Math.random() * captions.length)];
        
        const teaseMessages = dynamicMediaCaptions.tease;
        const teaseMessage = teaseMessages[Math.floor(Math.random() * teaseMessages.length)];
        
        const allMessages = [teaseMessage, caption];
        const initialTeaseDelay = calculatePsychologicalDelays([teaseMessage], mood, activity, relationshipStage, lifeEvent, status, timeSinceLastInteraction, engagementLevel)[0];
        const imageSendDelay = initialTeaseDelay + (3000 + Math.random() * 5000);
        const allDelays = [initialTeaseDelay, imageSendDelay];

        await logMessageToSupabase(userId, teaseMessage, 'ai');
        await logMessageToSupabase(userId, `[Sent Image: ${mediaCheck.imageUrl}] ${caption}`, 'ai');

        return {
          messages: allMessages,
          typingDelays: allDelays,
          shouldShowAsDelivered: true,
          shouldShowAsRead: true,
          mediaUrl: mediaCheck.imageUrl,
          mediaCaption: caption,
        };
    }
    
    const behavioralInstruction = getDynamicBehavioralInstruction(relationshipStage, sentimentScore);
    const prompt = createDynamicPersonaPrompt(message, userId, relationshipStage, timeSinceLastInteraction, chatHistory, detectedLanguage, behavioralInstruction);
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });

    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (responseText) {
      let aiResponse = responseText.trim().replace(/^(Kruthika:|Maya:|As Maya,|Response:|Reply:)\s*/i, '').trim();
      let messages = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0 && msg.length < 150);
      
      if (messages.length === 0) messages = ["...", "wht?", "hmm?"];
      
      for (const msg of messages) {
        await logMessageToSupabase(userId, msg, 'ai');
      }
      
      const typingDelays = calculatePsychologicalDelays(messages, mood, activity, relationshipStage, lifeEvent, status, timeSinceLastInteraction, engagementLevel);
      const busyUntil = setBusySchedule(userId, messages);
      
      return {
        messages,
        typingDelays,
        shouldShowAsDelivered: true,
        shouldShowAsRead: Math.random() < 0.9,
        busyUntil,
      };
      
    } else {
      throw new Error('Vertex AI returned empty response');
    }

  } catch (error) {
    console.error('❌ AI generation failed:', error);
    
    if (error.message.startsWith('AI_BUSY_UNTIL_')) {
      const busyUntil = parseInt(error.message.split('_')[3]);
      return { messages: [], typingDelays: [], shouldShowAsDelivered: false, shouldShowAsRead: true, busyUntil };
    }
    
    if (error.message.includes('authentication') || error.message.includes('credentials')) {
      await logMessageToSupabase(userId, "Authentication error occurred", 'ai');
      return { messages: ["hmm, something's wrong with my settings", "give me a sec..."], typingDelays: [2000, 3000], shouldShowAsDelivered: true, shouldShowAsRead: true };
    }
    
    await logMessageToSupabase(userId, "Network/system error occurred", 'ai');
    return { messages: ["ugh my phone is acting up", "try again?"], typingDelays: [1500, 2500], shouldShowAsDelivered: true, shouldShowAsRead: true };
  }
};

// Helper functions for busy status
function isCurrentlyBusy(userId: string): boolean {
  const busyUntil = busySchedule.get(userId);
  if (busyUntil && Date.now() < busyUntil) return true;
  if (busyUntil) busySchedule.delete(userId);
  return false;
}

function setBusySchedule(userId: string, messages: string[]): number | undefined {
  const busyKeywords = ['sone jaa rahi', 'market jaana', 'dinner time', 'college jaana', 'mummy bula rahi', 'study time'];
  const combinedMessage = messages.join(' ').toLowerCase();
  
  for (const keyword of busyKeywords) {
    if (combinedMessage.includes(keyword)) {
      let busyMinutes = (keyword.includes('sone') || keyword.includes('college')) ? 30 : 15;
      const busyUntil = Date.now() + (busyMinutes * 60 * 1000);
      busySchedule.set(userId, busyUntil);
      console.log(`🏃‍♀️ AI busy until: ${new Date(busyUntil).toLocaleTimeString()} (${busyMinutes} min)`);
      return busyUntil;
    }
  }
  return undefined;
}
