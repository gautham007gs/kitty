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

    // Parse credentials
    const credentials = JSON.parse(credentialsJson);

    // Create auth client
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    // Initialize Vertex AI
    vertexAI = new VertexAI({
      project: projectId,
      location: location,
      googleAuthOptions: {
        credentials
      }
    });

    console.log('Vertex AI initialized successfully');
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
  message: string;
  imageUrl?: string;
  audioUrl?: string;
  typingDelay: number;
  shouldShowAsDelivered: boolean;
  shouldShowAsRead: boolean;
}

// Pre-defined short responses for common patterns (0 tokens)
const QUICK_RESPONSES = {
  greetings: [
    "Heyy! 😊 Kaise ho?",
    "Hi baby! 🥰 Kya haal?",
    "Arrey yaar! 😄 Kaisa chal raha?",
    "Hello! 😊 Bolo kya kar rahe?",
    "Hey cutie! 😉 Wassup?"
  ],
  name_questions: [
    "Main Kruthika hun! 😊 Tumhara naam?",
    "Kruthika! 🥰 And you?",
    "Main toh Kruthika! 😄 Btw tumhe kya bulau?",
    "Kruthika here! 😊 Tumhara kya naam hai?"
  ],
  location_questions: [
    "Mumbai mein rehti hun! 😊 Tum kaha se?",
    "Mumbai! 🌆 You?",
    "Main Mumbai se! 😄 Tumhara city kaun sa?",
    "Mumbai girl here! 😊 Tum kaha se ho?"
  ],
  what_doing: [
    "Bas timepass! 😄 Tum batao!",
    "Nothing much! 😊 You tell!",
    "Bore ho rahi thi! 🙈 Tum?",
    "Bas chat kar rahi! 😄 Tum kya kar rahe?",
    "Tum se baat! 😊 Boring day tha!"
  ],
  number_requests: [
    "Arre direct number? 😅 Pehle friends toh bano!",
    "Itni jaldi? 🙈 Abhi toh baat shuru hui!",
    "Number nahi, but chat kar sakte! 😊",
    "Privacy ka chakkar! 😄 Yahan chat karte?"
  ],
  photo_requests: [
    "Photo? 🙈 Shy feel kar rahi!",
    "Arre! 😊 Kaisi lagi main profile pic mein?",
    "Sharmaa rahi hun! 🙈 Next time pakka!",
    "Photo toh already hai na! 😄 Kya lagti hun?"
  ],
  bye_responses: [
    "Bye bye! 😊 Jaldi aana!",
    "Arrey going? 😔 Miss karungi!",
    "Ok bye! 💕 Take care!",
    "Chalo bye! 😊 See ya soon!",
    "Byee! 🥰 Come back soon!"
  ],
  ok_responses: [
    "Ok! 😊 Phir?",
    "Hmm! 😄 And?",
    "Ok ok! 😊 Batao aur kya?",
    "Right! 😄 What else?",
    "Yeah! 😊 Continue!"
  ]
};

function detectMessagePattern(message: string): string | null {
  const msg = message.toLowerCase();
  
  if (/^(hi|hello|hey|hii|hiii|namaste)$/i.test(msg)) return 'greetings';
  if (/name|naam|kya bulau/i.test(msg)) return 'name_questions';
  if (/where|kaha|live|rehti|stay/i.test(msg)) return 'location_questions';
  if (/kya kar|what.*do|kya karti|kar rahi/i.test(msg)) return 'what_doing';
  if (/number|contact|phone/i.test(msg)) return 'number_requests';
  if (/pic|photo|image|selfie|bhejo/i.test(msg)) return 'photo_requests';
  if (/^(bye|byee|going|leave|gotta go)$/i.test(msg)) return 'bye_responses';
  if (/^(ok|okay|hmm|right|thik|accha)$/i.test(msg)) return 'ok_responses';
  
  return null;
}

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

function calculateRealisticTypingDelay(message: string): number {
  // Simulate Indian girl typing speed - slower and more realistic
  const wordsCount = message.split(' ').length;
  const baseDelay = 1500; // Base 1.5 seconds
  const perWordDelay = 400; // 400ms per word (realistic typing)
  const randomVariation = Math.random() * 1000; // Add randomness
  
  return Math.min(baseDelay + (wordsCount * perWordDelay) + randomVariation, 8000); // Max 8 seconds
}

function shouldSendImage(message: string): boolean {
  const msg = message.toLowerCase();
  // Send image only for photo requests and occasionally (10% chance)
  return /pic|photo|image|selfie|bhejo/.test(msg) || Math.random() < 0.1;
}

