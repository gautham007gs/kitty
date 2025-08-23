import {genkit} from 'genkit';
import {vertexAI} from '@genkit-ai/vertexai';

// -----------------------------------------------------------------------------
// Genkit AI Initialization with Vertex AI (Gemini)
// -----------------------------------------------------------------------------

// Function to determine the API key and project configuration for Vertex AI
const MIN_API_KEY_LENGTH = 30;

const getVertexAIConfig = (): { projectId: string; location: string; apiKey?: string } | null => {
  // Check for Google Cloud project configuration
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.VERTEX_AI_PROJECT_ID || process.env.GCP_PROJECT_ID;
  const location = process.env.VERTEX_AI_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  // Check for various possible API key environment variable names
  let apiKey: string | undefined;
  const possibleKeys = ['GOOGLE_API_KEY', 'GEMINI_API_KEY', 'VERTEX_AI_API_KEY', 'GCP_API_KEY'];

  for (const keyName of possibleKeys) {
    const key = process.env[keyName];
    console.log(`Genkit: Checking environment variable: ${keyName}`);
    if (key && key.trim() !== '' && key.length > 10 && !key.toLowerCase().includes('your_') && !key.toLowerCase().includes('placeholder')) {
      apiKey = key.trim();
      console.log(`Genkit: Valid API key found in ${keyName}`);
      break;
    } else {
      console.log(`Genkit: Environment variable ${keyName} is not set.`);
    }
  }

  if (!projectId) {
    console.error('CRITICAL Genkit Error: No Google Cloud Project ID found. Please set GOOGLE_CLOUD_PROJECT environment variable.');
    return null;
  }

  console.log(`Genkit: Using Vertex AI with Project ID: ${projectId}, Location: ${location}`);

  return {
    projectId,
    location,
    apiKey
  };
};

const vertexConfig = getVertexAIConfig();

export const ai = genkit({
  plugins: vertexConfig ?
    [
      vertexAI({
        projectId: vertexConfig.projectId,
        location: vertexConfig.location,
        apiKey: vertexConfig.apiKey, // Optional - will use default credentials if not provided
      }),
    ] :
    [], // Initialize with no plugins if no valid config is found
  model: 'vertexai/gemini-1.5-flash', // Using the cheapest Gemini model
});

// --- IMPORTANT NOTES ON VERTEX AI CONFIGURATION ---
//
// 1.  **ENVIRONMENT VARIABLES REQUIRED:**
//     - GOOGLE_CLOUD_PROJECT: Your Google Cloud Project ID
//     - VERTEX_AI_LOCATION: Region (defaults to us-central1)
//     - GOOGLE_API_KEY: Your API key (or use default credentials)
//
// 2.  **COST OPTIMIZATION:**
//     - Using gemini-1.5-flash which is the most cost-effective model
//     - Vertex AI pricing is generally more predictable than direct API calls
//
// 3.  **GOOGLE CLOUD $300 CREDIT:**
//     - Make sure your project is set up to use the free credits
//     - Monitor usage in Google Cloud Console
//     - Set up billing alerts to avoid unexpected charges
//
// 4.  **AUTHENTICATION:**
//     - API key method for simplicity in development
//     - For production, consider using service account credentials
//
// 5.  **RATE LIMITS:**
//     - Vertex AI has generous rate limits compared to direct API
//     - Perfect for scaling your chat application