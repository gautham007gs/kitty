import { VertexAI } from '@google-cloud/vertexai';
import { chatCache } from './chatCache';
import { userPersonalization } from './userPersonalization';

// Environment validation with detailed logging
const config = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  location: process.env.VERTEX_AI_LOCATION || 'us-central1',
  credentialsJson: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
};

console.log('🔧 AI Service Environment Check:');
console.log('- Project ID:', config.projectId || 'MISSING');
console.log('- Location:', config.location);
console.log('- Credentials length:', config.credentialsJson ? config.credentialsJson.length : 'MISSING');

if (!config.projectId || !config.credentialsJson) {
  console.error('❌ Missing required environment variables');
  throw new Error('Missing GOOGLE_CLOUD_PROJECT_ID or GOOGLE_APPLICATION_CREDENTIALS_JSON');
}

// Initialize Vertex AI
let vertex: VertexAI | null = null;
let model: any = null;
let isInitialized = false;

try {
  // Parse credentials
  const credentials = JSON.parse(config.credentialsJson);
  console.log('✅ Credentials parsed successfully');
  console.log('📧 Service account:', credentials.client_email);
  console.log('🆔 Project from creds:', credentials.project_id);

  // Initialize Vertex AI with explicit credentials
  vertex = new VertexAI({
    project: credentials.project_id,
    location: config.location,
    googleAuthOptions: {
      credentials: {
        type: 'service_account',
        project_id: credentials.project_id,
        private_key_id: credentials.private_key_id,
        private_key: credentials.private_key,
        client_email: credentials.client_email,
        client_id: credentials.client_id,
        auth_uri: credentials.auth_uri,
        token_uri: credentials.token_uri,
        auth_provider_x509_cert_url: credentials.auth_provider_x509_cert_url,
        client_x509_cert_url: credentials.client_x509_cert_url,
        universe_domain: credentials.universe_domain
      }
    }
  });

  // Initialize model with optimized settings
  model = vertex.preview.getGenerativeModel({
    model: 'gemini-2.0-flash-lite', // Latest Gemini 2.0 model
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      candidateCount: 1
    }
  });

  isInitialized = true;
  console.log('🚀 Vertex AI initialized successfully!');
  console.log('📱 Model: gemini-2.0-flash-lite (latest)');

} catch (error) {
  console.error('❌ Failed to initialize Vertex AI:', error);
  throw new Error(`Vertex AI initialization failed: ${error.message}`);
}

// Multi-language fallback responses
const MULTILINGUAL_FALLBACKS = {
  hindi: [
    "Hey! Technical issues ho rahe hain! 😅 Give me a sec!",
    "Sorry yaar! Server mein problem hai! 🥺 Try again?",
    "Oops! Network ka chakkar hai! 😊 One moment please!",
    "Technical problem ho rahi hai! 😔 But I'm here for you!"
  ],
  english: [
    "Hey! Having some technical issues! 😅 One sec!",
    "Sorry babe! Server problems! 🥺 Try again?",
    "Oops! Network issues! 😊 Give me a moment!",
    "Technical problems! 😔 But I'm always here for you!"
  ],
  tamil: [
    "Hey! Technical problem da! 😅 Wait pannu!",
    "Sorry yaar! Server issue! 🥺 Try again pannu?",
    "Oops! Network problem! 😊 Konjam wait!",
    "Technical issue irukku! 😔 But naan inga thaan!"
  ],
  telugu: [
    "Hey! Technical problem undi! 😅 Wait cheyyi!",
    "Sorry yaar! Server issue undi! 🥺 Try again cheyyi?",
    "Oops! Network problem! 😊 Koddiga wait!",
    "Technical issue undi! 😔 But nenu ikkade unna!"
  ]
};

// Language detection for appropriate fallbacks
function detectLanguage(message: string): string {
  const msg = message.toLowerCase();

  if (/\b(kya|kaisa|kaisi|kaise|haal|hai|tum|tumhara|mera|achha|bura|namaste|yaar|bhai|didi|ji|haan|nahi|mat|kar|raha|rahi|hoon|hun|main|tera|teri|mere|sabse|bahut)\b/.test(msg)) {
    return 'hindi';
  }
  if (/\b(enna|eppo|eppadi|nalla|irukka|irukku|vanakkam|da|di|nee|naan|unna|romba|chala|vera|level|cute|love|miss|vaa|poidalam|seri|okay)\b/.test(msg)) {
    return 'tamil';
  }
  if (/\b(ela|enti|unnavu|unnara|bagundi|bagunnava|namaste|nuvvu|nenu|nee|naa|chala|cute|love|miss|raa|veldam|sare|okay)\b/.test(msg)) {
    return 'telugu';
  }

  return 'english';
}

