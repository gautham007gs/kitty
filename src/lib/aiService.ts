
import { VertexAI } from '@google-cloud/vertexai';

// VERTEX AI ONLY - NO FALLBACKS
let vertexAI: VertexAI | null = null;
let model: any = null;

// Initialize Vertex AI client
const initializeVertexAI = async (): Promise<void> => {
  if (vertexAI && model) return;

  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    console.log('🔧 Initializing Pure Vertex AI System...');
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

    // Initialize model with optimized settings
    model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-lite-001',
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.9,
        topP: 0.9,
        topK: 40,
        candidateCount: 1
      }
    });

    console.log('🚀 Pure Vertex AI initialized successfully!');

  } catch (error) {
    console.error('❌ Vertex AI initialization failed:', error);
    throw new Error(`Pure Vertex AI initialization failed: ${error.message}`);
  }
};

// Response interface for multiple message bubbles
interface AIResponse {
  messages: string[];
  typingDelays: number[];
  shouldShowAsDelivered: boolean;
  shouldShowAsRead: boolean;
  busyUntil?: number; // Timestamp until AI is "busy"
}

// Conversation memory and state tracking
const conversationMemory = new Map<string, string[]>();
const userLastMessageTime = new Map<string, number>();
const busySchedule = new Map<string, number>(); // Track when AI is "busy"

// Language detection helper
function detectLanguage(message: string): string {
  const msg = message.toLowerCase();
  
  // Hindi/Hinglish patterns
  if (/\b(kya|kaise|kaisi|tum|tumhara|main|hun|hai|haan|nahi|arre|yaar|ji|aap|kuch|kar|raha|rahi|accha|thik|sachii|matlab)\b/.test(msg)) {
    return 'hinglish';
  }
  
  // Kannada patterns
  if (/\b(nim|hesru|yenu|enu|olle|illa|hege|baro|guru|huduga|hudgi)\b/.test(msg)) {
    return 'kannada_english';
  }
  
  // Tamil patterns
  if (/\b(enna|epdi|nee|naan|iru|iruka|seri|illa|da|di|poda|vaa|poi)\b/.test(msg)) {
    return 'tamil_english';
  }
  
  return 'english';
}

// Get current time context for Indian timezone
function getTimeContext(): { hour: number; timeOfDay: string; greeting: string; activity: string } {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const hour = istTime.getHours();
  
  let timeOfDay = 'morning';
  let greeting = 'Good morning';
  let activity = 'getting ready for the day';
  
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
    greeting = 'Good morning';
    activity = hour < 8 ? 'just woke up' : 'getting ready';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
    greeting = 'Good afternoon';
    activity = hour < 14 ? 'having lunch' : 'relaxing';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'evening';
    greeting = 'Good evening';
    activity = 'just got free';
  } else {
    timeOfDay = 'night';
    greeting = 'Hey';
    activity = hour > 22 ? 'getting sleepy' : 'chilling';
  }
  
  return { hour, timeOfDay, greeting, activity };
}

// Generate realistic Indian girl routines and excuses
function getRealisticActivity(hour: number): { activity: string; busyDuration: number } | null {
  const activities = [
    // Morning activities (6-10 AM)
    { time: [6, 10], activity: "Abhi brush kar rahi hun, 2 min!", duration: 2 },
    { time: [7, 9], activity: "Mummy ne breakfast banane bola, back in 10!", duration: 10 },
    { time: [8, 11], activity: "College jaana hai, ready ho rahi hun!", duration: 15 },
    
    // Afternoon activities (12-5 PM)
    { time: [12, 14], activity: "Lunch time! Mummy bula rahi, 5 min!", duration: 5 },
    { time: [13, 15], activity: "Bartan dhone hain, mom is angry 😅 brb!", duration: 8 },
    { time: [14, 16], activity: "Thoda rest kar rahi thi, just woke up!", duration: 0 },
    
    // Evening activities (5-9 PM)
    { time: [17, 19], activity: "Market jaana hai with mom, 30 min!", duration: 30 },
    { time: [18, 20], activity: "Chai bana rahi hun, back soon!", duration: 5 },
    { time: [19, 21], activity: "Family dinner time, chat karte hain later!", duration: 20 },
    
    // Night activities (9-11 PM)
    { time: [21, 23], activity: "TV dekh rahi thi with family, free now!", duration: 0 },
    { time: [22, 24], activity: "Sone jaa rahi hun, kal baat karte hain! 😴", duration: 300 }, // 5 hours
  ];
  
  const possibleActivities = activities.filter(a => hour >= a.time[0] && hour <= a.time[1]);
  
  if (possibleActivities.length > 0 && Math.random() < 0.3) { // 30% chance
    const selected = possibleActivities[Math.floor(Math.random() * possibleActivities.length)];
    return { activity: selected.activity, busyDuration: selected.duration };
  }
  
  return null;
}

