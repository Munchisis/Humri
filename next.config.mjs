/** @type {import('next').NextConfig} */

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://challenges.cloudflare.com https://static.cloudflareinsights.com blob:;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://vercel.live https://challenges.cloudflare.com;
    connect-src 'self' https://vercel.live https://*.vercel.live wss://*.vercel.live https://www.google-analytics.com https://*.google-analytics.com https://cloudflareinsights.com https://*.cloudflareinsights.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\s{2,}/g, " ").trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
