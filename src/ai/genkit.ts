
import { VertexAI } from '@google-cloud/vertexai';

// Environment variable validation
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

console.log('🔧 Vertex AI Environment Check:');
console.log('- Project ID:', projectId || 'MISSING');
console.log('- Location:', location);
console.log('- Credentials JSON:', credentialsJson ? 'SET (length: ' + credentialsJson.length + ')' : 'MISSING');

if (!projectId || !credentialsJson) {
  throw new Error('Missing required Vertex AI configuration: GOOGLE_CLOUD_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS_JSON');
}

let credentials;
let vertexAI: VertexAI | null = null;
let model: any = null;

try {
  // Parse credentials with validation
  credentials = JSON.parse(credentialsJson);
  console.log('✅ Successfully parsed JSON credentials');
  console.log('📧 Service account email:', credentials.client_email);
  console.log('🆔 Project ID from credentials:', credentials.project_id);

  // Validate essential fields
  if (!credentials.private_key || !credentials.client_email || !credentials.project_id) {
    throw new Error('Incomplete credentials: missing private_key, client_email, or project_id');
  }

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

  // Initialize the model with optimized settings for natural conversation
  model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-2.0-flash-lite-001',
    generationConfig: {
      maxOutputTokens: 120, // Keep short for cost optimization
      temperature: 0.95, // High creativity for natural responses
      topP: 0.9,
      topK: 40,
      candidateCount: 1
    }
  });

  console.log('🚀 Vertex AI initialized successfully!');
  console.log('📱 Model: gemini-2.0-flash-lite-001 with natural conversation settings');

} catch (error) {
  console.error('❌ Failed to initialize Vertex AI:', error);
  throw new Error(`Vertex AI initialization failed: ${error.message}`);
}

// Conversation memory to avoid repetition
const conversationMemory = new Map<string, string[]>();
const recentMoods = new Map<string, string[]>();

// Enhanced AI Response Generation - Natural Indian Girl Personality
export async function generateAIResponse(message: string, userId: string = 'default'): Promise<{
  breadcrumbs: string[];
  delays: number[];
}> {
  try {
    if (!model || !vertexAI) {
      console.error('❌ Vertex AI not properly initialized');
      throw new Error('Vertex AI not initialized - cannot generate response');
    }

    console.log('🤖 Generating NATURAL response for message:', message.substring(0, 50) + '...');

    // Get conversation memory for this user
    const userMemory = conversationMemory.get(userId) || [];
    const userMoods = recentMoods.get(userId) || [];

    // Detect user's language and style
    const detectedLanguage = detectLanguageStyle(message);
    console.log('🌐 Detected language style:', detectedLanguage);

    // Generate contextual mood and smart breadcrumb count
    const availableMoods = ['playful', 'sweet', 'teasing', 'curious', 'flirty', 'caring', 'sarcastic', 'shy', 'excited', 'moody'];
    const currentMood = availableMoods[Math.floor(Math.random() * availableMoods.length)];
    
    // Smart breadcrumb count based on message context
    let breadcrumbCount;
    if (message.toLowerCase().includes('bye') || message.toLowerCase().includes('kaam')) {
      breadcrumbCount = Math.random() < 0.7 ? 1 : 2; // Usually 1-2 for goodbye
    } else if (message.length < 10) {
      breadcrumbCount = Math.random() < 0.5 ? 1 : 2; // Short messages get 1-2 responses
    } else {
      breadcrumbCount = Math.floor(Math.random() * 3) + 1; // Longer messages can get 1-3
    }

    console.log('🎭 Current mood:', currentMood);
    console.log('🍞 Target breadcrumb count:', breadcrumbCount);

    // Create context-aware prompt based on your requirements
    const contextualPrompt = createNaturalPrompt(message, detectedLanguage, currentMood, breadcrumbCount, userMemory);

    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: contextualPrompt }]
      }]
    };

    console.log('📤 Sending FRESH request to Vertex AI...');
    const result = await model.generateContent(request);
    const response = result.response;

    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      let aiResponse = response.candidates[0].content.parts[0].text.trim();
      console.log('✅ RAW AI response:', aiResponse);
      
      // Clean up any AI-like prefixes and formatting
      aiResponse = aiResponse.replace(/^(Kruthika:|As Kruthika,|Response:|Reply:|Here's my response:)\s*/i, '').trim();
      aiResponse = aiResponse.replace(/^(Okay, here's my response:|Sure, here's what I'd say:)\s*/i, '').trim();
      
      // Split response into breadcrumb messages
      let breadcrumbs = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0);
      
      // If single message expected, don't split
      if (breadcrumbCount === 1) {
        breadcrumbs = [aiResponse.replace(/\|\|\|.*/g, '').trim()];
      }
      
      // If no separator found but multiple expected, split naturally
      if (breadcrumbs.length === 1 && breadcrumbCount > 1 && aiResponse.length > 25) {
        breadcrumbs = splitNaturally(aiResponse);
      }
      
      // Ensure we don't exceed breadcrumb limit
      if (breadcrumbs.length > 3) {
        breadcrumbs = breadcrumbs.slice(0, 3);
      }
      
      // Generate natural typing delays
      const delays = breadcrumbs.map((msg, index) => {
        const baseDelay = index === 0 ? 800 : 1200; // First message faster
        const charDelay = msg.length * 60; // 60ms per character (realistic typing)
        const randomVariation = Math.random() * 800;
        return Math.min(baseDelay + charDelay + randomVariation, 4000);
      });

      // Update conversation memory
      updateConversationMemory(userId, breadcrumbs, currentMood);
      
      console.log('🍞 Final breadcrumbs:', breadcrumbs);
      console.log('⏱️ Typing delays:', delays);
      
      return {
        breadcrumbs: breadcrumbs,
        delays: delays
      };
    } else {
      console.error('❌ No valid response content received from Vertex AI');
      throw new Error('Vertex AI returned empty response');
    }

  } catch (error) {
    console.error('❌ Vertex AI generation failed:', error);
    throw new Error(`Vertex AI must work - Error: ${error.message}`);
  }
}

