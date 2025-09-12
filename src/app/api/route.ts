import { NextRequest, NextResponse } from 'next/server';

// Cache the response to prevent excessive database calls
let lastHealthCheck = 0;
let cachedResponse: NextResponse | null = null;
const CACHE_DURATION = 30000; // 30 seconds

export async function GET() {
  const now = Date.now();

  // Return cached response if still valid
  if (cachedResponse && (now - lastHealthCheck) < CACHE_DURATION) {
    return cachedResponse;
  }

  try {
    const response = NextResponse.json({ 
      status: 'OK', 
      message: 'Maya Chat API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });

    // Cache the response
    cachedResponse = response;
    lastHealthCheck = now;

    return response;
  } catch (error) {
    return NextResponse.json(
      { status: 'ERROR', message: 'API health check failed' },
      { status: 500 }
    );
  }
}

// Lightweight HEAD response without any processing
export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=30',
      'Content-Type': 'application/json'
    }
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    status: 'healthy', 
    message: 'API service operational',
    timestamp: new Date().toISOString()
  });
}