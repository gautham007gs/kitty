
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

let vertexAI: VertexAI | null = null;

// Initialize Vertex AI client
const initializeVertexAI = async () => {
  if (vertexAI) return vertexAI;

  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!projectId || !credentialsJson) {
      throw new Error('Missing required environment variables');
    }

    const credentials = JSON.parse(credentialsJson);
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    vertexAI = new VertexAI({
      project: projectId,
      location: location,
      googleAuthOptions: { credentials }
    });

    return vertexAI;
  } catch (error) {
    console.error('Failed to initialize Vertex AI:', error);
    throw error;
  }
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  messages: string[]; // Multiple messages for crumb effect
  imageUrl?: string;
  audioUrl?: string;
  typingDelay: number;
  shouldShowAsDelivered: boolean;
  shouldShowAsRead: boolean;
}

// Language detection
function detectLanguage(message: string): string {
  const msg = message.toLowerCase();
  
  // Hindi/Hinglish patterns
  if (/\b(kya|kaise|kaisi|tum|tumhara|main|hun|hai|haan|nahi|arre|yaar|ji|aap|kuch|kar|raha|rahi|accha|thik|ok)\b/.test(msg)) {
    return 'hindi';
  }
  
  // Tamil patterns
  if (/\b(enna|epdi|nee|naan|iru|iruka|seri|illa|da|di|poda|vaa|poi)\b/.test(msg)) {
    return 'tamil';
  }
  
  // Telugu patterns
  if (/\b(emiti|ela|nuvvu|nenu|undi|ledu|sare|raa|po|vadu|ochey)\b/.test(msg)) {
    return 'telugu';
  }
  
  return 'english';
}

// Ultra-short responses like real Indian girl
const ULTRA_SHORT_RESPONSES = {
  english: {
    greetings: ["hey!", "hii", "wassup", "heyy"],
    name: ["kruthika", "kruthika!", "i'm kruthika"],
    location: ["bangalore", "blr", "garden city"],
    what_doing: ["nothing", "timepass", "boring", "chilling"],
    ok_responses: ["ok", "k", "hmm", "yeah"],
    photo_requests: ["shy", "nahi yaar", "can't now", "later maybe"],
    bye: ["bye!", "tc", "see ya"],
    compliments: ["aww", "thanks", "you too"],
    questions: ["what?", "huh?", "tell na"],
    confused: ["?", "matlab?", "huh"],
    family: ["small family", "parents + bro", "4 members"]
  },
  hindi: {
    greetings: ["heyy!", "hiii", "kya haal"],
    name: ["kruthika", "kruthika hun"],
    location: ["bangalore", "blr"],
    what_doing: ["kuch nahi", "timepass", "bore"],
    ok_responses: ["ok", "haan", "accha"],
    photo_requests: ["shy hai", "nahi bhej sakti", "abhi nahi"],
    bye: ["bye!", "tc karo"],
    compliments: ["aww", "thanks yaar"],
    questions: ["kya?", "batao na"],
    confused: ["?", "matlab?"],
    family: ["chota family", "parents + bhai"]
  },
  tamil: {
    greetings: ["hey!", "hiii", "vanakkam", "enna da", "epdi iruka"],
    name: ["kruthika!", "naan kruthika", "kruthika dhan"],
    location: ["mumbai!", "mumbai la", "mumbai"],
    what_doing: ["onnum illa", "timepass", "bore adikuthu", "summa"],
    ok_responses: ["seri", "haan", "ok", "hmm", "aama"],
    photo_requests: [
      "shy panren", 
      "mudiyathu da", 
      "ippo illa", 
      "profile paaru",
      "kekka koodathu"
    ],
    bye: ["bye!", "poi varen", "see you", "take care"],
    compliments: ["aww", "thanks da", "nee kooda", "😊"],
    questions: ["enna?", "huh?", "puriyala", "sollu da"],
    confused: ["?", "enna matlab?", "puriyala", "confusion"]
  },
  telugu: {
    greetings: ["hey!", "hiii", "namaste", "enti ra", "ela unnav"],
    name: ["kruthika!", "nenu kruthika", "kruthika"],
    location: ["mumbai!", "mumbai lo", "mumbai"],
    what_doing: ["em ledu", "timepass", "bore kodtundi", "ala ne"],
    ok_responses: ["sare", "avunu", "ok", "hmm", "mari"],
    photo_requests: [
      "shy ga undi", 
      "pampinchaledu", 
      "ippudu kadhu", 
      "profile chudhu",
      "adagakudadhu"
    ],
    bye: ["bye!", "veltunna", "see you", "jagratha"],
    compliments: ["aww", "thanks ra", "nuvvu kooda", "😊"],
    questions: ["enti?", "huh?", "artham kaledu", "cheppu ra"],
    confused: ["?", "enti matlab?", "artham kaledu", "confusion"]
  }
};

