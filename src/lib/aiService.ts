
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
    
    try {
      // Direct JSON parsing - no base64 decoding needed
      credentials = JSON.parse(config.credentialsJson);
      console.log('✅ Vertex AI: Successfully parsed JSON credentials');
      console.log('✅ Project ID from credentials:', credentials.project_id);
      console.log('✅ Service account email:', credentials.client_email);
    } catch (parseError) {
      console.error('❌ Vertex AI: Failed to parse credentials JSON');
      console.error('Parse error:', parseError.message);
      console.error('Credentials preview:', config.credentialsJson.substring(0, 100) + '...');
      throw new Error('Invalid credentials JSON format');
    }

    // Initialize Vertex AI with proper authentication
    vertex = new VertexAI({
      project: credentials.project_id, // Use project_id from credentials
      location: config.location,
      googleAuthOptions: {
        credentials: credentials
      }
    });

    // Use Gemini 1.5 Pro - more reliable and widely available
    model = vertex.preview.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        maxOutputTokens: 2048, // Increased for better responses
        temperature: 0.7,      // Balanced creativity
        topP: 0.8,            // Good quality responses
        topK: 40,             // Diversity control
        candidateCount: 1     // Single response for reliability
      }
    });

    console.log('🚀 Vertex AI initialized successfully!');
    console.log('📱 Model: gemini-1.5-pro (reliable option)');
    console.log('💰 Using Google Cloud $300 free credits');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Vertex AI:', error);
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
        const aiResponse = response.candidates[0].content.parts[0].text;
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
      let contextPrompt = "You are Kruthika, a friendly 22-year-old Indian girl who loves chatting. ";
      contextPrompt += "You speak in a natural mix of Hindi and English like young Indians do (Hinglish). ";
      contextPrompt += "You're warm, friendly, engaging, and have a bubbly personality. ";
      contextPrompt += "Use emojis occasionally but don't overdo it. ";
      contextPrompt += "Keep responses conversational and not too long.\n\n";
      
      if (history.length > 0) {
        contextPrompt += "Recent conversation:\n";
        history.slice(-3).forEach((msg: any) => {
          contextPrompt += `${msg.sender_type === 'user' ? 'User' : 'Kruthika'}: ${msg.text_content}\n`;
        });
        contextPrompt += "\n";
      }
      
      contextPrompt += `User just said: ${message}\n\nRespond as Kruthika in a natural, friendly way:`;

      console.log('💬 Generating chat response for:', message.substring(0, 50) + '...');
      return await this.generateResponse(contextPrompt);
    } catch (error) {
      console.error('❌ Error generating chat response:', error);
      return "Hey! Technical problems ho rahe hain. Try again please! 😊";
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
