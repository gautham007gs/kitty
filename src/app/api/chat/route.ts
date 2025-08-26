
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, generateSmartMediaResponse } from '@/lib/aiService';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [], userId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation context
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: message }
    ];

    // Generate AI response
    const aiResponse = await generateAIResponse(messages);

    // Check for smart media response
    const mediaResponse = await generateSmartMediaResponse(message, messages);

    // Log to Supabase if available
    try {
      if (supabase) {
        await supabase.from('messages_log').insert({
          user_id: userId || 'anonymous',
          user_message: message,
          ai_response: aiResponse,
          session_id: `session_${Date.now()}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (logError) {
      console.warn('Failed to log message to Supabase:', logError);
      // Don't fail the request if logging fails
    }

    // Prepare response
    const responseData: any = {
      response: aiResponse,
      timestamp: new Date().toISOString()
    };

    // Add media if available
    if (mediaResponse.shouldSendMedia) {
      responseData.media = {
        type: mediaResponse.mediaType,
        url: mediaResponse.mediaUrl
      };
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Return a fallback response instead of failing
    return NextResponse.json({
      response: "Sorry yaar! Main abhi thoda busy hun, but I'll be right back! 😊 Try again in a moment!",
      timestamp: new Date().toISOString(),
      error: 'AI_TEMPORARILY_UNAVAILABLE'
    });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Chat API is working',
    timestamp: new Date().toISOString()
  });
}
