import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  getOidcConfig,
  generatePkce,
  createOAuthStateToken,
  sanitizeReturnUrl,
} from "@/lib/auth/campusloop";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const returnTo = sanitizeReturnUrl(searchParams.get("returnTo"));
    const config = getOidcConfig();

    const { verifier, challenge } = generatePkce();
    const state = crypto.randomBytes(16).toString("hex");
    const nonce = crypto.randomBytes(16).toString("hex");

    const stateToken = await createOAuthStateToken({
      verifier,
      state,
      nonce,
      returnTo,
    });

    const authUrl = new URL(config.authorizationEndpoint);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", config.clientId);
    authUrl.searchParams.set("redirect_uri", config.redirectUri);
    authUrl.searchParams.set("scope", "openid profile email student college academic");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("nonce", nonce);

    const isSecure = process.env.NODE_ENV === "production" || config.redirectUri.startsWith("https");
    const cookieHeader = `campusloop_oauth_state=${stateToken}; Path=/; HttpOnly; ${
      isSecure ? "Secure; " : ""
    }SameSite=Lax; Max-Age=600`;

    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: authUrl.toString(),
        "Set-Cookie": cookieHeader,
      },
    });
  } catch (err: unknown) {
    console.error("Auth initialization error:", err);
    return NextResponse.json(
      { error: "Failed to initialize CampusLoop authentication." },
      { status: 500 }
    );
  }
}
