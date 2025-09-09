import { NextRequest, NextResponse } from 'next/server';
import { conversationStateManager } from '@/lib/conversationState';

/**
 * @swagger
 * /api/chat/history:
 *   get:
 *     summary: Retrieves the full conversation history for a user.
 *     description: >
 *       Fetches the entire conversation history from the state manager and formats it
 *       for display in the chat client.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier for the user.
 *     responses:
 *       200:
 *         description: The user's conversation history.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text: { type: string }
 *                       sender: { type: string, enum: ['user', 'ai'] }
 *       400:
 *         description: Bad request, userId is required.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const state = await conversationStateManager.getState(userId);

    // The history is stored as "User: message" or "AI: message".
    // We need to parse it into the format the frontend expects.
    const formattedHistory = state.history.map(entry => {
      const isUser = entry.startsWith('User:');
      return {
        text: entry.replace(/^(User:|AI:)\s*/, ''),
        sender: isUser ? 'user' : 'ai',
      };
    });

    return NextResponse.json({ history: formattedHistory });

  } catch (error: any) {
    console.error('❌ Chat History API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chat history.' },
      { status: 500 }
    );
  }
}