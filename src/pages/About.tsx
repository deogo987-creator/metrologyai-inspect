import { Shield, ArrowDown, Zap, Eye, FileCheck, BarChart3, AlertTriangle, CheckCircle2, Database, Cpu, Scan, Brain } from "lucide-react";

const pipelineSteps = [
  { icon: Scan, label: "Product Image", desc: "Upload or capture product label" },
  { icon: Cpu, label: "Image Pre-processing", desc: "Enhance, crop, normalize" },
  { icon: Eye, label: "OCR / Vision Model", desc: "GPT-4o Vision text extraction" },
  { icon: Database, label: "Text Extraction", desc: "Structured field detection" },
  { icon: Brain, label: "Field Detection", desc: "Declaration identification" },
  { icon: Shield, label: "Rule Engine", desc: "Compliance validation" },
  { icon: BarChart3, label: "Compliance Analysis", desc: "Violation detection" },
  { icon: AlertTriangle, label: "Risk Score", desc: "AI Compliance Risk Score" },
  { icon: CheckCircle2, label: "Inspector Review", desc: "Human verification" },
  { icon: FileCheck, label: "Report", desc: "Digital inspection report" },
];

export default function About() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-gray-500">About</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">System Overview</h1>
      </div>

      {/* Live AI indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 w-fit">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Live AI Integration Active</span>
      </div>

      {/* Problem & Solution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 mb-4">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900">The Problem</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Manual label inspection for Legal Metrology compliance is time-consuming,
            inconsistent, and difficult to scale. Inspectors must manually verify dozens
            of mandatory declarations on every product, leading to human error and delays.
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500 mb-4">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Our Solution</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            MetrologyAI uses OpenAI GPT-4o Vision for real OCR and text extraction, combined with a
            configurable compliance rule engine. Inspectors upload a product label image and receive
            instant, explainable AI analysis with evidence, enabling faster and more consistent inspections.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Upload Label", desc: "Take a photo or upload an image of any product label. Supports JPG, PNG, and WEBP formats." },
            { step: "2", title: "AI Analysis", desc: "GPT-4o Vision reads every text region on the label, extracts declarations, and assigns confidence scores to each field." },
            { step: "3", title: "Compliance Results", desc: "The rule engine evaluates extracted data against 12 Legal Metrology rules, showing compliant, review-required, and non-compliant fields." },
          ].map((s) => (
            <div key={s.step} className="p-4 rounded-xl bg-white/40 border border-white/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-bold mb-3">
                {s.step}
              </div>
              <h3 className="text-sm font-bold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Benefits */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Key Benefits</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Real AI-powered OCR via GPT-4o Vision",
            "Structured digital evidence and audit trail",
            "Explainable AI — understand why each flag was raised",
            "Consistent rule-based validation across products",
            "Digital inspection records with downloadable reports",
            "Inspector can manually correct any extracted field",
          ].map((b) => (
            <div key={b} className="flex items-start gap-2 p-3 rounded-xl bg-white/40 border border-white/50">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-xs font-medium text-gray-700">{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Architecture Pipeline */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-900 mb-6">AI Architecture Pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {pipelineSteps.map((step, i) => (
            <div key={step.label} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
                <step.icon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-bold text-gray-900">{step.label}</p>
              <p className="mt-1 text-[10px] text-gray-500">{step.desc}</p>
              {i < pipelineSteps.length - 1 && (
                <div className="sm:hidden mt-2 text-gray-300 text-lg">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Technology</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "AI Vision", desc: "OpenAI GPT-4o — OCR, text extraction, field detection" },
            { label: "Compliance Engine", desc: "Rule-based validation against 12 Legal Metrology rules" },
            { label: "Backend", desc: "Convex serverless actions with real-time capabilities" },
            { label: "Frontend", desc: "React + TypeScript + Vite with Tailwind CSS" },
            { label: "Authentication", desc: "Convex Auth with role-based access control" },
            { label: "Explainable AI", desc: "Every violation includes why it was flagged and what to do" },
          ].map((s) => (
            <div key={s.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/40 border border-white/50">
              <Cpu className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-800">{s.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Trust */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Security & Trust</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Role-Based Access", desc: "Inspector authentication and authorization" },
            { label: "Audit Trail", desc: "Every inspection tracked with ID, timestamp, and inspector identity" },
            { label: "Evidence Preservation", desc: "Uploaded images and detection results preserved" },
            { label: "Manual Verification", desc: "AI assists — inspectors make final decisions" },
            { label: "Data Integrity", desc: "Inspection records are immutable once submitted" },
            { label: "AI Disclaimer", desc: "Clear labeling that AI is assistive, not a replacement" },
          ].map((s) => (
            <div key={s.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/40 border border-white/50">
              <Shield className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-800">{s.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-2xl p-5 flex items-start gap-3 border border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-bold text-gray-800">AI Assistance Disclaimer</p>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
            This system uses OpenAI GPT-4o Vision for real OCR and text extraction from product label images.
            The AI analyzes the uploaded image, extracts visible text, and evaluates it against Legal Metrology
            compliance rules. All scores and results are AI-generated assessments intended to assist, not replace,
            authorized inspector decisions. The AI may occasionally misread text or miss declarations due to image
            quality, font size, or label layout — always verify critical findings against the physical product.
          </p>
        </div>
      </div>
    </div>
  );
}