// Split response into realistic message bubbles
function createRealisticBubbles(response: string, language: string): string[] {
  // If response is short (under 50 chars), send as single bubble
  if (response.length <= 50) {
    return [response];
  }

  // Split by natural conversation breaks
  const sentences = response.split(/[.!?]+/).filter(s => s.trim());
  const bubbles: string[] = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // If sentence is very long, split it further
    if (trimmed.length > 100) {
      const phrases = trimmed.split(/[,;:]+|(?=\s(?:but|and|or|so|because|since|while|although|however|therefore|moreover))/i);
      for (const phrase of phrases) {
        const cleanPhrase = phrase.trim();
        if (cleanPhrase && cleanPhrase.length > 10) {
          bubbles.push(cleanPhrase + (phrase.includes('?') ? '?' : ''));
        }
      }
    } else {
      // Add appropriate punctuation based on context
      let finalSentence = trimmed;
      if (!finalSentence.match(/[.!?]$/)) {
        if (finalSentence.includes('?') || finalSentence.toLowerCase().startsWith('kya') || 
            finalSentence.toLowerCase().startsWith('what') || finalSentence.toLowerCase().startsWith('how')) {
          finalSentence += '?';
        } else {
          finalSentence += '!';
        }
      }
      bubbles.push(finalSentence);
    }
  }

  // Add realistic connectors between bubbles
  const connectors = {
    hindi: ['Aur haan...', 'Btw...', 'Waise...', 'Ek baat aur...'],
    english: ['Also...', 'By the way...', 'Oh and...', 'Plus...'],
    tamil: ['Aama...', 'Oru vishayam...', 'Adhuvum...', 'Plus...'],
    telugu: ['Mariyu...', 'Oka vishayam...', 'Kuda...', 'Plus...']
  };

  // Sometimes add connectors between bubbles (20% chance)
  if (bubbles.length > 1 && Math.random() < 0.2) {
    const langConnectors = connectors[language] || connectors.english;
    const randomConnector = langConnectors[Math.floor(Math.random() * langConnectors.length)];
    bubbles.splice(1, 0, randomConnector);
  }

  return bubbles.slice(0, 4); // Max 4 bubbles to avoid spam
}

// Calculate realistic typing delay based on message length and language
function calculateTypingDelay(message: string, isFirst: boolean = false): number {
  const baseDelay = isFirst ? 500 : 800; // First message comes quicker
  const charDelay = 40; // 40ms per character (realistic typing speed)
  const readingDelay = 300; // Time to "read" previous message

  const typingTime = message.length * charDelay;
  const randomDelay = Math.random() * 1000; // Add some randomness

  return Math.min(baseDelay + typingTime + readingDelay + randomDelay, 4000); // Max 4 seconds
}

// Main AI response function
export async function generateAIResponse(message: string, userId?: string): Promise<string | string[]> {
  try {
    console.log('🤖 AI Service: Processing message:', message.substring(0, 50) + '...');

    const detectedLang = detectLanguage(message);

    // Enhanced cache key with language context
    const cacheKey = `${message.toLowerCase().trim()}|${detectedLang}`;
    const cachedResponse = chatCache.get(cacheKey);

    if (cachedResponse) {
      console.log('⚡ Cache hit - returning cached response');
      if (userId) userPersonalization.trackTokenUsage(userId, 5);

      // Return cached response (could be string or array)
      return cachedResponse.response || cachedResponse;
    }

    // Create contextual prompt for more natural responses
    const contextPrompt = `You are Kruthika, a 22-year-old Indian girl. Respond naturally in ${detectedLang === 'hindi' ? 'Hindi-English mix' : detectedLang} to: "${message}". Be friendly, use emojis, keep responses conversational and authentic. Maximum 150 characters total.`;

    const response = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: contextPrompt }]
      }]
    });

    if (!response || !response.response || !response.response.candidates || response.response.candidates.length === 0 || !response.response.candidates[0].content || !response.response.candidates[0].content.parts || response.response.candidates[0].content.parts.length === 0 || !response.response.candidates[0].content.parts[0].text) {
      throw new Error('Empty or invalid response from AI service');
    }
    
    const aiResponseText = response.response.candidates[0].content.parts[0].text.trim();

    // Create realistic message bubbles
    const bubbles = createRealisticBubbles(aiResponseText, detectedLang);

    // Cache both single and multi-bubble responses
    const finalResponse = bubbles.length === 1 ? bubbles[0] : bubbles;
    chatCache.set(cacheKey, { response: finalResponse, language: detectedLang });

    // Track token usage
    if (userId) {
      const estimatedTokens = Math.ceil((contextPrompt.length + aiResponseText.length) / 3);
      userPersonalization.trackTokenUsage(userId, estimatedTokens);

      // Update user language preference
      userPersonalization.updateUserProfile(userId, message, aiResponseText);
    }

    console.log(`✅ AI Service: Generated ${bubbles.length} bubble response(s)`);
    return finalResponse;

  } catch (error) {
    console.error('❌ AI Service Error:', error);

    // Return language-appropriate fallback
    const detectedLang = detectLanguage(message);
    const fallbacks = MULTILINGUAL_FALLBACKS[detectedLang] || MULTILINGUAL_FALLBACKS.english;
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

    return randomFallback;
  }
}

// Export typing delay calculation for use in components
export { calculateTypingDelay };

console.log('🎉 AI Service module loaded successfully');