import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { dashboardStats, demoProducts } from "@/lib/demo-data";
import type { InspectionStatus } from "@/lib/types";
import {
  LayoutDashboard,
  Search,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";

const statusColors: Record<InspectionStatus, string> = {
  compliant: "text-green-600 bg-green-50 border-green-200",
  "non-compliant": "text-red-600 bg-red-50 border-red-200",
  "review-required": "text-amber-600 bg-amber-50 border-amber-200",
  pending: "text-blue-600 bg-blue-50 border-blue-200",
};

const statusLabels: Record<InspectionStatus, string> = {
  compliant: "Compliant",
  "non-compliant": "Non-Compliant",
  "review-required": "Review Required",
  pending: "Pending",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const statCards = [
    { label: "Total Inspections", value: dashboardStats.totalInspections.toLocaleString(), icon: LayoutDashboard, color: "from-blue-500 to-indigo-500", shadow: "shadow-blue-500/20" },
    { label: "Compliant", value: dashboardStats.compliant.toLocaleString(), icon: CheckCircle2, color: "from-green-500 to-emerald-500", shadow: "shadow-green-500/20" },
    { label: "Non-Compliant", value: dashboardStats.nonCompliant.toLocaleString(), icon: XCircle, color: "from-red-500 to-rose-500", shadow: "shadow-red-500/20" },
    { label: "Pending Review", value: dashboardStats.pendingReview.toLocaleString(), icon: AlertTriangle, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Welcome back</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {user?.name ? `Inspector ${user.name}` : "Inspector Dashboard"}
          </h1>
        </div>
        <button              onClick={() => navigate("/dashboard/new-inspection")}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 self-start"
        >
          <Search className="h-4 w-4" />
          New Inspection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
                <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">{card.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg ${card.shadow}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Avg compliance + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Average Score */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Compliance Score</p>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {dashboardStats.avgCompliance}%
            </span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
              style={{ width: `${dashboardStats.avgCompliance}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-gray-400">Demo Data — Aug 2026</p>
        </div>

        {/* Quick actions */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Search, label: "New Inspection", to: "/dashboard/new-inspection", color: "from-blue-500 to-indigo-500" },
              { icon: History, label: "View History", to: "/dashboard/history", color: "from-violet-500 to-purple-500" },
              { icon: Shield, label: "Compliance Rules", to: "/dashboard/rules", color: "from-emerald-500 to-green-500" },
            ].map((action) => (
              <button
                key={action.to}
                onClick={() => navigate(action.to)}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/50 border border-white/60 hover:bg-white/70 transition-all text-left group"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md shrink-0`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{action.label}</p>
                </div>
                <ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-blue-500 ml-auto transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Demo Inspection Products</h2>
          </div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Demo Data</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {demoProducts.map((product, i) => {
            const result = product.result;
            const colors: Record<string, string> = {
              compliant: "from-green-500/10 to-emerald-500/10 border-green-200/60",
              "non-compliant": "from-red-500/10 to-rose-500/10 border-red-200/60",
              "review-required": "from-amber-500/10 to-orange-500/10 border-amber-200/60",
              pending: "from-blue-500/10 to-indigo-500/10 border-blue-200/60",
            };
            return (
              <button
                key={i}
                onClick={() => navigate("/dashboard/new-inspection", { state: { demoIndex: i } })}
                className={`text-left rounded-2xl p-5 bg-gradient-to-br ${colors[result.status]} border hover:shadow-lg transition-all group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[result.status]}`}>
                    {result.status === "compliant" && <CheckCircle2 className="h-3 w-3" />}
                    {result.status === "non-compliant" && <XCircle className="h-3 w-3" />}
                    {result.status === "review-required" && <AlertTriangle className="h-3 w-3" />}
                    {statusLabels[result.status]}
                  </span>
                  <span className="text-2xl font-extrabold text-gray-900">{result.score}</span>
                </div>
                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {product.name.split(" — ")[0]}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {product.name.split(" — ")[1]}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-blue-600">
                  <Clock className="h-3 w-3" />
                  Click to run demo inspection
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-gray-700">AI Assistance Disclaimer</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            This system assists inspectors with AI-powered label analysis. Final verification and enforcement decisions remain with the authorized inspector. All data shown is for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