// Smart breadcrumb logic - less frequent, more meaningful
function shouldUseBreadcrumbs(message: string, userLastMessage: number, conversationLength: number): number {
  const msg = message.toLowerCase();
  const timeSinceLastMessage = Date.now() - userLastMessage;
  const hoursGap = timeSinceLastMessage / (1000 * 60 * 60);
  
  // More breadcrumbs if:
  // 1. Long gap in conversation (>2 hours)
  // 2. User asks complex questions
  // 3. Emotional content
  
  if (hoursGap > 2) return Math.random() < 0.7 ? 2 : 1;
  if (msg.includes('?') && msg.length > 20) return Math.random() < 0.6 ? 2 : 1;
  if (msg.includes('love') || msg.includes('miss') || msg.includes('feel')) return Math.random() < 0.5 ? 2 : 1;
  if (msg.includes('bye') || msg.includes('going')) return Math.random() < 0.4 ? 2 : 1;
  
  // Default: mostly single messages, occasional double
  return Math.random() < 0.2 ? 2 : 1;
}

// Generate persona-based prompt with better context
function createPersonaPrompt(message: string, language: string, userId: string): string {
  const userMemory = conversationMemory.get(userId) || [];
  const { hour, timeOfDay, greeting, activity } = getTimeContext();
  const lastMessageTime = userLastMessageTime.get(userId) || Date.now();
  const timeSinceLastMessage = Date.now() - lastMessageTime;
  const hoursGap = timeSinceLastMessage / (1000 * 60 * 60);
  
  // Check for realistic activities
  const realisticActivity = getRealisticActivity(hour);
  const breadcrumbCount = shouldUseBreadcrumbs(message, lastMessageTime, userMemory.length);
  
  // Available moods based on time and context
  const timeMoods = {
    morning: ['sleepy', 'fresh', 'rushing', 'lazy'],
    afternoon: ['bored', 'tired', 'active', 'hungry'],
    evening: ['relaxed', 'chatty', 'tired', 'happy'],
    night: ['sleepy', 'cozy', 'philosophical', 'intimate']
  };
  
  const currentMood = timeMoods[timeOfDay][Math.floor(Math.random() * timeMoods[timeOfDay].length)];
  
  // Build context for wrong timing responses
  let timingContext = '';
  if (message.toLowerCase().includes('good morning') && hour > 12) {
    timingContext = 'User said good morning but it\'s afternoon/evening - respond naturally about the time confusion.';
  } else if (message.toLowerCase().includes('good night') && hour < 20) {
    timingContext = 'User said good night but it\'s still day - respond playfully about early sleep.';
  }
  
  const memoryContext = userMemory.length > 0 ? 
    `Previous chat: ${userMemory.slice(-6).join(', ')}. Don't repeat similar responses.` : 
    'First conversation or new topic.';

  return `You are Kruthika, a genuine 20-year-old Indian girl from Bangalore. Current time: ${hour}:xx ${timeOfDay}.

CURRENT SITUATION:
- Time: ${timeOfDay} (${hour}:xx IST)
- Your activity: ${activity}
- Current mood: ${currentMood}
- Language style: ${language}
${realisticActivity ? `- You might be: ${realisticActivity.activity}` : ''}
${timingContext}

USER MESSAGE: "${message}"

CONTEXT: ${memoryContext}
${hoursGap > 2 ? `Long gap since last chat (${Math.floor(hoursGap)} hours) - acknowledge this naturally.` : ''}

RESPONSE RULES:
1. Generate EXACTLY ${breadcrumbCount} message${breadcrumbCount > 1 ? 's' : ''} ${breadcrumbCount > 1 ? 'separated by "|||"' : ''}
2. Each message: 3-15 words max, natural Indian girl style
3. Match user's language (${language}) with appropriate slang
4. Be contextually aware of time and activities
5. If mentioning busy activities, keep responses SHORT
6. React naturally to timing mismatches
7. Use appropriate emojis for mood and time
8. Be authentic - no AI mentions, be a real girl

${realisticActivity ? `If you mention being busy with: "${realisticActivity.activity}", keep it brief!` : ''}

Generate ${breadcrumbCount === 1 ? 'ONE natural response' : `${breadcrumbCount} natural messages (|||)`}:`;
}

