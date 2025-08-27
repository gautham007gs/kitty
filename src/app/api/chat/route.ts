
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/ai/genkit';

interface ChatResponse {
  id: string;
  message: string;
  timestamp: Date;
  sender: 'ai' | 'user';
  isTyping: boolean;
  delay?: number; // Add delay for timing
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId = 'default' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🚀 Chat API: Processing NATURAL message from user:', userId);
    console.log('📝 Message:', message.substring(0, 100) + '...');

    // Generate AI response using ONLY Vertex AI - NO FALLBACKS
    let aiResponse: { breadcrumbs: string[]; delays: number[] };
    try {
      console.log('🔄 Generating NATURAL Vertex AI response...');
      aiResponse = await generateAIResponse(message, userId);
      console.log('✅ NATURAL Vertex AI response generated:', aiResponse.breadcrumbs);
      console.log('⏱️ With delays:', aiResponse.delays);
    } catch (error) {
      console.error('❌ VERTEX AI FAILED - NO FALLBACKS:', error);
      return NextResponse.json(
        { error: `Vertex AI failed: ${error.message}. Check AI configuration.` },
        { status: 503 }
      );
    }

    // Create response objects with proper timing
    const responses: ChatResponse[] = aiResponse.breadcrumbs.map((breadcrumb, index) => ({
      id: `ai-${Date.now()}-${index}`,
      message: breadcrumb,
      timestamp: new Date(),
      sender: 'ai',
      isTyping: false,
      delay: aiResponse.delays[index] // Include typing delay
    }));

    console.log('📤 Sending NATURAL response with delays:', responses);

    return NextResponse.json({
      responses: responses,
      newMood: 'natural', // Always natural now
      success: true
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Natural Chat API is working - NO FALLBACKS',
    timestamp: new Date().toISOString()
  });
}
