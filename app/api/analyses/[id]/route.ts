import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await initDb();

  const { rows: analyses } = await sql`SELECT * FROM analyses WHERE id = ${id}`;
  const analysis = analyses[0] as Record<string, unknown> | undefined;

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { rows: findings } = await sql`
    SELECT * FROM findings WHERE analysis_id = ${id} ORDER BY savings DESC
  `;

  const disputeLetter = generateLetterFromDb(analysis, findings as Finding[]);

  return NextResponse.json({ ...analysis, findings, dispute_letter: disputeLetter });
}

interface Finding {
  error_type: string;
  line_item: string;
  charge_amount: number;
  expected_amount: number;
  savings: number;
  action_required: string;
}

function generateLetterFromDb(
  analysis: Record<string, unknown>,
  findings: Finding[]
): string {
  const providerName = String(analysis.provider_name ?? "Unknown Provider");
  const totalBilled = Number(analysis.total_billed ?? 0);
  const totalSavings = findings.reduce((s, f) => s + f.savings, 0);
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemizedComplaints = findings
    .map(
      (f, i) =>
        `${i + 1}. ${f.line_item}\n   Billed: $${Number(f.charge_amount).toLocaleString()} | Expected: $${Number(f.expected_amount).toLocaleString()} | Disputed: $${Number(f.savings).toLocaleString()}\n   ${f.action_required}`
    )
    .join("\n\n");

  return `${today}

Patient Relations / Medical Billing Department
${providerName}
[Address]

RE: Formal Dispute of Medical Bill — Account #[YOUR ACCOUNT NUMBER]
    Patient Name: [YOUR FULL NAME]

To Whom It May Concern:

I am writing to formally dispute charges totaling $${totalBilled.toLocaleString()}. I have identified ${findings.length} billing error${findings.length !== 1 ? "s" : ""} amounting to $${totalSavings.toLocaleString()} in incorrect or questionable charges.

DISPUTED CHARGES:

${itemizedComplaints}

I request a corrected bill and written response within 30 days.

Sincerely,
[YOUR NAME]
[YOUR CONTACT INFO]`;
}