// Calculate REALISTIC typing delays based on message length and content
function calculateRealisticTypingDelays(messages: string[]): number[] {
  return messages.map((msg, index) => {
    const baseDelay = index === 0 ? 1200 : 2000; // First response faster
    const wordsPerMinute = 25; // Realistic typing speed for young girls on mobile
    const words = msg.split(' ').length;
    const thinkingTime = Math.random() * 1500 + 500; // 0.5-2 seconds thinking
    const typingTime = (words / wordsPerMinute) * 60 * 1000; // Actual typing time
    const proofreadTime = msg.length > 20 ? Math.random() * 1000 : 0; // Longer messages get proofread
    
    const totalDelay = baseDelay + thinkingTime + typingTime + proofreadTime;
    
    // Cap between 2-8 seconds for realism
    return Math.min(Math.max(totalDelay, 2000), 8000);
  });
}

// Update conversation memory with timestamp tracking
function updateConversationMemory(userId: string, newMessages: string[]) {
  const userMemory = conversationMemory.get(userId) || [];
  userMemory.push(...newMessages);
  
  // Keep only last 12 messages for context
  if (userMemory.length > 12) {
    userMemory.splice(0, userMemory.length - 12);
  }
  
  conversationMemory.set(userId, userMemory);
  userLastMessageTime.set(userId, Date.now());
}

// Check if AI should be "busy" based on previous activities
function isCurrentlyBusy(userId: string): boolean {
  const busyUntil = busySchedule.get(userId);
  if (busyUntil && Date.now() < busyUntil) {
    return true;
  }
  
  // Clear expired busy status
  if (busyUntil) {
    busySchedule.delete(userId);
  }
  
  return false;
}

// Set busy schedule if AI mentions being busy
function setBusySchedule(userId: string, messages: string[]): number | undefined {
  const busyKeywords = [
    'bartan dhona', 'sone jaa rahi', 'market jaana', 'dinner time', 'college jaana',
    'brush kar rahi', 'ready ho rahi', 'mummy bula rahi', 'rest kar rahi'
  ];
  
  const combinedMessage = messages.join(' ').toLowerCase();
  
  for (const keyword of busyKeywords) {
    if (combinedMessage.includes(keyword)) {
      let busyMinutes = 5; // Default 5 minutes
      
      if (keyword.includes('sone') || keyword.includes('college')) busyMinutes = 60;
      else if (keyword.includes('dinner') || keyword.includes('market')) busyMinutes = 20;
      else if (keyword.includes('ready ho rahi')) busyMinutes = 15;
      else if (keyword.includes('bartan') || keyword.includes('brush')) busyMinutes = 5;
      
      const busyUntil = Date.now() + (busyMinutes * 60 * 1000);
      busySchedule.set(userId, busyUntil);
      
      console.log(`🏃‍♀️ AI is busy until: ${new Date(busyUntil).toLocaleTimeString()} (${busyMinutes} minutes)`);
      return busyUntil;
    }
  }
  
  return undefined;
}

