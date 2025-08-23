import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

// -----------------------------------------------------------------------------
// Genkit AI Initialization with Vertex AI (Gemini 1.5 Flash - Cheapest Model)
// -----------------------------------------------------------------------------

// Environment variable validation
const validateEnvironment = () => {
  const required = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_AI_PROJECT_ID,
    location: process.env.VERTEX_AI_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  };

  console.log('Vertex AI Environment Check:');
  console.log('- Project ID:', required.projectId ? 'SET' : 'MISSING');
  console.log('- Location:', required.location);
  console.log('- API Key:', required.apiKey ? 'SET' : 'MISSING');

  return required;
};

const config = validateEnvironment();

// Initialize Genkit with Vertex AI
export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: config.projectId || 'your-google-cloud-project', // Replace with actual project ID
      location: config.location,
      // API key is optional - Vertex AI can use default credentials in production
      ...(config.apiKey && { apiKey: config.apiKey })
    }),
  ],
  // Using the cheapest Gemini model for cost optimization
  model: 'vertexai/gemini-1.5-flash',
});

// Export configuration for monitoring
export const vertexConfig = {
  projectId: config.projectId,
  location: config.location,
  model: 'vertexai/gemini-1.5-flash',
  hasApiKey: !!config.apiKey
};

console.log('Vertex AI initialized with Gemini 1.5 Flash model');