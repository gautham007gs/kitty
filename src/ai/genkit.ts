
import { GoogleGenerativeAI } from '@google/generative-ai';

// -----------------------------------------------------------------------------
// Vertex AI with Google Generative AI (Gemini 1.5 Flash - Cheapest Model)
// -----------------------------------------------------------------------------

// Environment variable validation
const validateEnvironment = () => {
  const required = {
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'your-google-cloud-project',
    location: process.env.VERTEX_AI_LOCATION || 'us-central1'
  };

  console.log('Vertex AI Environment Check:');
  console.log('- API Key:', required.apiKey ? 'SET' : 'MISSING');
  console.log('- Project ID:', required.projectId);
  console.log('- Location:', required.location);

  return required;
};

const config = validateEnvironment();

// Initialize Google Generative AI with Gemini 1.5 Flash (cheapest model)
let genAI: GoogleGenerativeAI | null = null;

if (config.apiKey) {
  genAI = new GoogleGenerativeAI(config.apiKey);
  console.log('Google Generative AI initialized with Gemini 1.5 Flash model');
} else {
  console.error('GEMINI_API_KEY is required for Vertex AI integration');
}

// Get the Gemini model instance
export const getGeminiModel = () => {
  if (!genAI) {
    throw new Error('Google Generative AI not initialized. Check your API key.');
  }
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// AI chat function for compatibility with existing code
export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
};

// Export configuration for monitoring
export const vertexConfig = {
  projectId: config.projectId,
  location: config.location,
  model: 'gemini-1.5-flash',
  hasApiKey: !!config.apiKey,
  provider: 'Google Generative AI'
};

// Legacy exports for backward compatibility
export const ai = {
  generate: generateAIResponse,
  model: 'gemini-1.5-flash'
};

console.log('Vertex AI initialized with Google Generative AI - Gemini 1.5 Flash model');
