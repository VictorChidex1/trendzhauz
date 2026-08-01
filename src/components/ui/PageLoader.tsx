export function PageLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest">
        Loading...
      </p>
    </div>
  );
}
