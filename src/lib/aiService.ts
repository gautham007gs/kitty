
import { VertexAI } from '@google-cloud/vertexai';

// Environment variable validation for Vertex AI
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

const initializeVertexAI = () => {
  if (!config.projectId || !config.credentialsJson) {
    console.error('Missing required Vertex AI configuration');
    console.error('Required: GOOGLE_CLOUD_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS_JSON');
    return false;
  }

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
      throw new Error('Invalid credentials format - please check your GOOGLE_APPLICATION_CREDENTIALS_JSON');
    }

    vertex = new VertexAI({
      project: config.projectId,
      location: config.location,
      googleAuthOptions: {
        credentials: credentials
      }
    });

    // Get the generative model (using Gemini 1.5 Flash - cheapest option)
    model = vertex.preview.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
        topP: 1,
      }
    });

    console.log('Vertex AI initialized successfully with Gemini 1.5 Flash');
    return true;
  } catch (error) {
    console.error('Failed to initialize Vertex AI:', error);
    return false;
  }
};

// Initialize on module load
const isInitialized = initializeVertexAI();

// AI Service Class
export class AIService {
  private static instance: AIService;

  private constructor() {
    if (!isInitialized || !model) {
      throw new Error('Vertex AI not initialized. Check your credentials and project configuration.');
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      try {
        AIService.instance = new AIService();
      } catch (error) {
        console.error('Failed to create AIService instance:', error);
        throw error;
      }
    }
    return AIService.instance;
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      if (!model) {
        throw new Error('Vertex AI model not initialized');
      }

      const request = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      };

      const result = await model.generateContent(request);
      const response = result.response;

      if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
        return response.candidates[0].content.parts[0].text;
      }

      throw new Error('No valid response received from Vertex AI');
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm having trouble connecting right now. Please try again in a moment! 😊";
    }
  }

  async generateChatResponse(message: string, history: any[] = []): Promise<string> {
    try {
      // Create context from chat history
      let contextPrompt = "You are Kruthika, a friendly Indian girl who loves chatting. ";
      contextPrompt += "Respond naturally in a mix of Hindi and English like young Indians do. ";
      contextPrompt += "Be warm, friendly, and engaging.\n\n";
      
      if (history.length > 0) {
        contextPrompt += "Recent conversation:\n";
        history.slice(-5).forEach((msg: any) => {
          contextPrompt += `${msg.sender_type === 'user' ? 'User' : 'You'}: ${msg.text_content}\n`;
        });
        contextPrompt += "\n";
      }
      
      contextPrompt += `User just said: ${message}\n\nRespond as Kruthika:`;

      return await this.generateResponse(contextPrompt);
    } catch (error) {
      console.error('Error generating chat response:', error);
      return "Hey! I'm not quite ready to chat yet. Give me a moment! 😊";
    }
  }
}

// Create singleton instance
let aiService: AIService | null = null;

try {
  aiService = AIService.getInstance();
  console.log('AI Service initialized successfully with Vertex AI');
} catch (error) {
  console.error('AI Service initialization failed:', error);
}

export { aiService };

// Legacy exports for backward compatibility
export const generateAIResponse = async (prompt: string): Promise<string> => {
  if (!aiService) {
    return "AI service is not available right now. Please try again later! 🤖";
  }
  return aiService.generateResponse(prompt);
};

export const generateChatResponse = async (message: string, history: any[] = []): Promise<string> => {
  if (!aiService) {
    return "Hey! I'm not quite ready to chat yet. Give me a moment! 😊";
  }
  return aiService.generateChatResponse(message, history);
};

// Configuration export
export const aiConfig = {
  projectId: config.projectId,
  location: config.location,
  model: 'gemini-1.5-flash-001',
  hasCredentials: !!config.credentialsJson,
  provider: 'Google Vertex AI',
  isInitialized: isInitialized
};

console.log('AI Service configured with Vertex AI - Free Google Cloud credits compatible');
