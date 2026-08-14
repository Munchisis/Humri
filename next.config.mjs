import { withSentryConfig } from "@sentry/nextjs";

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
    connect-src 'self' https://vercel.live https://*.vercel.live wss://*.vercel.live https://www.google-analytics.com https://*.google-analytics.com https://cloudflareinsights.com https://*.cloudflareinsights.com https://challenges.cloudflare.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["mongoose"],
  eslint: {
    // Allows production builds to successfully complete even if lint errors exist
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://humri.org",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
});
