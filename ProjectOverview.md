Project Overview: Trendzhauz - Serverless Music & Entertainment Blog Platform

1. AI Rules of Engagement & System Directives

- User Authority: The human developer leads the architecture and decision-making. The AI is a strict assistant. The AI MUST NOT generate massive blocks of unsolicited code, auto-implement unapproved features, or change the architecture without explicit permission. Await the developer's prompt for each step.
- Strict TypeScript: This project is built 100% in TypeScript. JavaScript (.js or .jsx) files are strictly prohibited. Enforce strict type checking and define interfaces for all data structures, especially Firebase payloads.
- Framework Rules: Use standard React via Vite. Next.js is strictly prohibited. Do not generate Next.js routing or server components.
- IDE Context: The developer is using Google's Antigravity IDE. Format all code outputs cleanly for this environment.
- Deployment Pipeline: Vercel is used EXCLUSIVELY for preview deployments and staging review environments. Production hosting for BOTH the frontend and serverless backend is handled natively on Firebase.

2. Project Summary
   Trendzhauz is a premium, blazing-fast, custom music and entertainment blog built completely from scratch for DJ Davisy. Moving entirely away from traditional monolithic platforms, this serverless web application delivers app-like loading speeds, flawless responsiveness, and an ironclad architecture that requires zero ongoing infrastructure maintenance.
   Core MVP Features:
1. Editorial Media Layout: A high-end, responsive magazine interface featuring a dynamic homepage hero slider for top trending stories.
1. Decoupled CMS Panel (/admin): A custom, protected administration dashboard supporting multi-writer publishing workflow operations and draft management.
1. Universal Media Parser: An embed resolution component that maps raw music streaming links into optimized, fully responsive iframe widgets.
1. Native Linktree Hub (/links): A mobile-first social aggregation center built entirely on-domain to retain web authority and track fan click analytics.

1. Technology Stack

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, Shadcn UI.
- Rich Text Editor: TipTap (Headless, customizable rich-text content engine).
- Database: Cloud Firestore (NoSQL, optimized for fast structured reads).
- Authentication: Firebase Authentication (Role-based secure administration control).
- Storage: Firebase Storage (Hosting raw binary image files safely away from Firestore).
- Hosting: Firebase Hosting (Free, global CDN-backed edge static deployment).

4. UI/UX & Branding Guidelines
   All styling must adhere strictly to the Trendzhauz brand identity using Tailwind custom utility classes. The design borrows inspiration from clean journalism portals while preserving an edgy entertainment atmosphere.

- Primary Background (Day): Crisp Editorial White (bg-white).
- Primary Background (Night): Deep Slate/Zinc Black (bg-zinc-950).
- Primary Typography: Heavy, bold editorial layout fonts (font-sans or high-impact serifs).
- Brand Accent Color: Trendzhauz Orange (text-orange-500, bg-orange-500).
- Design Ethos: High-contrast, clean, typography-focused layout. Avoid muddy grays. Incorporate a seamless, global application toggle switch for light and dark modes.

5. Architectural Breakdown & Engineering Patterns
   A. Structured Content Modeling (Decoupled Schema)
   To prevent database bloat and preserve future frontend elasticity, the platform completely isolates raw rich-text markup from media links.

- Instead of storing messy HTML strings or manual iframe elements directly inside the editor data, the article body is saved as flat sanitized HTML (content), and the target player URL is saved separately as a clean string data property (musicUrl).
- On render, a custom React component parses the canonical string patterns to mount the matching interactive element natively (supporting Spotify, Audiomack, YouTube, and Apple Music).

B. The "Search Index" Array Pattern
To deliver instantaneous blog content searches for up to 10,000 posts at zero extra platform or third-party infrastructure cost, the database utilizes tokenization arrays.

- Upon saving an article, a client utility sanitizes the title string, drops common stop words, converts the words to lowercase tokens, and logs them into a string array (searchIndex).
- Queries are processed via native Firestore array-contains evaluations, avoiding high-overhead full-text search engine subscriptions.

C. Secure File Decoupling (Binary Image Protection)
To bypass Firestore’s 1MB document size limitations, image properties are completely isolated.

- The admin application explicitly enforces client-side file picker boundaries restricted strictly to image MIME types under 5MB.
- Server-side validation rules drop incoming mutations to the blog-covers/ storage pathway unless the client presents valid admin authentication headers and matching content lengths, saving only the tiny reference string url in Firestore.

6. Route Map & Structural Division
   A. Public Frontend Core

