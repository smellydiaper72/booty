import Anthropic from "@anthropic-ai/sdk";

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

interface RawFinding {
  error_type: string;
  line_item: string;
  charge_amount: number;
  expected_amount: number;
  savings: number;
  severity: string;
  explanation: string;
  action_required: string;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a medical billing expert and patient advocate with deep knowledge of CPT codes, Revenue codes, NCCI bundling rules, and common billing fraud patterns.

Your job is to analyze a patient's medical bill and identify real billing errors, overcharges, and disputable items. Look for:
- Duplicate charges (same service billed twice)
- Upcoding (billing a higher-complexity code than warranted)
- Unbundling violations (splitting services that should be bundled per NCCI edits)
- Never-administered items (charges for services/supplies not actually provided)
- Incorrect billing codes (wrong CPT/ICD code applied)
- Out-of-network surprise charges (provider billed out-of-network without notice)
- Itemization errors / price inflation (charges grossly exceeding normal rates, e.g. $8 Tylenol)
- Undisclosed facility fees

Be specific and realistic — only flag genuine issues. If no bill text is provided, identify 2-4 of the most statistically common errors for this bill type and total amount, citing typical rates from CMS data. Return 1-6 findings maximum.

For each finding:
- charge_amount: amount billed (extract from bill text or estimate based on typical rates)
- expected_amount: what the charge should reasonably be (0 if the charge should not exist at all)
- savings: charge_amount minus expected_amount (always a positive number)`;

export async function analyzeBill(input: {
  billText: string;
  billType: string;
  providerName: string;
  totalBilled: number;
}): Promise<AnalysisResult> {
  const { billText, billType, providerName, totalBilled } = input;

  const userMessage = `Please analyze this medical bill for errors and billing issues:

Bill Type: ${billType.replace(/_/g, " ")}
Provider: ${providerName || "Unknown"}
Total Billed: $${totalBilled.toLocaleString()}

${billText ? `Bill Contents:\n${billText}` : "(No bill text provided — identify the most common billing errors for this bill type and amount based on CMS data and known industry patterns)"}`;

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    tools: [
      {
        name: "submit_findings",
        description: "Submit the complete list of billing errors found in the medical bill",
        input_schema: {
          type: "object" as const,
          properties: {
            findings: {
              type: "array",
              description:
                "List of billing errors found. Return an empty array if no issues are found.",
              items: {
                type: "object",
                properties: {
                  error_type: {
                    type: "string",
                    enum: [
                      "duplicate_charge",
                      "upcoding",
                      "unbundling",
                      "never_administered",
                      "incorrect_code",
                      "out_of_network",
                      "itemization_error",
                      "facility_fee",
                    ],
                  },
                  line_item: {
                    type: "string",
                    description: "Name of the charge or line item as it appears on the bill",
                  },
                  charge_amount: {
                    type: "number",
                    description: "Dollar amount that was billed",
                  },
                  expected_amount: {
                    type: "number",
                    description:
                      "Dollar amount that should have been charged (use 0 if the charge should not exist at all)",
                  },
                  savings: {
                    type: "number",
                    description: "charge_amount minus expected_amount — always a positive number",
                  },
                  severity: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                  },
                  explanation: {
                    type: "string",
                    description:
                      "Clear, plain-English explanation for the patient of why this charge is wrong",
                  },
                  action_required: {
                    type: "string",
                    description:
                      "Specific action the patient should take to dispute this charge, including any relevant codes or regulations to cite",
                  },
                },
                required: [
                  "error_type",
                  "line_item",
                  "charge_amount",
                  "expected_amount",
                  "savings",
                  "severity",
                  "explanation",
                  "action_required",
                ],
              },
            },
          },
          required: ["findings"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_findings" },
  });

  const response = await stream.finalMessage();

  const toolUseBlock = response.content.find((b) => b.type === "tool_use");
  const rawFindings: RawFinding[] =
    toolUseBlock && "input" in toolUseBlock
      ? (toolUseBlock.input as { findings: RawFinding[] }).findings ?? []
      : [];

  const findings: Finding[] = rawFindings.map((f) => ({
    id: uid(),
    error_type: f.error_type as ErrorType,
    line_item: f.line_item,
    charge_amount: f.charge_amount,
    expected_amount: f.expected_amount,
    savings: f.savings,
    severity: f.severity as Finding["severity"],
    explanation: f.explanation,
    action_required: f.action_required,
  }));

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