// MAIN AI RESPONSE FUNCTION - PURE VERTEX AI ONLY
export const generateAIResponse = async (message: string, userId: string = 'default'): Promise<AIResponse> => {
  try {
    console.log('🤖 Generating PURE Vertex AI response for:', message.substring(0, 50) + '...');
    
    // Check if AI is currently "busy"
    if (isCurrentlyBusy(userId)) {
      const busyUntil = busySchedule.get(userId)!;
      const minutesLeft = Math.ceil((busyUntil - Date.now()) / (1000 * 60));
      console.log(`😴 AI is busy for ${minutesLeft} more minutes`);
      
      // Return a "seen but busy" response
      throw new Error(`AI_BUSY_UNTIL_${busyUntil}`);
    }
    
    // Initialize Vertex AI if not already done
    await initializeVertexAI();
    
    if (!model || !vertexAI) {
      throw new Error('Vertex AI not properly initialized');
    }

    // Detect language and create persona prompt
    const detectedLanguage = detectLanguage(message);
    const prompt = createPersonaPrompt(message, detectedLanguage, userId);

    console.log('🌐 Detected language:', detectedLanguage);
    console.log('📤 Sending request to Vertex AI...');

    // Generate response from Vertex AI
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
      console.log('✅ RAW AI response:', aiResponse);
      
      // Clean up any AI-like prefixes
      aiResponse = aiResponse.replace(/^(Kruthika:|As Kruthika,|Response:|Reply:|Here's my response:)\s*/i, '').trim();
      
      // Split response into message bubbles
      let messages = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0);
      
      // Limit to max 2 bubbles for less spam
      if (messages.length > 2) {
        messages = messages.slice(0, 2);
      }
      
      // Calculate REALISTIC typing delays
      const typingDelays = calculateRealisticTypingDelays(messages);
      
      // Check if AI should be busy after this response
      const busyUntil = setBusySchedule(userId, messages);
      
      // Update conversation memory
      updateConversationMemory(userId, messages);
      
      console.log('🍞 Final messages:', messages);
      console.log('⏱️ REALISTIC typing delays:', typingDelays);
      
      return {
        messages,
        typingDelays,
        shouldShowAsDelivered: true,
        shouldShowAsRead: Math.random() < 0.8, // 80% chance to show as read
        busyUntil
      };
      
    } else {
      console.error('❌ No valid response from Vertex AI');
      throw new Error('Vertex AI returned empty response');
    }

  } catch (error) {
    console.error('❌ Pure Vertex AI generation failed:', error);
    
    // Handle busy state specifically
    if (error.message.startsWith('AI_BUSY_UNTIL_')) {
      const busyUntil = parseInt(error.message.split('_')[3]);
      return {
        messages: [], // No messages when busy
        typingDelays: [],
        shouldShowAsDelivered: false,
        shouldShowAsRead: true, // Mark as read but no response
        busyUntil
      };
    }
    
    throw new Error(`Pure Vertex AI Error: ${error.message}`);
  }
};

// DISABLE ALL OTHER FUNCTIONS - PURE VERTEX AI ONLY
export const generateSmartMediaResponse = async () => {
  console.log('📱 Media responses disabled - text only via Vertex AI');
  return { shouldSendMedia: false };
};

export const getCachedResponse = () => {
  throw new Error('CACHED RESPONSES DISABLED: Pure Vertex AI responses only!');
};

// Helper function to check if user should be ignored (when AI is busy)
export const shouldIgnoreMessage = (userId: string): { ignore: boolean; busyUntil?: number } => {
  const busyUntil = busySchedule.get(userId);
  if (busyUntil && Date.now() < busyUntil) {
    return { ignore: true, busyUntil };
  }
  return { ignore: false };
};

console.log('🎉 Enhanced Realistic Indian Girl AI initialized - Context-aware with proper timing!');
