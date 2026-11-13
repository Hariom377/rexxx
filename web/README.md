# REXAM — React 19 Web Platform

Modern, responsive, SEO-optimized SaaS website for **REXAM** built with React 19, TypeScript, Vite, Tailwind CSS, and Supabase.

---

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom REXAM dark theme, responsive breakpoints)
- **Routing**: React Router v6 (SPA routing with Cloudflare Pages `_redirects` fallback)
- **Backend & Auth**: Supabase JS Client (`@supabase/supabase-js` v2)
- **State Management**: TanStack Query v5 (`@tanstack/react-query`)
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **SEO & SSG**: Static HTML Prerendering (`scripts/prerender.js`), `react-helmet-async`, XML sitemap (`/sitemap.xml`), `robots.txt`, Schema.org JSON-LD structured data (`WebSite`, `Organization`, `JobPosting`).

---

## Local Development

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build & Static Prerendering
```bash
npm run build
```
This runs:
1. `tsc --noEmit` (Full TypeScript strict typechecking)
2. `vite build` (Production bundling with vendor code-splitting)
3. `node scripts/prerender.js` (Extracts verified live opportunities from Supabase and prerenders static HTML files for all public SEO routes into `dist/`)

### 4. Preview Production Build Locally
```bash
npm run preview
```
Open [http://localhost:4173](http://localhost:4173) in your browser.

---

## Cloudflare Pages Deployment

### Settings:
- **Framework Preset**: `Vite` (or `None`)
- **Root Directory**: `web`
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Node.js Version**: `18.x` or higher

### Environment Variables:
| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://bryatogngcaissitkgvv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SITE_URL` | `https://rexam.in` (or your Cloudflare Pages domain) |

---

## Directory Structure
```
web/
├── public/
│   ├── _redirects       # Cloudflare Pages SPA rewrite rule
│   ├── robots.txt       # Search engine crawler directives
│   └── manifest.json    # PWA configuration
├── scripts/
│   └── prerender.js     # SSG HTML prerenderer & sitemap generator
├── src/
│   ├── components/      # Shared UI (OpportunityCard, EmptyState, SearchBar, PageHeader)
│   ├── contexts/        # AuthContext (Supabase auth & candidate session)
│   ├── layouts/         # AppLayout (Desktop sidebar + mobile bottom nav), PublicLayout
│   ├── lib/             # Supabase client, cn utility, formatters
│   ├── pages/
│   │   ├── app/         # Discover, Explorer, Saved, Applications, Profile, Wizard, Alerts, Settings
│   │   ├── auth/        # Login, Register, ForgotPassword, AuthCallback
│   │   └── public/      # Landing, Jobs, Exams, Scholarships, OpportunityDetail, About, Contact, Privacy, Terms
│   ├── styles/          # globals.css & Tailwind layers
│   ├── types/           # Supabase Database schema & application interfaces
│   ├── App.tsx          # Router configuration
│   └── main.tsx         # Root entry point
├── dist/                # Production build & prerendered HTML output
├── vite.config.ts
├── tailwind.config.js
└── package.json
```
