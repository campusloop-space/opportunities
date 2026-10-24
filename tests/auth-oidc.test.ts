import { describe, it, expect } from "vitest";
import {
  generatePkce,
  createOAuthStateToken,
  verifyOAuthStateToken,
  sanitizeReturnUrl,
} from "../lib/auth/campusloop";
import { createSessionToken, verifySessionToken } from "../lib/auth/session";

describe("CampusLoop OIDC & Session Security", () => {
  it("generates cryptographic PKCE verifier and S256 challenge", () => {
    const { verifier, challenge } = generatePkce();
    expect(verifier).toBeDefined();
    expect(challenge).toBeDefined();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(challenge.length).toBeGreaterThanOrEqual(43);
    // Ensure URL-safe base64
    expect(verifier).not.toMatch(/[+/=]/);
    expect(challenge).not.toMatch(/[+/=]/);
  });

  it("creates and verifies signed transient state token", async () => {
    const data = {
      verifier: "mock_verifier_123",
      state: "mock_state_456",
      nonce: "mock_nonce_789",
      returnTo: "/saved",
    };

    const token = await createOAuthStateToken(data);
    const verified = await verifyOAuthStateToken(token);

    expect(verified).not.toBeNull();
    expect(verified?.state).toBe("mock_state_456");
    expect(verified?.verifier).toBe("mock_verifier_123");
    expect(verified?.nonce).toBe("mock_nonce_789");
    expect(verified?.returnTo).toBe("/saved");
  });

  it("prevents open redirects and sanitizes returnUrl", () => {
    expect(sanitizeReturnUrl("/saved")).toBe("/saved");
    expect(sanitizeReturnUrl("/categories/hackathons")).toBe("/categories/hackathons");
    // Dangerous redirects
    expect(sanitizeReturnUrl("https://evil.com")).toBe("/");
    expect(sanitizeReturnUrl("//evil.com/phish")).toBe("/");
    expect(sanitizeReturnUrl("\\\\evil.com")).toBe("/");
    expect(sanitizeReturnUrl(null)).toBe("/");
    expect(sanitizeReturnUrl("")).toBe("/");
  });

  it("creates and verifies signed JWT user session", async () => {
    const mockUser = {
      sub: "cl_user_abc123",
      name: "Aarav Sharma",
      email: "aarav@iitd.ac.in",
      studentVerified: true,
      college: "IIT Delhi",
      branch: "Computer Science",
      degree: "B.Tech",
      year: "3rd Year",
    };

    const token = await createSessionToken(mockUser);
    expect(token).toBeDefined();

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe("cl_user_abc123");
    expect(verified?.studentVerified).toBe(true);
    expect(verified?.college).toBe("IIT Delhi");
  });
});
