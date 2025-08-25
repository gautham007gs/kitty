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
import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Chat API: Received request');
    
    const body = await request.json();
    const { message, userImageUri, timeOfDay, mood, recentInteractions, userId } = body;

    if (!message || typeof message !== 'string') {
      console.error('❌ Chat API: Invalid message input');
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('💬 Chat API: Processing message:', message.substring(0, 50) + '...');
    console.log('🕒 Time of day:', timeOfDay);
    console.log('😊 Current mood:', mood);
    console.log('👤 User ID:', userId);

    // Generate AI response using the improved aiService
    const aiResponse = await generateAIResponse(message);

    console.log('✅ Chat API: Generated response:', aiResponse.substring(0, 50) + '...');

    // Simple mood detection based on user message
    let newMood = mood || 'neutral';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('love') || lowerMessage.includes('miss') || lowerMessage.includes('pyaar')) {
      newMood = 'romantic';
    } else if (lowerMessage.includes('haha') || lowerMessage.includes('funny') || lowerMessage.includes('mazak')) {
      newMood = 'playful';
    } else if (lowerMessage.includes('tired') || lowerMessage.includes('sleepy') || lowerMessage.includes('thak')) {
      newMood = 'tired';
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('upset') || lowerMessage.includes('dukhi')) {
      newMood = 'sad';
    }

    return NextResponse.json({
      response: aiResponse,
      newMood: newMood,
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    
    // Return a natural fallback response
    return NextResponse.json({
      response: "Sorry yaar! Technical problem ho rahi hai. Try again please! 😊",
      newMood: 'neutral',
      status: 'error'
    }, { status: 500 });
  }
}
