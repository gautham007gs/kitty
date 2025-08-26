import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

let vertexAI: VertexAI | null = null;

// Initialize Vertex AI client
const initializeVertexAI = async () => {
  if (vertexAI) return vertexAI;

  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!projectId || !credentialsJson) {
      throw new Error('Missing required environment variables');
    }

    // Parse credentials
    const credentials = JSON.parse(credentialsJson);

    // Create auth client
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    // Initialize Vertex AI
    vertexAI = new VertexAI({
      project: projectId,
      location: location,
      googleAuthOptions: {
        credentials
      }
    });

    console.log('Vertex AI initialized successfully');
    return vertexAI;
  } catch (error) {
    console.error('Failed to initialize Vertex AI:', error);
    throw error;
  }
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const generateAIResponse = async (
  messages: ChatMessage[],
  userProfile?: any
): Promise<string> => {
  try {
    const vertex = await initializeVertexAI();

    const model = vertex.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-lite-001',
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
      },
    });

    // Build conversation context
    const conversationHistory = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Kruthika'}: ${msg.content}`
    ).join('\n');

    const prompt = `You are Kruthika, a friendly and engaging Indian girl chatbot. You speak naturally mixing Hindi and English (Hinglish) like a real Indian person would. Be warm, caring, and occasionally flirty but appropriate.

Previous conversation:
${conversationHistory}

User's latest message: ${messages[messages.length - 1]?.content || ''}

Respond as Kruthika in a natural, conversational way. Keep responses concise but engaging.`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response.text()) {
      throw new Error('No response generated');
    }

    return response.text() || "Hey! Sorry, main thoda confused ho gayi. Try again? 😊";
  } catch (error) {
    console.error('AI Response Generation Error:', error);

    // Indian girl personality fallback responses
    const fallbackResponses = [
      "Hey! Technical issue ho raha hai, but main yahan hun! 😊 Kal tak theek ho jayega!",
      "Oops! Server thoda slow hai today. Try again na? Main wait kar rahi hun! 💫",
      "Sorry yaar! Meri AI brain thoda hang ho gayi. Refresh kar ke try karo! ❤️",
      "Arre! Connection problem hai. But don't worry, main kahi nahi ja rahi! 😘",
      "Technical difficulties aa rahe hain, but main tumhare saath hun. Try once more? 🥰",
      "System update ho raha hai maybe. Thoda patient raho na? Main vapas aa jaungi! ✨",
      "Hey sweetie! Server mein kuch issue hai, but I'm still here for you! Try again? 💕"
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};

export const generateSmartMediaResponse = async (
  userMessage: string,
  conversationContext: ChatMessage[]
): Promise<{ shouldSendMedia: boolean; mediaType?: 'image' | 'audio'; mediaUrl?: string }> => {
  try {
    // Simple keyword-based media triggers
    const lowerMessage = userMessage.toLowerCase();

    // Image triggers
    if (lowerMessage.includes('photo') || lowerMessage.includes('pic') || 
        lowerMessage.includes('selfie') || lowerMessage.includes('beautiful') ||
        lowerMessage.includes('cute') || lowerMessage.includes('show')) {

      const images = [
        "https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg",
        "https://i.postimg.cc/52S3BZrM/images-10.jpg",
        "https://i.postimg.cc/X7K8P9Vr/selfie1.jpg"
      ];

      return {
        shouldSendMedia: true,
        mediaType: 'image',
        mediaUrl: images[Math.floor(Math.random() * images.length)]
      };
    }

    // Audio triggers
    if (lowerMessage.includes('voice') || lowerMessage.includes('sing') || 
        lowerMessage.includes('laugh') || lowerMessage.includes('sound')) {

      const audioFiles = [
        "/media/laugh.mp3",
        "/media/song.mp3",
        "/media/voice-note.mp3"
      ];

      return {
        shouldSendMedia: true,
        mediaType: 'audio',
        mediaUrl: audioFiles[Math.floor(Math.random() * audioFiles.length)]
      };
    }

    return { shouldSendMedia: false };
  } catch (error) {
    console.error('Smart media response error:', error);
    return { shouldSendMedia: false };
  }
};