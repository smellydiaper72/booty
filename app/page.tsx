"use client";

import Link from "next/link";
import {
  Shield,
  FileSearch,
  DollarSign,
  ChevronRight,
  CheckCircle,
  Star,
  TrendingDown,
  AlertTriangle,
  FileText,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats />
        <HowItWorks />
        <WhatWeCatch />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              MedBill<span className="text-blue-600">.ai</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </a>
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/analyze"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Analyze my bill
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full mb-6 font-medium">
          <AlertTriangle className="h-4 w-4" />
          80% of hospital bills contain errors
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Stop Overpaying
          <br />
          <span className="text-blue-600">Medical Bills</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Our AI analyzes your hospital and insurance bills in minutes, finds
          billing errors and overcharges, and generates professional dispute
          letters that actually get results.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/analyze"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            Analyze My Bill Free
            <ChevronRight className="h-5 w-5" />
          </Link>
          <a
            href="#how-it-works"
            className="bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200"
          >
            See how it works
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          No credit card required · First analysis free
        </p>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "$3,800", label: "Average savings found per bill" },
    { value: "80%", label: "Of hospital bills contain errors" },
    { value: "94%", label: "Dispute success rate with our letters" },
    { value: "12 min", label: "Average time to analyze your bill" },
  ];
  return (
    <section className="py-16 border-y border-gray-100 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      step: "1",
      title: "Upload your bill",
      desc: "Take a photo or upload a PDF of your hospital, clinic, or insurance EOB. We support all major formats.",
    },
    {
      icon: FileSearch,
      step: "2",
      title: "AI analyzes it",
      desc: "Our AI cross-references every charge against medical billing codes, fee schedules, and common fraud patterns.",
    },
    {
      icon: AlertTriangle,
      step: "3",
      title: "See what's wrong",
      desc: "Get a clear breakdown of every error, overcharge, duplicate, and upcoded procedure we found.",
    },
    {
      icon: FileText,
      step: "4",
      title: "Dispute with one click",
      desc: "Generate a professional dispute letter citing exact billing codes and regulations. Send it yourself or we'll guide you through the call.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            From bill to refund in 4 steps
          </h2>
          <p className="text-xl text-gray-500">No medical coding expertise required.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+2rem)] right-[-2rem] h-0.5 bg-blue-100 z-0" />
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                  <s.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
                  Step {s.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatWeCatch() {
  const errors = [
    {
      name: "Duplicate charges",
      desc: "Same procedure billed multiple times — happens in 30% of bills",
      saving: "Avg $400 saved",
    },
    {
      name: "Upcoding",
      desc: "Billing for a more expensive procedure than performed",
      saving: "Avg $1,200 saved",
    },
    {
      name: "Unbundling",
      desc: "Splitting a procedure into parts and charging for each separately",
      saving: "Avg $650 saved",
    },
    {
      name: "Never-administered items",
      desc: "Charges for supplies or services you never received",
      saving: "Avg $300 saved",
    },
    {
      name: "Incorrect patient info",
      desc: "Wrong diagnosis codes that affect what insurance pays",
      saving: "Avg $900 saved",
    },
    {
      name: "Out-of-network surprises",
      desc: "Identifying providers who should be covered but were not flagged",
      saving: "Avg $2,100 saved",
    },
  ];

  return (
    <section className="py-24 bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What our AI catches
          </h2>
          <p className="text-xl text-gray-500">
            Medical billing is intentionally complex. We know every trick.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {errors.map((e) => (
            <div
              key={e.name}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{e.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{e.desc}</p>
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                    {e.saving}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      name: "Sarah M.",
      role: "Nurse, Ohio",
      avatar: "SM",
      stars: 5,
      text: "MedBill found $4,200 in duplicate charges on my surgery bill. I'm a nurse and even I couldn't catch this — the AI spotted it in 8 minutes. The dispute letter worked on the first try.",
    },
    {
      name: "James T.",
      role: "Small business owner, Texas",
      avatar: "JT",
      stars: 5,
      text: "My wife's ER visit bill was $22,000. After MedBill analyzed it and I sent the dispute letter, the hospital settled for $9,400. Worth every penny of the subscription.",
    },
    {
      name: "Priya K.",
      role: "Software engineer, California",
      avatar: "PK",
      stars: 5,
      text: "I had three billing errors on my colonoscopy bill totaling $1,800. The letters MedBill generated were incredibly professional — they cited exact CPT codes and regulations. Hospital corrected all three.",
    },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Real people, real savings
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
            >
              <div className="flex mb-4">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                  {r.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      desc: "See what we find",
      features: [
        "1 bill analysis per month",
        "Summary of errors found",
        "Estimated savings amount",
        "Basic dispute checklist",
      ],
      cta: "Start free",
      href: "/analyze",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      desc: "Everything you need to fight back",
      features: [
        "Unlimited bill analyses",
        "Full AI-generated dispute letters",
        "Phone call scripts & talking points",
        "Dispute tracking dashboard",
        "Follow-up letter templates",
        "State-specific regulations included",
        "Email support",
      ],
      cta: "Start 7-day free trial",
      href: "/analyze?plan=pro",
      highlight: true,
    },
    {
      name: "Success Fee",
      price: "10%",
      period: " of savings",
      desc: "Pay only when you win",
      features: [
        "Everything in Pro",
        "No upfront cost",
        "We handle the dispute for you",
        "Dedicated billing advocate",
        "Direct hospital negotiation",
        "Guaranteed results or free",
      ],
      cta: "Talk to an advocate",
      href: "/advocate",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-500">
            Most users save 20-100x the cost of a Pro subscription on their first bill.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 border ${
                p.highlight
                  ? "bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-200 scale-105"
                  : "bg-white border-gray-100 shadow-sm"
              }`}
            >
              <div
                className={`text-sm font-bold uppercase tracking-wide mb-2 ${
                  p.highlight ? "text-blue-200" : "text-blue-600"
                }`}
              >
                {p.name}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className={`text-4xl font-bold ${p.highlight ? "text-white" : "text-gray-900"}`}
                >
                  {p.price}
                </span>
                <span className={`text-sm ${p.highlight ? "text-blue-200" : "text-gray-500"}`}>
                  {p.period}
                </span>
              </div>
              <p className={`text-sm mb-6 ${p.highlight ? "text-blue-100" : "text-gray-500"}`}>
                {p.desc}
              </p>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle
                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        p.highlight ? "text-blue-200" : "text-green-500"
                      }`}
                    />
                    <span className={p.highlight ? "text-blue-50" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  p.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Is my medical information safe?",
      a: "Yes. We use bank-level AES-256 encryption. Your bills are analyzed and then deleted from our servers within 24 hours. We are HIPAA-compliant and never sell your data.",
    },
    {
      q: "What types of bills can you analyze?",
      a: "Hospital bills, clinic bills, specialist bills, lab bills, insurance Explanation of Benefits (EOB) statements, and ambulance bills. We support PDF, JPG, PNG, and HEIC formats.",
    },
    {
      q: "What if the hospital refuses to fix the errors?",
      a: "We provide escalation letter templates, state medical billing board complaint templates, and guidance on filing with the No Surprises Act arbitration process. Our Pro members have a 94% success rate.",
    },
    {
      q: "Do I need to know anything about medical billing?",
      a: "Not at all. Our AI translates every medical code and charge into plain English. We tell you exactly what each line item means and whether the price is reasonable.",
    },
    {
      q: "How is this different from calling the hospital myself?",
      a: "Hospital billing departments are trained to deflect complaints. Our dispute letters cite specific regulations, billing codes, and precedents that force them to respond. You go in with professional documentation instead of a personal complaint.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
        </div>
        <div className="space-y-6">
          {faqs.map((f) => (
            <div key={f.q} className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{f.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 bg-blue-600 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <DollarSign className="h-16 w-16 text-blue-200 mx-auto mb-6" />
        <h2 className="text-4xl font-bold text-white mb-4">
          Your first analysis is free
        </h2>
        <p className="text-blue-100 text-xl mb-8">
          Upload your bill now. Most people find errors within minutes.
        </p>
        <Link
          href="/analyze"
          className="bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
        >
          Analyze My Bill Now
          <ChevronRight className="h-5 w-5" />
        </Link>
        <p className="text-blue-200 text-sm mt-4">No account required to start</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-white font-bold">
              MedBill<span className="text-blue-400">.ai</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">HIPAA</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-sm">© 2026 MedBill.ai · Not a substitute for legal advice</div>
        </div>
      </div>
    </footer>
  );
}
