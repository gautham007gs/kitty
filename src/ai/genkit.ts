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

  // Initialize the model with optimized settings
  model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-2.0-flash-lite-001', // Available model
    generationConfig: {
      maxOutputTokens: 150,
      temperature: 0.9,
      topP: 0.9,
      topK: 40,
      candidateCount: 1
    }
  });

  console.log('🚀 Vertex AI initialized successfully!');
  console.log('📱 Model: gemini-2.0-flash-lite-001 (exact version)');

} catch (error) {
  console.error('❌ Failed to initialize Vertex AI:', error);
  throw new Error(`Vertex AI initialization failed: ${error.message}`);
}

// Enhanced AI Response Generation - ALWAYS use Vertex AI, returns breadcrumb messages
export async function generateAIResponse(message: string): Promise<string[]> {
  try {
    if (!model || !vertexAI) {
      console.error('❌ Vertex AI not properly initialized');
      throw new Error('Vertex AI not initialized - cannot generate response');
    }

    console.log('🤖 Generating FRESH response for message:', message.substring(0, 50) + '...');

    // Generate random breadcrumb count (1-4 messages)
    const randomBreadcrumbCount = Math.floor(Math.random() * 4) + 1;
    console.log('🎯 Target breadcrumb count:', randomBreadcrumbCount);

    // Enhanced prompt with conversation history awareness and variety
    const currentTime = new Date().toLocaleString('en-IN');
    const randomMood = ['playful', 'sweet', 'teasing', 'curious', 'flirty', 'caring'][Math.floor(Math.random() * 6)];
    
    const prompt = `You are Kruthika, a real Indian girl (NOT an AI assistant) chatting with your friend.
Current time: ${currentTime}
Current mood: ${randomMood}

PERSONALITY TRAITS:
- You're a young Indian girl with natural slang, emotions, and mood swings
- Match user's language style (English, Hindi, Hinglish, etc.) - they're using: "${message}"
- Be ${randomMood} right now, but stay unpredictable
- Never repeat phrases like "spill the tea", "what's up" etc. Be completely fresh and original
- Show real human psychology: tease, care, joke, get jealous, curious

RESPONSE FORMAT:
- Generate EXACTLY ${randomBreadcrumbCount} separate message bubbles
- Each bubble should be 1-2 sentences max
- Separate each bubble with "|||"
- Example: "Haww really? 😳|||Tell me more na|||I'm so curious now! 🤔"

ENGAGEMENT RULES:
- Keep user hooked with curiosity, questions, emotions
- Use varied expressions: "haww", "arey", "arre yaar", "sachii?", "uff", "haye", "areh"
- Add relevant emojis naturally
- Be conversational like texting a close friend
- Ask questions, make statements, show reactions - mix it up

AVOID REPETITION:
- Never use same phrases from previous messages
- Don't repeat "spill the tea", "what's up", or common phrases
- Each response should feel completely new and spontaneous

CONVERSATION CONTEXT:
User just said: "${message}"

Generate ${randomBreadcrumbCount} fresh message bubbles as Kruthika (use ||| separator):`;

    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    };

    console.log('📤 Sending FRESH request to Vertex AI (no fallbacks)...');
    const result = await model.generateContent(request);
    const response = result.response;

    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      const aiResponse = response.candidates[0].content.parts[0].text.trim();
      console.log('✅ FRESH AI response generated:', aiResponse);
      
      // Split response into breadcrumb messages
      let breadcrumbs = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0);
      
      // Remove any AI-like prefixes that might slip through
      breadcrumbs = breadcrumbs.map(msg => 
        msg.replace(/^(As Kruthika|Kruthika says|Response):\s*/i, '').trim()
      ).filter(msg => msg.length > 0);
      
      console.log('🍞 Final breadcrumbs:', breadcrumbs);
      console.log('🍞 Breadcrumb count:', breadcrumbs.length);
      
      // Ensure we have at least one message
      if (breadcrumbs.length === 0) {
        console.log('⚠️ Fallback to single response');
        return [aiResponse];
      }
      
      // Limit to max 4 breadcrumbs for performance
      if (breadcrumbs.length > 4) {
        breadcrumbs = breadcrumbs.slice(0, 4);
        console.log('✂️ Trimmed to 4 breadcrumbs');
      }
      
      return breadcrumbs;
    } else {
      console.error('❌ No valid response content received from Vertex AI');
      throw new Error('Vertex AI returned empty response');
    }

  } catch (error) {
    console.error('❌ Vertex AI generation failed completely:', error);
    
    // NO FALLBACKS - Force error to show Vertex AI issues
    throw new Error(`Vertex AI must work - Error: ${error.message}`);
  }
}



console.log('🎉 Vertex AI module ready with gemini-2.0-flash-lite-001 (exact version)');