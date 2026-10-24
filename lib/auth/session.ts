import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "campusloop_session";

export interface SessionUser {
  sub: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  studentVerified: boolean;
  college?: string | null;
  branch?: string | null;
  degree?: string | null;
  year?: string | null;
}

function getAuthSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "default_dev_secret_must_be_32_bytes_or_more_for_safety";
  return new TextEncoder().encode(secret.padEnd(32, "0"));
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const secretKey = getAuthSecretKey();
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const secretKey = getAuthSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return (payload.user as SessionUser) || null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function createSessionCookieHeader(token: string, maxAge: number = 30 * 24 * 3600): string {
  const isSecure = process.env.NODE_ENV === "production" || process.env.APP_URL?.startsWith("https");
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; ${isSecure ? "Secure; " : ""}SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
