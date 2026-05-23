import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getBackendBase(): string {
  const raw =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001';
  let url = String(raw).trim().replace(/\/$/, '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const backend = getBackendBase();
  const path = pathSegments.join('/');
  const target = `${backend}/api/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  const auth = req.headers.get('authorization');
  if (auth) headers.set('Authorization', auth);

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: body || undefined,
    });

    const responseBody = await upstream.text();
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('API proxy error:', target, error);
    return NextResponse.json(
      {
        error: `Backend unreachable at ${backend}. Check BACKEND_URL on Vercel and Railway public domain.`,
      },
      { status: 502 }
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
