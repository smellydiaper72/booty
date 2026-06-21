import Link from "next/link";
import { Shield, CheckCircle2, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              MedBill<span className="text-blue-600">.ai</span>
            </span>
          </Link>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          You&apos;re all set!
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Your 7-day free trial of MedBill.ai Pro has started. You now have
          unlimited bill analyses, full dispute letters, and dispute tracking.
          We won&apos;t charge you until the trial ends, and you can cancel
          anytime.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Analyze your first bill
          <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="text-sm text-gray-400 mt-6">
          A receipt has been emailed to you by Stripe.
        </p>
      </div>
    </div>
  );
}
