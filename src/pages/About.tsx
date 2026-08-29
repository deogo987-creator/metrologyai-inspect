import { Shield, ArrowDown, Zap, Eye, FileCheck, BarChart3, AlertTriangle, CheckCircle2, Database, Cpu, Scan, Brain } from "lucide-react";

const pipelineSteps = [
  { icon: Scan, label: "Product Image", desc: "Upload or capture product label" },
  { icon: Cpu, label: "Image Pre-processing", desc: "Enhance, crop, normalize" },
  { icon: Eye, label: "OCR / Vision Model", desc: "AI text extraction" },
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
            MetrologyAI assists inspectors by combining computer vision, OCR, structured field
            extraction, and configurable compliance rules. It provides explainable AI results
            with evidence, enabling faster and more consistent inspections.
          </p>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Key Benefits</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Faster inspection with AI-assisted extraction",
            "Structured digital evidence and audit trail",
            "Explainable AI — understand why each flag was raised",
            "Consistent rule-based validation across products",
            "Digital inspection records with downloadable reports",
            "Reduced manual effort and documentation overhead",
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
          <p className="text-xs font-bold text-gray-800">Prototype Disclaimer</p>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
            This is a prototype/MVP for Smart India Hackathon 2026 (PS26034). The system currently
            operates in Demo Simulation Mode with realistic sample data. The AI/OCR pipeline is
            structured to support live integration when API credentials are provided. This system
            does not claim to be a production enforcement tool. All scores and results are AI-generated
            assessments intended to assist, not replace, authorized inspector decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
