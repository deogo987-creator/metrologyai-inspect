import { monthlyInspections, commonViolations, categoryBreakdown, ocrConfidenceDistribution, dashboardStats } from "@/lib/demo-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { BarChart3, TrendingUp, AlertTriangle, Layers, Eye, Shield } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"];

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass-card rounded-2xl p-5 ${className}`}>{children}</div>
);

const SectionHeader = ({ icon: Icon, title }: { icon: typeof BarChart3; title: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className="h-4 w-4 text-blue-600" />
    <h3 className="text-sm font-bold text-gray-900">{title}</h3>
  </div>
);

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Insights</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
        </div>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-1 rounded-full bg-white/50 border border-white/60">Demo Data</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inspections over time */}
        <Card>
          <SectionHeader icon={TrendingUp} title="Inspections Over Time" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyInspections} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="compliant" name="Compliant" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="nonCompliant" name="Non-Compliant" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="review" name="Review" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category breakdown */}
        <Card>
          <SectionHeader icon={Layers} title="Product Categories" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Common violations */}
        <Card>
          <SectionHeader icon={AlertTriangle} title="Most Common Violations" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={commonViolations} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 10, fill: "#6b7280" }} width={160} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* OCR Confidence Distribution */}
        <Card>
          <SectionHeader icon={Eye} title="OCR Confidence Distribution" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ocrConfidenceDistribution} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Total Inspections", value: dashboardStats.totalInspections.toLocaleString(), icon: BarChart3, color: "from-blue-500 to-indigo-500" },
          { label: "Compliance Rate", value: `${Math.round((dashboardStats.compliant / dashboardStats.totalInspections) * 100)}%`, icon: Shield, color: "from-green-500 to-emerald-500" },
          { label: "Avg Score", value: `${dashboardStats.avgCompliance}%`, icon: TrendingUp, color: "from-violet-500 to-purple-500" },
          { label: "Active Rules", value: "12", icon: AlertTriangle, color: "from-amber-500 to-orange-500" },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
