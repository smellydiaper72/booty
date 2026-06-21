export type ErrorType =
  | "duplicate_charge"
  | "upcoding"
  | "unbundling"
  | "never_administered"
  | "incorrect_code"
  | "out_of_network"
  | "itemization_error"
  | "facility_fee";

export interface Finding {
  id: string;
  error_type: ErrorType;
  line_item: string;
  charge_amount: number;
  expected_amount: number;
  savings: number;
  severity: "low" | "medium" | "high" | "critical";
  explanation: string;
  action_required: string;
}

export interface AnalysisResult {
  id: string;
  bill_type: string;
  provider_name: string;
  total_billed: number;
  total_errors_found: number;
  estimated_savings: number;
  findings: Finding[];
  dispute_letter: string;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Simulate AI analysis — in production this calls Claude/GPT with the extracted bill text
export function analyzeBill(input: {
  billText: string;
  billType: string;
  providerName: string;
  totalBilled: number;
}): AnalysisResult {
  const { billType, providerName, totalBilled } = input;

  // Deterministic mock findings based on bill total to simulate realistic variation
  const seed = totalBilled;
  const findings: Finding[] = [];

  if (seed > 500) {
    findings.push({
      id: uid(),
      error_type: "duplicate_charge",
      line_item: "Room & Board – Medical/Surgical (Rev. Code 0120)",
      charge_amount: 4200,
      expected_amount: 2100,
      savings: 2100,
      severity: "high",
      explanation:
        "This charge appears twice on your bill. Room & board was billed on both line 12 and line 34 for the same admission date. Duplicate billing is one of the most common hospital billing errors.",
      action_required:
        "Request an itemized bill and cite Revenue Code 0120 appearing twice on the same date of service.",
    });
  }

  if (seed > 1000) {
    findings.push({
      id: uid(),
      error_type: "upcoding",
      line_item: "Emergency Department Visit Level 5 (CPT 99285)",
      charge_amount: 1850,
      expected_amount: 780,
      savings: 1070,
      severity: "critical",
      explanation:
        "Your bill shows a Level 5 ED visit (the highest and most expensive complexity), but based on the documented services, a Level 3 (CPT 99283, ~$780) is more consistent with the care provided. Upcoding is a major source of medical billing fraud.",
      action_required:
        "Request the medical record and ask the billing department to justify Level 5 complexity. Cite OIG guidelines on E&M visit documentation.",
    });
  }

  if (seed > 2000) {
    findings.push({
      id: uid(),
      error_type: "never_administered",
      line_item: "Disposable Gloves (supply charge x48 pairs)",
      charge_amount: 240,
      expected_amount: 0,
      savings: 240,
      severity: "medium",
      explanation:
        "48 pairs of disposable gloves at $5 each. This is an inflated supply charge — typical hospital stays do not require documenting individual glove usage, and this item is typically bundled into room & board charges.",
      action_required:
        "Dispute under CMS bundling guidelines. Supply items like gloves should not be itemized separately when room & board is already billed.",
    });
  }

  if (seed > 3000) {
    findings.push({
      id: uid(),
      error_type: "unbundling",
      line_item: "Surgical Package – Arthroscopy + Separate Anesthesia Setup",
      charge_amount: 3100,
      expected_amount: 1900,
      savings: 1200,
      severity: "high",
      explanation:
        'Unbundling occurs when services that should be billed together as a package are split into individual charges. Your arthroscopy procedure (CPT 29881) should include anesthesia setup, but it has been billed separately under CPT 00400, adding $1,200 in unbundled charges.',
      action_required:
        "Cite CMS National Correct Coding Initiative (NCCI) edits that prohibit billing CPT 00400 separately from this surgical procedure.",
    });
  }

  if (seed > 5000) {
    findings.push({
      id: uid(),
      error_type: "facility_fee",
      line_item: "Facility Fee – Outpatient Clinic Visit",
      charge_amount: 890,
      expected_amount: 0,
      savings: 890,
      severity: "high",
      explanation:
        "A facility fee of $890 was charged for what was a routine outpatient visit at a clinic. Many patients are unaware these fees exist. Under new CMS transparency rules, you must be notified in advance of facility fees for outpatient visits at hospital-owned clinics.",
      action_required:
        "Ask whether you received the required Advance Notice of facility fees. If not, you have grounds to dispute under the No Surprises Act.",
    });
  }

  findings.push({
    id: uid(),
    error_type: "itemization_error",
    line_item: "Pharmacy – Acetaminophen 325mg (x12 doses)",
    charge_amount: 96,
    expected_amount: 3,
    savings: 93,
    severity: "medium",
    explanation:
      "Hospital billed $8 per dose of over-the-counter Tylenol — $96 total. The retail cost is approximately $0.25 per dose. While hospitals may charge a dispensing fee, $8/dose exceeds any reasonable markup. This is a common itemized billing inflation tactic.",
    action_required:
      "Request the hospital pharmacy's chargemaster rate for this item and dispute the markup. Ask for it to be reduced to cost + a reasonable dispensing fee.",
  });

  const totalSavings = findings.reduce((sum, f) => sum + f.savings, 0);

  return {
    id: uid(),
    bill_type: billType,
    provider_name: providerName || "Unknown Provider",
    total_billed: totalBilled,
    total_errors_found: findings.length,
    estimated_savings: totalSavings,
    findings,
    dispute_letter: generateDisputeLetter({
      providerName: providerName || "Unknown Provider",
      totalBilled,
      findings,
    }),
  };
}

function generateDisputeLetter(input: {
  providerName: string;
  totalBilled: number;
  findings: Finding[];
}): string {
  const { providerName, totalBilled, findings } = input;
  const totalSavings = findings.reduce((s, f) => s + f.savings, 0);
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemizedComplaints = findings
    .map(
      (f, i) =>
        `${i + 1}. **${f.line_item}** (${formatErrorType(f.error_type)})\n   Billed: $${f.charge_amount.toLocaleString()} | Expected: $${f.expected_amount.toLocaleString()} | Disputed amount: $${f.savings.toLocaleString()}\n   ${f.action_required}`
    )
    .join("\n\n");

  return `${today}

Patient Relations / Medical Billing Department
${providerName}
[Address]

RE: Formal Dispute of Medical Bill — Account #[YOUR ACCOUNT NUMBER]
    Date of Service: [DATE OF SERVICE]
    Patient Name: [YOUR FULL NAME]
    Date of Birth: [YOUR DOB]

To Whom It May Concern:

I am writing to formally dispute charges on my bill totaling $${totalBilled.toLocaleString()}. After a detailed review of my itemized bill, I have identified ${findings.length} billing error${findings.length !== 1 ? "s" : ""} amounting to $${totalSavings.toLocaleString()} in charges that appear to be incorrect, duplicated, or inconsistent with the care I received.

I request a corrected bill reflecting the adjustments below. This letter serves as formal notice of dispute under my rights as a patient under the No Surprises Act (Public Law 116-260), CMS billing guidelines, and applicable state law.

DISPUTED CHARGES:

${itemizedComplaints}

REQUESTED ACTIONS:

1. Provide a fully itemized bill with CPT codes, Revenue Codes, and unit prices for every charge.
2. Correct the above billing errors totaling $${totalSavings.toLocaleString()}.
3. Respond in writing within 30 days as required by [YOUR STATE] medical billing dispute statutes.
4. Place my account in dispute status and cease collection activity during review.

I am prepared to escalate this dispute to your state's medical billing board, the Centers for Medicare & Medicaid Services (CMS), and the Consumer Financial Protection Bureau (CFPB) if a satisfactory resolution is not reached.

Please direct your response to:
[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR EMAIL]

I look forward to resolving this matter promptly.

Sincerely,

[YOUR SIGNATURE]
[YOUR PRINTED NAME]

Enclosures:
- Copy of itemized bill received
- Copy of insurance Explanation of Benefits (EOB)
- Documentation of care received`;
}

function formatErrorType(type: ErrorType): string {
  const map: Record<ErrorType, string> = {
    duplicate_charge: "Duplicate Charge",
    upcoding: "Upcoding",
    unbundling: "Unbundling Violation",
    never_administered: "Never-Administered Item",
    incorrect_code: "Incorrect Billing Code",
    out_of_network: "Unexpected Out-of-Network",
    itemization_error: "Itemization Error / Price Inflation",
    facility_fee: "Undisclosed Facility Fee",
  };
  return map[type] ?? type;
}
