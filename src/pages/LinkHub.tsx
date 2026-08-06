import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { LinktreeItem } from "@/types/linktree";
import { Loader2, Music, Link as LinkIcon, Mail, Headphones } from "lucide-react";

export default function LinkHub() {
  const [links, setLinks] = useState<LinktreeItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "spotify":
      case "apple":
        return <Music className="w-5 h-5" />;
      case "audiomack":
        return <Headphones className="w-5 h-5" />;
      case "youtube":
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>;
      case "instagram":
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
      case "twitter":
      case "x":
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
      case "tiktok":
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>;
      case "email":
      case "mail":
        return <Mail className="w-5 h-5" />;
      default:
        return <LinkIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="relative min-h-[100svh] flex flex-col items-center py-16 px-4 bg-zinc-950 text-white overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-md flex flex-col items-center">
        {/* Profile / Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-orange-500/50 p-1 mb-6 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
          <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center p-2">
            <img src="/assets/Trendzhauz-logo.png" alt="TrendzHauz" className="w-full h-full object-contain" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2">
          TRENDZHAUZ
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base mb-8 text-center max-w-[280px]">
          Listen to the latest mixes, view bookings, and connect.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
            <span className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Loading Links</span>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {links.filter(l => l.isActive).map((link) => (
              <a
                key={link.id}
                href={link.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link)}
                className="group relative w-full overflow-hidden rounded-xl bg-zinc-900/60 hover:bg-orange-500/10 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 backdrop-blur-sm p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 z-10 relative">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-orange-500 text-zinc-400 group-hover:text-white flex items-center justify-center transition-colors duration-300">
                    {getIcon(link.iconType)}
                  </div>
                  <span className="font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                    {link.title}
                  </span>
                </div>
                <div className="z-10 relative text-zinc-600 group-hover:text-orange-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </a>
            ))}
            
            {links.filter(l => l.isActive).length === 0 && (
              <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                No active links at the moment.
              </div>
            )}
          </div>
        )}

        {/* Branding Footer for Linkhub */}
        <div className="mt-16 text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
            Powered by Trendzhauz
          </span>
        </div>
      </div>
    </div>
  );
}
