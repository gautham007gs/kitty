import { VertexAI } from '@google-cloud/vertexai';

// Environment variable validation
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

console.log('Direct Vertex AI Environment Check:');
console.log('- Project ID:', projectId || 'MISSING');
console.log('- Location:', location);
console.log('- Credentials JSON:', credentialsJson ? 'SET' : 'MISSING');

if (!projectId || !credentialsJson) {
  throw new Error('Missing required Vertex AI configuration');
}

let credentials;
try {
  credentials = JSON.parse(credentialsJson);
  console.log('✅ Direct Vertex AI: Successfully parsed JSON credentials');
} catch (error) {
  throw new Error('Invalid credentials JSON format');
}

// Initialize Vertex AI directly
const vertexAI = new VertexAI({
  project: credentials.project_id,
  location: location,
  googleAuthOptions: {
    credentials: credentials
  }
});

const model = vertexAI.preview.getGenerativeModel({
  model: 'gemini-1.5-flash-001',
  generationConfig: {
    maxOutputTokens: 1024,
    temperature: 0.7,
    topP: 0.8,
    topK: 40
  }
});

console.log('🚀 Direct Vertex AI initialized with Gemini 1.5 Flash model');
console.log('💰 Using Google Cloud $300 free credits');

// AI Response Generation
export async function generateAIResponse(message: string): Promise<string> {
  try {
    console.log('🤖 Generating response with Direct Vertex AI for message:', message.substring(0, 50) + '...');

    const prompt = `You are Kruthika, a friendly 22-year-old Indian girl who loves chatting. You speak in a natural mix of Hindi and English like young Indians do (Hinglish). You're warm, friendly, engaging, and have a bubbly personality. Use emojis occasionally but don't overdo it. Keep responses conversational and not too long.

User message: ${message}

Respond as Kruthika in a natural, friendly way:`;

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
      console.log('✅ Direct Vertex AI response generated successfully');
      console.log('📝 Response preview:', aiResponse.substring(0, 100) + '...');
      return aiResponse;
    }

    throw new Error('No valid response received from Direct Vertex AI');
  } catch (error) {
    console.error('❌ Direct Vertex AI error:', error);
    throw error; // Don't return fallback here, let the calling code handle it
  }
}

console.log('🎉 Direct Vertex AI initialized - Compatible with Google Cloud free credits');
console.log('📱 Using cheapest model: gemini-1.5-flash-001');