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
  } catch (error) {
    console.error('❌ Chat API error:', error);

    // Different fallback responses to avoid repetition
    const fallbackResponses = [
      "Hey! Technical problems ho rahe hain. Try again please! 😊",
      "Sorry yaar, server issues chal rahe hain. Ek minute baad try karo! 🤗",
      "Oops! Kuch technical problem hai. Please try again! 💖",
      "System restart ho raha hai. Thoda wait karo please! 😅"
    ];

    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return NextResponse.json({
      response: randomFallback,
      error: true,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
  }
}