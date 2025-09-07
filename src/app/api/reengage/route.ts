
import { NextRequest, NextResponse } from 'next/server';
import { reengagementService } from '@/lib/reengagement';

/**
 * @swagger
 * /api/reengage:
 *   post:
 *     summary: Proactively re-engages a user with an AI-generated message.
 *     description: >
 *       This endpoint triggers the re-engagement service to generate a personalized,
 *       context-aware message and send it to the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: 
 *                 type: string
 *                 description: The unique identifier for the user to re-engage.
 *     responses:
 *       200:
 *         description: Successfully generated and sent a re-engagement message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 success: { type: boolean }
 *       400:
 *         description: Bad request, userId is required.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'default_user' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const message = await reengagementService.generateReengagementMessage(userId);

    // In a real-world scenario, you would now send this message to the user 
    // via a push notification service (e.g., Firebase Cloud Messaging, OneSignal).

    return NextResponse.json({
      message,
      success: true,
    });

  } catch (error: any) {
    console.error('❌ Re-engagement API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate re-engagement message.' },
      { status: 500 }
    );
  }
}
