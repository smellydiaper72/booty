"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Plus,
  BarChart3,
  DollarSign,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface Dispute {
  id: string;
  analysis_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  provider_name: string;
  amount_disputed: number;
  amount_recovered: number;
  notes: string;
  bill_provider: string;
  total_billed: number;
  estimated_savings: number;
}

interface Analysis {
  id: string;
  created_at: string;
  bill_type: string;
  provider_name: string;
  total_billed: number;
  total_errors_found: number;
  estimated_savings: number;
  status: string;
  finding_count: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  draft: { label: "Draft", color: "text-gray-500 bg-gray-100", icon: FileText },
  sent: {
    label: "Sent",
    color: "text-blue-700 bg-blue-100",
    icon: Clock,
  },
  in_review: {
    label: "Under Review",
    color: "text-yellow-700 bg-yellow-100",
    icon: AlertCircle,
  },
  won: {
    label: "Won",
    color: "text-green-700 bg-green-100",
    icon: CheckCircle2,
  },
  lost: {
    label: "Denied",
    color: "text-red-700 bg-red-100",
    icon: XCircle,
  },
  escalated: {
    label: "Escalated",
    color: "text-purple-700 bg-purple-100",
    icon: TrendingUp,
  },
};

export default function DashboardPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "disputes" | "analyses">("overview");

  useEffect(() => {
    fetch("/api/disputes")
      .then((r) => r.json())
      .then(setDisputes)
      .catch(() => {});
    fetch("/api/analyses")
      .then((r) => r.json())
      .then(setAnalyses)
      .catch(() => {});
  }, []);

  const totalDisputed = disputes.reduce((s, d) => s + d.amount_disputed, 0);
  const totalRecovered = disputes.reduce((s, d) => s + d.amount_recovered, 0);
  const wonCount = disputes.filter((d) => d.status === "won").length;
  const pendingCount = disputes.filter(
    (d) => d.status === "sent" || d.status === "in_review"
  ).length;

  async function updateDisputeStatus(id: string, status: string, recovered?: number) {
    await fetch("/api/disputes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, amountRecovered: recovered ?? 0 }),
    });
    const updated = await fetch("/api/disputes").then((r) => r.json());
    setDisputes(updated);
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
          <Link
            href="/analyze"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New analysis
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500">Track your medical bill disputes and savings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: BarChart3,
              label: "Bills analyzed",
              value: analyses.length,
              color: "text-blue-600 bg-blue-50",
            },
            {
              icon: DollarSign,
              label: "Total disputed",
              value: `$${totalDisputed.toLocaleString()}`,
              color: "text-orange-600 bg-orange-50",
            },
            {
              icon: TrendingUp,
              label: "Recovered",
              value: `$${totalRecovered.toLocaleString()}`,
              color: "text-green-600 bg-green-50",
            },
            {
              icon: CheckCircle2,
              label: "Disputes won",
              value: wonCount,
              color: "text-purple-600 bg-purple-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {(["overview", "disputes", "analyses"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {analyses.length === 0 && disputes.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {pendingCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
                    <Clock className="h-8 w-8 text-amber-600 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-amber-900">
                        {pendingCount} dispute{pendingCount !== 1 ? "s" : ""} awaiting response
                      </div>
                      <div className="text-sm text-amber-700">
                        Hospitals typically respond within 30 days. Follow up if
                        you have not heard back.
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent analyses
                  </h2>
                  {analyses.slice(0, 5).map((a) => (
                    <AnalysisRow key={a.id} analysis={a} />
                  ))}
                </div>

                {disputes.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Active disputes
                    </h2>
                    {disputes.slice(0, 5).map((d) => (
                      <DisputeRow
                        key={d.id}
                        dispute={d}
                        onStatusChange={updateDisputeStatus}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "disputes" && (
          <div className="space-y-3">
            {disputes.length === 0 ? (
              <EmptyState />
            ) : (
              disputes.map((d) => (
                <DisputeRow
                  key={d.id}
                  dispute={d}
                  onStatusChange={updateDisputeStatus}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "analyses" && (
          <div className="space-y-3">
            {analyses.length === 0 ? (
              <EmptyState />
            ) : (
              analyses.map((a) => <AnalysisRow key={a.id} analysis={a} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisRow({ analysis: a }: { analysis: Analysis }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">
            {a.provider_name || "Unknown Provider"}
          </div>
          <div className="text-sm text-gray-500">
            {a.bill_type?.replace(/_/g, " ")} ·{" "}
            {new Date(a.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            ${a.total_billed?.toLocaleString()}
          </div>
          <div className="text-gray-400 text-xs">Billed</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-red-500">{a.total_errors_found}</div>
          <div className="text-gray-400 text-xs">Errors</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-green-600">
            ${a.estimated_savings?.toLocaleString()}
          </div>
          <div className="text-gray-400 text-xs">Potential savings</div>
        </div>
        <Link
          href={`/results/${a.id}`}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
        >
          View
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function DisputeRow({
  dispute: d,
  onStatusChange,
}: {
  dispute: Dispute;
  onStatusChange: (id: string, status: string, recovered?: number) => void;
}) {
  const cfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.sent;
  const StatusIcon = cfg.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <StatusIcon className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{d.provider_name}</div>
            <div className="text-sm text-gray-500">
              Sent {new Date(d.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}
          >
            {cfg.label}
          </span>
          <div className="text-sm text-gray-700">
            Disputed:{" "}
            <span className="font-semibold">${d.amount_disputed?.toLocaleString()}</span>
          </div>
          {d.amount_recovered > 0 && (
            <div className="text-sm text-green-700 font-semibold">
              Recovered: ${d.amount_recovered.toLocaleString()}
            </div>
          )}
          <select
            value={d.status}
            onChange={(e) => {
              const newStatus = e.target.value;
              const recovered =
                newStatus === "won" ? d.amount_disputed : d.amount_recovered;
              onStatusChange(d.id, newStatus, recovered);
            }}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="sent">Sent</option>
            <option value="in_review">Under Review</option>
            <option value="won">Won</option>
            <option value="lost">Denied</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FileText className="h-8 w-8 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No activity yet</h3>
      <p className="text-gray-500 mb-6">
        Upload your first medical bill to see your analysis and dispute tracking here.
      </p>
      <Link
        href="/analyze"
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Analyze your first bill
      </Link>
    </div>
  );
}
