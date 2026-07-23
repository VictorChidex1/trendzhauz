import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLogin() {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // If user is already authenticated, auto-redirect to /admin/panel
  React.useEffect(() => {
    if (user && !authLoading) {
      const from = (location.state as any)?.from?.pathname || "/admin/panel";
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname || "/admin/panel";
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);
      let message = "Failed to sign in. Please verify your credentials.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        message = "Invalid email address or password.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many failed login attempts. Account temporarily locked for security.";
      } else if (err.code === "auth/network-request-failed") {
        message = "Network connection error. Check your connection.";
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-950/80 border border-zinc-800/80 rounded-md p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10 space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-3 py-1 rounded-full text-brand text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            CMS Gatekeeper
          </h1>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            Enter authenticated credentials to access editorial database controls.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-sm flex items-start space-x-3 text-red-400 text-xs font-medium"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-300 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@trendzhauz.com"
                required
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-sm pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand transition-colors font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-300 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-sm pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand transition-colors font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest py-3 rounded-sm transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to CMS</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-zinc-900">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            TrendzHauz Media · Encrypted Gateway
          </p>
        </div>
      </motion.div>
    </div>
  );
}
