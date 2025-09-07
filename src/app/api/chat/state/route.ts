import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // In a real app, you would fetch this data from your database
  // based on the userId.
  // For now, we'll return some mock data.

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const mockChatState = {
    lastMessage: 'Hey! How is it going? I was just thinking about you.',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    unreadCount: 2,
  };

  return NextResponse.json(mockChatState);
}
