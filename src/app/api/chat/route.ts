import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/ai/genkit';

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

    // Generate AI response using the working Vertex AI service
    const aiResponse = await generateAIResponse(message);

    console.log('✅ Chat API: Response generated successfully');

    return NextResponse.json({
      response: aiResponse,
      newMood: mood || 'happy',
      success: true
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);

    // Return a contextual fallback response
    const fallbackResponse = "Hey! Server mein thoda issue aa raha hai... But I'm here! Kya haal hai? 😊";

    return NextResponse.json({
      response: fallbackResponse,
      newMood: 'neutral',
      success: false,
      error: 'AI service temporarily unavailable'
    });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Chat API is working',
    timestamp: new Date().toISOString()
  });
}