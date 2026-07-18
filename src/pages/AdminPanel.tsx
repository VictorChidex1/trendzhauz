export default function AdminPanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
      <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-foreground">
        CMS Dashboard Controls
      </h2>
      <p className="text-muted-foreground mt-4 text-sm">
        Publish drafts, manage streaming assets, and compile metadata collections.
      </p>
    </div>
  );
}
