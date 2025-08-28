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

    // Handle busy state - AI is busy and won't respond
    if (aiResult.busyUntil && aiResult.messages.length === 0) {
      const minutesLeft = Math.ceil((aiResult.busyUntil - Date.now()) / (1000 * 60));
      console.log(`😴 AI is busy for ${minutesLeft} more minutes - message seen but no response`);
      
      return NextResponse.json({
        responses: [], // No responses when busy
        isBusy: true,
        busyUntil: aiResult.busyUntil,
        busyMessage: `Kruthika is busy and will reply in ${minutesLeft} minutes`,
        newMood: 'busy',
        success: true
      });
    }

    // Create response objects with ADDICTIVE timing and media
    const responses: ChatResponse[] = aiResult.messages.map((messageContent, index) => ({
      id: `ai-${Date.now()}-${index}`,
      message: messageContent,
      timestamp: new Date(),
      sender: 'ai',
      isTyping: false,
      delay: aiResult.typingDelays[index],
      // Include media if available
      ...(index === aiResult.messages.length - 1 && aiResult.mediaUrl ? {
        aiImageUrl: aiResult.mediaUrl,
        mediaCaption: aiResult.mediaCaption
      } : {})
    }));

    console.log('📤 Sending ADDICTIVE response with psychological delays:', responses);
    console.log('📱 Media shared:', aiResult.mediaUrl ? 'YES' : 'NO');
    console.log('📺 Ad trigger:', aiResult.shouldTriggerAd ? aiResult.adType : 'NO');

    return NextResponse.json({
      responses: responses,
      newMood: 'addictive', 
      busyUntil: aiResult.busyUntil,
      shouldTriggerAd: aiResult.shouldTriggerAd,
      adType: aiResult.adType,
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