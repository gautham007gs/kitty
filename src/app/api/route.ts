import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: Request) {
  return Response.json({
    message: 'Maya Chat API is running',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  }, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Content-Type': 'application/json',
    },
  });
}

export async function HEAD(request: Request) {
  // Add caching headers to reduce frequent HEAD requests
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'X-API-Status': 'healthy',
    },
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    status: 'healthy', 
    message: 'API service operational',
    timestamp: new Date().toISOString()
  });
}