import { useParams } from "react-router-dom";

export default function BlogPostView() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
      <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-foreground">
        Article Details
      </h2>
      <p className="text-muted-foreground mt-4 text-sm">
        Currently loading slug parameter: <code className="bg-muted px-2 py-1 rounded text-foreground">{slug}</code>
      </p>
    </div>
  );
}
