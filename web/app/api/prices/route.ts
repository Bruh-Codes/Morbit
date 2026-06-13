import { NextRequest, NextResponse } from 'next/server';

const FAMILY_API_URL = process.env.FAMILY_API_URL;

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = ['http://localhost:3000'];

  const isOriginAllowed = (origin: string | null): boolean => {
    if (!origin) return false;
    if (allowedOrigins.includes(origin)) return true;
    const allowedPatterns = [/^https:\/\/.*avaraxyz\.vercel\.app$/];
    return allowedPatterns.some((pattern) => pattern.test(origin));
  };

  const responseHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (process.env.CORS_DOMAINS_ALLOWED === 'true') {
    responseHeaders['Access-Control-Allow-Origin'] = '*';
  } else if (origin && isOriginAllowed(origin)) {
    responseHeaders['Access-Control-Allow-Origin'] = origin;
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: responseHeaders });
  }

  try {
    const { tokenIds } = await request.json();

    if (!tokenIds || !Array.isArray(tokenIds)) {
      return NextResponse.json(
        { error: 'tokenIds array is required' },
        { status: 400, headers: responseHeaders }
      );
    }

    const familyApiKey = process.env.FAMILY_API_KEY;
    if (!familyApiKey || !FAMILY_API_URL) {
      console.error('FAMILY_API_KEY or FAMILY_API_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500, headers: responseHeaders }
      );
    }

    const requestBody = { tokenIds };

    const response = await fetch(FAMILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': familyApiKey,
        Origin: origin || 'http://localhost:3000',
        Referer: 'http://localhost:3000/',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('Family API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch prices from Family API', details: response.statusText },
        { status: response.status, headers: responseHeaders }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error) {
    console.error('Family prices proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500, headers: responseHeaders }
    );
  }
}
