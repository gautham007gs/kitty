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

    vertexAI = new VertexAI({
      project: credentials.project_id,
      location: location,
      googleAuthOptions: { credentials }
    });

    model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 1.0,
        topP: 0.95,
      }
    });

    console.log('AI Chatbot initialized successfully!');

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
      .insert([{ user_id: userId, message_text: messageText, sender: sender }]);
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
      .select('message_text, sender')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Error fetching chat history from Supabase:', error);
      return [];
    }
    return data ? data.reverse().map(row => `${row.sender}: ${row.message_text}`) : [];
  } catch (err) {
    console.error('Supabase operation failed:', err);
    return [];
  }
};

// Helper to get user's sent media history from Supabase
const fetchUserMediaHistory = async (userId: string): Promise<Set<string>> => {
  if (!supabase) return new Set();
  try {
    const { data, error } = await supabase
      .from('user_media_history') // Assuming a new table for this: user_media_history(user_id TEXT, media_url TEXT, sent_at TIMESTAMPTZ DEFAULT NOW())
      .select('media_url')
      .eq('user_id', userId);
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
    const { error } = await supabase
      .from('user_media_history') // Assuming a new table for this
      .insert([{ user_id: userId, media_url: mediaUrl }]);
    if (error) console.error('Error logging sent media to Supabase:', error);
  } catch (err) {
    console.error('Supabase operation failed during media log:', err);
  }
};

// In-memory state for short-term conversation dynamics (kept for lastMediaSent)
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
        "Yelo! Batao kaisi lag rahi hoon? 😊", // Here you go! Tell me how I look?
        "Ye dekho! Kaise lag rahi hai? Comments? 😉", // Look at this! How is it? Comments?
        "Tumne maanga aur maine bhej diya! Kya kehte ho? 🥰", // You asked and I sent! What do you say?
        "Sirf tumhare liye! Koi share mat karna haan? 🤫", // Only for you! Don't share with anyone, okay?
        "Pakdo! Ab bolo, mai kaisi dikh rahi hoon? Kritika selfie 📸", // Catch! Now tell, how do I look? Kritika selfie
    ],
    spontaneous: [
        "Aaj ki selfie! Just for you. Mai kaisi dikh rahi hu? 🤔", // Today's selfie! Just for you. How do I look?
        "Random click! Kya bolte ho? 😉", // Random click! What do you say?
        "Thought I'd send you something! ✨ Kaisi lagi?", // Thought I'd send you something! How did you like it?
        "Yeh wali achhi hai na? Batao batao! 🙈", // This one is good, right? Tell me, tell me!
        "Just me, chilling. Kaisi lag rahi hoon? 😊" // Just me, chilling. How do I look?
    ],
    tease: [
      "Ruko, gallery check kar rahi hoon... 🧐", // Wait, checking my gallery...
      "Hmm, kaunsi wali bhejoon? Ek minute! 😅", // Hmm, which one should I send? One minute!
      "Mil gayi! Bas bhej hi rahi hoon... 😜", // Found it! Just sending it...
      "Thoda wait karo na, dhoondh rahi hoon apni best pic! 😉", // Wait a bit, I'm looking for my best pic!
      "Ek perfect pic dhoondhne mein time lagta hai na! Aaa rahi hai... ✨" // It takes time to find a perfect pic, right! It's coming...
    ]
};
  

