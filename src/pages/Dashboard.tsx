import { useNavigate } from "react-router";
import type { InspectionStatus } from "@/lib/types";
import {
  LayoutDashboard,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Welcome back</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
  Inspector's Dashboard
          </h1>
        </div>
        <button
          onClick={() => navigate("/dashboard/new-inspection")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
        >
          <Zap className="h-4 w-4" />
          New Inspection
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/dashboard/new-inspection")}
          className="glass-card rounded-2xl p-5 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">New Inspection</h3>
              <p className="text-[11px] text-gray-500">Upload a product label for AI analysis</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/dashboard/history")}
          className="glass-card rounded-2xl p-5 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Inspection History</h3>
              <p className="text-[11px] text-gray-500">View past inspections and reports</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/dashboard/rules")}
          className="glass-card rounded-2xl p-5 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Compliance Rules</h3>
              <p className="text-[11px] text-gray-500">12 active Legal Metrology rules</p>
            </div>
          </div>
        </button>
      </div>

      {/* Info banner */}
      <div className="glass-card rounded-2xl p-5 border border-blue-200/50 bg-blue-50/30">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Get Started</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Upload a product label image to begin a real AI-powered compliance inspection. The system uses OpenAI GPT-4o Vision to extract text from labels and evaluate them against Legal Metrology rules.
            </p>
            <button
              onClick={() => navigate("/dashboard/new-inspection")}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Start your first inspection
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
