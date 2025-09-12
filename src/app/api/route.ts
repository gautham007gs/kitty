import { NextRequest, NextResponse } from 'next/server';

// Cache the response to prevent excessive database calls
let lastHealthCheck = 0;
let cachedResponse: NextResponse | null = null;
const CACHE_DURATION = 30000; // 30 seconds

export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    status: 'healthy', 
    message: 'API service operational',
    timestamp: new Date().toISOString()
  });
}