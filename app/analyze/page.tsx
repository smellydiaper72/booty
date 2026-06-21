"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Upload,
  FileText,
  DollarSign,
  ChevronRight,
  Lock,
  Loader2,
  Building2,
  AlertCircle,
} from "lucide-react";

const BILL_TYPES = [
  { value: "hospital", label: "Hospital Bill" },
  { value: "er", label: "Emergency Room Bill" },
  { value: "clinic", label: "Clinic / Specialist Bill" },
  { value: "lab", label: "Lab / Radiology Bill" },
  { value: "insurance_eob", label: "Insurance EOB" },
  { value: "ambulance", label: "Ambulance Bill" },
  { value: "surgery", label: "Surgery Center Bill" },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "analyzing">("form");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    billType: "hospital",
    providerName: "",
    totalBilled: "",
    billText: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const total = parseFloat(form.totalBilled.replace(/[,$]/g, ""));
    if (isNaN(total) || total <= 0) {
      setError("Please enter a valid bill total.");
      return;
    }

    setStep("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billType: form.billType,
          providerName: form.providerName,
          totalBilled: total,
          billText: form.billText,
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      router.push(`/results/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("form");
    }
  }

  if (step === "analyzing") {
    return <AnalyzingScreen />;
  }

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

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Analyze your bill
          </h1>
          <p className="text-gray-500 text-lg">
            Tell us about your bill. We will find errors in minutes.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill type
              </label>
              <select
                value={form.billType}
                onChange={(e) => setForm({ ...form, billType: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {BILL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="inline h-4 w-4 mr-1" />
                Provider / Hospital name
              </label>
              <input
                type="text"
                value={form.providerName}
                onChange={(e) => setForm({ ...form, providerName: e.target.value })}
                placeholder="e.g. St. Mary's Medical Center"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Total amount billed
              </label>
              <input
                type="text"
                value={form.totalBilled}
                onChange={(e) => setForm({ ...form, totalBilled: e.target.value })}
                placeholder="e.g. 12,450.00"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Paste bill contents{" "}
                <span className="text-gray-400 font-normal">(optional but improves accuracy)</span>
              </label>
              <textarea
                value={form.billText}
                onChange={(e) => setForm({ ...form, billText: e.target.value })}
                rows={5}
                placeholder="Paste the text from your bill here. Include line items, CPT codes, dates of service, and any charges listed. The more detail you provide, the more accurate our analysis will be."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
              <Upload className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>PDF/photo upload coming soon.</strong> For now, paste
                your bill text above for the most accurate analysis.
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Analyze My Bill
              <ChevronRight className="h-5 w-5" />
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-400">
          <Lock className="h-4 w-4" />
          HIPAA-compliant · AES-256 encrypted · Data deleted in 24h
        </div>
      </div>
    </div>
  );
}

function AnalyzingScreen() {
  const steps = [
    "Parsing bill structure...",
    "Cross-referencing CPT codes...",
    "Checking for duplicate charges...",
    "Scanning for upcoding patterns...",
    "Reviewing NCCI bundling rules...",
    "Calculating potential savings...",
    "Generating dispute letter...",
  ];
  const [currentStep] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analyzing your bill...
        </h2>
        <p className="text-gray-500 mb-8">
          Our AI is reviewing every charge. This usually takes under 30 seconds.
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left space-y-3">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                i <= currentStep ? "text-gray-900" : "text-gray-300"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  i < currentStep
                    ? "bg-green-500"
                    : i === currentStep
                    ? "bg-blue-600 animate-pulse"
                    : "bg-gray-200"
                }`}
              />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
