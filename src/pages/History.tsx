import { Search, History as HistoryIcon, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";

export default function History() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-500">Records</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Inspection History</h1>
      </div>

      {/* Filters (disabled state) */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3 opacity-60">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search by ID, product, or manufacturer..."
            disabled
            className="w-full h-10 pl-10 pr-3 rounded-xl text-sm bg-white/50 border border-white/50 text-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <select disabled className="h-10 px-3 rounded-xl text-sm bg-white/50 border border-white/50 text-gray-400">
            <option>All Status</option>
          </select>
          <select disabled className="h-10 px-3 rounded-xl text-sm bg-white/50 border border-white/50 text-gray-400">
            <option>All Categories</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 mx-auto">
          <HistoryIcon className="h-8 w-8 text-gray-300" />
        </div>
        <p className="mt-4 text-sm font-bold text-gray-900">No Inspections Yet</p>
        <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
          Inspection history will appear here once you complete your first AI-powered label inspection.
        </p>
        <button
          onClick={() => navigate("/dashboard/new-inspection")}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-500/20"
        >
          <AlertCircle className="h-3 w-3" />
          Start First Inspection
        </button>
      </div>
    </div>
  );
}
