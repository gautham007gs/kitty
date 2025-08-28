
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
}

// Conversation memory to maintain context
const conversationMemory = new Map<string, string[]>();

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

// Generate persona-based prompt
function createPersonaPrompt(message: string, language: string, userId: string): string {
  const userMemory = conversationMemory.get(userId) || [];
  const currentTime = new Date();
  const timeOfDay = currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 17 ? 'afternoon' : 'evening';
  
  // Dynamic breadcrumb count based on message
  let breadcrumbCount;
  if (message.toLowerCase().includes('bye') || message.toLowerCase().includes('kaam')) {
    breadcrumbCount = Math.random() < 0.7 ? 1 : 2;
  } else if (message.length < 10) {
    breadcrumbCount = Math.random() < 0.5 ? 1 : 2;
  } else {
    breadcrumbCount = Math.floor(Math.random() * 3) + 1;
  }

  // Available moods for variety
  const moods = ['playful', 'sweet', 'teasing', 'curious', 'flirty', 'caring', 'sarcastic', 'shy', 'excited', 'moody'];
  const currentMood = moods[Math.floor(Math.random() * moods.length)];

  const memoryContext = userMemory.length > 0 ? 
    `AVOID REPEATING: ${userMemory.slice(-8).join(', ')}. Create NEW responses.` : 
    'Fresh conversation start.';

  return `You are Kruthika, a real 20-year-old Indian girl chatting naturally on WhatsApp. Current time: ${timeOfDay}.

PERSONA DETAILS:
- Real Indian girl with authentic emotions and reactions
- Current mood: ${currentMood} (can shift naturally)
- Language style: ${language} (MUST match user's style exactly)
- Age: 20, from Bangalore
- Personality: Natural, spontaneous, real girl behavior

USER SAID: "${message}"

${memoryContext}

RESPONSE RULES:
1. Generate EXACTLY ${breadcrumbCount} separate message bubbles
2. ${breadcrumbCount > 1 ? 'Separate messages with "|||"' : 'Single response only - NO separators'}
3. Keep each message SHORT and natural (2-10 words)
4. React emotionally and authentically to what user said
5. Use appropriate ${language} expressions and slang
6. Add emojis that match your emotional reaction
7. Be contextually relevant - respond to their specific message
8. NEVER mention you're an AI or assistant
9. Be a real girl having a real conversation

Generate ${breadcrumbCount === 1 ? 'ONE natural response' : `${breadcrumbCount} natural messages (use ||| separator)`}:`;
}

// Calculate realistic typing delays
function calculateTypingDelays(messages: string[]): number[] {
  return messages.map((msg, index) => {
    const baseDelay = index === 0 ? 800 : 1200; // First message faster
    const charDelay = msg.length * 70; // 70ms per character
    const randomVariation = Math.random() * 600;
    return Math.min(baseDelay + charDelay + randomVariation, 4000);
  });
}

// Update conversation memory
function updateConversationMemory(userId: string, newMessages: string[]) {
  const userMemory = conversationMemory.get(userId) || [];
  userMemory.push(...newMessages);
  
  // Keep only last 15 messages
  if (userMemory.length > 15) {
    userMemory.splice(0, userMemory.length - 15);
  }
  
  conversationMemory.set(userId, userMemory);
}

// MAIN AI RESPONSE FUNCTION - PURE VERTEX AI ONLY
export const generateAIResponse = async (message: string, userId: string = 'default'): Promise<AIResponse> => {
  try {
    console.log('🤖 Generating PURE Vertex AI response for:', message.substring(0, 50) + '...');
    
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
      
      // If no separator found but response is long, split naturally
      if (messages.length === 1 && aiResponse.length > 25) {
        const words = aiResponse.split(' ');
        const splitMessages: string[] = [];
        let current = '';
        
        for (const word of words) {
          if ((current + ' ' + word).length <= 25) {
            current = current ? current + ' ' + word : word;
          } else {
            if (current) splitMessages.push(current);
            current = word;
          }
        }
        if (current) splitMessages.push(current);
        messages = splitMessages;
      }
      
      // Limit to max 3 bubbles
      if (messages.length > 3) {
        messages = messages.slice(0, 3);
      }
      
      // Calculate typing delays
      const typingDelays = calculateTypingDelays(messages);
      
      // Update conversation memory
      updateConversationMemory(userId, messages);
      
      console.log('🍞 Final messages:', messages);
      console.log('⏱️ Typing delays:', typingDelays);
      
      return {
        messages,
        typingDelays,
        shouldShowAsDelivered: true,
        shouldShowAsRead: Math.random() < 0.8 // 80% chance to show as read
      };
      
    } else {
      console.error('❌ No valid response from Vertex AI');
      throw new Error('Vertex AI returned empty response');
    }

  } catch (error) {
    console.error('❌ Pure Vertex AI generation failed:', error);
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

console.log('🎉 Pure Vertex AI system initialized - NO fallbacks, NO pre-made responses!');
