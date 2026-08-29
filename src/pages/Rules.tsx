import { useState } from "react";
import { rules } from "@/lib/demo-data";
import type { RuleStatus } from "@/lib/types";
import { Search, Shield, CheckCircle2, XCircle, Filter } from "lucide-react";

export default function Rules() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const categories = [...new Set(rules.map((r) => r.category))];

  const filtered = rules.filter((r) => {
    const matchSearch = search === "" || r.declaration.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.requirement.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || r.category === categoryFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-500">Configuration</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Compliance Rules</h1>
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules..."
            className="w-full h-10 pl-10 pr-3 rounded-xl text-sm glass-input border border-white/50 bg-white/50 outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-xl text-sm glass-input border border-white/50 bg-white/50 outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl text-sm glass-input border border-white/50 bg-white/50 outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40">
                {["Rule ID", "Declaration", "Requirement", "Validation", "Severity", "Category", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((rule) => (
                <tr key={rule.id} className="border-b border-white/20 hover:bg-white/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-blue-600">{rule.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-gray-400 shrink-0" />
                      <span className="text-xs font-semibold text-gray-800">{rule.declaration}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600 max-w-[200px] line-clamp-2">{rule.requirement}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {rule.validationType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      rule.severity === "high" ? "bg-red-50 text-red-700 border-red-200"
                        : rule.severity === "medium" ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                      {rule.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">{rule.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      rule.status === "active" ? "text-green-600" : "text-gray-400"
                    }`}>
                      {rule.status === "active" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {rule.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
