import { NextResponse } from "next/server";
import { timingSafeEqual } from "@/lib/security";
import {
  listOpportunities,
  upsertOpportunity,
} from "@/lib/opportunities/service";
import {
  ListOpportunitiesSchema,
  UpsertOpportunitySchema,
} from "@/lib/validation/opportunity";

function isAuthorized(request: Request): boolean {
  const secret = process.env.MCP_API_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return !!match && timingSafeEqual(match[1].trim(), secret);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const validated = ListOpportunitiesSchema.parse(searchParams);
    const authorized = isAuthorized(request);

    const result = await listOpportunities(validated, {
      includeUnpublished: authorized,
    });
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list opportunities" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = UpsertOpportunitySchema.parse(body);
    const result = await upsertOpportunity(validated, { type: "rest_api" });
    return NextResponse.json(result, { status: result.operation === "created" ? 201 : 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Validation failed" },
      { status: 400 }
    );
  }
}
