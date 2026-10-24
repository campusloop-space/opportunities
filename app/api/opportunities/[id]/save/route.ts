import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { toggleSaveOpportunity } from "@/lib/opportunities/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required to bookmark opportunities." },
      { status: 401 }
    );
  }

  const { id } = await params;
  try {
    const result = await toggleSaveOpportunity(session.sub, id);
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to toggle bookmark." },
      { status: 500 }
    );
  }
}
