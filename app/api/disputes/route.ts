import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function GET() {
  const db = getDb();
  const disputes = db
    .prepare(
      `SELECT d.*, a.provider_name as bill_provider, a.total_billed, a.estimated_savings
       FROM disputes d JOIN analyses a ON d.analysis_id = a.id
       ORDER BY d.created_at DESC`
    )
    .all();
  return NextResponse.json(disputes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { analysisId, letterContent, providerName, amountDisputed } = body;

  const db = getDb();
  const id = uid();

  db.prepare(
    `INSERT INTO disputes (id, analysis_id, letter_content, provider_name, amount_disputed, status)
     VALUES (?, ?, ?, ?, ?, 'sent')`
  ).run(id, analysisId, letterContent, providerName, amountDisputed);

  return NextResponse.json({ id, status: "sent" });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, amountRecovered, notes } = body;

  const db = getDb();
  db.prepare(
    `UPDATE disputes SET status=?, amount_recovered=?, notes=?, updated_at=datetime('now') WHERE id=?`
  ).run(status, amountRecovered ?? 0, notes ?? "", id);

  return NextResponse.json({ success: true });
}