- / (Homepage): Displays the Featured Hero Slider followed by a masonry query layout grid sorting posts across Reviews, Music, and Entertainment News categories.
- /blog/:slug: Renders dynamic individual articles, pairing the rich text element smoothly alongside the context-aware UniversalMusicPlayer.
- /links (The Linktree Hub): A mobile-first, distraction-free landing page feeding active vertical call-to-action redirect links coupled with direct backend click increment logs.

B. Protected Administration Hub

- /admin (CMS Dashboard): Guarded entry view presenting authentication components.
- /admin/create: The writing view containing the custom TipTap text node canvas, categorical tag menus, storage dropdowns, and link fields.
- /admin/linktree: A data manager table where DJ Davisy can order, disable, or track analytical traffic engagement across his bio links.

7. Database Schema (Firestore Collections)
   TypeScript
   interface BlogPost {
   id: string;
   title: string;
   slug: string;
   content: string;
   category: "reviews" | "music" | "entertainment" | "news";
   coverImageUrl: string;
   musicUrl?: string;
   searchIndex: string[];
   status: "draft" | "published";
   authorId: string;
   authorName: string;
   views: number;
   createdAt: Timestamp;
   }

linktree Collection
TypeScript
interface LinktreeItem {
id: string;
title: string;
targetUrl: string;
iconType: "spotify" | "audiomack" | "youtube" | "apple" | "instagram" | "generic";
order: number;
isActive: boolean;
clickCount: number;
}

users Collection
TypeScript
interface UserProfile {
uid: string;
email: string;
displayName: string;
role: "super-admin" | "writer";
}

8. Execution Roadmap (Step-by-Step)
   AI Assistant: Await the developer's command to begin each step. Do not proceed to the next step without approval.

- Step 1: Scaffold the Vite/React/TS environment and install Tailwind CSS and Shadcn UI components.
- Step 2: Link the local development workspace to the Firebase CLI using the developer email authorizations, initializing the local Firestore, Auth, and Storage emulators.
- Step 3: Setup local backend security logic gatekeepers for both Cloud Storage blocks and Firestore mutations.
- Step 4: Build the core App Shell layouts, styling global Tailwind parameters to handle absolute black, white, and orange light/dark switching.
- Step 5: Program the /admin Auth routes, integrating the headless TipTap editor and the multi-author draft dashboard layout.
- Step 6: Construct the title tokenization function and link it to the Firestore dispatch form to fuel the searchIndex array.
- Step 7: Develop the public frontend, coding the high-impact homepage Featured Hero Slider and category grids.
- Step 8: Code the UniversalMusicPlayer component to natively handle client-side dynamic link parsing and iframe creation.
- Step 9: Formulate the /links dynamic landing view and connect it to automated atomic transaction triggers to track redirect click counts.
- Step 10: Connect trendzhauz.com to production Firebase Hosting environments and trigger final clean compilation routines.

src/
├── assets/ # Branding logs, custom SVG brand badges
├── components/ # React structural interfaces
│ ├── ui/ # Shadcn reusable core elements (Buttons, Inputs, Switchers)
│ ├── layout/ # App Shell structures (MainNavbar, Footer)
│ ├── admin/ # CMS dashboard utilities (TipTapCanvas, UploadZone)
│ ├── blog/ # Article components (HeroSlider, PostCard, UniversalMusicPlayer)
│ └── links/ # Bio Link assets (LinkButton)
├── hooks/ # Custom React logic hooks
│ ├── useAuth.ts # Authentication observer mappings
│ ├── useSearch.ts # Search filter array array-contains queries
│ └── useTheme.ts # Dark/Light visual context management
├── pages/ # Main routing views
│ ├── BlogHome.tsx # Public structural home grid
│ ├── BlogPostView.tsx# Individual single article view
│ ├── LinkHub.tsx # The custom link-in-bio route
│ ├── AdminLogin.tsx # Dashboard authentication gate
│ └── AdminPanel.tsx # Core CMS base controls
├── services/ # Backend cloud orchestration
│ └── firebase.ts # Firestore initialization configuration
├── types/ # Strict type parameters
│ └── index.ts # Database collection interfaces
├── utils/ # Global structural helpers
│ ├── slugify.ts # Generates safe paths from text titles
│ └── textSplit.ts # Tokenizer utility converting text to lowercase arrays
├── App.tsx # Main routing shell
├── main.tsx # DOM node entry layer
└── index.css # Tailwind custom visual layout injections
