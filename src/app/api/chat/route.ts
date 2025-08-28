import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/aiService';

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

    // PURE VERTEX AI ONLY - NO FALLBACKS
    const aiResult = await generateAIResponse(message, userId);

    // Create response objects with proper timing
    const responses: ChatResponse[] = aiResult.messages.map((messageContent, index) => ({
      id: `ai-${Date.now()}-${index}`,
      message: messageContent,
      timestamp: new Date(),
      sender: 'ai',
      isTyping: false,
      delay: aiResult.typingDelays[index] // Include typing delay
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