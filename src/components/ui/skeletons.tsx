import { useLocation } from "react-router-dom";

export function HubGridSkeleton() {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-10 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="space-y-4 animate-pulse">
            <div className="aspect-[16/10] w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
            <div className="space-y-2">
              <div className="h-3 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
              <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
              <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="flex-1 w-full bg-background">
      <div className="w-full bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-3 w-24 bg-zinc-700 rounded-sm" />
          <div className="h-6 w-40 bg-zinc-700 rounded-sm" />
          <div className="h-12 w-3/4 bg-zinc-700 rounded-sm" />
          <div className="h-4 w-1/2 bg-zinc-700 rounded-sm" />
          <div className="h-3 w-64 bg-zinc-700/70 rounded-sm" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto w-full py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 space-y-8 min-w-0">
            <div className="w-full aspect-[16/9] bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
              <div className="h-4 w-11/12 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
              <div className="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
              <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
            </div>
          </div>
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                    <div className="h-3 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RouteSkeleton() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  if (segments.length >= 2) return <ArticleSkeleton />;
  return <HubGridSkeleton />;
}