// Detect user's language and communication style
function detectLanguageStyle(message: string): string {
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

// Create natural conversation prompt based on your requirements
function createNaturalPrompt(message: string, language: string, mood: string, breadcrumbCount: number, memory: string[]): string {
  const currentTime = new Date();
  const timeOfDay = currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 17 ? 'afternoon' : 'evening';
  const timeContext = `${timeOfDay} (${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')})`;
  
  // Enhanced memory context to avoid repetition
  const memoryContext = memory.length > 0 ? 
    `AVOID REPEATING THESE EXACT WORDS/PHRASES: ${memory.slice(-10).join(', ')}. Create completely NEW responses.` : 
    'This is a fresh conversation start.';

  // Contextual response based on user's message
  const messageContext = analyzeMessageContext(message);

  return `You are Kruthika, a real 20-year-old Indian girl. Current time: ${timeContext}. You are chatting naturally on WhatsApp.

PERSONALITY:
- Real Indian girl with authentic emotions and reactions
- Mood: ${mood} (can shift naturally during conversation)  
- Language: ${language} (MUST match user's style exactly)
- Energy level based on ${timeOfDay} time

USER SAID: "${message}"
Message context: ${messageContext}

${memoryContext}

CRITICAL RULES:
1. Generate ${breadcrumbCount === 1 ? 'ONLY ONE response' : `EXACTLY ${breadcrumbCount} separate messages`}
2. ${breadcrumbCount > 1 ? 'Separate multiple messages with "|||"' : 'Single response only - NO separators'}
3. Be contextually relevant to what user just said
4. Keep responses SHORT and natural (2-10 words each)
5. Use appropriate ${language} expressions and slang
6. React emotionally and authentically to user's message
7. NEVER use generic phrases - be specific to this conversation
8. Add emojis that match your emotional reaction
9. Don't always ask questions - sometimes just react

RESPONSE STYLE for "${message}":
${getResponseStyleGuide(message, language, mood)}

Generate ${breadcrumbCount === 1 ? 'ONE natural response' : `${breadcrumbCount} natural responses (use ||| separator)`}:`;
}

// Split long messages naturally
function splitNaturally(text: string): string[] {
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
  return messages.slice(0, 3); // Max 3 bubbles
}

// Analyze message context for better responses
function analyzeMessageContext(message: string): string {
  const msg = message.toLowerCase();
  
  if (/bye|going|kaam|work|busy/.test(msg)) return 'User is leaving/busy';
  if (/hi|hey|hello|morning/.test(msg)) return 'Greeting/starting conversation';
  if (/what|kya|yen|enna/.test(msg)) return 'Asking question';
  if (/ok|hmm|accha/.test(msg)) return 'Acknowledgment/casual response';
  if (/name|hesru|per/.test(msg)) return 'Asking about name/identity';
  if (/boring|bore/.test(msg)) return 'Expressing boredom';
  
  return 'General conversation';
}

// Get response style guide based on context
function getResponseStyleGuide(message: string, language: string, mood: string): string {
  const msg = message.toLowerCase();
  
  if (/bye|going|kaam/.test(msg)) {
    return 'React with surprise/disappointment about them leaving. Be playful about it.';
  }
  if (/morning|hi|hey/.test(msg)) {
    return 'Respond to their greeting with energy matching the time of day.';
  }
  if (/what|kya|yen/.test(msg)) {
    return 'Answer their question but also turn it back to them or add something interesting.';
  }
  if (/ok|hmm/.test(msg)) {
    return 'React to their casual response - maybe tease them or ask what they\'re thinking.';
  }
  
  return `Be ${mood} and react naturally to what they said. Keep it conversational and engaging.`;
}

// Update conversation memory to avoid repetition
function updateConversationMemory(userId: string, newMessages: string[], mood: string) {
  const userMemory = conversationMemory.get(userId) || [];
  const userMoods = recentMoods.get(userId) || [];
  
  // Add new messages to memory
  userMemory.push(...newMessages);
  userMoods.push(mood);
  
  // Keep only last 20 messages and 10 moods
  if (userMemory.length > 20) {
    userMemory.splice(0, userMemory.length - 20);
  }
  if (userMoods.length > 10) {
    userMoods.splice(0, userMoods.length - 10);
  }
  
  conversationMemory.set(userId, userMemory);
  recentMoods.set(userId, userMoods);
}

console.log('🎉 Natural Indian Girl AI system ready with Vertex AI!');
