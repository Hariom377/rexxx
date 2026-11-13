# REXAM Web — Cloudflare Pages Deployment Guide

This guide covers everything needed to build and deploy the REXAM Flutter Web application to Cloudflare Pages.

**One REXAM product. One Supabase backend. Android + Web.**

---

## Prerequisites

- GitHub repository with the REXAM codebase
- Cloudflare account (free tier supported)
- Existing Supabase project with REXAM database applied
- Google OAuth client configured (see [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md))

---

## 1. Architecture Overview

```
Cloudflare Pages (CDN)
       │
       │  HTTPS
       ▼
Flutter Web (SPA — build/web/)
       │
       │  HTTPS API
       ▼
Supabase (PostgreSQL + Auth + Storage)
       │
       │  (shared backend)
       ▼
Android App (same Supabase project)
```

The web and Android applications share the **exact same Supabase project, database, and user accounts**. A student who registered on Android can log in on web with the same credentials.

---

## 2. Supabase Configuration for Web

Before deploying, configure Supabase to accept web OAuth redirects.

### 2a. Add Web Redirect URLs

1. Open **Supabase Dashboard** → your project → **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   http://localhost:8080/auth/callback
   https://rexam.pages.dev/auth/callback
   https://your-custom-domain.com/auth/callback
   ```
   Replace `rexam.pages.dev` and `your-custom-domain.com` with your actual domains.

3. Under **Site URL**, set:
   ```
   https://your-custom-domain.com
   ```
   (or `https://rexam.pages.dev` if no custom domain yet)

### 2b. Google OAuth Web Client

1. Open **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Web Client (used for Supabase)
3. Under **Authorized redirect URIs**, ensure this is present:
   ```
   https://<your-supabase-ref>.supabase.co/auth/v1/callback
   ```
   This is Supabase's own callback — it was already set when you configured Android OAuth. No new entry needed unless you created a separate web client.

---

## 3. GitHub Repository Setup

Ensure your repository is connected to Cloudflare Pages. See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for the initial setup.

Your repository structure must have:
```
Maxer-main/
├── mobile/          ← Flutter project root (Cloudflare build root)
│   ├── lib/
│   ├── web/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── _redirects   ← SPA fallback (required for routing)
│   │   └── robots.txt
│   └── pubspec.yaml
└── ...
```

---

## 4. Cloudflare Pages Configuration

### 4a. Create a New Pages Project

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Pages** → **Create a project** → **Connect to Git**
3. Authorize GitHub and select your REXAM repository
4. Configure the build settings:

| Setting | Value |
|---------|-------|
| **Project name** | `rexam` (or your preferred name) |
| **Production branch** | `main` |
| **Framework preset** | `None` |
| **Root directory** | `mobile` |
| **Build command** | *(see Section 4b)* |
| **Build output directory** | `build/web` |

### 4b. Build Command

Cloudflare Pages does not include the Flutter SDK. The build command must install it first:

```bash
git clone https://github.com/flutter/flutter.git --depth 1 -b stable /opt/flutter && \
export PATH="$PATH:/opt/flutter/bin" && \
flutter config --enable-web && \
flutter pub get && \
flutter build web --release \
  --dart-define=SUPABASE_URL=$SUPABASE_URL \
  --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  --dart-define=WEB_OAUTH_REDIRECT_URL=$WEB_OAUTH_REDIRECT_URL
```

> **Note:** This installs Flutter's latest stable SDK on every build. Build time is approximately 4–6 minutes. Cloudflare Pages free tier allows 500 builds/month.

### 4c. Environment Variables

In Cloudflare Pages → your project → **Settings** → **Environment Variables**, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `SUPABASE_URL` | `https://your-ref.supabase.co` | From Supabase Dashboard → Project Settings → API |
| `SUPABASE_ANON_KEY` | `eyJ...` | Anon/publishable key only — **never** service role |
| `WEB_OAUTH_REDIRECT_URL` | `https://rexam.pages.dev/auth/callback` | Your Cloudflare Pages domain + `/auth/callback` |

> [!CAUTION]
> **Never add `SUPABASE_SERVICE_ROLE_KEY` to Cloudflare Pages environment variables.** The service role key bypasses all RLS policies and must only be used in server-side environments (GitHub Actions, Python engine). The Flutter web build only needs the anon key.

Set these variables for both **Production** and **Preview** environments (use different values if you have a separate staging Supabase project).

---

## 5. SPA Routing — `_redirects`

The file `mobile/web/_redirects` contains:
```
/* /index.html 200
```

Flutter copies this into `build/web/_redirects` during the build. Cloudflare Pages reads this file automatically and serves `index.html` for any path that isn't a static file. This enables:
- Direct URL access: `https://rexam.pages.dev/discover`
- Browser refresh on nested routes: `https://rexam.pages.dev/opportunities/exam-id-123`
- Browser back/forward button navigation

---

## 6. Custom Domain (Optional)

1. Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain**
2. Enter your domain (e.g., `app.rexam.in`)
3. Cloudflare automatically provisions SSL and configures DNS (if the domain is managed by Cloudflare)
4. After custom domain is live, update:
   - `WEB_OAUTH_REDIRECT_URL` environment variable → `https://app.rexam.in/auth/callback`
   - Supabase Auth redirect URLs → add `https://app.rexam.in/auth/callback`
   - Supabase Auth Site URL → `https://app.rexam.in`

---

## 7. Local Web Development

