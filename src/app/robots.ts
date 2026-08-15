import type { MetadataRoute } from "next";

const BASE_URL = "https://humri.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/lawyer",
        "/lawyer/*",
        "/auth/login",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/auth/verify-email",
        "/auth/pending",
        "/dashboard-redirect",
        "/api/*",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
