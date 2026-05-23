/** @type {import('next').NextConfig} */
function normalizeBackendUrl(raw) {
  const fallback = 'http://localhost:3001';
  if (!raw || !String(raw).trim()) return fallback;

  let url = String(raw).trim().replace(/\/$/, '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return fallback;
    return url;
  } catch {
    console.warn('[next.config] Invalid BACKEND_URL / NEXT_PUBLIC_API_URL, using localhost for rewrites');
    return fallback;
  }
}

const backendUrl = normalizeBackendUrl(
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
);

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
