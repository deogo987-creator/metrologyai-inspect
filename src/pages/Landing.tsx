import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Shield,
  Scan,
  FileCheck,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Eye,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "AI-Powered OCR",
    description: "Upload a product label image and our AI extracts all mandatory declarations instantly using advanced OCR.",
  },
  {
    icon: FileCheck,
    title: "Compliance Validation",
    description: "Automatically cross-reference extracted data against Legal Metrology rules with explainable results.",
  },
  {
    icon: BarChart3,
    title: "Risk Scoring",
    description: "Get a clear AI Compliance Risk Score with category-wise breakdown for every inspected product.",
  },
  {
    icon: Eye,
    title: "Evidence-Based",
    description: "Every detection includes bounding boxes, confidence scores, and evidence for inspector review.",
  },
];

const stats = [
  { value: "3x", label: "Faster Inspections" },
  { value: "94%", label: "Detection Accuracy" },
  { value: "100%", label: "Explainable AI" },
  { value: "0", label: "False Certifications" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Nav */}
      <nav className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900">MetrologyAI</span>
              <span className="hidden sm:inline text-xs text-gray-500 ml-2">by Legal Metrology Division</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-white/50"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 sm:py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-semibold text-blue-700 mb-6">
                <Zap className="h-3.5 w-3.5" />
                Smart India Hackathon 2026 — PS26034
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
            >
              AI-Assisted Legal Metrology{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Label Compliance
              </span>{" "}
              Inspection
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Upload a product label. Let AI extract declarations, validate
              compliance, flag violations — and generate inspection reports in
              seconds, not hours.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => navigate("/dashboard")}
                className="group px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 flex items-center gap-2"
              >
                Start Inspection
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3.5 text-base font-semibold text-gray-700 glass-card rounded-2xl hover:bg-white/70 transition-all"
              >
                View Demo
              </button>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 sm:mt-20 glass-card rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              A complete AI-assisted workflow from image upload to compliance report.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-base font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              AI Processing Pipeline
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              From label image to compliance verdict in seconds.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { step: "1", label: "Image Upload", sub: "Capture or upload label" },
                { step: "2", label: "OCR Analysis", sub: "AI text extraction" },
                { step: "3", label: "Field Detection", sub: "Extract declarations" },
                { step: "4", label: "Rule Validation", sub: "Compliance check" },
                { step: "5", label: "Report", sub: "Score & violations" },
              ].map((item, i) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20">
                    {item.step}
                  </div>
                  <p className="mt-3 text-sm font-bold text-gray-900">{item.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.sub}</p>
                  {i < 4 && (
                    <div className="hidden sm:block mt-2 text-gray-300">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Built for Inspectors,
                <br />
                Trusted by the System
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                MetrologyAI assists inspectors — it does not replace official enforcement
                decisions. Every result is explainable, auditable, and backed by evidence.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Faster inspection with AI-assisted extraction",
                  "Structured digital evidence and audit trail",
                  "Explainable AI — understand why each flag was raised",
                  "Consistent rule-based validation across products",
                  "Digital inspection records with downloadable reports",
                  "Reduced manual effort and documentation overhead",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-3xl p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50/70 border border-green-200/60">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-green-800">COMPLIANT — Score 94/100</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold text-amber-800">REVIEW REQUIRED — Score 72/100</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50/70 border border-red-200/60">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-red-800">NON-COMPLIANT — Score 43/100</span>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-green-50/70 border border-green-200/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Live AI Integration</span>
                </div>
                <p className="text-xs text-green-700 leading-relaxed">
                  Powered by Google Gemini 2.5 Flash — real OCR, real compliance analysis, real results on every inspection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card rounded-3xl p-10 sm:p-14">
            <Star className="h-10 w-10 text-amber-400 mx-auto" />
            <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Ready to Inspect?
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Log in as an inspector to start an AI-assisted compliance check. The full demo takes under 3 minutes.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-8 group px-10 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 inline-flex items-center gap-2"
            >
              Launch MetrologyAI
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-gray-400">
            © 2026 MetrologyAI — AI-Assisted Legal Metrology Inspection System • Smart India Hackathon PS26034
          </p>
          <p className="mt-1 text-[10px] text-gray-400">
            This is a prototype for demonstration purposes. Not for production enforcement use.
          </p>
        </div>
      </footer>
    </div>
  );
}
