
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/ai/genkit';

export async function POST(request: NextRequest) {
  try {
    const { message, userImageUri, timeOfDay, mood, recentInteractions, userId } = await request.json();
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Valid message is required' }, { status: 400 });
    }

    console.log('💬 Chat API: Processing message:', message.substring(0, 50) + '...');

    // Create a more contextual prompt that includes conversation history
    const contextualPrompt = `Previous conversation: ${recentInteractions?.slice(-3).join(' | ') || 'None'}
Current mood: ${mood || 'neutral'}
Time: ${timeOfDay || 'unknown'}
User says: ${message}

Respond as Kruthika naturally:`;

    const response = await generateAIResponse(contextualPrompt);
    
    if (!response || response.trim() === '') {
      throw new Error('Empty response from AI service');
    }

    console.log('✅ Chat API: Successful response generated');
    return NextResponse.json({ 
      response: response.trim(),
      newMood: mood // You can enhance this to detect mood changes
    });
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
