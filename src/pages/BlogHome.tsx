import { HeroSection } from "@/components/blog/HeroSection";
import { LatestArticles } from "@/components/blog/LatestArticles";

export default function BlogHome() {
  return (
    <div className="flex-1 flex flex-col w-full bg-background transition-colors duration-300">
      {/* ── Hero Banner ── */}
      <HeroSection />

      {/* ── Orange Brand Divider ── */}
      <div className="w-full h-[3px] bg-brand/90" />

      {/* ── Content Grid Area ── */}
      <LatestArticles />
    </div>
  );
}
