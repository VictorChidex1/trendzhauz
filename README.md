# Trendzhauz - Serverless Music & Entertainment Blog Platform

A premium, blazing-fast, custom serverless music and entertainment blog built from scratch for **DJ Davisy**. Moving away from traditional monolithic content management systems, this application leverages a decoupled client-serverless architecture to deliver app-like loading speeds, flawless responsiveness, and zero ongoing server maintenance costs.

---

## 🚀 Core Features

*   **Editorial Media Layout**: A high-end, high-contrast magazine layout featuring a responsive design and homepage hero slider for top trending stories.
*   **Decoupled CMS Panel (`/admin`)**: A custom, role-protected administrative dashboard supporting multi-writer publishing workflows, real-time rich-text editing, and draft management.
*   **Universal Media Parser**: A custom embed parser that resolves canonical streaming links (Spotify, Audiomack, YouTube, Apple Music) into responsive player widgets natively in articles.
*   **On-Domain Linktree Hub (`/links`)**: A mobile-first, distraction-free landing page aggregating social links and tracking fan redirect click analytics using atomic Firestore transactions.
*   **Array Tokenization Search**: Instant content search covering up to 10,000 posts via a custom title-tokenization index, completely bypassing expensive third-party full-text search subscriptions.
*   **Binary File Decoupling**: Restricts and isolates high-resolution images via Cloud Storage rules, storing only tiny reference URLs in Firestore to keep database documents under 1MB.

---

## 🛠️ Technology Stack

*   **Frontend Framework**: React 19, Vite, TypeScript
*   **Styling**: Tailwind CSS, Shadcn UI (Radix / Nova preset)
*   **Typography**: Geist Sans Variable Font
*   **Rich Text Editor**: Headless TipTap content engine
*   **Database**: Cloud Firestore (NoSQL, optimized for fast structured reads)
*   **Authentication**: Firebase Authentication (Role-based access controls)
*   **Cloud Storage**: Firebase Storage (Secure binary file hosting)
*   **Hosting**: Firebase Hosting (CDN-backed edge deployment)
*   **Code Diagnostics**: Oxlint (Rust-based ultra-fast linter)

---

## 📂 Project Structure

```
src/
├── assets/         # Branding logos, custom SVG badges
├── components/     # React structural components
│   ├── ui/         # Shadcn reusable core elements (Button, Switch, Input, Label)
│   ├── layout/     # App Shell structures (Navbar, Footer)
│   ├── admin/      # CMS dashboard utilities (TipTap Canvas, Upload Zone)
│   ├── blog/       # Article components (Hero Slider, Universal Music Player)
│   └── links/      # Bio Link assets
├── hooks/          # Custom React logic hooks (useAuth, useSearch, useTheme)
├── pages/          # Main routing views (BlogHome, BlogPostView, LinkHub, AdminLogin, AdminPanel)
├── services/       # Backend cloud orchestrations (firebase.ts initialization)
├── types/          # Database collection schemas
├── utils/          # Helpers (slugify path generator, searchIndex array tokenizer)
├── App.tsx         # Main routing shell
├── main.tsx        # DOM node entry layer
└── index.css       # Tailwind custom styles and CSS variables (OKLCH light/dark theme)
```

---

## ⚙️ Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   Java Runtime Environment (JRE) (required for running Firebase emulators locally)
*   Firebase CLI (`npm install -g firebase-tools`)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Run Firebase Emulators
Boot up the local database, auth, storage, and emulator dashboard:
```bash
firebase emulators:start
```
The Firebase Emulator Suite dashboard will be accessible at [http://localhost:4000](http://localhost:4000).

### 4. Start Vite Dev Server
In a separate terminal window, start the React application:
```bash
npm run dev
```
The app will detect local development and automatically route all database, storage, and auth operations to your local emulators.

---

## 🔒 Database Schemas

### BlogPost
```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: "reviews" | "music" | "entertainment" | "news";
  coverImageUrl: string;
  musicUrl?: string;
  searchIndex: string[]; // Lowercase sanitized tokens for search
  status: "draft" | "published";
  authorId: string;
  authorName: string;
  views: number;
  createdAt: Timestamp;
}
```

### LinktreeItem
```typescript
interface LinktreeItem {
  id: string;
  title: string;
  targetUrl: string;
  iconType: "spotify" | "audiomack" | "youtube" | "apple" | "instagram" | "generic";
  order: number;
  isActive: boolean;
  clickCount: number;
}
```

### UserProfile
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "super-admin" | "writer";
}
```
