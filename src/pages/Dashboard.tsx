import { useNavigate } from "react-router";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  LayoutDashboard,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  ArrowRight,
  Zap,
  Clock,
  TrendingUp,
  BarChart3,
  FileText,
  History,
  Filter,
  Play,
  Sparkles,
  TrendingDown,
  Globe,
} from "lucide-react";

const searchIntents = [
  { query: "high risk inspections", filter: "riskLevel", value: "high" },
  { query: "MRP discrepancies", filter: "field", value: "mrp" },
  { query: "inspections requiring review", filter: "status", value: "review-required" },
  { query: "non-compliant products", filter: "status", value: "non-compliant" },
  { query: "low OCR confidence", filter: "confidence", value: "low" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  // Keyboard shortcuts
  const shortcuts = useMemo(() => ({
    "ctrl+n": () => navigate("/dashboard/new-inspection"),
    "ctrl+d": () => navigate("/dashboard/new-inspection?demo=true"),
    "1": () => navigate("/dashboard"),
    "2": () => navigate("/dashboard/new-inspection"),
    "3": () => navigate("/dashboard/history"),
    "4": () => navigate("/dashboard/analytics"),
    "5": () => navigate("/dashboard/rules"),
  }), [navigate]);
  useKeyboardShortcuts(shortcuts);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [inspectorName, setInspectorName] = useState("Inspector");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("metrology-inspector");
        if (stored) {
          const info = JSON.parse(stored);
          setInspectorName(info.name || "Inspector");
        }
      } catch {}
    }
  }, []);

  const stats = useQuery(api.inspections.getStats);
  const recentInspections = useQuery(api.inspections.getRecent, { limit: 5 });
  const searchResults = useQuery(
    api.inspections.search,
    searchQuery.trim() ? { query: searchQuery } : "skip"
  );

  const displayStats = useMemo(() => {
    if (stats) {
      return {
        total: stats.total,
        compliant: stats.compliant,
        nonCompliant: stats.nonCompliant,
        reviewRequired: stats.reviewRequired,
        avgScore: stats.avgScore,
        highRisk: stats.highRisk,
        mediumRisk: stats.mediumRisk,
        lowRisk: stats.lowRisk,
        isReal: true,
      };
    }
    return {
      total: 0, compliant: 0, nonCompliant: 0, reviewRequired: 0,
      avgScore: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0,
      isReal: false,
    };
  }, [stats]);

  const matchedIntent = searchIntents.find((intent) =>
    searchQuery.toLowerCase().includes(intent.query)
  );

  const statusConfig: Record<string, { bg: string; color: string }> = {
    compliant: { bg: "bg-green-50", color: "text-green-700" },
    "non-compliant": { bg: "bg-red-50", color: "text-red-700" },
    "review-required": { bg: "bg-amber-50", color: "text-amber-700" },
  };

  const riskConfig: Record<string, { bg: string; color: string }> = {
    low: { bg: "bg-green-50", color: "text-green-600" },
    medium: { bg: "bg-amber-50", color: "text-amber-600" },
    high: { bg: "bg-red-50", color: "text-red-600" },
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500">Welcome back, {inspectorName}</p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
            Inspector's Dashboard
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/dashboard/new-inspection?demo=true")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Demo Mode</span>
            <span className="sm:hidden">Demo</span>
          </button>
          <button
            onClick={() => navigate("/dashboard/new-inspection")}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
          >
            <Zap className="h-4 w-4" />
            New Inspection
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Smart Search */}
      <div className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.length > 0);
            }}
            onFocus={() => searchQuery && setShowSearchResults(true)}
            placeholder='Search inspections... Try "high risk" or "MRP discrepancies"'
            className="w-full h-10 pl-10 pr-4 rounded-xl text-sm bg-white/50 border border-white/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {!searchQuery && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Try:</span>
            {searchIntents.slice(0, 4).map((intent) => (
              <button
                key={intent.query}
                onClick={() => { setSearchQuery(intent.query); setShowSearchResults(true); }}
                className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
              >
                {intent.query}
              </button>
            ))}
          </div>
        )}

        {showSearchResults && searchResults && (
          <div className="mt-3 space-y-2">
            {matchedIntent && (
              <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold mb-2">
                <Filter className="h-3 w-3" />
                Filter: {matchedIntent.filter} = {matchedIntent.value}
              </div>
            )}
            {searchResults.length > 0 ? (
              searchResults.map((insp) => {
                const sc = statusConfig[insp.status] || statusConfig["review-required"];
                const rc = riskConfig[insp.riskLevel] || riskConfig.low;
                return (
                  <div
                    key={insp.id}
                    className="p-3 rounded-xl bg-white/40 border border-white/50 flex items-center gap-3 hover:bg-white/60 transition-colors cursor-pointer"
                    onClick={() => navigate("/dashboard/new-inspection")}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${sc.bg}`}>
                      {insp.status === "compliant" ? (
                        <CheckCircle2 className={`h-5 w-5 ${sc.color}`} />
                      ) : insp.status === "non-compliant" ? (
                        <XCircle className={`h-5 w-5 ${sc.color}`} />
                      ) : (
                        <AlertTriangle className={`h-5 w-5 ${sc.color}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{insp.productName}</p>
                      <p className="text-[10px] text-gray-500">
                        {insp.manufacturer} • {insp.date?.slice(0, 10)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-gray-900">{insp.score}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${rc.bg} ${rc.color}`}>
                        {insp.riskLevel}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">
                No inspections match "{searchQuery}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => navigate("/dashboard/new-inspection")}
          className="glass-card rounded-2xl p-4 sm:p-5 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">New Inspection</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500">Upload product label</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate("/dashboard/new-inspection?ecommerce=true")}
          className="glass-card rounded-2xl p-4 sm:p-5 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">E-Commerce Compare</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500">Cross-source verification</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate("/dashboard/history")}
          className="glass-card rounded-2xl p-4 sm:p-5 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">History</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500">Past inspections</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate("/dashboard/analytics")}
          className="glass-card rounded-2xl p-4 sm:p-5 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">Analytics</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500">AI performance metrics</p>
            </div>
          </div>
        </button>
      </div>

      {/* Real Stats from Database */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">System Overview</h3>
          {displayStats.isReal ? (
            <span className="text-[9px] px-2 py-0.5 rounded bg-green-50 text-green-600 font-bold">LIVE DATA</span>
          ) : (
            <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold">NO DATA YET</span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 rounded-xl bg-white/40 border border-white/50">
            <p className="text-[10px] font-semibold text-gray-500 uppercase">Total Inspections</p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">{displayStats.total}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/40 border border-white/50">
            <p className="text-[10px] font-semibold text-gray-500 uppercase">Compliant</p>
            <p className="text-xl font-extrabold text-green-600 mt-1">{displayStats.compliant}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/40 border border-white/50">
            <p className="text-[10px] font-semibold text-gray-500 uppercase">Non-Compliant</p>
            <p className="text-xl font-extrabold text-red-600 mt-1">{displayStats.nonCompliant}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/40 border border-white/50">
            <p className="text-[10px] font-semibold text-gray-500 uppercase">Avg Score</p>
            <p className="text-xl font-extrabold text-blue-600 mt-1">{displayStats.avgScore}</p>
          </div>
        </div>
        {displayStats.isReal && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="p-2 rounded-lg bg-red-50/50 border border-red-100 text-center">
              <p className="text-[9px] font-bold text-red-500 uppercase">High Risk</p>
              <p className="text-lg font-extrabold text-red-600">{displayStats.highRisk}</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100 text-center">
              <p className="text-[9px] font-bold text-amber-500 uppercase">Medium Risk</p>
              <p className="text-lg font-extrabold text-amber-600">{displayStats.mediumRisk}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-50/50 border border-green-100 text-center">
              <p className="text-[9px] font-bold text-green-500 uppercase">Low Risk</p>
              <p className="text-lg font-extrabold text-green-600">{displayStats.lowRisk}</p>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-bold text-gray-900">Keyboard Shortcuts</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { keys: "Ctrl+N", action: "New Inspection" },
            { keys: "Ctrl+D", action: "Demo Mode" },
            { keys: "1-5", action: "Navigate pages" },
          ].map((s) => (
            <div key={s.keys} className="flex items-center gap-1.5 text-[10px]">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 font-mono text-gray-600">
                {s.keys}
              </kbd>
              <span className="text-gray-500">{s.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Mode Banner */}
      <div className="glass-card rounded-2xl p-5 border-2 border-dashed border-emerald-200 bg-emerald-50/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shrink-0">
            <Play className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              SIH Demo Mode
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Run a guided walkthrough showcasing all 20 features — multi-view analysis,
              evidence chain, recapture assistant, e-commerce comparison, risk scoring,
              and more. Perfect for hackathon judges.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/new-inspection?demo=true")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all whitespace-nowrap"
          >
            <Play className="inline h-3.5 w-3.5 mr-1.5" />
            Start Demo
          </button>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Recent Inspections</h3>
        </div>
        {recentInspections && recentInspections.length > 0 ? (
          <div className="space-y-2">
            {recentInspections.map((insp) => {
              const sc = statusConfig[insp.status] || statusConfig["review-required"];
              return (
                <div
                  key={insp._id}
                  className="p-3 rounded-xl bg-white/40 border border-white/50 flex items-center gap-3 hover:bg-white/60 transition-colors cursor-pointer"
                  onClick={() => navigate("/dashboard/new-inspection")}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${sc.bg}`}>
                    {insp.status === "compliant" ? (
                      <CheckCircle2 className={`h-4 w-4 ${sc.color}`} />
                    ) : insp.status === "non-compliant" ? (
                      <XCircle className={`h-4 w-4 ${sc.color}`} />
                    ) : (
                      <AlertTriangle className={`h-4 w-4 ${sc.color}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{insp.productName}</p>
                    <p className="text-[10px] text-gray-500">
                      {insp.manufacturer} • {insp.dateTime?.slice(0, 10)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-gray-900">{insp.score}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${sc.bg} ${sc.color}`}>
                      {insp.status.replace("-", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No inspections yet</p>
            <p className="text-xs text-gray-400 mt-1">Start your first inspection or try Demo Mode</p>
            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={() => navigate("/dashboard/new-inspection?demo=true")}
                className="px-4 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <Play className="inline h-3 w-3 mr-1" />
                Try Demo
              </button>
              <button
                onClick={() => navigate("/dashboard/new-inspection")}
                className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Start Inspection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
