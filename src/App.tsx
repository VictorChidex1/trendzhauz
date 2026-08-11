import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { RouteScrollReset } from "@/components/ui/RouteScrollReset";
import { PageLoader } from "@/components/ui/PageLoader";
import { pruneExpiredCache } from "@/utils/queryCache";
import BlogHome from "@/pages/BlogHome";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const MusicPage = lazy(() => import("@/pages/MusicPage"));
const ReviewsPage = lazy(() => import("@/pages/ReviewsPage"));
const VideosPage = lazy(() => import("@/pages/VideosPage"));
const NewsPage = lazy(() => import("@/pages/NewsPage"));
const AdvertisePage = lazy(() => import("@/pages/AdvertisePage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const BlogPostView = lazy(() => import("@/pages/BlogPostView"));
const LinkHub = lazy(() => import("@/pages/LinkHub"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("@/pages/TermsOfServicePage"));

import { useLocation } from "react-router-dom";
import { PageSeo } from "@/components/seo/PageSeo";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isIsolatedRoute = isAdminRoute || location.pathname.startsWith("/links");

  // Automatically prune expired localStorage cache entries on app boot
  useEffect(() => {
    pruneExpiredCache();
  }, []);

  return (
    <div className="theme min-h-[100svh] flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Auto-scroll to top on every route change */}
      <RouteScrollReset />

      {/* Show Main Navigation Bar only on public routes */}
      {!isIsolatedRoute && <MainNavbar />}

      {/* Main Page Layout Envelope */}
      <main className="flex-1 flex flex-col w-full">
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public Routing */}
          <Route path="/" element={<BlogHome />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/links" element={<LinkHub />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />

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
                <PageSeo title="404 — Page Not Found" description="The page you are looking for does not exist." path={location.pathname} noindex />
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
      {!isIsolatedRoute && <Footer />}
      {!isIsolatedRoute && <ScrollToTop />}
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

