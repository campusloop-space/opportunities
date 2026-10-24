import crypto from "crypto";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import type { SessionUser } from "./session";

const ISSUER = process.env.CAMPUSLOOP_ISSUER || "https://campusloop.space";
const JWKS_URL = new URL(`${ISSUER}/oauth/jwks.json`);
const remoteJWKSet = createRemoteJWKSet(JWKS_URL);

export interface CampusLoopProfile {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  picture?: string;
  profile?: string;
  student_verified?: boolean;
  verification_method?: string;
  college?: {
    id?: string;
    name?: string;
    slug?: string;
    state?: string;
  } | string;
  branch?: string;
  degree?: string;
  year?: string;
}

export function getOidcConfig() {
  const clientId = process.env.CAMPUSLOOP_CLIENT_ID;
  const clientSecret = process.env.CAMPUSLOOP_CLIENT_SECRET;
  const appUrl = process.env.APP_URL || "https://opportunities.campusloop.space";

  if (!clientId) {
    throw new Error("CAMPUSLOOP_CLIENT_ID is not configured.");
  }

  return {
    issuer: ISSUER,
    clientId,
    clientSecret,
    authorizationEndpoint: `${ISSUER}/oauth/authorize`,
    tokenEndpoint: `${ISSUER}/oauth/token`,
    userinfoEndpoint: `${ISSUER}/oauth/userinfo`,
    redirectUri: `${appUrl}/auth/callback/campusloop`,
  };
}

export function base64URLEncode(buffer: Buffer): string {
  return buffer.toString("base64url");
}

export function generatePkce() {
  const verifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(
    crypto.createHash("sha256").update(verifier).digest()
  );
  return { verifier, challenge };
}

export async function createOAuthStateToken(data: {
  verifier: string;
  state: string;
  nonce: string;
  returnTo: string;
}): Promise<string> {
  const secretKey = new TextEncoder().encode(
    (process.env.AUTH_SECRET || "default_auth_secret_dev").padEnd(32, "0")
  );
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secretKey);
}

export async function verifyOAuthStateToken(token: string): Promise<{
  verifier: string;
  state: string;
  nonce: string;
  returnTo: string;
} | null> {
  try {
    const secretKey = new TextEncoder().encode(
      (process.env.AUTH_SECRET || "default_auth_secret_dev").padEnd(32, "0")
    );
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as {
      verifier: string;
      state: string;
      nonce: string;
      returnTo: string;
    };
  } catch {
    return null;
  }
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  actualRedirectUri?: string
) {
  const config = getOidcConfig();
  const redirectUri = actualRedirectUri || config.redirectUri;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    code_verifier: codeVerifier,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (config.clientSecret) {
    // Standard Basic Auth
    const basicAuth = Buffer.from(
      `${config.clientId}:${config.clientSecret}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${basicAuth}`;
  }

  const res = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers,
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    id_token?: string;
    token_type: string;
    expires_in: number;
  };
  return data;
}

export async function verifyIdToken(idToken: string, expectedNonce?: string) {
  const config = getOidcConfig();

  const { payload } = await jwtVerify(idToken, remoteJWKSet, {
    issuer: config.issuer,
    audience: config.clientId,
    algorithms: ["ES256"],
  });

  if (expectedNonce && payload.nonce !== expectedNonce) {
    throw new Error("Nonce mismatch in ID token.");
  }

  return payload;
}

export async function fetchUserInfo(accessToken: string): Promise<CampusLoopProfile> {
  const config = getOidcConfig();
  const res = await fetch(config.userinfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Userinfo request failed (${res.status}): ${errText}`);
  }

  return (await res.json()) as CampusLoopProfile;
}

export async function upsertUserFromProfile(profile: CampusLoopProfile): Promise<SessionUser> {
  const collegeObj = typeof profile.college === "object" ? profile.college : null;
  const collegeName = collegeObj?.name || (typeof profile.college === "string" ? profile.college : null);

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.sub, profile.sub))
    .limit(1);

  const isVerified = profile.student_verified === true;

  if (existing.length > 0) {
    await db
      .update(users)
      .set({
        name: profile.name || existing[0].name,
        preferredUsername: profile.preferred_username || existing[0].preferredUsername,
        email: profile.email || existing[0].email,
        picture: profile.picture || existing[0].picture,
        studentVerified: isVerified,
        verificationMethod: profile.verification_method || existing[0].verificationMethod,
        collegeId: collegeObj?.id || existing[0].collegeId,
        collegeName: collegeName || existing[0].collegeName,
        collegeSlug: collegeObj?.slug || existing[0].collegeSlug,
        collegeState: collegeObj?.state || existing[0].collegeState,
        branch: profile.branch || existing[0].branch,
        degree: profile.degree || existing[0].degree,
        year: profile.year || existing[0].year,
        updatedAt: new Date(),
      })
      .where(eq(users.sub, profile.sub));
  } else {
    await db.insert(users).values({
      sub: profile.sub,
      name: profile.name ?? null,
      preferredUsername: profile.preferred_username ?? null,
      email: profile.email ?? null,
      picture: profile.picture ?? null,
      studentVerified: isVerified,
      verificationMethod: profile.verification_method ?? null,
      collegeId: collegeObj?.id ?? null,
      collegeName: collegeName ?? null,
      collegeSlug: collegeObj?.slug ?? null,
      collegeState: collegeObj?.state ?? null,
      branch: profile.branch ?? null,
      degree: profile.degree ?? null,
      year: profile.year ?? null,
    });
  }

  return {
    sub: profile.sub,
    name: profile.name || profile.preferred_username || null,
    email: profile.email || null,
    picture: profile.picture || null,
    studentVerified: isVerified,
    college: collegeName,
    branch: profile.branch || null,
    degree: profile.degree || null,
    year: profile.year || null,
  };
}

export function sanitizeReturnUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "/";
  if (!rawUrl.startsWith("/") || rawUrl.startsWith("//") || rawUrl.includes("\\")) {
    return "/";
  }
  return rawUrl;
}
