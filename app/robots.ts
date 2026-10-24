import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL || "https://opportunities.campusloop.space";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/opportunities/",
          "/categories/",
          "/about",
          "/privacy",
          "/terms",
          "/report",
        ],
        disallow: [
          "/api/",
          "/auth/",
          "/saved",
          "/dashboard",
          "/_next/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
