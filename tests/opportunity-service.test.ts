import { describe, it, expect } from "vitest";
import { generateBaseSlug, computeContentHash } from "../lib/opportunities/service";
import { CreateOpportunitySchema, UpdateOpportunitySchema } from "../lib/validation/opportunity";

describe("Opportunity Business Logic & Validation", () => {
  it("generates clean, human-readable URL slugs", () => {
    const slug = generateBaseSlug("Google Summer of Code 2026", "Google Open Source");
    expect(slug).toBe("google-open-source-google-summer-of-code-2026");

    const simpleSlug = generateBaseSlug("HackMIT 2026");
    expect(simpleSlug).toBe("hackmit-2026");

    const messySlug = generateBaseSlug("Summer Research Fellowship @ IIT-K (Surge!)", "IITK");
    expect(messySlug).toBe("iitk-summer-research-fellowship-iit-k-surge");
  });

  it("computes deterministic SHA-256 content hash", () => {
    const payloadA = {
      title: "SIH 2026",
      summary: "Smart India Hackathon",
      description: "Details",
      category: "hackathons",
      sourceUrl: "https://sih.gov.in",
      applicationUrl: "https://sih.gov.in/apply",
      deadlineAt: "2026-09-30T23:59:59Z",
    };

    const payloadB = { ...payloadA };
    expect(computeContentHash(payloadA)).toBe(computeContentHash(payloadB));

    const payloadC = { ...payloadA, title: "SIH 2027" };
    expect(computeContentHash(payloadA)).not.toBe(computeContentHash(payloadC));
  });

  it("validates full Opportunity payload with Zod schema", () => {
    const validData = {
      title: "Smart India Hackathon 2026",
      summary: "National hackathon initiative by Ministry of Education.",
      description: "36 hour non-stop coding competition across multiple nodal centers.",
      category: "hackathons",
      organizerName: "AICTE",
      sourceUrl: "https://sih.gov.in",
      applicationUrl: "https://sih.gov.in/register",
      deliveryMode: "in_person",
      rollingDeadline: false,
      tags: ["AICTE", "National"],
    };

    const parsed = CreateOpportunitySchema.parse(validData);
    expect(parsed.title).toBe(validData.title);
    expect(parsed.deliveryMode).toBe("in_person");
  });

  it("rejects incomplete or invalid payloads", () => {
    const invalidData = {
      title: "SI", // Too short (< 3 chars)
      summary: "Too short", // (< 10 chars)
      description: "Short", // (< 20 chars)
      category: "invalid_category",
      organizerName: "A",
      sourceUrl: "not-a-url",
      applicationUrl: "javascript:alert(1)",
    };

    expect(() => CreateOpportunitySchema.parse(invalidData)).toThrow();
  });
});
