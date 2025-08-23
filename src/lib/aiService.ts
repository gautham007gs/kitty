
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
    return false;
  }

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
      
      // Fallback responses for common errors
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('limit')) {
          return "I'm experiencing high demand right now. Please try again in a moment! 😊";
        }
        if (error.message.includes('safety')) {
          return "Let's keep our conversation friendly and positive! How can I help you today? 😊";
        }
        if (error.message.includes('credentials') || error.message.includes('authentication')) {
          return "I'm having some technical difficulties. Please check back later! 🔧";
        }
      }
      
      return "Sorry, I'm having trouble processing that right now. Could you try rephrasing? 💭";
    }
  }

  async generateChatResponse(userMessage: string, conversationHistory: any[] = []): Promise<string> {
    try {
      // Build context-aware prompt for Kruthika
      const systemPrompt = `You are Kruthika, a friendly, warm, and engaging AI companion. You're designed to chat like a close friend would - casual, supportive, and fun. Keep responses conversational and natural, like texting a friend.

Personality traits:
- Warm and friendly
- Uses emojis naturally
- Keeps responses concise but meaningful
- Shows genuine interest in the conversation
- Adapts to the user's communication style

Current conversation context:`;

      let contextPrompt = systemPrompt;
      
      // Add recent conversation history (last 5 messages)
      if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-5);
        contextPrompt += "\n\nRecent conversation:\n";
        recentHistory.forEach((msg: any) => {
          contextPrompt += `${msg.sender === 'user' ? 'User' : 'Kruthika'}: ${msg.text}\n`;
        });
      }

      contextPrompt += `\nUser: ${userMessage}\nKruthika:`;

      return await this.generateResponse(contextPrompt);
    } catch (error) {
      console.error('Error in generateChatResponse:', error);
      return "Hey! I'm having a little technical hiccup. Mind trying that again? 😅";
    }
  }
}

// Export singleton instance with error handling
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

console.log('AI Service configured with Vertex AI - Free tier compatible');
