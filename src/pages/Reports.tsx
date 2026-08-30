import { useNavigate } from "react-router";
import {
  FileText,
  Download,
  Calendar,
  Shield,
  CheckCircle2,
  ArrowRight,
  Printer,
  Eye,
} from "lucide-react";

const demoReports = [
  { id: "RPT-2026-001", inspectionId: "INSP-2026-001", productName: "Premium Biscuit Pack", date: "2026-08-28", score: 82, status: "review-required", findings: 1, fields: 11, hasEvidence: true },
  { id: "RPT-2026-002", inspectionId: "INSP-2026-002", productName: "Organic Honey 500g", date: "2026-08-27", score: 95, status: "compliant", findings: 0, fields: 11, hasEvidence: true },
  { id: "RPT-2026-003", inspectionId: "INSP-2026-003", productName: "Packaged Drinking Water", date: "2026-08-26", score: 45, status: "non-compliant", findings: 4, fields: 11, hasEvidence: true },
];

const statusCfg: Record<string, { bg: string; color: string }> = {
  compliant: { bg: "bg-green-50", color: "text-green-700" },
  "non-compliant": { bg: "bg-red-50", color: "text-red-700" },
  "review-required": { bg: "bg-amber-50", color: "text-amber-700" },
};

export default function Reports() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Documents</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Inspection Reports</h1>
        </div>
        <span className="text-[9px] px-2.5 py-1 rounded bg-blue-50 text-blue-600 font-bold">EVIDENCE-FIRST</span>
      </div>

      <p className="text-xs text-gray-500">Every report includes: Finding → Evidence → Rule → AI Confidence → Inspector Decision. Reports are fully auditable.</p>

      {demoReports.length > 0 ? (
        <div className="space-y-3">
          {demoReports.map((report) => {
            const sc = statusCfg[report.status] || statusCfg["review-required"];
            return (
              <div key={report.id} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{report.productName}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${sc.bg} ${sc.color}`}>{report.status.replace("-", " ").toUpperCase()}</span>
                      {report.hasEvidence && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">EVIDENCE ATTACHED</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {report.id} • {report.inspectionId} • {report.date} • Score: {report.score}/100
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] text-gray-500">{report.fields} fields extracted</span>
                      {report.findings > 0 && <span className="text-[9px] text-red-600 font-bold">{report.findings} finding(s)</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="p-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 text-gray-600">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white/80 text-gray-600">
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 mx-auto">
            <FileText className="h-8 w-8 text-gray-300" />
          </div>
          <p className="mt-4 text-sm font-bold text-gray-900">No Reports Generated</p>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            Reports are generated after completing an AI inspection. Each report includes evidence chains, compliance scores, and inspector decisions.
          </p>
          <button onClick={() => navigate("/dashboard/new-inspection")} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-500/20">
            Start Inspection <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
