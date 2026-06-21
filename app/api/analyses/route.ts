import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
  const db = getDb();
  const analyses = db
    .prepare(
      `SELECT a.*, COUNT(f.id) as finding_count
       FROM analyses a LEFT JOIN findings f ON a.id = f.analysis_id
       GROUP BY a.id ORDER BY a.created_at DESC`
    )
    .all();
  return NextResponse.json(analyses);
}
