

// This API route was causing a HEAD request loop - removing it completely
// The ads and other functionality work fine without this endpoint

export async function GET() {
  return new Response('API is working', { status: 200 });
}

