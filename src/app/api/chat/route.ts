import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/ai/genkit';

// Define the ChatResponse interface (assuming it's defined elsewhere or needs to be included)
interface ChatResponse {
  id: string;
  message: string;
  timestamp: Date;
  sender: 'ai' | 'user';
  isTyping: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userImageUri, timeOfDay, mood, recentInteractions, userId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🚀 Chat API: Processing message from user:', userId);
    console.log('📝 Message:', message.substring(0, 100) + '...');

    // Generate AI response using Vertex AI - no fallbacks
    let aiResponse: string;
    try {
      aiResponse = await generateAIResponse(message);
    } catch (error) {
      console.error('❌ Failed to get Vertex AI response:', error);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    const response: ChatResponse = {
      id: Date.now().toString(),
      message: aiResponse,
      timestamp: new Date(),
      sender: 'ai',
      isTyping: false
    };

    // The original code included these, so we preserve them if they are part of the intended functionality
    // For example, if newMood is meant to be updated based on the AI's response, it should be kept.
    // If not, they can be removed. Assuming they are relevant for context.
    const newMood = mood || 'happy'; // Keep original mood handling if applicable

    return NextResponse.json({
      response: response, // Ensure the entire response object is returned
      newMood: newMood,
      success: true
    });

  } catch (error) {
    // This catch block now specifically handles errors during request parsing or unexpected issues
    console.error('❌ Chat API Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Chat API is working',
    timestamp: new Date().toISOString()
  });
}