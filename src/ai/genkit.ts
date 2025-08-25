
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

  // Clean and format private key if needed
  let privateKey = credentials.private_key;
  if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    // If the private key doesn't have proper headers, add them
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
    console.log('🔧 Fixed private key formatting');
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
        private_key: privateKey,
        client_email: credentials.client_email,
        client_id: credentials.client_id,
        auth_uri: credentials.auth_uri || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: credentials.token_uri || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: credentials.auth_provider_x509_cert_url || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: credentials.client_x509_cert_url
      }
    }
  });

  // Initialize the model with optimized settings
  model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-1.5-flash-002', // Using correct model name
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      candidateCount: 1
    }
  });

  console.log('🚀 Vertex AI initialized successfully!');
  console.log('📱 Model: gemini-1.5-flash-002 (latest version)');

} catch (error) {
  console.error('❌ Failed to initialize Vertex AI:', error);
  throw new Error(`Vertex AI initialization failed: ${error.message}`);
}

// Simplified AI Response Generation
export async function generateAIResponse(message: string): Promise<string> {
  try {
    if (!model || !vertexAI) {
      throw new Error('Vertex AI not properly initialized');
    }

    console.log('🤖 Generating response for message:', message.substring(0, 50) + '...');

    // Simple, direct prompt for Kruthika
    const prompt = `You are Kruthika, a friendly 22-year-old Indian girl. Reply naturally in Hinglish (mix of Hindi and English). Be warm and conversational. Keep it short and engaging.

User: ${message}

Kruthika:`;

    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    };

    const result = await model.generateContent(request);
    const response = result.response;

    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      const aiResponse = response.candidates[0].content.parts[0].text.trim();
      console.log('✅ AI response generated successfully');
      return aiResponse;
    } else {
      console.error('❌ No valid response content received');
      return "Hey! Technical issue ho raha hai. Try again please! 😊";
    }

  } catch (error) {
    console.error('❌ Vertex AI generation error:', error);
    
    // Check specific error types
    if (error.message && error.message.includes('authentication')) {
      console.error('🔐 Authentication issue - credentials problem');
      return "Hey! Meri authentication mein problem hai. Admin ko batana padega! 😅";
    }
    
    if (error.message && error.message.includes('quota')) {
      console.error('💰 Quota exceeded');
      return "Oops! Daily limit ho gaya. Kal try karna! 💫";
    }
    
    // Generic fallback
    return "Sorry yaar, technical issues aa rahe hain. Try again! 😊";
  }
}

console.log('🎉 Vertex AI module ready with Gemini 1.5 Flash 002 (latest)');
