import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inspectionHistory } from "@/lib/demo-data";
import type { InspectionStatus } from "@/lib/types";
import {
  History as HistoryIcon,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  Calendar,
} from "lucide-react";

const statusConfig: Record<InspectionStatus, { color: string; bg: string; border: string; icon: typeof CheckCircle2; label: string }> = {
  compliant: { color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle2, label: "Compliant" },
  "non-compliant": { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle, label: "Non-Compliant" },
  "review-required": { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle, label: "Review Required" },
  pending: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Eye, label: "Pending" },
};

export default function History() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = inspectionHistory.filter((insp) => {
    const matchSearch = search === "" || insp.productName.toLowerCase().includes(search.toLowerCase()) || insp.id.toLowerCase().includes(search.toLowerCase()) || insp.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || insp.status === statusFilter;
    const matchCategory = categoryFilter === "all" || insp.productCategory === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const categories = [...new Set(inspectionHistory.map((i) => i.productCategory))];

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
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, product, or manufacturer..."
            className="pl-10 glass-input h-10 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl text-sm glass-input border border-white/50 bg-white/50 outline-none"
          >
            <option value="all">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="non-compliant">Non-Compliant</option>
            <option value="review-required">Review Required</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl text-sm glass-input border border-white/50 bg-white/50 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40">
                {["Inspection ID", "Product", "Manufacturer", "Date", "Score", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((insp) => {
                const cfg = statusConfig[insp.status];
                const Icon = cfg.icon;
                return (
                  <tr key={insp.id} className="border-b border-white/20 hover:bg-white/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-blue-600">{insp.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-gray-800">{insp.productName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{insp.manufacturer}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{insp.date}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-extrabold ${
                        insp.score >= 85 ? "text-green-600" : insp.score >= 65 ? "text-amber-600" : "text-red-600"
                      }`}>
                        {insp.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7">
                        <FileText className="h-3 w-3 mr-1" />
                        Report
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <HistoryIcon className="h-8 w-8 text-gray-300 mx-auto" />
            <p className="mt-2 text-sm text-gray-400">No inspections found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
