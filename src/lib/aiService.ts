
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

// Super short realistic responses by language
const ULTRA_SHORT_RESPONSES = {
  english: {
    greetings: ["hey!", "hiiii", "heyy babe", "hii", "wassup"],
    name: ["kruthika!", "kruthika", "i'm kruthika", "kruthika here"],
    location: ["mumbai!", "mumbai", "mumbai girl"],
    what_doing: ["nothing", "timepass", "boring", "just chilling", "bored"],
    ok_responses: ["ok", "hmm", "yeah", "right", "k"],
    photo_requests: [
      "shy", 
      "nahi yaar", 
      "not now", 
      "maybe later?",
      "profile dekho na"
    ],
    bye: ["bye!", "byee", "tc", "see ya"],
    compliments: ["aww", "thanks baby", "you too", "😊"],
    questions: ["what?", "huh?", "kya?", "tell na"],
    confused: ["?", "kya bol rahe?", "samjha nahi", "what do you mean?"]
  },
  hindi: {
    greetings: ["heyy!", "hiii", "namaste", "arre yaar", "kya haal"],
    name: ["kruthika!", "main kruthika", "kruthika hun"],
    location: ["mumbai!", "mumbai se", "mumbai"],
    what_doing: ["kuch nahi", "timepass", "bore ho rahi", "bas yun hi"],
    ok_responses: ["accha", "haan", "thik hai", "ok", "hmm"],
    photo_requests: [
      "sharam aati hai", 
      "nahi bhej sakti", 
      "abhi nahi", 
      "profile dekho",
      "shy feel kar rahi"
    ],
    bye: ["bye!", "alvida", "milte hain", "tc karo"],
    compliments: ["aww", "thanks yaar", "tum bhi", "😊"],
    questions: ["kya?", "huh?", "samjha nahi", "batao na"],
    confused: ["?", "kya matlab?", "samjha nahi", "confusion hai"]
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
  if (/where|kaha|enga|ekkada|live|stay/.test(msg)) return 'location';
  if (/kya kar|what.*do|enna panra|emi chestha/.test(msg)) return 'what_doing';
  if (/^(ok|okay|hmm|seri|sare|accha|thik)$/i.test(msg)) return 'ok_responses';
  if (/pic|photo|selfie|bhejo|pampinchu|anuppu/.test(msg)) return 'photo_requests';
  if (/^(bye|byee|po|veltunna|ja)$/i.test(msg)) return 'bye';
  if /(beautiful|cute|pretty|sundar|azhagu|andamga)/.test(msg)) return 'compliments';
  if (/\?/.test(msg)) return 'questions';
  
  return 'confused';
}

// Split longer responses into multiple bubbles
function splitIntoMessages(text: string): string[] {
  if (text.length <= 25) return [text];
  
  const words = text.split(' ');
  const messages: string[] = [];
  let current = '';
  
  for (const word of words) {
    if ((current + ' ' + word).length <= 25) {
      current = current ? current + ' ' + word : word;
    } else {
      if (current) messages.push(current);
      current = word;
    }
  }
  
  if (current) messages.push(current);
  return messages;
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
  try {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const language = detectLanguage(lastMessage);
    const messageType = detectMessageType(lastMessage);
    
    // Get unique response to avoid repetition
    let response = getUniqueResponse(messageType, language, userId);
    
    // For photo requests, add realistic Indian girl behavior
    if (messageType === 'photo_requests') {
      const photoExcuses = {
        hindi: ["sorry nahi bhej sakti", "papa dekh lenge", "shy lagti hai"],
        english: ["can't send now", "parents are here", "feeling shy"],
        tamil: ["sorry anuppa mudiyathu", "appa paarthuduvanga", "shy panren"],
        telugu: ["sorry pampinchaledu", "nanna chustaadu", "shy ga undi"]
      };
      
      const excuses = photoExcuses[language] || photoExcuses.english;
      const excuse = excuses[Math.floor(Math.random() * excuses.length)];
      response = excuse;
    }
    
    // Split response into multiple messages for realistic bubble effect
    const messageArray = splitIntoMessages(response);
    
    return {
      messages: messageArray,
      imageUrl: undefined, // Removed automatic images
      typingDelay: calculateTypingDelay(response),
      shouldShowAsDelivered: true,
      shouldShowAsRead: Math.random() < 0.7 // 70% chance of being read
    };

  } catch (error) {
    console.error('AI Response Error:', error);
    
    // Simple fallback
    return {
      messages: ["network issue hai", "try again?"],
      typingDelay: 1500,
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
