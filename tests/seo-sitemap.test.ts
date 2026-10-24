import { describe, it, expect } from "vitest";
import { generateOpportunityJsonLd, generateBreadcrumbJsonLd } from "../lib/seo";
import type { Opportunity } from "../lib/db/schema";
import robots from "../app/robots";

describe("SEO & Structured Data", () => {
  const mockOpportunity: Opportunity = {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    slug: "google-summer-of-code-2026",
    title: "Google Summer of Code 2026",
    summary: "Global open source mentorship program.",
    description: "Work on open source software projects with professional mentors.",
    category: "fellowships",
    tags: ["Open Source"],
    organizerName: "Google Open Source",
    organizerWebsite: "https://summerofcode.withgoogle.com",
    sourceUrl: "https://summerofcode.withgoogle.com",
    applicationUrl: "https://summerofcode.withgoogle.com/apply",
    location: "Worldwide",
    deliveryMode: "remote",
    eligibilitySummary: "18+ years old",
    eligibleDegrees: ["B.Tech"],
    eligibleYears: ["3rd Year"],
    eligibleFields: ["CS"],
    eligibleCountries: ["India"],
    benefitsSummary: "USD 1500 - 3000",
    stipendAmount: "250000",
    stipendCurrency: "INR",
    applicationOpensAt: new Date("2026-03-01T00:00:00Z"),
    deadlineAt: new Date("2026-04-01T00:00:00Z"),
    deadlineTimezone: "UTC",
    rollingDeadline: false,
    status: "published",
    sourceCheckedAt: new Date(),
    publishedAt: new Date("2026-02-01T00:00:00Z"),
    lastSeenAt: new Date(),
    closedReason: null,
    sourceMethod: "official",
    sourceNotes: null,
    contentHash: "abc",
    createdBy: "system",
    updatedBy: "system",
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("generates Schema.org JobPosting structured data for fellowships/internships", () => {
    const jsonLd = generateOpportunityJsonLd(mockOpportunity);
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("JobPosting");
    expect((jsonLd as any).hiringOrganization?.name).toBe("Google Open Source");
    expect((jsonLd as any).jobLocationType).toBe("TELECOMMUTE");
    expect((jsonLd as any).baseSalary?.currency).toBe("INR");
  });

  it("generates Schema.org Event structured data for hackathons/competitions", () => {
    const hackathonOpp = { ...mockOpportunity, category: "hackathons" as const };
    const jsonLd = generateOpportunityJsonLd(hackathonOpp);
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Event");
    expect(jsonLd.name).toBe("Google Summer of Code 2026");
  });

  it("generates BreadcrumbList structured data", () => {
    const breadcrumbs = generateBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Fellowships", url: "/categories/fellowships" },
      { name: "GSoC 2026", url: "/opportunities/gsoc-2026" },
    ]);
    expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbs.itemListElement.length).toBe(3);
    expect(breadcrumbs.itemListElement[0].position).toBe(1);
    expect(breadcrumbs.itemListElement[0].name).toBe("Home");
  });

  it("robots configuration permits public discovery and blocks private routes", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    expect(rules.allow).toContain("/");
    expect(rules.allow).toContain("/opportunities/");
    expect(rules.allow).toContain("/categories/");
    expect(rules.disallow).toContain("/api/");
    expect(rules.disallow).toContain("/auth/");
    expect(rules.disallow).toContain("/saved");
    expect(config.sitemap).toContain("sitemap.xml");
  });
});
