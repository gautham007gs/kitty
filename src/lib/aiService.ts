
import { GoogleGenerativeAI } from '@google/generative-ai';

// Environment variable validation
const validateEnvironment = () => {
  const required = {
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'your-google-cloud-project',
    location: process.env.VERTEX_AI_LOCATION || 'us-central1'
  };

  console.log('AI Service Environment Check:');
  console.log('- API Key:', required.apiKey ? 'SET' : 'MISSING');
  console.log('- Project ID:', required.projectId);
  console.log('- Location:', required.location);

  return required;
};

const config = validateEnvironment();

// Initialize Google Generative AI
let genAI: GoogleGenerativeAI | null = null;

if (config.apiKey) {
  genAI = new GoogleGenerativeAI(config.apiKey);
  console.log('Google Generative AI initialized successfully');
} else {
  console.error('GEMINI_API_KEY is required for AI integration');
}

// AI Service Class
export class AIService {
  private static instance: AIService;
  private model: any;

  private constructor() {
    if (!genAI) {
      throw new Error('Google Generative AI not initialized. Check your API key.');
    }
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      if (!this.model) {
        throw new Error('AI model not initialized');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback responses for common errors
      if (error instanceof Error) {
        if (error.message.includes('quota')) {
          return "I'm experiencing high demand right now. Please try again in a moment! 😊";
        }
        if (error.message.includes('safety')) {
          return "Let's keep our conversation friendly and positive! How can I help you today? 😊";
        }
      }
      
      return "Sorry, I'm having trouble processing that right now. Could you try rephrasing? 💭";
    }
  }

  async generateChatResponse(userMessage: string, conversationHistory: any[] = []): Promise<string> {
    try {
      // Build context-aware prompt
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

// Export singleton instance
export const aiService = AIService.getInstance();

// Legacy exports for backward compatibility
export const generateAIResponse = (prompt: string) => aiService.generateResponse(prompt);
export const generateChatResponse = (message: string, history: any[] = []) => 
  aiService.generateChatResponse(message, history);

// Configuration export
export const aiConfig = {
  projectId: config.projectId,
  location: config.location,
  model: 'gemini-1.5-flash',
  hasApiKey: !!config.apiKey,
  provider: 'Google Generative AI (Vertex AI Compatible)'
};

console.log('AI Service initialized with Vertex AI compatible configuration');
