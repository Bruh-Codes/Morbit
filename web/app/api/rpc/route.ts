import { NextRequest, NextResponse } from 'next/server';
import { ChainId } from 'protocol/aave-compat';
import { mantle, megaeth, xLayer } from 'viem/chains';

const NETWORK_CONFIG: Record<number, { network: string; apiKey: string }> = {
  [ChainId.mainnet]: { network: 'eth-mainnet', apiKey: process.env.MAINNET_RPC_API_KEY || '' },
  [ChainId.polygon]: { network: 'polygon-mainnet', apiKey: process.env.POLYGON_RPC_API_KEY || '' },
  [ChainId.avalanche]: { network: 'avax-mainnet', apiKey: process.env.AVALANCHE_RPC_API_KEY || '' },
  [ChainId.arbitrum_one]: {
    network: 'arb-mainnet',
    apiKey: process.env.ARBITRUM_RPC_API_KEY || '',
  },
  [ChainId.base]: { network: 'base-mainnet', apiKey: process.env.BASE_RPC_API_KEY || '' },
  [ChainId.optimism]: { network: 'opt-mainnet', apiKey: process.env.OPTIMISM_RPC_API_KEY || '' },
  [ChainId.metis_andromeda]: {
    network: 'metis-mainnet',
    apiKey: process.env.METIS_RPC_API_KEY || '',
  },
  [ChainId.xdai]: { network: 'gnosis-mainnet', apiKey: process.env.GNOSIS_RPC_API_KEY || '' },
  [ChainId.bnb]: { network: 'bnb-mainnet', apiKey: process.env.BNB_RPC_API_KEY || '' },
  [ChainId.scroll]: { network: 'scroll-mainnet', apiKey: process.env.SCROLL_RPC_API_KEY || '' },
  [ChainId.zksync]: { network: 'zksync-mainnet', apiKey: process.env.ZKSYNC_RPC_API_KEY || '' },
  [ChainId.linea]: { network: 'linea-mainnet', apiKey: process.env.LINEA_RPC_API_KEY || '' },
  [ChainId.sonic]: { network: 'sonic-mainnet', apiKey: process.env.SONIC_RPC_API_KEY || '' },
  [ChainId.celo]: { network: 'celo-mainnet', apiKey: process.env.CELO_RPC_API_KEY || '' },
  [ChainId.soneium]: { network: 'soneium-mainnet', apiKey: process.env.SONEIUM_RPC_API_KEY || '' },
  [ChainId.ink]: { network: 'ink-mainnet', apiKey: process.env.INK_RPC_API_KEY || '' },
  [ChainId.plasma]: { network: 'plasma-mainnet', apiKey: process.env.PLASMA_RPC_API_KEY || '' },
  [megaeth.id]: { network: 'megaeth-mainnet', apiKey: process.env.MEGAETH_RPC_API_KEY || '' },
  [mantle.id]: { network: 'mantle-mainnet', apiKey: process.env.MANTLE_RPC_API_KEY || '' },
  [xLayer.id]: { network: 'xlayer-mainnet', apiKey: process.env.XLAYER_RPC_API_KEY || '' },
  [ChainId.sepolia]: { network: 'eth-sepolia', apiKey: process.env.MAINNET_RPC_API_KEY || '' },
  [ChainId.fuji]: { network: 'avax-fuji', apiKey: process.env.AVALANCHE_RPC_API_KEY || '' },
  [ChainId.arbitrum_sepolia]: {
    network: 'arb-sepolia',
    apiKey: process.env.ARBITRUM_RPC_API_KEY || '',
  },
  [ChainId.base_sepolia]: { network: 'base-sepolia', apiKey: process.env.BASE_RPC_API_KEY || '' },
  [ChainId.optimism_sepolia]: {
    network: 'opt-sepolia',
    apiKey: process.env.OPTIMISM_RPC_API_KEY || '',
  },
  [ChainId.scroll_sepolia]: {
    network: 'scroll-sepolia',
    apiKey: process.env.SCROLL_RPC_API_KEY || '',
  },
};

function getRpcUrl(chainId: number): string | null {
  const config = NETWORK_CONFIG[chainId];
  if (!config) return null;
  return `https://${config.network}.g.alchemy.com/v2/${config.apiKey}`;
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
    const { chainId, method, params } = await request.json();

    if (typeof method !== 'string' || method.startsWith('alchemy_')) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 400, headers: responseHeaders }
      );
    }

    const chainIdNumber = typeof chainId === 'string' ? parseInt(chainId) : chainId;
    const rpcUrl = getRpcUrl(chainIdNumber);

    if (!rpcUrl) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainIdNumber}` },
        { status: 400, headers: responseHeaders }
      );
    }

    const rpcRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    };

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin || 'http://localhost:3000',
        Referer: 'http://localhost:3000/',
      },
      body: JSON.stringify(rpcRequest),
    });

    const data = await response.json();
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error) {
    console.error('RPC proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500, headers: responseHeaders }
    );
  }
}
