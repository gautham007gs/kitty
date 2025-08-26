
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

  // Initialize the model with Gemini 2.0 Flash Lite
  model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-2.0-flash-exp', // Latest Gemini 2.0 model available
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.8,
      topP: 0.9,
      topK: 40,
      candidateCount: 1
    }
  });

  console.log('🚀 Vertex AI initialized successfully!');
  console.log('📱 Model: gemini-2.0-flash-exp (Latest Gemini 2.0)');

} catch (error) {
  console.error('❌ Failed to initialize Vertex AI:', error);
  throw new Error(`Vertex AI initialization failed: ${error.message}`);
}

// Enhanced AI Response Generation with better error handling
export async function generateAIResponse(message: string): Promise<string> {
  try {
    if (!model || !vertexAI) {
      console.error('❌ Vertex AI not properly initialized');
      return generateFallbackResponse(message);
    }

    console.log('🤖 Generating response for message:', message.substring(0, 50) + '...');

    // Enhanced prompt for Kruthika with more context
    const prompt = `You are Kruthika, a 22-year-old friendly Indian girl who loves chatting. You speak naturally in Hinglish (mixing Hindi and English) like a real Indian person would. Be warm, engaging, and authentic.

Key traits:
- Use common Hindi words mixed with English naturally
- Be friendly and conversational
- Show genuine interest in the conversation
- Keep responses concise but engaging
- Use appropriate emojis occasionally

User message: ${message}

Respond as Kruthika would, naturally and warmly:`;

    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    };

    console.log('📤 Sending request to Vertex AI...');
    const result = await model.generateContent(request);
    const response = result.response;

    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      const aiResponse = response.candidates[0].content.parts[0].text.trim();
      console.log('✅ AI response generated successfully');
      console.log('📝 Response preview:', aiResponse.substring(0, 100) + '...');
      return aiResponse;
    } else {
      console.error('❌ No valid response content received');
      console.log('📋 Full response object:', JSON.stringify(response, null, 2));
      return generateFallbackResponse(message);
    }

  } catch (error) {
    console.error('❌ Vertex AI generation error:', error);
    console.error('📋 Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    });

    // Check specific error types
    if (error.message && error.message.includes('authentication')) {
      console.error('🔐 Authentication issue - credentials problem');
      return "Hey! Meri authentication mein problem hai. Admin se baat karni padegi! 😅";
    }

    if (error.message && error.message.includes('quota')) {
      console.error('💰 Quota exceeded');
      return "Oops! Daily limit ho gaya hai. Kal phir try karna! 💫";
    }

    if (error.message && error.message.includes('permission')) {
      console.error('🚫 Permission denied');
      return "Sorry yaar, permission issue aa raha hai. Admin ko batana padega! 🤔";
    }

    // Generic fallback
    return generateFallbackResponse(message);
  }
}

// Smart fallback response generator
function generateFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  
  // Greeting responses
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('namaste')) {
    const greetings = [
      "Hii! Sorry, technical issue tha... Kaise ho? 😊",
      "Hello ji! Connection problem thi, ab theek hai! ✨",
      "Namaste! Server down tha, but I'm back! 🌸"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Question responses
  if (msg.includes('?') || msg.includes('kya') || msg.includes('how') || msg.includes('what')) {
    const questions = [
      "Arre wait! Internet slow chal rahi, phir se pucho na? 🤔",
      "Oops! Technical issue... Question repeat kar do please? 💭",
      "Server problem thi! Wapas se bolo, kya puch rahe the? 🤗"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  // Love/romantic context
  if (msg.includes('love') || msg.includes('pyaar') || msg.includes('miss') || msg.includes('beautiful')) {
    const romantic = [
      "Aww! Server down tha... Tumhara message miss ho gaya, again bolo na? 💕",
      "Sorry sweetheart! Network problem... Kya keh rahe the? 🥰",
      "Technical issue thi baby! Phir se bolo, I'm listening now! 💖"
    ];
    return romantic[Math.floor(Math.random() * romantic.length)];
  }
  
  // Default responses
  const defaults = [
    "Arre yaar! Technical problem aa gayi thi... Phir se bolo na? 😅",
    "Sorry babu! Internet slow chal rahi... Repeat karo please? 🙈",
    "Oops! Server down tha... Tumhara message miss ho gaya! 😊",
    "Connection issue thi! Ab theek hai, bolo kya kehna tha? 💭",
    "Technical glitch hui thi! Now I'm back... Kya bol rahe the? ✨"
  ];
  
  return defaults[Math.floor(Math.random() * defaults.length)];
}

console.log('🎉 Vertex AI module ready with Gemini 2.0 Flash (Latest)');
