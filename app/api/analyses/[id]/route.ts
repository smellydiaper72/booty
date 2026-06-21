import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const analysis = db
    .prepare("SELECT * FROM analyses WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const findings = db
    .prepare("SELECT * FROM findings WHERE analysis_id = ? ORDER BY savings DESC")
    .all(id);

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
        `${i + 1}. ${f.line_item}\n   Billed: $${f.charge_amount.toLocaleString()} | Expected: $${f.expected_amount.toLocaleString()} | Disputed: $${f.savings.toLocaleString()}\n   ${f.action_required}`
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
