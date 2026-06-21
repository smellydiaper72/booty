import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { analyzeBill } from "@/lib/analyzer";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { billType, providerName, totalBilled, billText } = body;

    if (!totalBilled || isNaN(Number(totalBilled))) {
      return NextResponse.json({ error: "Invalid bill total" }, { status: 400 });
    }

    const result = await analyzeBill({
      billText: billText ?? "",
      billType: billType ?? "hospital",
      providerName: providerName ?? "",
      totalBilled: Number(totalBilled),
    });

    const db = getDb();

    db.prepare(
      `INSERT INTO analyses (id, bill_type, provider_name, total_billed, total_errors_found, estimated_savings, status, raw_text)
       VALUES (?, ?, ?, ?, ?, ?, 'complete', ?)`
    ).run(
      result.id,
      result.bill_type,
      result.provider_name,
      result.total_billed,
      result.total_errors_found,
      result.estimated_savings,
      billText ?? ""
    );

    const insertFinding = db.prepare(
      `INSERT INTO findings (id, analysis_id, error_type, line_item, charge_amount, expected_amount, savings, severity, explanation, action_required)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const f of result.findings) {
      insertFinding.run(
        f.id,
        result.id,
        f.error_type,
        f.line_item,
        f.charge_amount,
        f.expected_amount,
        f.savings,
        f.severity,
        f.explanation,
        f.action_required
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
