import { NextResponse } from "next/server";
import { timingSafeEqual } from "@/lib/security";
import { updateOpportunity, getOpportunityBySlug } from "@/lib/opportunities/service";
import { UpdateOpportunitySchema } from "@/lib/validation/opportunity";

function isAuthorized(request: Request): boolean {
  const secret = process.env.MCP_API_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return !!match && timingSafeEqual(match[1].trim(), secret);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authorized = isAuthorized(request);
  const opp = await getOpportunityBySlug(id, { includeUnpublished: authorized });
  if (!opp) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }
  return NextResponse.json(opp);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const validated = UpdateOpportunitySchema.parse(body);
    const updated = await updateOpportunity(id, validated, { type: "rest_api" });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 }
    );
  }
}
