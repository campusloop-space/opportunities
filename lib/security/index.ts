import crypto from "crypto";

/**
 * Constant-time comparison to prevent timing attacks on secrets
 */
export function timingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Run comparison against dummy buffer to maintain constant time
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Validates that an external URL is HTTP or HTTPS and not a local/private network address (SSRF guard).
 */
export function isSafeExternalUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    
    // Disallow loopback, localhost, and common link-local / internal targets
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return false;
    }

    // Disallow private IPv4 ranges:
    // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
    const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (ipv4Match) {
      const b1 = parseInt(ipv4Match[1], 10);
      const b2 = parseInt(ipv4Match[2], 10);
      if (b1 === 10) return false;
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return false;
      if (b1 === 192 && b2 === 168) return false;
      if (b1 === 169 && b2 === 254) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize and sanitize URLs for storage and deduplication
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl.trim());
    // Strip trailing slashes
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    // Remove tracking query parameters like utm_*
    const searchParams = new URLSearchParams(url.search);
    const trackingPrefixes = ["utm_", "fbclid", "gclid", "ref_src", "source"];
    const keysToDelete: string[] = [];
    for (const key of searchParams.keys()) {
      if (trackingPrefixes.some((p) => key.startsWith(p))) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      searchParams.delete(key);
    }
    url.search = searchParams.toString();
    return url.toString();
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Simple in-memory rate limiter for serverless worker isolates
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    const newEntry = { count: 1, resetAt: now + windowMs };
    rateLimitMap.set(key, newEntry);
    return { allowed: true, remaining: limit - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
