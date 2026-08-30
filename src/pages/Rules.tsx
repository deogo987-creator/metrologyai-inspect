import { useState } from "react";
import { rules } from "@/lib/demo-data";
import {
  Shield,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  Archive,
  AlertTriangle,
  BookOpen,
  Tag,
  Calendar,
} from "lucide-react";

const severityConfig: Record<string, { bg: string; color: string }> = {
  high: { bg: "bg-red-50", color: "text-red-700" },
  medium: { bg: "bg-amber-50", color: "text-amber-700" },
  low: { bg: "bg-blue-50", color: "text-blue-700" },
};

const statusConfig: Record<string, { bg: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { bg: "bg-green-50", color: "text-green-700", icon: CheckCircle2 },
  inactive: { bg: "bg-gray-50", color: "text-gray-600", icon: AlertTriangle },
  archived: { bg: "bg-orange-50", color: "text-orange-600", icon: Archive },
};

const categoryColors: Record<string, string> = {
  Mandatory: "bg-blue-50 text-blue-600",
  Quantity: "bg-purple-50 text-purple-600",
  Price: "bg-green-50 text-green-600",
  Consumer: "bg-amber-50 text-amber-600",
  Date: "bg-cyan-50 text-cyan-600",
  Food: "bg-rose-50 text-rose-600",
};

export default function Rules() {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const categories = [...new Set(rules.map((r) => r.category))];

  const filteredRules = rules.filter((r) => {
    if (filterCategory !== "all" && r.category !== filterCategory) return false;
    if (filterSeverity !== "all" && r.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Compliance</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Rules Engine</h1>
        </div>
        <span className="text-[9px] px-2.5 py-1 rounded bg-blue-50 text-blue-600 font-bold">VERSIONED RULES</span>
      </div>

      <p className="text-xs text-gray-500">
        Configurable rule database for Legal Metrology compliance. Each rule includes version history, effective dates, and validation logic.
      </p>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-gray-400" />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="h-8 px-2 rounded-lg text-xs bg-white/50 border border-white/50 outline-none">
            <option value="all">All Categories</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-gray-400" />
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="h-8 px-2 rounded-lg text-xs bg-white/50 border border-white/50 outline-none">
            <option value="all">All Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="ml-auto text-[10px] text-gray-400 flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {filteredRules.length} rules
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-2">
        {filteredRules.map((rule) => {
          const sc = statusConfig[rule.status] || statusConfig.active;
          const sevCfg = severityConfig[rule.severity] || severityConfig.medium;
          const StatusIcon = sc.icon;
          const isExpanded = expandedRule === rule.id;

          return (
            <div key={rule.id} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                className="w-full p-4 text-left flex items-center gap-3 hover:bg-white/30 transition-colors"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${sc.bg}`}>
                  <StatusIcon className={`h-5 w-5 ${sc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-gray-500">{rule.id}</span>
                    <span className="text-sm font-bold text-gray-900">{rule.declaration}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${sevCfg.bg} ${sevCfg.color}`}>{rule.severity.toUpperCase()}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${categoryColors[rule.category] || "bg-gray-50 text-gray-600"}`}>{rule.category}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{rule.requirement}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-bold text-gray-400">v{rule.version}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/50">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Description</p>
                      <p className="text-xs text-gray-700 mt-1">{rule.description}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/50">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Validation Logic</p>
                      <p className="text-xs text-gray-700 mt-1">{rule.validationLogic}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-[10px]">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      Effective: {rule.effectiveDate}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Tag className="h-3 w-3" />
                      Type: {rule.validationType}
                    </div>
                    <div className={`flex items-center gap-1 ${sc.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      Status: {rule.status}
                    </div>
                  </div>

                  {/* Version History */}
                  {rule.previousVersions && rule.previousVersions.length > 0 && (
                    <div className="p-3 rounded-xl bg-white/40 border border-white/50">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Version History</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {rule.previousVersions.map((pv) => {
                          const pvSc = statusConfig[pv.status] || statusConfig.archived;
                          const PvIcon = pvSc.icon;
                          return (
                            <div key={pv.version} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
                              <PvIcon className={`h-3 w-3 ${pvSc.color}`} />
                              <span className="text-[9px] font-bold">v{pv.version}</span>
                              <span className={`text-[8px] px-1 py-0.5 rounded ${pvSc.bg} ${pvSc.color}`}>{pv.status}</span>
                              <span className="text-[8px] text-gray-400">{pv.effectiveDate}</span>
                            </div>
                          );
                        })}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-50 border border-green-100">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-[9px] font-bold">v{rule.version}</span>
                          <span className="text-[8px] px-1 py-0.5 rounded bg-green-100 text-green-700">active</span>
                          <span className="text-[8px] text-gray-400">{rule.effectiveDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        Rule database is configurable. Current version: v2.x series. This system uses a configurable rule database, not an official government authority.
      </p>
    </div>
  );
}
