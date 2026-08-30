import { NavLink, Outlet, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Search,
  History,
  FileText,
  Shield,
  User,
  Menu,
  X,
  Info,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/new-inspection", icon: Search, label: "New Inspection" },
  { to: "/dashboard/history", icon: History, label: "Inspection History" },
  { to: "/dashboard/reports", icon: FileText, label: "Reports" },
  { to: "/dashboard/rules", icon: Shield, label: "Rules Engine" },
  { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/dashboard/about", icon: Info, label: "About" },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get inspector info from localStorage
  const inspectorInfo = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("metrology-inspector");
        return stored ? JSON.parse(stored) : { id: "INS-LM-000", name: "Inspector", email: "inspector@metrologyai.gov.in", role: "Inspector" };
      } catch { return { id: "INS-LM-000", name: "Inspector", email: "inspector@metrologyai.gov.in", role: "Inspector" }; }
    }
    return { id: "INS-LM-000", name: "Inspector", email: "inspector@metrologyai.gov.in", role: "Inspector" };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem("metrology-inspector");
      navigate("/");
    } catch { navigate("/"); }
  };

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("metrology-dark-mode") === "true" ||
        (!localStorage.getItem("metrology-dark-mode") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("metrology-dark-mode", String(darkMode));
  }, [darkMode]);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/30">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-gray-900">
            MetrologyAI
          </h1>
          <p className="text-[10px] font-medium text-gray-500 leading-tight">
            Legal Metrology Inspection
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-600/10 text-blue-700 shadow-sm border border-blue-200/50"
                  : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/30 p-4 space-y-2">
        <div className="flex items-center gap-3 rounded-xl bg-white/40 px-3 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-bold">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {inspectorInfo.name}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {inspectorInfo.id} • {inspectorInfo.role}
            </p>
          </div>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 rounded-xl bg-white/40 px-3 py-2.5 text-left hover:bg-white/60 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
            {darkMode ? "☀️" : "🌙"}
          </div>
          <span className="text-xs font-medium text-gray-600">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-xl bg-red-50/50 border border-red-100 px-3 py-2.5 text-left hover:bg-red-100/50 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
            <LogOut className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-xs font-medium text-red-600">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 glass-sidebar flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 glass-sidebar flex flex-col transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 rounded-lg p-1.5 text-gray-500 hover:bg-white/50"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden glass-header sticky top-0 z-20 flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-gray-600 hover:bg-white/50"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-gray-900">MetrologyAI</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