```bash
cd mobile

# Install dependencies
flutter pub get

# Run on web (Chrome)
flutter run -d chrome \
  --dart-define=SUPABASE_URL=https://your-ref.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key \
  --dart-define=WEB_OAUTH_REDIRECT_URL=http://localhost:8080/auth/callback

# Or use a .env file approach with flutter_dotenv (not currently used)
# Alternatively pass --dart-define-from-file=.env.json
```

For Google OAuth to work locally, `http://localhost:8080/auth/callback` must be in your Supabase redirect URLs.

---

## 8. Production Build Verification

```bash
cd mobile

# Full release build
flutter build web --release \
  --dart-define=SUPABASE_URL=https://your-ref.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key \
  --dart-define=WEB_OAUTH_REDIRECT_URL=https://rexam.pages.dev/auth/callback

# Verify output
ls build/web/
# Should contain: index.html, main.dart.js, flutter_bootstrap.js,
#                 assets/, icons/, manifest.json, _redirects, robots.txt

# Serve locally to test the production build
cd build/web && python -m http.server 8080
```

---

## 9. Browser Testing Checklist

After each deployment, verify:

| Test | URL | Expected |
|------|-----|----------|
| Homepage | `/` | Redirects to `/welcome` |
| Welcome | `/welcome` | REXAM welcome screen loads |
| Login | `/auth` | Email/Google auth forms visible |
| Direct dashboard | `/discover` | Redirects to `/welcome` (unauthenticated) |
| Dashboard (authed) | `/discover` | Personalized opportunity cards load |
| Opportunity detail | `/opportunities/:id` | Opportunity details load |
| Browser refresh | `/saved` | Page loads correctly (not 404) |
| Google OAuth | Click "Continue with Google" | Redirects to Google, returns to `/discover` |
| Password reset | Enter email → Reset | Email received with `/auth/callback` link |
| Logout | Settings → Logout | Redirects to `/welcome` |

---

## 10. Troubleshooting

### "Page not found" on refresh

**Cause:** `_redirects` file missing from `build/web/`  
**Fix:** Confirm `mobile/web/_redirects` exists. It's automatically copied by `flutter build web`.

### Google OAuth redirects to wrong URL

**Cause:** `WEB_OAUTH_REDIRECT_URL` environment variable not set, or not added to Supabase redirect URLs.  
**Fix:**
1. Add `WEB_OAUTH_REDIRECT_URL` to Cloudflare Pages environment variables
2. Add the same URL to Supabase Auth → URL Configuration → Redirect URLs
3. Redeploy

### "Supabase connection unavailable"

**Cause:** `SUPABASE_URL` or `SUPABASE_ANON_KEY` not set in Cloudflare environment variables.  
**Fix:** Add variables in Cloudflare Pages → Settings → Environment Variables → Production.

### Build fails: "flutter: command not found"

**Cause:** Flutter SDK installation in the build command failed.  
**Fix:** Check build logs. The git clone step requires internet access and ~500MB. If Cloudflare build times out (>20 min), consider pinning a specific Flutter version:
```bash
git clone https://github.com/flutter/flutter.git --depth 1 -b 3.24.0 /opt/flutter
```

### CORS errors in browser console

**Cause:** Supabase project allows all origins by default. If you restricted origins, add your domain.  
**Fix:** Supabase Dashboard → Project Settings → API → allowed origins — add your Cloudflare Pages domain.

### "Invalid redirect URL" from Supabase during Google login

**Cause:** The URL passed to Supabase OAuth doesn't match any entry in the allowed redirect list.  
**Fix:** Confirm `WEB_OAUTH_REDIRECT_URL` exactly matches one of the URLs in Supabase Auth → URL Configuration → Redirect URLs (including protocol and path).

---

## 11. Flutter Version

The build command uses `flutter/flutter` stable branch. To pin a specific version:
```bash
git clone https://github.com/flutter/flutter.git --depth 1 -b 3.24.0 /opt/flutter
```

The project `pubspec.yaml` requires `sdk: ^3.13.1`. Any Flutter ≥3.13.1 stable will work.

---

## 12. GitHub Actions (Automated CI/CD)

Alternatively, use GitHub Actions to build and push to Cloudflare Pages:

```yaml
# .github/workflows/deploy-web.yml
name: Deploy REXAM Web to Cloudflare Pages

on:
  push:
    branches: [main]
    paths:
      - 'mobile/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: 'stable'
          channel: 'stable'

      - name: Enable Flutter Web
        run: flutter config --enable-web

      - name: Install dependencies
        working-directory: mobile
        run: flutter pub get

      - name: Build Flutter Web
        working-directory: mobile
        run: |
          flutter build web --release \
            --dart-define=SUPABASE_URL=${{ secrets.SUPABASE_URL }} \
            --dart-define=SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }} \
            --dart-define=WEB_OAUTH_REDIRECT_URL=${{ secrets.WEB_OAUTH_REDIRECT_URL }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: rexam
          directory: mobile/build/web
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**Required GitHub Secrets for CI/CD:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (anon key — not service role)
- `WEB_OAUTH_REDIRECT_URL`
- `CLOUDFLARE_API_TOKEN` (from Cloudflare → My Profile → API Tokens → Create Token → Edit Cloudflare Pages)
- `CLOUDFLARE_ACCOUNT_ID` (from Cloudflare Dashboard → right sidebar)

---

## Security Checklist

- [ ] Only `SUPABASE_ANON_KEY` is exposed in the web build (never `service_role`)
- [ ] Supabase RLS policies are enabled on all tables
- [ ] OAuth redirect URLs are explicitly listed in Supabase (no wildcards)
- [ ] `robots.txt` blocks authenticated dashboard routes from indexing
- [ ] No `.env` files committed to the repository
