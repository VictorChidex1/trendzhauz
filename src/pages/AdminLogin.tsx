import * as React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
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
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        message = "Invalid email address or password.";
      } else if (err.code === "auth/too-many-requests") {
        message =
          "Too many failed login attempts. Account temporarily locked for security.";
      } else if (err.code === "auth/network-request-failed") {
        message = "Network connection error. Check your connection.";
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 relative overflow-hidden text-zinc-900">
      {/* Return to Public Site Link at Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-brand transition-colors bg-white/80 border border-zinc-200 px-3.5 py-2 rounded-full shadow-xs backdrop-blur-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Homepage</span>
        </Link>
      </div>

      {/* Light Mode Ambient Background Accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-zinc-200/50 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] relative z-10 space-y-6"
      >
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <img
              src="/assets/Trendzhauz-logo.png"
              alt="TrendzHauz Media Logo"
              className="h-14 sm:h-16 w-auto object-contain transition-all hover:scale-105 duration-300"
            />
          </div>

          <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-3 py-1 rounded-full text-brand text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Dashboard Portal</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
            TRENDZHAUZ MEDIA
          </h1>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            Enter authenticated credentials to access editorial database
            controls.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-red-50 border border-red-200 rounded-md flex items-start space-x-3 text-red-600 text-xs font-medium"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@trendzhauz.com"
                required
                className="w-full bg-zinc-50 border border-zinc-300 rounded-md pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Password
              </label>
              <Link
                to="/admin/forgot-password"
                className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline transition-all"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-zinc-50 border border-zinc-300 rounded-md pl-10 pr-10 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest py-3 rounded-md transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="pt-3 text-center border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            TrendzHauz Media · Encrypted Gateway
          </p>
        </div>
      </motion.div>
    </div>
  );
}
