import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.resolve(__dirname, '../dist')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bryatogngcaissitkgvv.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeWF0b2duZ2NhaXNzaXRrZ3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMTkzMDIsImV4cCI6MjEwOTY5NTMwMn0.by5xepgYaKjHPJuR7Srt5TcP2scwLVZIoUxtXkiRj3U'

async function fetchPublishedOpportunities() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/examinations?select=slug,name,overview,category,last_verified_at&status=eq.published&limit=50`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
    if (!res.ok) return []
    return await res.json()
  } catch (err) {
    console.warn('[Prerender] Could not fetch live database records, falling back to static routes:', err.message)
    return []
  }
}

async function prerender() {
  console.log('[Prerender] Starting static HTML generation for Cloudflare Pages...')

  if (!fs.existsSync(distDir)) {
    console.error('[Prerender] Error: dist/ directory not found. Run vite build first.')
    process.exit(1)
  }

  const indexHtmlPath = path.join(distDir, 'index.html')
  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8')

  // Public Core Routes
  const staticRoutes = [
    {
      route: '/',
      title: 'REXAM — Government Exams, Recruitments & Scholarships Discovery',
      desc: 'Discover government job notifications, recruitment exams, scholarships and fellowships personalized for Indian college students and graduates.',
    },
    {
      route: '/jobs',
      title: 'Government Jobs & Recruitments 2026 — REXAM',
      desc: 'Latest central & state government job notifications, vacancies, eligibility criteria and application deadlines in India.',
    },
    {
      route: '/exams',
      title: 'Upcoming National & State Exams 2026 — REXAM',
      desc: 'Upcoming competitive entrance examinations, university admissions, eligibility criteria, and important dates in India.',
    },
    {
      route: '/scholarships',
      title: 'Government Scholarships & Fellowships 2026 — REXAM',
      desc: 'Central and state government scholarships, financial assistance schemes, research fellowships and DBT grants for Indian students.',
    },
    {
      route: '/about',
      title: 'About REXAM — Government Opportunity Discovery Platform',
      desc: 'Learn about REXAM mission to simplify government exam discovery and deterministic eligibility assessment for Indian students.',
    },
    {
      route: '/contact',
      title: 'Contact Us — REXAM',
      desc: 'Get in touch with the REXAM team for questions, feedback, or government source integrations.',
    },
    {
      route: '/privacy',
      title: 'Privacy Policy — REXAM',
      desc: 'REXAM privacy policy explaining how candidate data is collected, stored, and protected.',
    },
    {
      route: '/terms',
      title: 'Terms of Service — REXAM',
      desc: 'Terms of service and user agreements for the REXAM platform.',
    },
  ]

  // Dynamic Opportunity Routes from Supabase
  const opportunities = await fetchPublishedOpportunities()
  const dynamicRoutes = opportunities.map((opp) => ({
    route: `/opportunities/${opp.slug}`,
    title: `${opp.name} — Eligibility, Dates & Notification | REXAM`,
    desc: opp.overview ? opp.overview.slice(0, 160) : `${opp.name} official notification, eligibility criteria and dates.`,
    lastmod: opp.last_verified_at,
  }))

  const allRoutes = [...staticRoutes, ...dynamicRoutes]

  // Prerender each route into dist/<route>/index.html
  for (const page of allRoutes) {
    if (page.route === '/') continue // already has dist/index.html

    const pageHtml = baseHtml
      .replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`)
      .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${page.desc.replace(/"/g, '&quot;')}" />`)
      .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="https://rexam.in${page.route}" />`)

    const targetSubdir = path.join(distDir, page.route.replace(/^\//, ''))
    fs.mkdirSync(targetSubdir, { recursive: true })
    fs.writeFileSync(path.join(targetSubdir, 'index.html'), pageHtml, 'utf-8')
  }

  // Generate dynamic sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (p) => `  <url>
    <loc>https://rexam.in${p.route}</loc>
    <lastmod>${(p.lastmod || new Date().toISOString()).split('T')[0]}</lastmod>
    <changefreq>${p.route === '/' || p.route.startsWith('/opportunities') ? 'daily' : 'weekly'}</changefreq>
    <priority>${p.route === '/' ? '1.0' : p.route.startsWith('/opportunities') ? '0.9' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8')

  console.log(`[Prerender] Successfully generated static HTML snapshots for ${allRoutes.length} public SEO routes.`)
  console.log('[Prerender] Generated dist/sitemap.xml with live indexable URLs.')
}

prerender().catch(console.error)
