import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { CreateReportSchema } from "@/lib/validation/opportunity";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const validated = CreateReportSchema.parse(body);

    const [report] = await db
      .insert(reports)
      .values({
        opportunityId: validated.opportunityId || null,
        reason: validated.reason,
        details: validated.details,
        reporterEmail: validated.reporterEmail || session?.email || null,
        reporterSub: session?.sub || null,
      })
      .returning();

    return NextResponse.json({ ok: true, reportId: report.id }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit report." },
      { status: 400 }
    );
  }
}
