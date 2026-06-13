import { NextRequest, NextResponse } from 'next/server';
import { SUBGRAPH_IDS, SubgraphKey } from 'utils/subgraphRequest';

const subgraphApiKey = process.env.SUBGRAPH_API_KEY;

function buildSubgraphUrl(subgraphId: string): string {
  return `https://gateway.thegraph.com/api/subgraphs/id/${subgraphId}`;
}

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
    const {
      subgraphKey,
      query,
      variables,
    }: { subgraphKey: SubgraphKey; query: string; variables?: Record<string, unknown> } =
      await request.json();

    if (!subgraphKey || !query) {
      return NextResponse.json(
        { error: 'Missing required fields: subgraphKey and query' },
        { status: 400, headers: responseHeaders }
      );
    }

    if (!(subgraphKey in SUBGRAPH_IDS)) {
      return NextResponse.json(
        { error: 'Invalid subgraph key' },
        { status: 400, headers: responseHeaders }
      );
    }

    const subgraphUrl = buildSubgraphUrl(SUBGRAPH_IDS[subgraphKey]);

    const response = await fetch(subgraphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${subgraphApiKey}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error) {
    console.error('Subgraph proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500, headers: responseHeaders }
    );
  }
}
