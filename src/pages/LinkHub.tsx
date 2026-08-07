import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { LinktreeItem } from "@/types/linktree";
import { Loader2, Link as LinkIcon, Mail, Sun, Moon, Globe } from "lucide-react";

export default function LinkHub() {
  const [links, setLinks] = useState<LinktreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check OS preference
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true; // Default dark
  });

  useEffect(() => {
    const q = query(
      collection(db, "linktree"),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLinks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LinktreeItem[];
      setLinks(fetchedLinks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLinkClick = async (link: LinktreeItem) => {
    try {
      const linkRef = doc(db, "linktree", link.id);
      await updateDoc(linkRef, {
        clickCount: increment(1)
      });
    } catch (error) {
      console.error("Error updating click count:", error);
    }
  };

  const getIcon = (type: string, isDark: boolean) => {
    switch (type.toLowerCase()) {
      case "spotify":
        return <svg viewBox="0 0 24 24" fill="#1DB954" className="w-6 h-6"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.72 12.9c.36.181.54.78.241 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.32 11.28-1.02 15.721 1.621.54.3.72.96.42 1.5-.3.54-.96.72-1.56.36z"/></svg>;
      case "apple":
        return <svg viewBox="0 0 24 24" fill="#FA243C" className="w-6 h-6"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-1.9.04-3.664 1.11-4.632 2.787-1.952 3.39-.497 8.423 1.405 11.164.928 1.34 2.022 2.84 3.473 2.791 1.378-.04 1.91-.877 3.477-.877 1.563 0 2.05.836 3.483.877 1.488.04 2.417-1.3 3.33-2.628 1.059-1.546 1.495-3.045 1.517-3.12-.03-.016-2.92-1.12-2.946-4.464-.025-2.79 2.277-4.137 2.385-4.197-1.306-1.905-3.328-2.164-4.043-2.222-1.782-.163-3.528 1.04-4.489 1.04v-.113zm1.5-3.11c.789-.955 1.32-2.283 1.176-3.6-.11.05-.173.08-.236.104-1.264.475-2.656 1.258-3.535 2.275-.767.893-1.404 2.247-1.229 3.551 1.407.108 2.873-.64 3.824-2.33z"/></svg>;
      case "audiomack":
        return <img src="/assets/audiomack.png" alt="Audiomack" className="w-6 h-6 object-contain" />;
      case "youtube":
        return <svg viewBox="0 0 24 24" fill="#FF0000" className="w-6 h-6"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
      case "instagram":
        return (
          <svg viewBox="0 0 24 24" fill="url(#ig-grad)" className="w-6 h-6">
            <defs>
              <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                <stop stopColor="#fdf497" offset="0%" />
                <stop stopColor="#fdf497" offset="5%" />
                <stop stopColor="#fd5949" offset="45%" />
                <stop stopColor="#d6249f" offset="60%" />
                <stop stopColor="#285AEB" offset="90%" />
              </radialGradient>
            </defs>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.395a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
          </svg>
        );
      case "twitter":
      case "x":
        return <img src="/assets/x-logo.png" alt="X" className={`w-6 h-6 object-contain ${isDark ? "invert" : ""}`} />;
      case "tiktok":
        return <svg viewBox="0 0 24 24" className={`w-6 h-6 fill-current ${isDark ? "text-white" : "text-zinc-900"}`}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.36-2.93 5.68-1.78 1.33-4.14 1.73-6.19 1.24-2.06-.48-3.79-1.92-4.72-3.83-.93-1.92-.93-4.22 0-6.14.93-1.92 2.66-3.35 4.72-3.83 2.05-.49 4.41-.09 6.19 1.24.16.12.31.25.46.39v-4.66c-.46-.17-.95-.29-1.45-.37-1.41-.21-2.88-.13-4.24.28-1.36.41-2.58 1.21-3.5 2.29-.91 1.08-1.46 2.44-1.59 3.86-.13 1.42.15 2.86.81 4.12.67 1.25 1.69 2.27 2.94 2.94 1.26.66 2.7.94 4.12.81 1.42-.13 2.78-.68 3.86-1.59 1.08-.92 1.88-2.14 2.29-3.5.41-1.36.49-2.83.28-4.24v-6.93Z"/></svg>;
      case "facebook":
        return <svg viewBox="0 0 24 24" fill="#1877F2" className="w-6 h-6"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
      case "email":
      case "mail":
        return <Mail className={`w-6 h-6 ${isDark ? "text-white" : "text-zinc-900"}`} />;
      default:
        return <LinkIcon className={`w-6 h-6 ${isDark ? "text-white" : "text-zinc-900"}`} />;
    }
  };

  const getActionText = (type: string) => {
    const streamingPlatforms = ["spotify", "apple", "audiomack", "youtube"];
    return streamingPlatforms.includes(type.toLowerCase()) ? "Play" : "Visit";
  };

  return (
    <div className={`relative min-h-[100svh] flex flex-col items-center py-16 px-4 overflow-hidden transition-colors duration-500 ${isDarkMode ? "bg-[#0A0A0A] text-white" : "bg-[#FAFAFA] text-zinc-900"}`}>
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-6 right-6 p-2 rounded-full backdrop-blur-md border transition-all duration-300 z-50 ${isDarkMode ? "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10" : "bg-white/80 border-zinc-200 text-zinc-500 hover:text-zinc-900 shadow-sm hover:shadow"}`}
        aria-label="Toggle Theme"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Classy Ambient Background */}
      {isDarkMode ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
        </>
      )}
      
      <div className="z-10 w-full max-w-md flex flex-col items-center">
        {/* Profile / Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mb-6 relative group">
          <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center p-2 shadow-lg relative z-10">
            <img src="/assets/Trendzhauz-logo.png" alt="TrendzHauz" className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500" />
          </div>
          {/* Subtle glow behind avatar */}
          <div className={`absolute inset-0 rounded-full blur-xl scale-110 transition-opacity duration-500 -z-10 ${isDarkMode ? "bg-white/10 opacity-50" : "bg-black/5 opacity-50"}`} />
        </div>

        <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mb-1 ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
          TRENDZHAUZ
        </h1>
        <p className={`text-sm sm:text-base mb-10 text-center max-w-[280px] font-medium ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
          Listen to the latest mixes, view bookings, and connect.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3.5">
            {/* Primary Action: Link Back to Website */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative w-full overflow-hidden rounded-2xl transition-all duration-300 p-4 flex items-center justify-between hover:-translate-y-1 ${
                isDarkMode 
                  ? "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 shadow-lg shadow-black/20 hover:shadow-orange-500/10" 
                  : "bg-white hover:bg-zinc-50 border border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-orange-500/30"
              }`}
            >
              <div className="flex items-center gap-4 z-10 relative">
                <div className={`w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  <Globe className={`w-6 h-6 ${isDarkMode ? "text-white" : "text-zinc-900"}`} />
                </div>
                <span className={`font-semibold tracking-tight transition-colors ${
                  isDarkMode ? "text-zinc-100" : "text-zinc-900"
                }`}>
                  Visit Our Website
                </span>
              </div>
              <div className={`z-10 relative text-[11px] font-bold uppercase tracking-wider transition-colors ${
                isDarkMode ? "text-zinc-500 group-hover:text-zinc-300" : "text-zinc-400 group-hover:text-zinc-600"
              }`}>
                Visit
              </div>
            </a>

            {/* Dynamic Links */}
            {links.filter(l => l.isActive).map((link) => (
              <a
                key={link.id}
                href={link.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link)}
                className={`group relative w-full overflow-hidden rounded-2xl transition-all duration-300 p-4 flex items-center justify-between hover:-translate-y-1 ${
                  isDarkMode 
                    ? "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-lg shadow-black/20 hover:shadow-white/5" 
                    : "bg-white hover:bg-zinc-50 border border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-4 z-10 relative">
                  <div className={`w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    {getIcon(link.iconType, isDarkMode)}
                  </div>
                  <span className={`font-semibold tracking-tight transition-colors ${
                    isDarkMode ? "text-zinc-100 group-hover:text-white" : "text-zinc-800 group-hover:text-zinc-900"
                  }`}>
                    {link.title}
                  </span>
                </div>
                <div className={`z-10 relative text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  isDarkMode ? "text-zinc-500 group-hover:text-zinc-300" : "text-zinc-400 group-hover:text-zinc-600"
                }`}>
                  {getActionText(link.iconType)}
                </div>
              </a>
            ))}
            
            {links.filter(l => l.isActive).length === 0 && (
              <div className={`text-center py-8 border rounded-2xl ${
                isDarkMode ? "text-zinc-500 border-white/10 bg-white/5" : "text-zinc-400 border-zinc-200 bg-white"
              }`}>
                No active links at the moment.
              </div>
            )}
          </div>
        )}

        {/* Branding Footer */}
        <div className="mt-16 text-center">
          <a href="/" className={`text-[10px] uppercase tracking-[0.2em] font-bold hover:text-orange-500 transition-colors ${
            isDarkMode ? "text-zinc-600" : "text-zinc-400"
          }`}>
            Powered by Trendzhauz
          </a>
        </div>
      </div>
    </div>
  );
}
