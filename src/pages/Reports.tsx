import { FileText, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";

export default function Reports() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-500">Documents</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Inspection Reports</h1>
      </div>

      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 mx-auto">
          <FileText className="h-8 w-8 text-gray-300" />
        </div>
        <p className="mt-4 text-sm font-bold text-gray-900">No Reports Generated</p>
        <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
          Reports are generated after completing an AI inspection. Each report includes extracted declarations, compliance score, violations, and evidence.
        </p>
        <button
          onClick={() => navigate("/dashboard/new-inspection")}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-500/20"
        >
          <AlertCircle className="h-3 w-3" />
          Start Inspection
        </button>
      </div>
    </div>
  );
}
