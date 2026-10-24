import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  let dbStatus = "unknown";
  try {
    const res = await db.execute(sql`SELECT 1 as live;`);
    if (res) {
      dbStatus = "connected";
    }
  } catch {
    dbStatus = "unavailable";
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      service: "campusloop-opportunities",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
