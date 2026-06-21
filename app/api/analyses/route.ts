import { NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const { rows } = await sql`
    SELECT a.*, COUNT(f.id)::int as finding_count
    FROM analyses a LEFT JOIN findings f ON a.id = f.analysis_id
    GROUP BY a.id ORDER BY a.created_at DESC
  `;
  return NextResponse.json(rows);
}
