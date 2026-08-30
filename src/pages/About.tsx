import { Shield, Sparkles, CheckCircle2, Globe, Eye, Camera, AlertTriangle, GitBranch, ShieldCheck, BarChart3, FileText, Search, Zap, RefreshCw, MessageSquare, Target, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

const features = [
  { icon: GitBranch, title: "AI Evidence Chain", desc: "Every finding traces back through: Image → Region → OCR → Field → Rule → Validation → Finding", tier: "Core" },
  { icon: Eye, title: "Multi-View Analysis", desc: "Upload Front, Back, Left, Right, Top, Bottom views — AI merges all into one unified inspection", tier: "Core" },
  { icon: Target, title: "Missing vs Unreadable", desc: "Distinguishes between Detected, Uncertain, Not Detected, and Image Insufficient", tier: "Core" },
  { icon: Camera, title: "Adaptive Recapture", desc: "Detects blur, glare, low-light and recommends specific recapture instructions", tier: "Core" },
  { icon: Globe, title: "E-Commerce Comparison", desc: "Compare physical package against online listing for MRP, quantity, manufacturer discrepancies", tier: "Core" },
  { icon: RefreshCw, title: "Smart Revalidation", desc: "After inspector corrections, automatically re-runs affected compliance rules", tier: "Core" },
  { icon: ShieldCheck, title: "Risk Prioritization", desc: "Transparent AI risk scoring with factor breakdown — not legal classification", tier: "Core" },
  { icon: MessageSquare, title: "Human-in-the-Loop", desc: "Inspector can correct AI values, with full audit trail of changes", tier: "Core" },
  { icon: AlertTriangle, title: "Label Anomaly Detection", desc: "Experimental: detects sticker overlays, covered text, typography inconsistencies", tier: "Advanced" },
  { icon: BarChart3, title: "AI vs Inspector Analytics", desc: "Correction rates, confidence distribution, recapture success metrics", tier: "Analytics" },
  { icon: Search, title: "Smart Inspector Search", desc: "Natural-language search: \"high risk inspections\", \"MRP discrepancies\"", tier: "Search" },
  { icon: FileText, title: "Evidence-First Reports", desc: "PDF export with finding → evidence → rule → confidence → decision chain", tier: "Reports" },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">MetrologyAI</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
            AI-Assisted Legal Metrology Label Compliance Inspection System
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
            <span className="text-[10px] font-bold text-blue-600">SIH PS26034</span>
            <span className="text-[10px] text-gray-400">•</span>
            <span className="text-[10px] text-gray-500">Smart India Hackathon 2026</span>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Problem Statement PS26034</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            <strong>AI-Assisted Legal Metrology Label Compliance Inspection System</strong>
          </p>
          <p>
            Legal Metrology regulations in India mandate specific declarations on all packaged commodities:
            product name, manufacturer details, net quantity, MRP, consumer care information, date of
            manufacturing/expiry, country of origin, batch number, and more.
          </p>
          <p>
            Current manual inspection processes are time-consuming, inconsistent, and prone to human error.
            Field inspectors must physically verify each declaration against regulatory requirements —
            a process that doesn't scale.
          </p>
          <p className="font-medium text-gray-800">
            MetrologyAI uses AI-powered computer vision to automate label compliance inspection while
            keeping the human inspector in control of every decision.
          </p>
        </div>
      </div>

      {/* Our Approach */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Our Approach — Beyond OCR</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          MetrologyAI is NOT just an OCR-based label checker. It is an explainable, human-in-the-loop
          inspection intelligence platform.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Understands multiple product views",
            "Distinguishes missing from unreadable",
            "Guides inspectors during image capture",
            "Validates configurable regulatory rules",
            "Compares physical and digital product info",
            "Prioritizes inspection risk",
            "Preserves evidence for audit",
            "Keeps inspector in final control",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-bold text-gray-900">20 Unique Features</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 shrink-0">
                  <f.icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-900">{f.title}</p>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-bold">{f.tier}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Technology Stack</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Gemini AI", desc: "Vision & OCR" },
            { name: "Convex", desc: "Backend & DB" },
            { name: "React + TS", desc: "Frontend" },
            { name: "Tailwind CSS", desc: "Styling" },
          ].map((t) => (
            <div key={t.name} className="p-3 rounded-xl bg-white/40 border border-white/50 text-center">
              <p className="text-xs font-bold text-gray-900">{t.name}</p>
              <p className="text-[10px] text-gray-500">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-2xl p-5 border border-amber-200 bg-amber-50/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 leading-relaxed">
            <p className="font-bold mb-1">Prototype Disclaimer</p>
            <p>
              This is a hackathon prototype demonstrating AI-assisted inspection capabilities.
              It is NOT an official government tool and should NOT be used as a substitute for
              actual Legal Metrology compliance verification. All AI-generated results require
              human verification.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-8">
        <button
          onClick={() => navigate("/dashboard/new-inspection?demo=true")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all"
        >
          Try Demo Mode
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