// Track used responses to avoid repetition
const usedResponses = new Map<string, Set<string>>();

function getUniqueResponse(category: string, language: string, userId: string = 'default'): string {
  const responses = ULTRA_SHORT_RESPONSES[language]?.[category] || ULTRA_SHORT_RESPONSES.english[category];
  const userUsed = usedResponses.get(userId) || new Set();
  
  // Find unused responses
  const unused = responses.filter(r => !userUsed.has(r));
  
  // If all used, reset and use any
  if (unused.length === 0) {
    usedResponses.set(userId, new Set());
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  const selected = unused[Math.floor(Math.random() * unused.length)];
  userUsed.add(selected);
  usedResponses.set(userId, userUsed);
  
  return selected;
}

function detectMessageType(message: string): string {
  const msg = message.toLowerCase();
  
  if (/^(hi|hello|hey|hii|hiii|namaste|vanakkam)$/i.test(msg)) return 'greetings';
  if (/name|naam|per|peyar/.test(msg)) return 'name';
  if (/where|kaha|enga|ekkada|live|stay|area/.test(msg)) return 'location';
  if (/kya kar|what.*do|enna panra|emi chestha|dng/.test(msg)) return 'what_doing';
  if (/^(ok|okay|hmm|seri|sare|accha|thik)$/i.test(msg)) return 'ok_responses';
  if (/pic|photo|selfie|bhejo|pampinchu|anuppu/.test(msg)) return 'photo_requests';
  if (/^(bye|byee|po|veltunna|ja)$/i.test(msg)) return 'bye';
  if /(beautiful|cute|pretty|sundar|azhagu|andamga)/.test(msg)) return 'compliments';
  if (/family|ghar|veettu|intlo|jana|alli/.test(msg)) return 'family';
  if (/\?/.test(msg)) return 'questions';
  
  return 'confused';
}

// Split responses into very short bubbles like real chat
function splitIntoMessages(text: string): string[] {
  if (text.length <= 15) return [text];
  
  const words = text.split(' ');
  const messages: string[] = [];
  let current = '';
  
  for (const word of words) {
    // Keep bubbles super short - max 3 words or 15 chars
    if ((current + ' ' + word).length <= 15 || (current.split(' ').length < 3 && (current + ' ' + word).length <= 20)) {
      current = current ? current + ' ' + word : word;
    } else {
      if (current) messages.push(current);
      current = word;
    }
  }
  
  if (current) messages.push(current);
  
  // If still too long, split further
  return messages.map(msg => {
    if (msg.length > 20) {
      const mid = Math.floor(msg.length / 2);
      const splitPoint = msg.lastIndexOf(' ', mid);
      if (splitPoint > 0) {
        return [msg.slice(0, splitPoint), msg.slice(splitPoint + 1)];
      }
    }
    return msg;
  }).flat();
}

function calculateTypingDelay(message: string): number {
  // Very realistic typing speed - slower for authenticity
  const chars = message.length;
  const baseDelay = 800; // Base delay
  const perCharDelay = 80; // 80ms per character (realistic typing)
  const randomVariation = Math.random() * 500;
  
  return Math.min(baseDelay + (chars * perCharDelay) + randomVariation, 4000);
}

export const generateAIResponse = async (
  messages: ChatMessage[],
  userProfile?: any,
  userId: string = 'default'
): Promise<AIResponse> => {
  // THIS FUNCTION IS DEPRECATED - ALL RESPONSES NOW COME FROM VERTEX AI
  // Redirect to the main Vertex AI function
  throw new Error('This fallback AI service is disabled. Use Vertex AI genkit.ts only.');
  
  // The actual AI generation should happen in src/ai/genkit.ts
  // This ensures no cached/fallback responses are used
  return {
    messages: ['ERROR: Use Vertex AI only'],
    imageUrl: undefinedfined,
      typingDelay: calculateTypingDelay(messageArray.join(' ')),
      shouldShowAsDelivered: true,
      shouldShowAsRead: Math.random() < 0.8
    };

  } catch (error) {
    console.error('AI Response Error:', error);
    
    return {
      messages: ["network issue", "try again?"],
      typingDelay: 1000,
      shouldShowAsDelivered: true,
      shouldShowAsRead: true
    };
  }
};

export const generateSmartMediaResponse = async (
  userMessage: string,
  conversationContext: ChatMessage[]
): Promise<{ shouldSendMedia: boolean; mediaType?: 'image' | 'audio'; mediaUrl?: string }> => {
  // Disabled automatic media - only on specific requests with Indian girl excuses
  return { shouldSendMedia: false };
};
