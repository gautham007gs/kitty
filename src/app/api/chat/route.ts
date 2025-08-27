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

    // Generate AI response using Vertex AI - no fallbacks, returns breadcrumbs
    let aiResponseBreadcrumbs: string[];
    try {
      console.log('🔄 Attempting to generate AI response...');
      aiResponseBreadcrumbs = await generateAIResponse(message);
      console.log('✅ AI response generated:', aiResponseBreadcrumbs);
    } catch (error) {
      console.error('❌ Failed to get Vertex AI response:', error);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    // Create multiple response objects for breadcrumb effect
    const responses: ChatResponse[] = aiResponseBreadcrumbs.map((breadcrumb, index) => ({
      id: `ai-${Date.now()}-${index}`,
      message: breadcrumb,
      timestamp: new Date(),
      sender: 'ai',
      isTyping: false
    }));

    const newMood = mood || 'happy';

    console.log('📤 Sending response:', { responses, newMood });

    return NextResponse.json({
      responses: responses, // Return array of responses for breadcrumb effect
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