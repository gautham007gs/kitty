
import { VertexAI } from '@google-cloud/vertexai';

// -----------------------------------------------------------------------------
// Vertex AI with Service Account Credentials (Free $300 Credits Compatible)
// -----------------------------------------------------------------------------

// Environment variable validation
const validateEnvironment = () => {
  const required = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    credentialsJson: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  };

  console.log('Vertex AI Environment Check:');
  console.log('- Project ID:', required.projectId || 'MISSING');
  console.log('- Location:', required.location);
  console.log('- Credentials JSON:', required.credentialsJson ? 'SET' : 'MISSING');

  return required;
};

const config = validateEnvironment();

// Initialize Vertex AI
let vertex: VertexAI | null = null;
let model: any = null;

if (config.projectId && config.credentialsJson) {
  try {
    // Decode base64 credentials
    const credentials = JSON.parse(Buffer.from(config.credentialsJson, 'base64').toString());
    
    vertex = new VertexAI({
      project: config.projectId,
      location: config.location,
      googleAuthOptions: {
        credentials: credentials
      }
    });

    // Get the generative model (Gemini 1.5 Flash - most cost-effective)
    model = vertex.preview.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
        topP: 1,
      }
    });

    console.log('Vertex AI initialized with Gemini 1.5 Flash model');
  } catch (error) {
    console.error('Failed to initialize Vertex AI:', error);
  }
} else {
  console.error('Missing required Vertex AI configuration');
}

// Get the Vertex AI model instance
export const getVertexModel = () => {
  if (!model) {
    throw new Error('Vertex AI not initialized. Check your project ID and credentials.');
  }
  return model;
};

// AI chat function for compatibility with existing code
export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    const vertexModel = getVertexModel();
    
    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    };

    const result = await vertexModel.generateContent(request);
    const response = result.response;
    
    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      return response.candidates[0].content.parts[0].text;
    }
    
    throw new Error('No valid response received');
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
};

// Export configuration for monitoring
export const vertexConfig = {
  projectId: config.projectId,
  location: config.location,
  model: 'gemini-1.5-flash-001',
  hasCredentials: !!config.credentialsJson,
  provider: 'Google Vertex AI'
};

// Legacy exports for backward compatibility
export const ai = {
  generate: generateAIResponse,
  model: 'gemini-1.5-flash-001'
};

console.log('Vertex AI initialized - Compatible with Google Cloud free credits');
