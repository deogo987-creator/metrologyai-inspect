import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
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
} from "lucide-react";

// Smart Search Intents (Feature 14)
const searchIntents = [
  { query: "high risk inspections", filter: "riskLevel", value: "high" },
  { query: "MRP discrepancies", filter: "field", value: "mrp" },
  { query: "inspections requiring review", filter: "status", value: "review-required" },
  { query: "non-compliant products", filter: "status", value: "non-compliant" },
  { query: "low OCR confidence", filter: "confidence", value: "low" },
];

// Demo inspection data for search results
const demoInspections = [
  { id: "INSP-2026-001", productName: "Premium Biscuit Pack", manufacturer: "Britannia Industries", date: "2026-08-28", score: 82, status: "review-required" as const, risk: "medium" },
  { id: "INSP-2026-002", productName: "Organic Honey 500g", manufacturer: "Patanjali Ayurved", date: "2026-08-27", score: 95, status: "compliant" as const, risk: "low" },
  { id: "INSP-2026-003", productName: "Packaged Drinking Water", manufacturer: "Bisleri International", date: "2026-08-26", score: 45, status: "non-compliant" as const, risk: "high" },
  { id: "INSP-2026-004", productName: "Shampoo Sachet", manufacturer: "Hindustan Unilever", date: "2026-08-25", score: 88, status: "compliant" as const, risk: "low" },
  { id: "INSP-2026-005", productName: "Masala Powder 100g", manufacturer: "MDH Spices", date: "2026-08-24", score: 62, status: "review-required" as const, risk: "medium" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return demoInspections.filter(
      (insp) =>
        insp.productName.toLowerCase().includes(q) ||
        insp.manufacturer.toLowerCase().includes(q) ||
        insp.id.toLowerCase().includes(q) ||
        insp.status.includes(q) ||
        insp.risk.includes(q)
    );
  }, [searchQuery]);

  const matchedIntent = searchIntents.find((intent) => searchQuery.toLowerCase().includes(intent.query));

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Welcome back</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Inspector's Dashboard</h1>
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

      {/* Feature 14: Smart Inspector Search */}
      <div className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(e.target.value.length > 0); }}
            onFocus={() => searchQuery && setShowSearchResults(true)}
            placeholder='Search inspections... Try "high risk" or "MRP discrepancies"'
            className="w-full h-10 pl-10 pr-4 rounded-xl text-sm bg-white/50 border border-white/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Smart Intent Suggestions */}
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

        {/* Search Results */}
        {showSearchResults && (
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
                const rc = riskConfig[insp.risk] || riskConfig.low;
                return (
                  <div key={insp.id} className="p-3 rounded-xl bg-white/40 border border-white/50 flex items-center gap-3 hover:bg-white/60 transition-colors">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${sc.bg}`}>
                      {insp.status === "compliant" ? <CheckCircle2 className={`h-5 w-5 ${sc.color}`} /> :
                       insp.status === "non-compliant" ? <XCircle className={`h-5 w-5 ${sc.color}`} /> :
                       <AlertTriangle className={`h-5 w-5 ${sc.color}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{insp.productName}</p>
                      <p className="text-[10px] text-gray-500">{insp.manufacturer} • {insp.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-gray-900">{insp.score}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${rc.bg} ${rc.color}`}>{insp.risk}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">No inspections match "{searchQuery}"</p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => navigate("/dashboard/new-inspection")} className="glass-card rounded-2xl p-5 text-left hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">New Inspection</h3>
              <p className="text-[11px] text-gray-500">Upload product label for AI analysis</p>
            </div>
          </div>
        </button>
        <button onClick={() => navigate("/dashboard/history")} className="glass-card rounded-2xl p-5 text-left hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Inspection History</h3>
              <p className="text-[11px] text-gray-500">View past inspections & audit trail</p>
            </div>
          </div>
        </button>
        <button onClick={() => navigate("/dashboard/analytics")} className="glass-card rounded-2xl p-5 text-left hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Analytics</h3>
              <p className="text-[11px] text-gray-500">AI vs Inspector performance metrics</p>
            </div>
          </div>
        </button>
        <button onClick={() => navigate("/dashboard/rules")} className="glass-card rounded-2xl p-5 text-left hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Rules Engine</h3>
              <p className="text-[11px] text-gray-500">Versioned compliance rules</p>
            </div>
          </div>
        </button>
      </div>

      {/* System Stats */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">System Overview</h3>
          <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold">DEMO METRICS</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Inspections", value: "4,820", icon: Search, color: "from-blue-500 to-indigo-500" },
            { label: "AI Extractions", value: "52,640", icon: Zap, color: "from-green-500 to-emerald-500" },
            { label: "Inspector Corrections", value: "312", icon: Edit3, color: "from-amber-500 to-orange-500" },
            { label: "Correction Rate", value: "6.47%", icon: TrendingUp, color: "from-purple-500 to-pink-500" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-white/40 border border-white/50">
              <p className="text-[10px] font-semibold text-gray-500 uppercase">{stat.label}</p>
              <p className="text-xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Recent Inspections</h3>
        </div>
        <div className="space-y-2">
          {demoInspections.map((insp) => {
            const sc = statusConfig[insp.status] || statusConfig["review-required"];
            return (
              <div key={insp.id} className="p-3 rounded-xl bg-white/40 border border-white/50 flex items-center gap-3 hover:bg-white/60 transition-colors cursor-pointer" onClick={() => navigate("/dashboard/new-inspection")}>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${sc.bg}`}>
                  {insp.status === "compliant" ? <CheckCircle2 className={`h-4 w-4 ${sc.color}`} /> :
                   insp.status === "non-compliant" ? <XCircle className={`h-4 w-4 ${sc.color}`} /> :
                   <AlertTriangle className={`h-4 w-4 ${sc.color}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{insp.productName}</p>
                  <p className="text-[10px] text-gray-500">{insp.manufacturer} • {insp.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-gray-900">{insp.score}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${sc.bg} ${sc.color}`}>{insp.status.replace("-", " ")}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Edit3(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>;
}
