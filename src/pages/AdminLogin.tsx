export default function AdminLogin() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
      <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-foreground">
        CMS Portal Gatekeeper
      </h2>
      <p className="text-muted-foreground mt-4 text-sm">
        Please sign in with authenticated credential structures to manage the database.
      </p>
    </div>
  );
}
