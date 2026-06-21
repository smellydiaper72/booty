"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Download,
  Send,
  TrendingDown,
  DollarSign,
  FileText,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

interface Finding {
  id: string;
  error_type: string;
  line_item: string;
  charge_amount: number;
  expected_amount: number;
  savings: number;
  severity: string;
  explanation: string;
  action_required: string;
}

interface AnalysisResult {
  id: string;
  bill_type: string;
  provider_name: string;
  total_billed: number;
  total_errors_found: number;
  estimated_savings: number;
  findings: Finding[];
  dispute_letter: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

const ERROR_TYPE_LABEL: Record<string, string> = {
  duplicate_charge: "Duplicate Charge",
  upcoding: "Upcoding",
  unbundling: "Unbundling Violation",
  never_administered: "Never-Administered Item",
  incorrect_code: "Incorrect Billing Code",
  out_of_network: "Out-of-Network Surprise",
  itemization_error: "Price Inflation",
  facility_fee: "Undisclosed Facility Fee",
};

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"findings" | "letter">("findings");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`/api/analyses/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/analyze");
      });
  }, [id, router]);

  async function handleSendToDispute() {
    if (!result) return;
    setSending(true);
    await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysisId: result.id,
        letterContent: result.dispute_letter,
        providerName: result.provider_name,
        amountDisputed: result.estimated_savings,
      }),
    });
    setSending(false);
    setSent(true);
  }

  function copyLetter() {
    if (!result) return;
    navigator.clipboard.writeText(result.dispute_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadLetter() {
    if (!result) return;
    const blob = new Blob([result.dispute_letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medbill-dispute-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!result) return null;

  const savingsPct = Math.round((result.estimated_savings / result.total_billed) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              MedBill<span className="text-blue-600">.ai</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link
          href="/analyze"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Analyze another bill
        </Link>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wide">
                Analysis complete
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {result.provider_name}
              </h1>
              <p className="text-gray-500 capitalize">
                {result.bill_type?.replace(/_/g, " ")} · Total billed: $
                {result.total_billed.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">
                  {result.total_errors_found}
                </div>
                <div className="text-xs text-gray-500 mt-1">Errors found</div>
              </div>
              <div className="w-px bg-gray-100" />
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ${result.estimated_savings.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Potential savings ({savingsPct}%)
                </div>
              </div>
            </div>
          </div>

          {result.total_errors_found > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>
                  We found {result.total_errors_found} billing issue
                  {result.total_errors_found !== 1 ? "s" : ""}
                </strong>{" "}
                on your bill. A dispute letter has been generated below. Send it
                to {result.provider_name}&apos;s billing department to recover your
                money.
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("findings")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "findings"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Findings ({result.findings.length})
          </button>
          <button
            onClick={() => setActiveTab("letter")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "letter"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Dispute Letter
          </button>
        </div>

        {activeTab === "findings" && (
          <div className="space-y-4">
            {result.findings.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{f.line_item}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            SEVERITY_COLOR[f.severity] ?? ""
                          }`}
                        >
                          {f.severity?.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ERROR_TYPE_LABEL[f.error_type] ?? f.error_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm text-gray-500">
                      Billed: ${f.charge_amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Expected: ${f.expected_amount.toLocaleString()}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      Save ${f.savings.toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {f.explanation}
                </p>
                <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    <strong>Action:</strong> {f.action_required}
                  </p>
                </div>
              </div>
            ))}

            <div className="bg-green-50 rounded-2xl border border-green-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-bold text-green-900 text-lg">
                    Total potential savings
                  </div>
                  <div className="text-sm text-green-700">
                    {savingsPct}% of your total bill
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-green-700">
                ${result.estimated_savings.toLocaleString()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveTab("letter")}
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5" />
                View Dispute Letter
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                Track in Dashboard
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}

        {activeTab === "letter" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4" />
                  Medical Bill Dispute Letter
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyLetter}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={downloadLetter}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              </div>
              <pre className="p-6 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-[600px]">
                {result.dispute_letter}
              </pre>
            </div>

            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <h3 className="font-semibold text-blue-900 mb-2">
                Before you send this letter
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                {[
                  "Fill in your name, address, account number, and date of service in the [BRACKETS].",
                  "Attach a copy of your itemized bill and insurance EOB.",
                  "Send via certified mail with return receipt — keep your tracking number.",
                  "Keep a copy of everything you send.",
                  "The hospital must respond within 30 days in most states.",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleSendToDispute}
              disabled={sending || sent}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : sent ? (
                <CheckCircle className="h-5 w-5 text-green-300" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {sent
                ? "Saved to Dashboard"
                : sending
                ? "Saving..."
                : "Save Dispute to Dashboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
