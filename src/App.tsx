import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { Footer } from "@/components/layout/Footer";
import BlogHome from "@/pages/BlogHome";
import BlogPostView from "@/pages/BlogPostView";
import LinkHub from "@/pages/LinkHub";
import AdminLogin from "@/pages/AdminLogin";
import AdminPanel from "@/pages/AdminPanel";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="theme min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
          {/* Main Navigation Bar */}
          <MainNavbar />

          {/* Main Page Layout Envelope */}
          <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Routing */}
              <Route path="/" element={<BlogHome />} />
              <Route path="/category/:category" element={<BlogHome />} />
              <Route path="/post/:slug" element={<BlogPostView />} />
              <Route path="/links" element={<LinkHub />} />

              {/* Administrative CMS Routing */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/panel" element={<AdminPanel />} />

              {/* Catch-all 404 Route */}
              <Route 
                path="*" 
                element={
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <h1 className="text-4xl font-black text-brand tracking-tighter uppercase">404</h1>
                    <p className="text-muted-foreground mt-2 font-bold uppercase tracking-wider text-xs">
                      Page Not Found
                    </p>
                  </div>
                } 
              />
            </Routes>
          </main>

          {/* Core Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
