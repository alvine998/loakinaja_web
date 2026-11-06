/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          { key: 'Link', value: '<https://loakinaja.com/llms.txt>; rel="describedby"; type="text/plain", <https://loakinaja.com/index.md>; rel="alternate"; type="text/markdown"' },
        ],
      },
      {
        source: '/llms.txt',
        headers: [{ key: 'Content-Type', value: 'text/plain; charset=utf-8' }],
      },
      {
        source: '/index.md',
        headers: [{ key: 'Content-Type', value: 'text/markdown; charset=utf-8' }],
      },
      {
        source: '/.well-known/mcp/server-card.json',
        headers: [{ key: 'Content-Type', value: 'application/json; charset=utf-8' }],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
          destination: '/api/home-markdown',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
