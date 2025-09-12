import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'healthy', 
    message: 'API service operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}

export async function HEAD(request: NextRequest) {
  // Optimized for health checks - no logging to reduce noise
  // This satisfies external monitoring systems (like Sentry/Replit infrastructure)
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache',
      'X-Health-Check': 'ok'
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