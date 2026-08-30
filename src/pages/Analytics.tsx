import { useNavigate } from "react-router";
import {
  BarChart3,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Target,
  Zap,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const correctionData = [
  { field: "Date", count: 89 },
  { field: "Net Quantity", count: 67 },
  { field: "Country of Origin", count: 52 },
  { field: "MRP", count: 34 },
  { field: "Consumer Care", count: 28 },
  { field: "Batch Number", count: 22 },
  { field: "Manufacturer", count: 12 },
];

const confidenceByField = [
  { field: "Product Name", confidence: 94 },
  { field: "MRP", confidence: 89 },
  { field: "Net Quantity", confidence: 86 },
  { field: "Manufacturer", confidence: 82 },
  { field: "Consumer Care", confidence: 71 },
  { field: "Dates", confidence: 68 },
  { field: "Batch Number", confidence: 65 },
  { field: "FSSAI", confidence: 58 },
];

const complianceOverTime = [
  { month: "Mar", compliant: 68, nonCompliant: 12, review: 20 },
  { month: "Apr", compliant: 72, nonCompliant: 10, review: 18 },
  { month: "May", compliant: 75, nonCompliant: 8, review: 17 },
  { month: "Jun", compliant: 78, nonCompliant: 7, review: 15 },
  { month: "Jul", compliant: 82, nonCompliant: 6, review: 12 },
  { month: "Aug", compliant: 85, nonCompliant: 5, review: 10 },
];

const statusPie = [
  { name: "Compliant", value: 68, color: "#22c55e" },
  { name: "Review Required", value: 22, color: "#f59e0b" },
  { name: "Non-Compliant", value: 10, color: "#ef4444" },
];

const recaptureData = { before: 62, after: 91 };

export default function Analytics() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Insights</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
        </div>
        <span className="text-[9px] px-2.5 py-1 rounded bg-blue-50 text-blue-600 font-bold">DEMO METRICS</span>
      </div>

      {/* Feature 18: AI vs Inspector Performance */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">AI vs Inspector Performance</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total AI Extractions", value: "4,820", color: "from-blue-500 to-indigo-500" },
            { label: "Inspector Corrections", value: "312", color: "from-amber-500 to-orange-500" },
            { label: "Correction Rate", value: "6.47%", color: "from-green-500 to-emerald-500" },
            { label: "Recapture Improvement", value: "+29%", color: "from-purple-500 to-pink-500" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-white/40 border border-white/50">
              <p className="text-[10px] font-semibold text-gray-500 uppercase">{stat.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Most Corrected Fields */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Most Corrected Fields</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={correctionData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="field" type="category" tick={{ fontSize: 10 }} width={100} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 11 }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Confidence by Field */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-bold text-gray-900">AI Confidence by Field</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={confidenceByField} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="field" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 11 }} />
              <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                {confidenceByField.map((entry, index) => (
                  <Cell key={index} fill={entry.confidence >= 80 ? "#22c55e" : entry.confidence >= 70 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compliance Over Time */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Compliance Trends (6 Months)</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={complianceOverTime} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="compliant" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="review" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="nonCompliant" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Status Distribution</h3>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusPie.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {statusPie.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] font-medium text-gray-600">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recapture Improvement */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-bold text-gray-900">Recapture Improvement</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Before Recapture</span>
                <span className="text-xs font-bold text-red-600">{recaptureData.before}%</span>
              </div>
              <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: `${recaptureData.before}%` }} />
              </div>
            </div>
            <div className="text-center">
              <ArrowRight className="h-6 w-6 text-green-500 mx-auto" />
              <span className="text-xs font-bold text-green-600">+{recaptureData.after - recaptureData.before}% improvement</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">After Recapture</span>
                <span className="text-xs font-bold text-green-600">{recaptureData.after}%</span>
              </div>
              <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: `${recaptureData.after}%` }} />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-4">Adaptive re-capture guidance significantly improves OCR confidence</p>
        </div>
      </div>

      <div className="text-center">
        <button onClick={() => navigate("/dashboard/new-inspection")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-500/20">
          Start New Inspection <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
