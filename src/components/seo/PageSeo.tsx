import { Helmet } from "react-helmet-async";
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  OG_LOCALE,
  STAGING_HOST_MARKERS,
} from "@/seo/site";

interface PageSeoProps {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  section?: string;
}

function isStagingHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return STAGING_HOST_MARKERS.some((marker) => host.includes(marker));
}

function absoluteUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  if (/^https?:\/\//.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

export function PageSeo({
  title,
  description,
  path,
  image,
  type = "website",
  noindex = false,
  jsonLd,
  publishedTime,
  modifiedTime,
  authorName,
  section,
}: PageSeoProps) {
  const finalTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalImage = absoluteUrl(image, DEFAULT_OG_IMAGE);
  const canonicalUrl = `${SITE_URL}${path}`;
  const forceNoindex = noindex || isStagingHost();
  const robotsContent = forceNoindex ? "noindex, nofollow" : "index, follow";

  const ldJson = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : [];

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:locale" content={OG_LOCALE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && authorName && (
        <meta property="article:author" content={authorName} />
      )}
      {type === "article" && section && (
        <meta property="article:section" content={section} />
      )}

      {ldJson.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  );
}
