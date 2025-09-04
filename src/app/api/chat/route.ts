
import { NextRequest, NextResponse } from 'next/server';
import { generateResponse, EmotionalStateInput } from '@/ai/actions/emotional-state-actions';

// Keep track of conversation history in memory (for simplicity)
// In a real-world app, you'd use a database like Redis or Supabase.
const conversationHistory: { [userId: string]: string[] } = {};
const userMoods: { [userId: string]: string } = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId = 'default_user' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Initialize history for new users
    if (!conversationHistory[userId]) {
      conversationHistory[userId] = [];
    }
    if (!userMoods[userId]) {
      userMoods[userId] = 'neutral'; // Start with a neutral mood
    }
    
    conversationHistory[userId].push(`User: ${message}`);

    // --- Prepare input for the new generateResponse function ---
    const emotionalInput: EmotionalStateInput = {
      userMessage: message,
      timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
      mood: userMoods[userId],
      recentInteractions: conversationHistory[userId].slice(-10),
    };

    // --- Call the new, refined AI action ---
    const aiOutput = await generateResponse(emotionalInput);

    // Update conversation history and mood using the actual bubbles
    const aiResponsesTexts = aiOutput.humanizedResponse.bubbles.map(bubble => bubble.text);
    aiResponsesTexts.forEach(resText => conversationHistory[userId].push(`AI: ${resText}`));
    userMoods[userId] = aiOutput.newMood;

    // --- Format the response for the frontend ---
    // The humanizedResponse from aiOutput already has the correct structure for 'bubbles'
    const formattedBubbles = aiOutput.humanizedResponse.bubbles;

    console.log(`📤 Sending response to user ${userId}. New mood: ${aiOutput.newMood}`);

    return NextResponse.json({
      humanizedResponse: {
        bubbles: formattedBubbles,
      },
      newMood: aiOutput.newMood,
      success: true,
      proactiveMediaUrl: aiOutput.proactiveMediaUrl, // Ensure proactiveMediaUrl is passed if available
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return NextResponse.json(
      { error: 'Oops! Something went wrong on my end. Try again in a bit?' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Chat API is active and running the new persona logic.',
    timestamp: new Date().toISOString()
  });
}
