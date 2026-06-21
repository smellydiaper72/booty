import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function GET() {
  await initDb();
  const { rows } = await sql`
    SELECT d.*, a.provider_name as bill_provider, a.total_billed, a.estimated_savings
    FROM disputes d JOIN analyses a ON d.analysis_id = a.id
    ORDER BY d.created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { analysisId, letterContent, providerName, amountDisputed } = body;

  await initDb();
  const id = uid();

  await sql`
    INSERT INTO disputes (id, analysis_id, letter_content, provider_name, amount_disputed, status)
    VALUES (${id}, ${analysisId}, ${letterContent}, ${providerName}, ${amountDisputed}, 'sent')
  `;

  return NextResponse.json({ id, status: "sent" });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, amountRecovered, notes } = body;

  await initDb();
  await sql`
    UPDATE disputes
    SET status = ${status}, amount_recovered = ${amountRecovered ?? 0}, notes = ${notes ?? ""}, updated_at = NOW()
    WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}
