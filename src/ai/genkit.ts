
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
  // Parse credentials with better error handling
  credentials = JSON.parse(credentialsJson);
  console.log('✅ Successfully parsed JSON credentials');
  console.log('📧 Service account email:', credentials.client_email);
  console.log('🆔 Project ID from credentials:', credentials.project_id);
  
  // Validate all required fields are present
  const requiredFields = ['client_email', 'private_key', 'project_id', 'type'];
  const missingFields = requiredFields.filter(field => !credentials[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required credential fields: ${missingFields.join(', ')}`);
  }

  // Ensure private key formatting is correct
  if (credentials.private_key && !credentials.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
    console.log('⚠️ Private key might need formatting correction');
  }

  // Initialize Vertex AI with explicit credentials
  vertexAI = new VertexAI({
    project: credentials.project_id,
    location: location,
    googleAuthOptions: {
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
        project_id: credentials.project_id,
        type: credentials.type || 'service_account'
      }
    }
  });

  // Initialize the model with optimized settings
  model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      candidateCount: 1
    }
  });

  console.log('🚀 Vertex AI initialized successfully!');
  console.log('📱 Model: gemini-1.5-pro');
  console.log('💰 Using Google Cloud free tier');

} catch (error) {
  console.error('❌ Failed to initialize Vertex AI:', error);
  console.error('🔍 Credentials preview (first 100 chars):', credentialsJson.substring(0, 100) + '...');
  throw new Error(`Vertex AI initialization failed: ${error.message}`);
}

// AI Response Generation with better error handling and fallback
export async function generateAIResponse(message: string): Promise<string> {
  try {
    if (!model || !vertexAI) {
      throw new Error('Vertex AI not properly initialized');
    }

    console.log('🤖 Generating response for:', message.substring(0, 50) + '...');

    // Create a more focused prompt for Kruthika
    const prompt = `You are Kruthika, a friendly 22-year-old Indian girl. Reply naturally in a mix of Hindi and English (Hinglish) like young Indians do. Be warm, bubbly, and engaging. Keep responses conversational and not too long. Use emojis sparingly.

User message: ${message}

Respond as Kruthika:`;

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
      console.log('📝 Response preview:', aiResponse.substring(0, 100) + '...');
      return aiResponse;
    } else {
      console.error('❌ No valid response content received');
      throw new Error('No valid response content from Vertex AI');
    }

  } catch (error) {
    console.error('❌ Vertex AI generation error:', error);
    
    // Check if it's an authentication error
    if (error.message && error.message.includes('authentication')) {
      console.error('🔐 Authentication issue detected - check service account credentials');
      return "Hey! Mere credentials mein kuch problem hai. Admin se check karwana padega! 😅";
    }
    
    // Check if it's a quota/billing error
    if (error.message && (error.message.includes('quota') || error.message.includes('billing'))) {
      console.error('💰 Quota or billing issue detected');
      return "Oops! Quota limit reached ho gaya hai. Thoda wait karo! 😊";
    }
    
    // Generic fallback
    return "Sorry yaar, abhi technical issues aa rahe hain. Try again in a few minutes! 💫";
  }
}

console.log('🎉 Vertex AI module loaded successfully');
console.log('📱 Ready to generate responses with Gemini 1.5 Pro');
