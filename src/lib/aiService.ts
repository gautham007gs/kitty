import { VertexAI } from '@google-cloud/vertexai';

// Environment validation
const config = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  location: process.env.VERTEX_AI_LOCATION || 'us-central1',
  credentialsJson: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
};

console.log('🔧 AI Service Environment Check:');
console.log('- Project ID:', config.projectId || 'MISSING');
console.log('- Location:', config.location);
console.log('- Credentials:', config.credentialsJson ? 'SET' : 'MISSING');

// Initialize Vertex AI
let vertex: VertexAI | null = null;
let model: any = null;
let isInitialized = false;

const initializeVertexAI = () => {
  try {
    if (!config.projectId || !config.credentialsJson) {
      console.error('❌ Missing required configuration');
      return false;
    }

    const credentials = JSON.parse(config.credentialsJson);

    vertex = new VertexAI({
      project: credentials.project_id,
      location: config.location,
      googleAuthOptions: {
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
          project_id: credentials.project_id,
          type: 'service_account'
        }
      }
    });

    model = vertex.preview.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        candidateCount: 1
      }
    });

    console.log('✅ AI Service initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize AI Service:', error);
    return false;
  }
};

// Initialize on module load
isInitialized = initializeVertexAI();

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
        console.log('✅ AIService singleton created successfully');
      } catch (error) {
        console.error('❌ Failed to create AIService instance:', error);
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

      console.log('🤖 Generating AI response with Vertex AI...');
      
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
        return aiResponse;
      }

      throw new Error('No valid response received from Vertex AI');
    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      // Return a fallback only if there's a real error
      return "Sorry yaar, I'm having some technical issues right now. Please try again! 😊";
    }
  }

  async generateChatResponse(message: string, history: any[] = []): Promise<string> {
    try {
      // Create context from chat history with Kruthika's personality
      let contextPrompt = "You are Kruthika, a friendly 22-year-old Indian girl. ";
      contextPrompt += "Reply in a natural mix of Hindi and English (Hinglish). ";
      contextPrompt += "Be warm, bubbly, and engaging. Keep responses conversational.\n\n";
      
      if (history.length > 0) {
        contextPrompt += "Recent conversation:\n";
        history.slice(-2).forEach((msg: any) => {
          contextPrompt += `${msg.sender_type === 'user' ? 'User' : 'Kruthika'}: ${msg.text_content}\n`;
        });
        contextPrompt += "\n";
      }
      
      contextPrompt += `User: ${message}\n\nRespond as Kruthika:`;

      console.log('💬 Generating chat response for:', message.substring(0, 50) + '...');
      return await this.generateResponse(contextPrompt);
    } catch (error) {
      console.error('❌ Error generating chat response:', error);
      return "Hey! Kuch technical problem hai. Try again please! 😊";
    }
  }

  // Test function to verify AI is working
  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await this.generateResponse("Say hello in one sentence.");
      console.log('🧪 AI Test Response:', testResponse);
      return testResponse.length > 0 && !testResponse.includes("technical issues");
    } catch (error) {
      console.error('❌ AI Connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
let aiService: AIService | null = null;

try {
  aiService = AIService.getInstance();
  console.log('✅ AI Service initialized successfully with Vertex AI');
  
  // Test the connection
  aiService.testConnection().then(success => {
    if (success) {
      console.log('🎉 AI Connection test PASSED - Ready to chat!');
    } else {
      console.log('⚠️ AI Connection test FAILED - Check configuration');
    }
  });
} catch (error) {
  console.error('❌ AI Service initialization failed:', error);
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
  model: 'gemini-1.5-pro',
  hasCredentials: !!config.credentialsJson,
  provider: 'Google Vertex AI',
  isInitialized: isInitialized,
  freeCredits: true,
  costOptimized: true
};

console.log('🚀 AI Service configured with Vertex AI');
console.log('💰 Compatible with Google Cloud $300 free credits');
console.log('📱 Using reliable model: gemini-1.5-pro');