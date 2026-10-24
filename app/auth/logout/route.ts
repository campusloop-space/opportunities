import { NextResponse } from "next/server";
import { clearSessionCookieHeader } from "@/lib/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", url.origin));
  response.headers.set("Set-Cookie", clearSessionCookieHeader());
  return response;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", url.origin));
  response.headers.set("Set-Cookie", clearSessionCookieHeader());
  return response;
}