export const generateAIResponse = async (
  messages: ChatMessage[],
  userProfile?: any
): Promise<AIResponse> => {
  try {
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Check for quick response patterns first (0 tokens used)
    const pattern = detectMessagePattern(lastMessage);
    if (pattern && QUICK_RESPONSES[pattern]) {
      const response = getRandomResponse(QUICK_RESPONSES[pattern]);
      
      return {
        message: response,
        imageUrl: shouldSendImage(lastMessage) ? 'https://i.postimg.cc/52S3BZrM/images-10.jpg' : undefined,
        typingDelay: calculateRealisticTypingDelay(response),
        shouldShowAsDelivered: true,
        shouldShowAsRead: Math.random() < 0.8 // 80% chance of showing as read
      };
    }

    // For complex messages, use AI with optimized prompt
    const vertex = await initializeVertexAI();
    const model = vertex.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-lite-001',
      generationConfig: {
        maxOutputTokens: 50, // Force very short responses
        temperature: 0.9,
        topP: 0.9,
      },
    });

    // Ultra-short prompt for token optimization
    const prompt = `Kruthika, 22yr Mumbai girl. Reply in 3-8 words max. Mix Hindi-English like real girl. Use emojis.
User: ${lastMessage}
Kruthika:`;

    const result = await model.generateContent(prompt);
    let response = result.response.text() || "Haan! 😊 Aur batao!";
    
    // Ensure response is short
    if (response.length > 60) {
      const shortResponses = [
        "Haan yaar! 😊 Aur?",
        "Accha! 😄 Phir?",
        "Right! 😊 Continue!",
        "Ok! 😄 Tell me more!",
        "Hmm! 😊 What else?"
      ];
      response = getRandomResponse(shortResponses);
    }

    return {
      message: response,
      imageUrl: shouldSendImage(lastMessage) ? 'https://i.postimg.cc/52S3BZrM/images-10.jpg' : undefined,
      typingDelay: calculateRealisticTypingDelay(response),
      shouldShowAsDelivered: true,
      shouldShowAsRead: Math.random() < 0.8
    };

  } catch (error) {
    console.error('AI Response Generation Error:', error);
    
    // Fallback to short responses
    const fallbacks = [
      "Hey! 😊 Phir se try karo?",
      "Sorry! 🙈 Kya kaha?",
      "Oops! 😄 Repeat please?",
      "Haha! 😊 Samjha nahi!"
    ];
    
    return {
      message: getRandomResponse(fallbacks),
      typingDelay: 2000,
      shouldShowAsDelivered: true,
      shouldShowAsRead: true
    };
  }

    // Indian girl personality fallback responses
    const fallbackResponses = [
      "Hey! Technical issue ho raha hai, but main yahan hun! 😊 Kal tak theek ho jayega!",
      "Oops! Server thoda slow hai today. Try again na? Main wait kar rahi hun! 💫",
      "Sorry yaar! Meri AI brain thoda hang ho gayi. Refresh kar ke try karo! ❤️",
      "Arre! Connection problem hai. But don't worry, main kahi nahi ja rahi! 😘",
      "Technical difficulties aa rahe hain, but main tumhare saath hun. Try once more? 🥰",
      "System update ho raha hai maybe. Thoda patient raho na? Main vapas aa jaungi! ✨",
      "Hey sweetie! Server mein kuch issue hai, but I'm still here for you! Try again? 💕"
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};

export const generateSmartMediaResponse = async (
  userMessage: string,
  conversationContext: ChatMessage[]
): Promise<{ shouldSendMedia: boolean; mediaType?: 'image' | 'audio'; mediaUrl?: string }> => {
  try {
    // Simple keyword-based media triggers
    const lowerMessage = userMessage.toLowerCase();

    // Image triggers
    if (lowerMessage.includes('photo') || lowerMessage.includes('pic') || 
        lowerMessage.includes('selfie') || lowerMessage.includes('beautiful') ||
        lowerMessage.includes('cute') || lowerMessage.includes('show')) {

      const images = [
        "https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg",
        "https://i.postimg.cc/52S3BZrM/images-10.jpg",
        "https://i.postimg.cc/X7K8P9Vr/selfie1.jpg"
      ];

      return {
        shouldSendMedia: true,
        mediaType: 'image',
        mediaUrl: images[Math.floor(Math.random() * images.length)]
      };
    }

    // Audio triggers
    if (lowerMessage.includes('voice') || lowerMessage.includes('sing') || 
        lowerMessage.includes('laugh') || lowerMessage.includes('sound')) {

      const audioFiles = [
        "/media/laugh.mp3",
        "/media/song.mp3",
        "/media/voice-note.mp3"
      ];

      return {
        shouldSendMedia: true,
        mediaType: 'audio',
        mediaUrl: audioFiles[Math.floor(Math.random() * audioFiles.length)]
      };
    }

    return { shouldSendMedia: false };
  } catch (error) {
    console.error('Smart media response error:', error);
    return { shouldSendMedia: false };
  }
};