
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
    let credentials;
    
    // Try to parse as base64 first, then as direct JSON
    try {
      // First check if it looks like base64
      if (config.credentialsJson.includes('{') && config.credentialsJson.includes('}')) {
        // Looks like direct JSON
        credentials = JSON.parse(config.credentialsJson);
        console.log('Vertex AI: Successfully parsed direct JSON credentials');
      } else {
        // Try base64 decode
        const decodedCredentials = Buffer.from(config.credentialsJson, 'base64').toString();
        credentials = JSON.parse(decodedCredentials);
        console.log('Vertex AI: Successfully parsed base64 encoded credentials');
      }
    } catch (parseError) {
      console.error('Vertex AI: Failed to parse credentials');
      console.error('Parse error:', parseError.message);
      console.error('Credentials preview:', config.credentialsJson.substring(0, 100) + '...');
      throw new Error('Invalid credentials format - please check your GOOGLE_APPLICATION_CREDENTIALS_JSON');
    }
    
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
    console.error('Please check your GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable');
  }
} else {
  console.error('Missing required Vertex AI configuration');
  console.error('Required: GOOGLE_CLOUD_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS_JSON');
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
