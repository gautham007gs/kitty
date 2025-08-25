
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/ai/genkit';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Valid message is required' }, { status: 400 });
    }

    console.log('💬 Chat API: Processing message:', message.substring(0, 50) + '...');

    const response = await generateAIResponse(message.trim());
    
    if (!response || response.trim() === '') {
      throw new Error('Empty response from AI service');
    }

    console.log('✅ Chat API: Successful response generated');
    return NextResponse.json({ response: response.trim() });
  } catch (error: any) {
    console.error('❌ Chat API error:', error);
    
    // Return a simple fallback only when there's a real error
    const fallback = "Hey! Technical issues aa rahe hain. Try again please! 😊";
    
    return NextResponse.json(
      { response: fallback, error: true, details: error.message },
      { status: 200 } // Still return 200 so the frontend shows the fallback
    );
  }
}
