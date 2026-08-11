/**
 * JSON-LD structured data builders (Schema.org).
 * Pure functions — no React. Each returns a plain object that PageSeo
 * serializes into a <script type="application/ld+json"> tag.
 */
import { SITE_NAME, SITE_URL, SOCIAL_LINKS, DEFAULT_DESCRIPTION } from "./site";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/Trendzhauz-logo.png`,
    description: DEFAULT_DESCRIPTION,
    sameAs: SOCIAL_LINKS,
    address: {
      "@type": "PostalAddress",
      addressCountry: "NG",
    },
    areaServed: "NG",
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-NG",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: `${SITE_URL}/assets/Trendzhauz-logo.png`,
    },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function collectionPageSchema(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: `${SITE_URL}${path}`,
    inLanguage: "en-NG",
  };
}

interface ArticleSchemaInput {
  title: string;
  description: string;
  image: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  category: string;
  url: string;
  isNews?: boolean;
}

export function articleSchema(input: ArticleSchemaInput) {
  const type = input.isNews ? "NewsArticle" : "Article";
  return {
    "@context": "https://schema.org",
    "@type": type,
    headline: input.title,
    description: input.description,
    image: input.image,
    url: `${SITE_URL}${input.url}`,
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    inLanguage: "en-NG",
    mainEntityOfPage: `${SITE_URL}${input.url}`,
    author: {
      "@type": "Person",
      name: input.authorName || "TrendzHauz Editor",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/Trendzhauz-logo.png`,
      },
    },
    articleSection: input.category,
  };
}

interface ReviewSchemaInput {
  title: string;
  description: string;
  image: string;
  rating: number;
  url: string;
  datePublished?: string;
  authorName?: string;
  artistName?: string;
  projectTitle?: string;
  projectType?: string;
}

export function reviewSchema(input: ReviewSchemaInput) {
  const itemName = input.projectTitle || input.title;
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    name: `Review: ${input.title}`,
    description: input.description,
    url: `${SITE_URL}${input.url}`,
    datePublished: input.datePublished,
    inLanguage: "en-NG",
    author: {
      "@type": "Person",
      name: input.authorName || "TrendzHauz Editor",
    },
    itemReviewed: {
      "@type": input.projectType === "Album" ? "MusicAlbum" : "MusicRecording",
      name: itemName,
      ...(input.artistName ? { byArtist: { "@type": "MusicGroup", name: input.artistName } } : {}),
      image: input.image,
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: input.rating,
      bestRating: 10,
      worstRating: 0,
    },
  };
}

export function webpageSchema(name: string, path: string, description?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url: `${SITE_URL}${path}`,
    ...(description ? { description } : {}),
    inLanguage: "en-NG",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

// ── Alias exports matching page-level imports ──

export const getOrganizationSchema = organizationSchema;
export const getWebSiteSchema = websiteSchema;
export const getReviewSchema = reviewSchema;
export const getCollectionPageSchema = collectionPageSchema;
export const getBreadcrumbSchema = breadcrumbSchema;

/**
 * Adapter: maps the BlogPostView call-site names (path, publishedTime, etc.)
 * to the internal articleSchema() contract (url, datePublished, etc.).
 */
export function getArticleSchema(input: {
  title: string;
  description: string;
  image: string;
  path: string;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  section?: string;
}) {
  return articleSchema({
    title: input.title,
    description: input.description,
    image: input.image,
    url: input.path,
    datePublished: input.publishedTime,
    dateModified: input.modifiedTime,
    authorName: input.authorName,
    category: input.section || "News",
  });
}
