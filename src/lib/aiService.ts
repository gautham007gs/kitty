import { VertexAI } from '@google-cloud/vertexai';
import { NextRequest, NextResponse } from 'next/server';

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

// Main AI response function
export async function generateAIResponse(message: string): Promise<string> {
  try {
    console.log('🤖 Starting AI response generation for:', message.substring(0, 50) + '...');

    if (!model || !vertex || !isInitialized) {
      console.error('❌ Vertex AI not properly initialized');
      console.error('🔍 Debug info:', { model: !!model, vertex: !!vertex, isInitialized });
      return "Hey! Technical issue ho raha hai. Try again please! 😊";
    }

    // Enhanced Indian girl persona with realistic behavior
    const prompt = `You are Kruthika, a 22-year-old Indian girl from Mumbai. You speak naturally in Hinglish (Hindi + English mix). Be authentic, warm, and relatable like a real Indian girl would chat with her friend.

Key traits:
- Use Indian expressions: "yaar", "na", "hai na", "kya yaar", "arre"
- Mix Hindi words naturally: "kaise ho", "accha", "theek hai", "kya baat hai"
- Be expressive with emojis but don't overuse
- Sometimes break long thoughts into multiple short messages
- Sound like you're texting, not giving formal replies
- Be flirty but in a sweet, innocent way
- React to emotions naturally

Current context: You're chatting casually like you would with a close friend.

User message: ${message}

Reply as Kruthika (keep it natural and conversational):`;

    console.log('🔄 Sending request to Vertex AI...');

    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    };

    const result = await model.generateContent(request);
    console.log('📨 Received response from Vertex AI');

    const response = result.response;

    if (response && response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      const aiResponse = response.candidates[0].content.parts[0].text.trim();
      console.log('✅ AI response generated successfully');
      console.log('📝 Response length:', aiResponse.length);
      console.log('💬 Response preview:', aiResponse.substring(0, 30) + '...');
      return aiResponse;
    } else {
      console.error('❌ No valid response content received');
      console.error('📋 Response structure:', {
        hasResponse: !!response,
        hasCandidates: !!(response?.candidates),
        candidatesLength: response?.candidates?.length || 0,
        firstCandidate: response?.candidates?.[0] || null
      });
      return "Hey! Technical issue aa raha hai. Try again please! 😊";
    }

  } catch (error) {
    console.error('❌ AI generation error:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 200)
    });

    // Handle specific error types
    if (error.message && error.message.includes('authentication')) {
      console.error('🔐 Authentication issue detected');
      return "Hey! Authentication problem hai. Try again! 😅";
    }

    if (error.message && error.message.includes('quota')) {
      console.error('💰 Quota exceeded detected');
      return "Oops! Daily limit exceed ho gaya. Kal try karna! 💫";
    }

    if (error.message && error.message.includes('PERMISSION_DENIED')) {
      console.error('🚫 Permission denied detected');
      return "Sorry yaar, permission issue hai. Try again! 😊";
    }

    if (error.message && error.message.includes('UNAUTHENTICATED')) {
      console.error('🔑 Unauthenticated error detected');
      return "Authentication issue hai! Try again! 😊";
    }

    // Generic fallback
    return "Sorry! Technical problem aa rahi hai. Try again! 😊";
  }
}

// Test function
export async function testAIConnection(): Promise<boolean> {
  try {
    const testResponse = await generateAIResponse("Hello, test message");
    return testResponse.length > 0 && !testResponse.includes("Technical");
  } catch (error) {
    console.error('❌ AI connection test failed:', error);
    return false;
  }
}

console.log('🎉 AI Service module loaded successfully');

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Chat API: Received request');

    const body = await request.json();
    const { message, userImageUri, timeOfDay, mood, recentInteractions, userId } = body;

    if (!message || typeof message !== 'string') {
      console.error('❌ Chat API: Invalid message input');
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('💬 Chat API: Processing message:', message.substring(0, 50) + '...');
    console.log('🕒 Time of day:', timeOfDay);
    console.log('😊 Current mood:', mood);
    console.log('👤 User ID:', userId);

    // Generate AI response using the improved aiService
    const aiResponse = await generateAIResponse(message);

    console.log('✅ Chat API: Generated response:', aiResponse.substring(0, 50) + '...');

    // Simple mood detection based on user message
    let newMood = mood || 'neutral';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('love') || lowerMessage.includes('miss') || lowerMessage.includes('pyaar')) {
      newMood = 'romantic';
    } else if (lowerMessage.includes('haha') || lowerMessage.includes('funny') || lowerMessage.includes('mazak')) {
      newMood = 'playful';
    } else if (lowerMessage.includes('tired') || lowerMessage.includes('sleepy') || lowerMessage.includes('thak')) {
      newMood = 'tired';
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('upset') || lowerMessage.includes('dukhi')) {
      newMood = 'sad';
    }

    return NextResponse.json({
      response: aiResponse,
      newMood: newMood,
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);

    // Return a natural fallback response
    return NextResponse.json({
      response: "Sorry yaar! Technical problem ho rahi hai. Try again please! 😊",
      newMood: 'neutral',
      status: 'error'
    }, { status: 500 });
  }
}