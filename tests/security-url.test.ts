import { describe, it, expect } from "vitest";
import { isSafeExternalUrl, normalizeUrl, timingSafeEqual, checkRateLimit } from "../lib/security";
import { SafeUrlSchema, CreateOpportunitySchema } from "../lib/validation/opportunity";

describe("Security & URL Safety", () => {
  it("rejects non-http/https protocols", () => {
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("data:text/html,<h1>hack</h1>")).toBe(false);
    expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeExternalUrl("ftp://example.com/file")).toBe(false);
  });

  it("rejects local and private network hostnames (SSRF prevention)", () => {
    expect(isSafeExternalUrl("http://localhost:3000")).toBe(false);
    expect(isSafeExternalUrl("http://127.0.0.1:8080")).toBe(false);
    expect(isSafeExternalUrl("http://0.0.0.0")).toBe(false);
    expect(isSafeExternalUrl("http://10.0.0.1")).toBe(false);
    expect(isSafeExternalUrl("http://192.168.1.1")).toBe(false);
    expect(isSafeExternalUrl("http://172.16.0.1")).toBe(false);
    expect(isSafeExternalUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isSafeExternalUrl("http://internal.service.local")).toBe(false);
  });

  it("permits valid public external URLs", () => {
    expect(isSafeExternalUrl("https://summerofcode.withgoogle.com")).toBe(true);
    expect(isSafeExternalUrl("https://github.com/campusloop-space")).toBe(true);
    expect(isSafeExternalUrl("https://sih.gov.in")).toBe(true);
  });

  it("normalizes URLs and strips tracking parameters", () => {
    const raw = "https://example.com/apply/?utm_source=twitter&utm_medium=social&ref_src=twsrc";
    const normalized = normalizeUrl(raw);
    expect(normalized).toBe("https://example.com/apply");
  });

  it("timingSafeEqual safely compares secrets in constant time", () => {
    const secret = "a".repeat(32);
    expect(timingSafeEqual(secret, secret)).toBe(true);
    expect(timingSafeEqual(secret, "b".repeat(32))).toBe(false);
    expect(timingSafeEqual(secret, "short")).toBe(false);
    expect(timingSafeEqual("", secret)).toBe(false);
  });

  it("checkRateLimit bounds requests per window", () => {
    const key = `test-ip-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(key, 5, 10000);
      expect(res.allowed).toBe(true);
    }
    const blocked = checkRateLimit(key, 5, 10000);
    expect(blocked.allowed).toBe(false);
  });

  it("SafeUrlSchema validates in Zod and rejects malformed inputs", () => {
    expect(() => SafeUrlSchema.parse("https://valid-domain.com")).not.toThrow();
    expect(() => SafeUrlSchema.parse("http://127.0.0.1")).toThrow();
    expect(() => SafeUrlSchema.parse("not-a-url")).toThrow();
  });
});
