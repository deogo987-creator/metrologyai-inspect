import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  Shield,
  Loader2,
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

// Pre-configured demo inspector accounts
const DEMO_ACCOUNTS = [
  { id: "INS-LM-042", email: "inspector@metrologyai.gov.in", name: "Rajesh Kumar", role: "Senior Inspector" },
  { id: "INS-LM-017", email: "priya@metrologyai.gov.in", name: "Priya Sharma", role: "Field Inspector" },
  { id: "INS-LM-089", email: "amit@metrologyai.gov.in", name: "Amit Patel", role: "Compliance Officer" },
];

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);

  const [mode, setMode] = useState<"signin" | "otp-sent">("signin");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<typeof DEMO_ACCOUNTS[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate(redirect);
  }, [authLoading, isAuthenticated, navigate, redirect]);

  // Handle email OTP sign-in
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signIn("email-otp", { email });
      setMode("otp-sent");
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signIn("email-otp", { email, code: otp });
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle demo quick login (anonymous)
  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setIsLoading(true);
    setError(null);
    setSelectedAccount(account);
    try {
      await signIn("anonymous");
      // Store inspector info in localStorage for display
      localStorage.setItem("metrology-inspector", JSON.stringify({
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
      }));
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">MetrologyAI</h1>
          <p className="mt-1 text-sm text-gray-500">AI-Assisted Legal Metrology Inspection System</p>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-3xl p-8">
          {/* Email OTP Form */}
          {mode === "signin" && (
            <>
              <h2 className="text-lg font-bold text-gray-900 text-center">Inspector Sign In</h2>
              <p className="mt-1 text-sm text-gray-500 text-center">Enter your email to receive a verification code</p>

              <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="inspector@metrologyai.gov.in"
                      className="pl-10 glass-input h-11"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* OTP Verification */}
          {mode === "otp-sent" && (
            <>
              <div className="text-center mb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Check Your Email</h2>
                <p className="mt-1 text-sm text-gray-500">
                  We sent a 6-digit code to<br />
                  <span className="font-semibold text-gray-700">{email}</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Verification Code</label>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="glass-input h-11 text-center text-lg tracking-[0.5em] font-mono"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25"
                  disabled={isLoading || otp.length < 6}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verify & Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(null); setOtp(""); }}
                  className="w-full text-xs text-gray-500 hover:text-gray-700 text-center"
                >
                  ← Back to sign in
                </button>
              </form>
            </>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/60 px-3 text-gray-400 font-medium">Quick Access</span>
            </div>
          </div>

          {/* Demo Inspector Accounts */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase text-center mb-3">
              Pre-configured Inspector Accounts
            </p>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.id}
                onClick={() => handleDemoLogin(account)}
                disabled={isLoading}
                className="w-full p-3 rounded-xl bg-white/40 border border-white/50 hover:bg-white/70 hover:border-blue-200 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{account.name}</p>
                    <p className="text-[10px] text-gray-500">{account.id} • {account.role}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-[10px] text-blue-600 leading-relaxed">
              <p className="font-bold">Demo Mode</p>
              <p>Click any inspector account for instant access. Or enter your email for OTP-based authentication.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-400">
            Secured by MetrologyAI • Prototype for SIH PS26034
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
