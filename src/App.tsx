import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { pruneExpiredCache } from "@/utils/queryCache";
import BlogHome from "@/pages/BlogHome";
import ReviewsPage from "@/pages/ReviewsPage";
import BlogPostView from "@/pages/BlogPostView";
import LinkHub from "@/pages/LinkHub";
import AdminLogin from "@/pages/AdminLogin";
import AdminPanel from "@/pages/AdminPanel";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<BlogHome />} />
          <Route path="/category/reviews" element={<ReviewsPage />} />
          <Route path="/category/:category" element={<BlogHome />} />
          <Route path="/post/:slug" element={<BlogPostView />} />
          <Route path="/links" element={<LinkHub />} />

          {/* Administrative CMS Routing */}
          <Route path="/admin" element={<AdminLogin />} />
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
      </main>

      {/* Show Core Footer and ScrollToTop only on public routes */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ScrollToTop />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

