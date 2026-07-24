import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Loader2,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/services/firebase";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Attempt custom redirect URL (works seamlessly on HTTPS / Vercel / Production)
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/admin/reset-password`,
        };
        await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
      } catch (primaryErr: any) {
        // If local HTTP origin or CORS restrictions block custom actionCodeSettings, fallback to default Firebase email
        if (
          primaryErr.code === "auth/network-request-failed" ||
          primaryErr.code === "auth/unauthorized-continue-uri" ||
          primaryErr.code === "auth/invalid-continue-uri"
        ) {
          console.warn("Primary reset settings failed, attempting default Firebase reset email:", primaryErr.code);
          await sendPasswordResetEmail(auth, email.trim());
        } else {
          throw primaryErr;
        }
      }
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Password reset error:", err.code, err.message);
      let message = "Failed to send reset link. Please check your email.";
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        message = "No account found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many password reset attempts. Please wait a few minutes.";
      } else if (err.code === "auth/network-request-failed") {
        message = "Network request failed. Please check your internet connection or try again.";
      } else if (err.code === "auth/unauthorized-continue-uri") {
        message = "The current domain is not authorized in Firebase Console -> Authentication -> Settings -> Authorized Domains.";
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 relative overflow-hidden text-zinc-900">
      {/* Return to Admin Login Link at Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-brand transition-colors bg-white/80 border border-zinc-200 px-3.5 py-2 rounded-full shadow-xs backdrop-blur-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>

      {/* Light Mode Ambient Background Accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[150px] pointer-events-none" />

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
            <KeyRound className="h-3.5 w-3.5" />
            <span>Account Recovery</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
            Forgot Password?
          </h1>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            Enter your registered editor email to receive a password reset link.
          </p>
        </div>

        {/* Success Card State */}
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-emerald-50 border border-emerald-200 rounded-md text-center space-y-3"
          >
            <div className="h-12 w-12 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-emerald-900 tracking-wide">
                Reset Email Sent!
              </h3>
              <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                We've dispatched a password recovery link to{" "}
                <span className="font-bold text-emerald-900">{email}</span>. Please check your inbox or spam folder.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest py-2.5 rounded-sm transition-all shadow-xs"
              >
                Return to Sign In
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Reset Email Request Form */
          <>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest py-3 rounded-md transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Dispatching Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          </>
        )}

        <div className="pt-3 text-center border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            TrendzHauz Media · Security Recovery
          </p>
        </div>
      </motion.div>
    </div>
  );
}
