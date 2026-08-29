import { inspectionHistory } from "@/lib/demo-data";
import { FileText, Download, Eye, Calendar, Shield, Printer, Share2 } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-500">Documents</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Inspection Reports</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {inspectionHistory.map((insp) => (
          <div key={insp.id} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md">
                <FileText className="h-5 w-5" />
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                insp.status === "compliant" ? "bg-green-50 text-green-700 border border-green-200"
                  : insp.status === "non-compliant" ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {insp.score}/100
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900">{insp.productName}</h3>
            <p className="text-xs text-gray-500 mt-1">{insp.manufacturer}</p>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400">
              <Calendar className="h-3 w-3" />
              {insp.date}
              <span className="mx-1">•</span>
              {insp.id}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
                <Eye className="h-3 w-3" />
                View
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                <Download className="h-3 w-3" />
                PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                <Printer className="h-3 w-3" />
                Print
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
