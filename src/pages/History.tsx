import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  History as HistoryIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Filter,
  Calendar,
  Shield,
  ChevronRight,
  ArrowUpDown,
  Clock,
} from "lucide-react";

const demoInspections = [
  { id: "INSP-2026-001", productName: "Premium Biscuit Pack", manufacturer: "Britannia Industries", date: "2026-08-28", time: "14:32", score: 82, status: "review-required" as const, risk: "medium" as const, violations: 1, fields: 11, inspector: "INS-LM-042" },
  { id: "INSP-2026-002", productName: "Organic Honey 500g", manufacturer: "Patanjali Ayurved", date: "2026-08-27", time: "11:15", score: 95, status: "compliant" as const, risk: "low" as const, violations: 0, fields: 11, inspector: "INS-LM-038" },
  { id: "INSP-2026-003", productName: "Packaged Drinking Water", manufacturer: "Bisleri International", date: "2026-08-26", time: "09:48", score: 45, status: "non-compliant" as const, risk: "high" as const, violations: 4, fields: 11, inspector: "INS-LM-042" },
  { id: "INSP-2026-004", productName: "Shampoo Sachet 6ml", manufacturer: "Hindustan Unilever", date: "2026-08-25", time: "16:20", score: 88, status: "compliant" as const, risk: "low" as const, violations: 0, fields: 11, inspector: "INS-LM-045" },
  { id: "INSP-2026-005", productName: "Masala Powder 100g", manufacturer: "MDH Spices", date: "2026-08-24", time: "10:05", score: 62, status: "review-required" as const, risk: "medium" as const, violations: 2, fields: 11, inspector: "INS-LM-038" },
  { id: "INSP-2026-006", productName: "Tea Powder 250g", manufacturer: "Tata Consumer Products", date: "2026-08-23", time: "13:44", score: 91, status: "compliant" as const, risk: "low" as const, violations: 0, fields: 11, inspector: "INS-LM-042" },
  { id: "INSP-2026-007", productName: "Cooking Oil 1L", manufacturer: "Fortune Foods", date: "2026-08-22", time: "08:30", score: 73, status: "review-required" as const, risk: "medium" as const, violations: 1, fields: 11, inspector: "INS-LM-045" },
  { id: "INSP-2026-008", productName: "Chips Packet 52g", manufacturer: "Haldiram's", date: "2026-08-21", time: "15:12", score: 97, status: "compliant" as const, risk: "low" as const, violations: 0, fields: 11, inspector: "INS-LM-038" },
];

const statusCfg: Record<string, { bg: string; color: string; icon: typeof CheckCircle2 }> = {
  compliant: { bg: "bg-green-50", color: "text-green-700", icon: CheckCircle2 },
  "non-compliant": { bg: "bg-red-50", color: "text-red-700", icon: XCircle },
  "review-required": { bg: "bg-amber-50", color: "text-amber-700", icon: AlertTriangle },
};

const riskCfg: Record<string, { bg: string; color: string }> = {
  low: { bg: "bg-green-50", color: "text-green-600" },
  medium: { bg: "bg-amber-50", color: "text-amber-600" },
  high: { bg: "bg-red-50", color: "text-red-600" },
};

export default function History() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"date" | "score">("date");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let result = [...demoInspections];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => i.productName.toLowerCase().includes(q) || i.manufacturer.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.inspector.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter((i) => i.status === statusFilter);
    if (riskFilter !== "all") result = result.filter((i) => i.risk === riskFilter);

    result.sort((a, b) => {
      if (sortField === "date") return sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
      return sortAsc ? a.score - b.score : b.score - a.score;
    });

    return result;
  }, [searchQuery, statusFilter, riskFilter, sortField, sortAsc]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-500">Records</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Inspection History</h1>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search by ID, product, or inspector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-xl text-sm bg-white/50 border border-white/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl text-sm bg-white/50 border border-white/50 focus:border-blue-300 outline-none">
            <option value="all">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="review-required">Review Required</option>
            <option value="non-compliant">Non-Compliant</option>
          </select>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="h-10 px-3 rounded-xl text-sm bg-white/50 border border-white/50 focus:border-blue-300 outline-none">
            <option value="all">All Risk</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            onClick={() => setSortField(sortField === "date" ? "score" : "date")}
            className="h-10 px-3 rounded-xl text-sm bg-white/50 border border-white/50 hover:bg-white/80 flex items-center gap-1.5 font-medium text-gray-600"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortField === "date" ? "Date" : "Score"}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <HistoryIcon className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-sm font-bold text-gray-900">No Inspections Found</p>
            <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filtered.map((insp) => {
            const sc = statusCfg[insp.status] || statusCfg["review-required"];
            const rc = riskCfg[insp.risk] || riskCfg.low;
            const Icon = sc.icon;
            return (
              <div key={insp.id} className="glass-card rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/dashboard/new-inspection")}>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${sc.bg}`}>
                    <Icon className={`h-6 w-6 ${sc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{insp.productName}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${sc.bg} ${sc.color}`}>{insp.status.replace("-", " ").toUpperCase()}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{insp.manufacturer} • Inspector: {insp.inspector}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-xl font-extrabold text-gray-900">{insp.score}</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${rc.bg} ${rc.color}`}>Risk: {insp.risk}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {insp.date}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {insp.time}
                    </div>
                    {insp.violations > 0 && (
                      <p className="text-[10px] text-red-600 font-bold mt-0.5">{insp.violations} violation(s)</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-[10px] text-gray-400 text-center">Showing {filtered.length} of {demoInspections.length} inspections • Demo data for SIH presentation</p>
    </div>
  );
}