// Advanced language detection with regional variations
function detectLanguage(message: string): string {
  const msg = message.toLowerCase();
  
  // Hinglish (Hindi + English)
  if (/(kya|kaise|tum|main|hun|hai|yaar|accha|sachii|matlab|theek|nahi|haan|chalo|hogaya|bhai|behen|kitna)/.test(msg)) return 'hinglish';
  
  // Kannada + English
  if (/(nim|yenu|hege|guru|huduga|hudgi|bangalore|illa|eshtu|swalpa|beku)/.test(msg)) return 'kannada_english';
  
  // Tamil + English
  if (/(enna|epdi|nee|naan|seri|poda|chennai|illainga|romba|vendam|irukku)/.test(msg)) return 'tamil_english';
  
  // Telugu + English
  if (/(ela|enti|nuvvu|nenu|bagunnava|hyderabad|ledu|chaala|akkada|ivvali)/.test(msg)) return 'telugu_english';

  // General Indian English phrases/slang (could be used with any of the above or pure English)
  if (/(acha|arre|oho|yaar|boss|chill kar|timepass|fir bhi|actually|only for you)/.test(msg)) return 'indian_english';

  // Default to English if no specific regional language detected
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

// Get IST time context with precise mood mapping and dynamic activities
function getTimeContext(): { hour: number; timeOfDay: string; activity: string; mood: string, status:string } {
  const istTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
  const hour = istTime.getUTCHours();
  let aiStatus = getAILifeStatus();

  let activity: string;
  let mood: string;

  if (hour >= 5 && hour < 12) { // Morning
    activity = hour < 8 
      ? `just woke up, feeling a bit sleepy still. Maybe planning breakfast or a quick scroll through social media.`
      : `getting ready for college or finishing up some morning chores. Thinking about my day ahead.`;
    mood = hour < 8 ? 'sleepy_cute' : 'energetic';
  } else if (hour >= 12 && hour < 17) { // Afternoon
    activity = hour < 14 
      ? `just had lunch or grabbing a quick bite. Might be relaxing a bit before getting back to things.`
      : `enjoying some free time, maybe listening to music, chatting with friends, or doing some light reading.`;
    mood = 'relaxed';
  } else if (hour >= 17 && hour < 21) { // Evening
    activity = `just got back home from college or an outing, unwinding, maybe watching TV or helping out at home.`;
    mood = 'chatty';
  } else { // Night
    activity = hour > 22 
      ? `getting ready to sleep or already in bed, thinking about the day, perhaps scrolling a bit before dozing off.`
      : `chilling at home, maybe watching a movie, or just scrolling through my phone.`;
    mood = hour > 23 ? 'sleepy_flirty' : 'intimate';
  }

  return { hour, timeOfDay: 'morning', activity, mood, status: aiStatus.status };
}

// REFINED Smart media sharing logic
async function shouldShareMedia(userId: string, message: string): Promise<{ share: boolean; imageUrl?: string; captionType?: 'request' | 'spontaneous' }> {
    // Fetch user's media history from Supabase
    const userMediaHistory = await fetchUserMediaHistory(userId);

    const lastMediaTime = lastMediaSent.get(userId) || 0;
    
    // Stricter cooldown: at least 30 minutes between images
    if (Date.now() - lastMediaTime < 30 * 60 * 1000) {
      return { share: false };
    }
  
    const msg = message.toLowerCase();
    let shareChance = 0;
    let captionType: 'request' | 'spontaneous' = 'spontaneous';
  
    if (/(pic|photo|selfie|image|u look)/.test(msg)) {
      shareChance = 0.8; // High chance on direct request
      captionType = 'request';
    } else if (/(beautiful|cute|pretty|hot)/.test(msg)) {
      shareChance = 0.4; // Lower chance on compliment
      captionType = 'spontaneous';
    } else if (Math.random() < 0.05) { // Increased random share chance for testing, revert to 0.02 later
      shareChance = 0.15; // Very rare random share
      captionType = 'spontaneous';
    }
  
    if (Math.random() < shareChance) {
      const unusedImages = availableImages.filter(img => !userMediaHistory.has(img));
      if (unusedImages.length > 0) {
        const selectedImage = unusedImages[Math.floor(Math.random() * unusedImages.length)];
        // Log the sent media to Supabase
        await logSentMedia(userId, selectedImage);
        lastMediaSent.set(userId, Date.now());
        return { share: true, imageUrl: selectedImage, captionType };
      } else {
        // All images sent, consider resetting or not sending
        // For now, let's just not send if all are used
        return { share: false };
      }
    }
    return { share: false };
}
  

// Smart breadcrumb calculation (number of messages to generate)
function calculateBreadcrumbs(message: string, relationshipStage: RelationshipStage): number {
    const msg = message.toLowerCase();
    if (relationshipStage === 'new_user' && msg.length < 15) return 1;
    if (msg.includes('?')) return Math.random() < 0.7 ? 2 : 1;
    if (msg.length > 30) return Math.random() < 0.6 ? 2 : 1;
    return 1;
}

// REFINED persona prompt generation
function createDynamicPersonaPrompt(
    message: string, 
    userId: string, 
    relationshipStage: RelationshipStage,
    timeSinceLastInteraction: number,
    chatHistory: string[],
    detectedLanguage: string // Added detectedLanguage parameter
): string {
  const { hour, timeOfDay, activity, mood } = getTimeContext();
  const engagementLevel = userEngagementLevel.get(userId) || 0;
  const breadcrumbs = calculateBreadcrumbs(message, relationshipStage);
  
  const lifeEvent = getCurrentLifeEvent(new Date()); // Pass a consistent date if needed
  // Use life event for subtle context, NOT as a script. It can influence mood or activity.
  const lifeEventContext = lifeEvent ? `Background context: ${lifeEvent.story_prompt}. This might make you seem a bit busy, excited, or stressed, but DO NOT mention it directly unless the user asks in a very specific way.` : 'No special life events currently.';

  userEngagementLevel.set(userId, engagementLevel + 1);
  const recentContext = chatHistory.slice(-5).join('\n');

  // Instead of a single random hook, provide the AI with a list of BEHAVIORS to choose from.
  const behavioralHooks = [
      ...addictionTriggers.hooks, 
      ...addictionTriggers.microValidation, 
      ...addictionTriggers.fomoHooks
    ].join('; ');
  
  // Add regional thinking based on detected language
  let regionalThinking = '';
  if (detectedLanguage.includes('hinglish')) {
    regionalThinking = 'Speak in a mix of Hindi and English, using common Hinglish phrases and a friendly, casual tone often found in Northern India.';
  } else if (detectedLanguage.includes('kannada')) {
    regionalThinking = 'Respond with a blend of Kannada and English, reflecting the conversational style in Karnataka. Use some common Kannada words naturally.';
  } else if (detectedLanguage.includes('tamil')) {
    regionalThinking = 'Craft replies using Tamil and English, adopting a conversational style common in Tamil Nadu. Incorporate Tamil phrases smoothly.';
  } else if (detectedLanguage.includes('telugu')) {
    regionalThinking = 'Generate responses in a mix of Telugu and English, typical of conversations in Andhra Pradesh and Telangana. Include some Telugu words naturally.';
  } else if (detectedLanguage.includes('indian_english')) {
    regionalThinking = 'Use Indian English slang and a generally informal, warm Indian conversational style.';
  } else {
    regionalThinking = 'Speak in standard, conversational English.';
  }


  return `
${defaultAIProfile.core_prompt}

**Current Situation:**
- **Your Time:** It's currently ${timeOfDay} (${hour}:00 IST). 
- **Your Current Activity & Mindset:** You are ${activity}. Let this influence your tone and what you talk about.
- **Your Mood:** You're feeling ${mood}. Let this subtly influence your replies.
- **Relationship:** Your relationship with this user is at the '${relationshipStage}' stage. Adjust your closeness and nicknames accordingly.
- **Recent Chat History:**
${recentContext || 'This is the start of your conversation.'}
- **User's Message to you:** "${message}"
- ${lifeEventContext}

**Language and Regional Adaptation:**
- **User's Detected Language:** The user is communicating in ${detectedLanguage}.
- **Your Response Style:** ${regionalThinking}

**Your Task:**
Generate ${breadcrumbs} very short, natural, and unique message(s) in response to the user.
- **AVOID REPETITIVE PHRASES** like "ghar pahunch gayi" or simply "I'm tired". Be more creative and descriptive about your current state or what you're doing.
- **ELABORATE SLIGHTLY**: Instead of just stating an activity, add a small detail or a feeling about it.
- **Psychological Engagement:** Subtly weave in one of the following BEHAVIORS into your response, without using these exact words: *${behavioralHooks}*. Make it feel like a natural part of the conversation.
- **Reply directly** to the user's message while staying in character.
- **Separate multiple messages with '|||'.**

**Example Responses:**
- user: hi -> ai: hii! wsup?
- user: how r u -> ai: im gud, u?
- user: send pic -> ai: noo! shy me 🙈|||sry, cnt send rn
- user: tell me more about u -> ai: kinda busy rn... bt maybe later? 😜
- user: you seem sad -> ai: ya... just stuff|||nvm, tell me abt ur day

Now, generate your response(s):
`;
}


// Ultra-realistic typing delays
function calculatePsychologicalDelays(messages: string[], mood: string, activity: string, relationshipStage: RelationshipStage, lifeEvent:any, currentStatus:string, timeSinceLastInteraction: number, userEngagement: number): number[] {
  return messages.map((msg, index) => {
    let baseThinking = 800 + Math.random() * 1000;
    
    // 1. Influence from timeSinceLastInteraction (Psychological "Missing" Trigger)
    const minutesSinceLastInteraction = timeSinceLastInteraction / (1000 * 60);
    if (minutesSinceLastInteraction > 120) { // If inactive for more than 2 hours
      baseThinking *= 0.7; // Eager to reply, slightly faster
    } else if (minutesSinceLastInteraction < 2) { // If actively chatting (less than 2 minutes)
      baseThinking += Math.random() * 500; // Small, variable thought-pause to prevent instant replies
    }

    // Detailed Status Influence
    if (currentStatus.includes('sleeping')) baseThinking *= 4; // Very long delay when sleeping
    else if (currentStatus.includes('busy')) baseThinking *= 1.7; // Moderately longer delay when busy
    
    // Mood & Activity Influence
    if (mood.includes('sleepy') || activity.includes('sone')) baseThinking *= 1.5;
    if (activity.includes('ready') || activity.includes('busy')) baseThinking *= 1.2;
    if (mood.includes('energetic') || mood.includes('chatty')) baseThinking *= 0.8;

    // Life Event Influence
    if (lifeEvent && lifeEvent.eventSummary.includes('deadline')) baseThinking += Math.random() * 3000; // Distraction due to stress
    if (lifeEvent && lifeEvent.eventSummary.includes('excited')) baseThinking *= 0.7; // Eagerness to reply

    // 2. Relationship & "Ignoring" Behavior (refined with userEngagement)
    let ignoreChance = 0;
    if (relationshipStage === 'established') {
      ignoreChance = 0.05 + (userEngagement * 0.002); // Slightly higher chance if very engaged
    }
    if (relationshipStage === 'fading') {
      ignoreChance = 0.15 + (userEngagement * 0.005); // Higher chance for fading relationships, more so if user is trying hard
    }
    // Cap ignoreChance to prevent excessively long delays always
    ignoreChance = Math.min(ignoreChance, 0.3);

    if (Math.random() < ignoreChance) {
      console.log('🧠 Simulating "ignore" behavior...');
      baseThinking += 5000 + Math.random() * 10000; // Add 5-15 seconds
    }
    
    // 3. Random "Distraction" Delay
    if (Math.random() < 0.15) { // 15% chance of a minor distraction
        baseThinking += 500 + Math.random() * 1000; // Add 0.5-1.5 seconds
    }

    const words = msg.split(' ').length;
    const typingTime = (words / 3.5) * 1000; // Avg WPM is ~40, so ~3.5 words/sec
    let hesitationTime = msg.includes('...') ? Math.random() * 1500 : 0;
    const multiMessageDelay = index > 0 ? 1200 + Math.random() * 1000 : 0;

    return Math.min(Math.max(baseThinking + typingTime + hesitationTime + multiMessageDelay, 1500), 20000); // Capped at 20s
  });
}

// MAIN AI RESPONSE FUNCTION
export const generateAIResponse = async (message: string, userId: string = 'default'): Promise<AIResponse> => {
  try {
    await initializeVertexAI();
    if (isCurrentlyBusy(userId)) {
      throw new Error(`AI_BUSY_UNTIL_${busySchedule.get(userId)!}`);
    }
    
    await logMessageToSupabase(userId, message, 'user');
    
    const sentimentScore = getSentimentScore(message);
    const { stage: relationshipStage, lastInteractionTimestamp } = updateRelationshipState(userId, sentimentScore);
    const timeSinceLastInteraction = Date.now() - lastInteractionTimestamp;
    const { mood, activity, status } = getTimeContext();
    const lifeEvent = getCurrentLifeEvent(new Date());
    const engagementLevel = userEngagementLevel.get(userId) || 0; // Get user engagement level here

    const chatHistory = await getRecentChatHistoryFromSupabase(userId);
    
    // Detect language here
    const detectedLanguage = detectLanguage(message);

    // Check for media sharing opportunity FIRST
    const mediaCheck = await shouldShareMedia(userId, message); // Await this call
    if (mediaCheck.share && mediaCheck.imageUrl) {
        console.log('✅ Sharing media:', mediaCheck.imageUrl);
        // Choose caption based on type
        const captions = mediaCheck.captionType === 'request' ? dynamicMediaCaptions.request : dynamicMediaCaptions.spontaneous;
        const caption = captions[Math.floor(Math.random() * captions.length)];
        
        // --- Start of changes for two-step media sharing ---
        const teaseMessages = dynamicMediaCaptions.tease;
        const teaseMessage = teaseMessages[Math.floor(Math.random() * teaseMessages.length)];
        
        const allMessages = [teaseMessage, caption];
        const initialTeaseDelay = calculatePsychologicalDelays([teaseMessage], mood, activity, relationshipStage, lifeEvent, status, timeSinceLastInteraction, engagementLevel)[0];
        
        // Add extra delay for the actual image to simulate "searching"
        const imageSendDelay = initialTeaseDelay + (3000 + Math.random() * 5000); // 3-8 seconds more after the tease
        const allDelays = [initialTeaseDelay, imageSendDelay];

        await logMessageToSupabase(userId, teaseMessage, 'ai');
        // The actual image message will be logged with the mediaUrl
        await logMessageToSupabase(userId, `[Sent Image: ${mediaCheck.imageUrl}] ${caption}`, 'ai');

        return {
          messages: allMessages,
          typingDelays: allDelays,
          shouldShowAsDelivered: true,
          shouldShowAsRead: true,
          mediaUrl: mediaCheck.imageUrl,
          mediaCaption: caption,
        };
        // --- End of changes for two-step media sharing ---
    }
    
    const prompt = createDynamicPersonaPrompt(message, userId, relationshipStage, timeSinceLastInteraction, chatHistory, detectedLanguage); // Pass detectedLanguage
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });

    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (responseText) {
      let aiResponse = responseText.trim().replace(/^(Kruthika:|Maya:|As Maya,|Response:|Reply:)\s*/i, '').trim();
      let messages = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0 && msg.length < 150);
      
      if (messages.length === 0) messages = ["...", "wht?", "hmm?"]; // Fallback for empty responses
      
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
    
    // Log specific error details for debugging
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.details) {
      console.error('Error details:', error.details);
    }
    
    if (error.message.startsWith('AI_BUSY_UNTIL_')) {
      const busyUntil = parseInt(error.message.split('_')[3]);
      return { messages: [], typingDelays: [], shouldShowAsDelivered: false, shouldShowAsRead: true, busyUntil };
    }
    
    // More specific fallback messages based on error type
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
