import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { PageLoader } from "@/components/ui/PageLoader";
import { pruneExpiredCache } from "@/utils/queryCache";
import BlogHome from "@/pages/BlogHome";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const MusicPage = lazy(() => import("@/pages/MusicPage"));
const ReviewsPage = lazy(() => import("@/pages/ReviewsPage"));
const VideosPage = lazy(() => import("@/pages/VideosPage"));
const BlogPostView = lazy(() => import("@/pages/BlogPostView"));
const LinkHub = lazy(() => import("@/pages/LinkHub"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

import { useLocation } from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Automatically prune expired localStorage cache entries on app boot
  useEffect(() => {
    pruneExpiredCache();
  }, []);

  return (
    <div className="theme min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Show Main Navigation Bar only on public routes */}
      {!isAdminRoute && <MainNavbar />}

      {/* Main Page Layout Envelope */}
      <main className="flex-1 flex flex-col w-full">
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public Routing */}
          <Route path="/" element={<BlogHome />} />
          <Route path="/category/music" element={<MusicPage />} />
          <Route path="/category/reviews" element={<ReviewsPage />} />
          <Route path="/category/videos" element={<VideosPage />} />
          <Route path="/category/:category" element={<BlogHome />} />
          <Route path="/links" element={<LinkHub />} />

          {/* Article Detail — category-based URL: /{category}/{slug} */}
          <Route path="/:category/:slug" element={<BlogPostView />} />

          {/* Administrative CMS Routing */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route
            path="/admin/panel"
            element={
              <ProtectedRoute requiredRole="writer">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route
            path="*"
            element={
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <h1 className="text-4xl font-black text-brand tracking-tighter uppercase">
                  404
                </h1>
                <p className="text-muted-foreground mt-2 font-bold uppercase tracking-wider text-xs">
                  Page Not Found
                </p>
              </div>
            }
          />
          </Routes>
        </Suspense>
      </main>

      {/* Show Core Footer and ScrollToTop only on public routes */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ScrollToTop />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

