# REXAM — Web SEO & AEO Architecture Guide
## Public Discovery & AI Engine Optimization (AEO) Strategy

### 1. Executive Summary

Flutter Web is an application-tier framework designed for rich, single-page application (SPA) interactions using HTML5 Canvas / WebAssembly (Wasm). While ideal for candidate dashboards, interactive eligibility engines, qualification wizards, and application tracking, search engine crawlers (Googlebot, Bingbot, Perplexity, OpenAI Search, and DuckDuckGo) prefer server-rendered HTML for deep indexing of thousands of dynamic job/exam listings.

This document outlines the dual-architecture strategy that pairs the **REXAM Flutter Web SaaS Application** with an **Edge-Rendered Public Discovery Portal** powered by the existing Supabase backend.

---

### 2. Dual-Layer Architecture

```
                       ┌───────────────────────────────────────┐
                       │           Incoming Request            │
                       └───────────────────┬───────────────────┘
                                           │
                        Is path public or authenticated?
                                           │
                   ┌───────────────────────┴───────────────────────┐
                   ▼                                               ▼
     [Public & SEO Routes]                            [Interactive App Routes]
     - / (Landing)                                    - /discover
     - /opportunities/* (Public Pages)                - /explorer
     - /scholarships/*                                - /eligibility/*
     - /authorities/*                                 - /profile/*
                   │                                  - /saved
                   │                                  - /applications
                   ▼                                  - /settings
     ┌───────────────────────────┐                                 │
     │ Edge SSR (Astro / Worker) │                                 ▼
     │ Cloudflare Pages Function │                    ┌─────────────────────────┐
     │ Reads from same Supabase  │                    │ Flutter Web Application │
     └─────────────┬─────────────┘                    │   (SPA compiled to JS)  │
                   │                                  └────────────┬────────────┘
                   ▼                                               │
     ┌─────────────────────────────────────────────────────────────┴──────────┐
     │                   Existing Supabase Backend                            │
     │          (PostgreSQL / Row Level Security / Auth / Storage)            │
     └────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Immediate Flutter Web SEO Enhancements (Implemented)

The Flutter Web application in `mobile/web` contains the following search discovery foundation:
1. **Canonical Metadata & Open Graph**: Comprehensive tags in `index.html` for Facebook, LinkedIn, Twitter/X, and WhatsApp link previews.
2. **Schema.org Structured Data**: Embedded JSON-LD defining `WebApplication` schema for search engines and AI knowledge graphs.
3. **`sitemap.xml`**: Defined in `mobile/web/sitemap.xml` covering public-facing URLs (`/`, `/welcome`, `/login`, `/register`).
4. **`robots.txt`**: Defined in `mobile/web/robots.txt` allowing indexing of public routes while protecting candidate data, session tokens, and personal qualification records.
5. **Clean URL Strategy**: Path URL strategy enabled (`usePathUrlStrategy()` in `main.dart`) eliminating `#` hash fragments from browser URLs.
6. **Cloudflare SPA Routing**: `_redirects` file (`/* /index.html 200`) enabling direct URL hits and browser refreshes on all deep links.

---

### 4. Recommended Edge SEO Portal (Astro / Cloudflare Pages)

For indexing individual examinations (e.g., `rexam.in/opportunities/upsc-cse-2026`):

1. **Framework**: Astro 4.x or Cloudflare Pages Functions.
2. **Data Source**: Connect directly to the existing Supabase project (`https://bryatogngcaissitkgvv.supabase.co`) with the same anonymous API key.
3. **Page Generation**:
   - Static Site Generation (SSG) with Incremental Regeneration for top examinations.
   - Server-Side Rendering (SSR) at the Cloudflare edge for search bots.
4. **CTA Redirection**: Each public examination page contains a prominent *"Check My Eligibility on REXAM"* button that navigates seamlessly into `/opportunities/:id` in the Flutter Web App.

---

### 5. Answer Engine Optimization (AEO) Strategy

To optimize for AI search agents (ChatGPT Search, Perplexity, Google Gemini, Claude):
- **Structured JSON-LD `JobPosting` and `EducationalOccupationalCredential` schema** on opportunity details.
- **Factual Question-and-Answer Pairs** in metadata (e.g., *"What is the age limit for UPSC CSE?"*, *"What are the required qualifications?"*).
- **Authoritative Provenance**: Clear source attributions linking to official Indian gazette notifications, preventing AI hallucination penalties.
