import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert, LogOut, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: "super-admin" | "writer";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAdmin, isWriter, logout } = useAuth();
  const location = useLocation();

  // 1. Loading Spinner State while verifying Firebase JWT & Firestore Role
  if (loading) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center bg-background text-foreground p-6">
        <div className="flex flex-col items-center space-y-4 p-8 rounded-md bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl shadow-2xl">
          <Loader2 className="h-10 w-10 text-brand animate-spin" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
              Verifying Credentials
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Checking security token and database role assignment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Redirect to Login Gatekeeper
  if (!user) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  // 3. Role Authorization Guard
  if (requiredRole === "super-admin" && !isAdmin) {
    return <AccessDeniedScreen logout={logout} roleRequired="Super Admin" />;
  }

  if (requiredRole === "writer" && !isWriter) {
    return <AccessDeniedScreen logout={logout} roleRequired="Writer or Admin" />;
  }

  // 4. Authorized Access
  return <>{children}</>;
}

function AccessDeniedScreen({
  logout,
  roleRequired,
}: {
  logout: () => Promise<void>;
  roleRequired: string;
}) {
  return (
    <div className="flex-1 min-h-[75vh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-md bg-zinc-950/80 border border-red-500/20 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(239,68,68,0.2)]">
        <div className="h-16 w-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-500">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
            Access Denied
          </h2>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Your logged-in account does not possess the necessary{" "}
            <span className="text-red-400 font-bold uppercase">{roleRequired}</span> privileges
            required to enter this administrative dashboard.
          </p>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <a
            href="/"
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-black uppercase tracking-widest rounded-sm text-foreground transition-all inline-flex items-center gap-2"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </a>
          <button
            onClick={() => logout()}
            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest rounded-sm transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
