import { NextResponse } from "next/server";
import { timingSafeEqual } from "@/lib/security";
import { closeOpportunity } from "@/lib/opportunities/service";
import { CloseOpportunitySchema } from "@/lib/validation/opportunity";

function isAuthorized(request: Request): boolean {
  const secret = process.env.MCP_API_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return !!match && timingSafeEqual(match[1].trim(), secret);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const validated = CloseOpportunitySchema.parse({ idOrSlug: id, reason: body.reason });
    const closed = await closeOpportunity(validated.idOrSlug, validated.reason, { type: "rest_api" });
    return NextResponse.json(closed);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Close failed" },
      { status: 400 }
    );
  }
}
