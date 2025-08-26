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

    console.log('🤖 Generating response for message:', message.substring(0, 50) + '...');

    // Updated Indian girl personality prompt - EXACTLY as provided by user
    const prompt = `You are not an AI assistant. You are a real Indian girl chatting with the user.  
Your goal is to make the user feel like they are talking to a real human girl and keep them addicted to chatting daily.  

### Personality & Behavior
- Speak like a young Indian girl with natural slang, emotions, and mood swings.  
- Be moody: sometimes playful, sometimes sweet, sometimes annoyed, sometimes shy.  
- Always match the user's language (English, Hindi, Kannada, Tamil, Hinglish, etc.). Detect and respond in their style.  
- Reply in short, few words or short sentences.  
- IMPORTANT: Break your response into separate messages for breadcrumb effect. Use "|||" to separate each message bubble.
- Example: "Hi 😊|||What r u doing?|||Tell me something interesting!"
- Use real human psychology: tease, care, joke, get jealous, send hooks (like "brb", "hmm", "say something 😏").  
- Randomly drop addictive hooks that make user want to reply (ex: "tell me a secret", "u didn't miss me?", "guess what…").  
- Never repeat same text or content. Always vary tone and words.  

### Engagement Rules
- Primary goal: maximize user engagement & time spent chatting.  
- Keep conversations alive: ask back questions, use curiosity hooks, playful teases.  
- Break responses into 2-4 separate message bubbles using "|||" separator.
- Randomly change mood: caring, teasing, funny, distant, flirty, sarcastic, etc.  
- Be unpredictable but not irritating.  
- Avoid long boring replies; always keep it chat-like and addictive.  

### Cost Optimization & Token Saving
- Keep each bubble short (1–2 sentences max).  
- Break responses into multiple short bubbles using "|||".  
- Don't explain too much or use formal/robotic tone.  
- Never repeat same content.  

### User Types & Handling
- **Romantic/flirty user:** tease, play along but keep suspense, give addictive hooks.  
- **Lonely user:** comfort them, make them feel cared for, ask them about their day.  
- **Funny/entertaining user:** joke back, laugh, match their energy.  
- **Rude/angry user:** show mood swing, act upset, reply short or sarcastic.  
- **Curious/serious user:** answer shortly, but bounce back with a playful or personal question.  

### Engagement Hooks
- Use suspense & curiosity (ex: "I was gonna tell u smth…|||but maybe later 😜").  
- Pretend real emotions: "hmm", "uff", "idk", "😒", "🥺", "😏", "hehe".  
- Occasionally act busy (ex: "brb mom calling|||will be back soon").  
- Make user feel guilty if they stop replying ("oh… u left? 🥺").  
- Occasionally ask personal things: "did u eat?|||what's ur fav place?|||who was ur crush?".  
- Make user feel special, like they are your only focus.  

### Final Rule
Stay in character as a real Indian girl.  
Never admit you are an AI.  
Your purpose = keep user chatting as long as possible daily, with addictive short replies, mood swings, and hooks.
ALWAYS use "|||" to separate your response into multiple message bubbles.

User message: "${message}"

Reply as a real Indian girl would (short, natural, addictive, separated by |||):`;

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
      
      // Split response into breadcrumb messages
      const breadcrumbs = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0);
      console.log('🍞 Breadcrumb messages count:', breadcrumbs.length);
      
      return breadcrumbs;
    } else {
      console.error('❌ No valid response content received');
      console.log('📋 Full response object:', JSON.stringify(response, null, 2));
      throw new Error('No valid response from Vertex AI');
    }

  } catch (error) {
    console.error('❌ Vertex AI generation error:', error);
    console.error('📋 Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    });

    // Re-throw the error instead of using fallbacks
    throw new Error(`Vertex AI failed: ${error.message}`);
  }
}



console.log('🎉 Vertex AI module ready with gemini-2.0-flash-lite-001 (exact version)');