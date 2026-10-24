import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { opportunities, opportunityCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || "https://opportunities.campusloop.space";

  // Static SEO routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/report`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Category pages
  const categoryRoutes: MetadataRoute.Sitemap = opportunityCategories.map((cat) => ({
    url: `${baseUrl}/categories/${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Dynamic published opportunities
  let oppRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedList = await db
      .select({
        slug: opportunities.slug,
        updatedAt: opportunities.updatedAt,
      })
      .from(opportunities)
      .where(eq(opportunities.status, "published"))
      .limit(1000);

    oppRoutes = publishedList.map((opp) => ({
      url: `${baseUrl}/opportunities/${opp.slug}`,
      lastModified: opp.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));
  } catch (err) {
    console.error("Error fetching sitemap dynamic opportunities:", err);
  }

  return [...staticRoutes, ...categoryRoutes, ...oppRoutes];
}
