
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
    const aiResponse = await generateAIResponse(message, userId);

    // Handle array responses (multiple bubbles)
    const responseText = Array.isArray(aiResponse) ? aiResponse[0] : aiResponse;

    console.log('✅ Chat API: Generated response:', responseText.substring(0, 50) + '...');

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
      response: responseText,
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
