import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/services/firebase";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = React.useState(true);
  const [isCodeValid, setIsCodeValid] = React.useState(false);
  const [targetEmail, setTargetEmail] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Verify the oobCode token when the component mounts
  React.useEffect(() => {
    async function verifyCode() {
      if (!oobCode) {
        setIsVerifyingCode(false);
        setIsCodeValid(false);
        setErrorMessage("Missing password reset security token in URL.");
        return;
      }

      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setTargetEmail(userEmail);
        setIsCodeValid(true);
      } catch (err: any) {
        console.error("Invalid reset code:", err);
        setIsCodeValid(false);
        setErrorMessage(
          "This password reset link is invalid or has expired. Please request a new one."
        );
      } finally {
        setIsVerifyingCode(false);
      }
    }

    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (!oobCode) {
      setErrorMessage("Missing security reset token.");
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setIsSuccess(true);

      // Auto-redirect to /admin after 3 seconds
      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 3000);
    } catch (err: any) {
      console.error("Password update error:", err);
      let message = "Failed to update password. Please try again.";
      if (err.code === "auth/expired-action-code") {
        message = "This password reset link has expired. Please request a new link.";
      } else if (err.code === "auth/invalid-action-code") {
        message = "This password reset code is invalid or already used.";
      } else if (err.code === "auth/weak-password") {
        message = "Password is too weak. Choose a stronger password.";
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 relative overflow-hidden text-zinc-900">
      {/* Return to Login Link at Top Left */}
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
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Set New Password</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
            TRENDZHAUZ MEDIA
          </h1>
          {targetEmail && (
            <p className="text-xs text-zinc-500 font-medium">
              Updating credentials for{" "}
              <span className="font-bold text-zinc-800">{targetEmail}</span>
            </p>
          )}
        </div>

        {/* 1. Verifying Token Code Spinner State */}
        {isVerifyingCode ? (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-brand animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-medium">
              Verifying security token from email link...
            </p>
          </div>
        ) : isSuccess ? (
          /* 2. Success State Card */
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
                Password Updated!
              </h3>
              <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                Your password has been changed securely. Redirecting to the login gatekeeper...
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest py-2.5 rounded-md transition-all shadow-xs"
              >
                Sign In Now
              </Link>
            </div>
          </motion.div>
        ) : !isCodeValid ? (
          /* 3. Invalid Code / Expired Token Error Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-red-50 border border-red-200 rounded-md text-center space-y-3"
          >
            <div className="h-12 w-12 bg-red-100 border border-red-300 rounded-full flex items-center justify-center mx-auto text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-red-900 tracking-wide">
                Link Invalid or Expired
              </h3>
              <p className="text-xs text-red-700 font-medium leading-relaxed">
                {errorMessage || "This security link is invalid or has expired."}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/admin/forgot-password"
                className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest py-2.5 rounded-md transition-all shadow-xs"
              >
                Request New Link
              </Link>
            </div>
          </motion.div>
        ) : (
          /* 4. Active Password Update Form */
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
              {/* New Password Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
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

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-md pl-10 pr-10 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs"
                  />
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
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </>
        )}

        <div className="pt-3 text-center border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            TrendzHauz Media · Encrypted Gateway
          </p>
        </div>
      </motion.div>
    </div>
  );
}
