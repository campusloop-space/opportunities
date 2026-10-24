import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyOAuthStateToken,
  exchangeCodeForTokens,
  verifyIdToken,
  fetchUserInfo,
  upsertUserFromProfile,
  sanitizeReturnUrl,
  getOidcConfig,
} from "@/lib/auth/campusloop";
import { createSessionToken, createSessionCookieHeader } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
      console.error("CampusLoop OIDC provider error:", error, errorDescription);
      return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error)}`, url.origin));
    }

    if (!code || !state) {
      return NextResponse.json({ error: "Missing authorization code or state parameter." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const stateCookie = cookieStore.get("campusloop_oauth_state")?.value;

    if (!stateCookie) {
      return NextResponse.json({ error: "Missing state session cookie. Please try signing in again." }, { status: 400 });
    }

    const statePayload = await verifyOAuthStateToken(stateCookie);
    if (!statePayload || statePayload.state !== state) {
      return NextResponse.json({ error: "Invalid state token or CSRF check failed." }, { status: 400 });
    }

    // Determine actual redirect uri matching this request origin
    const config = getOidcConfig();
    const actualRedirectUri = `${url.origin}/auth/callback/campusloop`;

    const tokenResponse = await exchangeCodeForTokens(
      code,
      statePayload.verifier,
      actualRedirectUri.includes("localhost") ? actualRedirectUri : config.redirectUri
    );

    let profileSub = "";
    if (tokenResponse.id_token) {
      const idClaims = await verifyIdToken(tokenResponse.id_token, statePayload.nonce);
      profileSub = idClaims.sub as string;
    }

    const userinfo = await fetchUserInfo(tokenResponse.access_token);
    if (profileSub && userinfo.sub !== profileSub) {
      throw new Error("Subject identifier mismatch between id_token and userinfo.");
    }

    const sessionUser = await upsertUserFromProfile(userinfo);
    const sessionToken = await createSessionToken(sessionUser);

    const destination = sanitizeReturnUrl(statePayload.returnTo);
    const response = NextResponse.redirect(new URL(destination, url.origin));

    // Set session cookie
    response.headers.append("Set-Cookie", createSessionCookieHeader(sessionToken));

    // Clear state cookie
    response.headers.append(
      "Set-Cookie",
      "campusloop_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );

    return response;
  } catch (err: unknown) {
    console.error("CampusLoop OAuth callback error:", err);
    const message = err instanceof Error ? err.message : "Authentication callback failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
