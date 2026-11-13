import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ArrowRight, CheckCircle2, Shield, Search,
  Bell, Users, Building2, GraduationCap, BookOpen, Award
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ExaminationWithDetails } from '../../types'
import { OpportunityCard } from '../../components/shared/OpportunityCard'

const ORGANISATIONS = [
  'UPSC', 'SSC', 'ISRO', 'DRDO', 'SBI', 'IBPS',
  'PMRF', 'CSIR-JRF', 'Railway Board', 'BARC', 'IOCL', 'HAL',
  'UPSC', 'SSC', 'ISRO', 'DRDO', 'SBI', 'IBPS',
  'PMRF', 'CSIR-JRF', 'Railway Board', 'BARC', 'IOCL', 'HAL',
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Build your profile once',
    desc: 'Enter your degree, stream, graduation year, state of domicile, and social category. Takes under 2 minutes.',
  },
  {
    step: '02',
    title: 'We evaluate every exam for you',
    desc: 'Our deterministic engine checks every official rule — age cutoff, category relaxations (OBC-NCL +3yr, SC/ST +5yr, PwBD +10yr), qualification, and backlog status.',
  },
  {
    step: '03',
    title: 'See only what you can apply for',
    desc: 'Your personalised dashboard shows government jobs, exams, and scholarships you are genuinely eligible for — with direct official application links.',
  },
  {
    step: '04',
    title: 'Never miss a deadline',
    desc: 'Bookmark opportunities, track application stages, and receive timely alerts before closing dates.',
  },
]

const CATEGORIES = [
  {
    to: '/jobs',
    icon: Building2,
    label: 'Government Jobs',
    desc: 'UPSC, SSC, State PSC, PSU, Banking & Railway vacancies with verified eligibility criteria.',
    color: 'text-accent-green',
    dimColor: 'bg-accent-green-dim',
  },
  {
    to: '/exams',
    icon: GraduationCap,
    label: 'National Examinations',
    desc: 'GATE, NET, CAT, JEE, NEET and central entrance assessments for higher education and PSU hiring.',
    color: 'text-accent-blue',
    dimColor: 'bg-accent-blue-dim',
  },
  {
    to: '/scholarships',
    icon: Award,
    label: 'Scholarships & Fellowships',
    desc: 'Central & State government scholarships, DBT schemes, and research fellowships like PMRF and CSIR-JRF.',
    color: 'text-accent-orange',
    dimColor: 'bg-accent-orange-dim',
  },
]

export default function LandingPage() {
  const { data: featuredExams = [] } = useQuery<ExaminationWithDetails[]>({
    queryKey: ['public-featured-exams'],
    queryFn: async () => {
      const { data } = await supabase
        .from('examinations')
        .select(`*, organisations (*), examination_dates (*), eligibility_rules (*)`)
        .eq('status', 'published')
        .order('last_verified_at', { ascending: false })
        .limit(6)
      return (data || []) as ExaminationWithDetails[]
    },
  })

  return (
    <>
      <Helmet>
        <title>REXAM — Government Exams, Recruitments &amp; Scholarships Discovery</title>
        <meta name="description" content="India's personalised government examination, recruitment and scholarship discovery platform. Deterministic eligibility evaluation — never miss a government deadline you qualified for." />
        <link rel="canonical" href="https://rexam.in" />
      </Helmet>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 tablet:pt-24 tablet:pb-32 overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272F15_1px,transparent_1px),linear-gradient(to_bottom,#27272F15_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />

        <div className="content-frame max-w-content relative">
          <div className="max-w-3xl">
            {/* Live pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-bg-elevated border border-border text-xs text-text-muted mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-dot flex-shrink-0" />
              Updated daily · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · 18 official sources
            </div>

            <h1 className="display-heading text-4xl tablet:text-5xl desktop:text-6xl leading-[1.08] mb-6">
              Every government exam<br />
              <span className="text-accent-green">you can actually apply for.</span>
            </h1>

            <p className="text-base tablet:text-lg text-text-secondary leading-relaxed max-w-2xl mb-10">
              Stop reading 60-page PDFs only to find you are 2 months overage or from the wrong stream.
              REXAM evaluates your eligibility against every official rule — age cutoffs, category relaxations,
              qualification requirements — and shows only what you qualify for.
            </p>

            {/* CTAs */}
            <div className="flex flex-col tablet:flex-row items-start gap-3 mb-14">
              <Link to="/register" className="btn-primary text-sm px-6 py-3 w-full tablet:w-auto gap-2">
                Check my eligibility — free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/jobs" className="btn-secondary text-sm px-6 py-3 w-full tablet:w-auto gap-2">
                <Search className="w-4 h-4" />
                Browse all opportunities
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: CheckCircle2, label: '100% Official Sources', color: 'text-accent-green' },
                { icon: Shield, label: 'Zero Spam Notifications', color: 'text-accent-blue' },
                { icon: Users, label: 'Indian Students Only Focus', color: 'text-text-muted' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="stat-pill">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOURCES TICKER ─────────────────────────────────── */}
      <div className="border-y border-border bg-bg-secondary overflow-hidden py-3">
        <div className="flex gap-0 animate-ticker whitespace-nowrap">
          {ORGANISATIONS.map((org, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-4 text-xs text-text-muted font-medium">
              {org}
              <span className="text-border">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      <section className="py-16">
        <div className="content-frame max-w-content">
          <div className="mb-10">
            <p className="section-label mb-2">What we cover</p>
            <h2 className="display-heading text-2xl tablet:text-3xl">
              All categories of government opportunities
            </h2>
          </div>

          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
            {CATEGORIES.map(({ to, icon: Icon, label, desc, color, dimColor }) => (
              <Link
                key={to}
                to={to}
                className="card-hover p-6 group flex flex-col"
              >
                <div className={`w-10 h-10 rounded-lg ${dimColor} flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2 tracking-tight">
                  {label}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed flex-1">
                  {desc}
                </p>
                <div className={`mt-5 flex items-center gap-1.5 text-xs font-semibold ${color}`}>
                  View {label.split(' ')[0]} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="py-16 border-t border-border bg-bg-secondary/50">
        <div className="content-frame max-w-content">
          <div className="max-w-xl mb-12">
            <p className="section-label mb-2">The REXAM difference</p>
            <h2 className="display-heading text-2xl tablet:text-3xl">
              Personalised, not generic
            </h2>
            <p className="text-sm text-text-secondary mt-3 leading-relaxed">
              Most job portals show every opening to everyone. REXAM runs every official eligibility rule
              against your specific credentials before showing you an opportunity.
            </p>
          </div>

          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="card p-6 flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-green-dim flex items-center justify-center">
                  <span className="text-xs font-black text-accent-green font-mono">{step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1.5 tracking-tight">{title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED OPPORTUNITIES ─────────────────────────── */}
      <section className="py-16">
        <div className="content-frame max-w-content">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-2">Live notifications</p>
              <h2 className="display-heading text-2xl tablet:text-3xl">
                Latest verified opportunities
              </h2>
            </div>
            <Link to="/jobs" className="btn-ghost text-sm gap-1 hidden tablet:inline-flex flex-shrink-0">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredExams.length === 0 ? (
            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-52 skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-5">
              {featuredExams.map((exam) => (
                <OpportunityCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}

          <div className="mt-6 tablet:hidden">
            <Link to="/jobs" className="btn-secondary w-full">View all opportunities</Link>
          </div>
        </div>
      </section>

      {/* ── WHY TRUST SECTION ──────────────────────────────── */}
      <section className="py-16 border-t border-border bg-bg-secondary/30">
        <div className="content-frame max-w-content">
          <div className="grid grid-cols-1 desktop:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label mb-3">Why students trust REXAM</p>
              <h2 className="display-heading text-2xl tablet:text-3xl mb-6">
                Built for serious aspirants, not casual browsers
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: Shield,
                    title: 'Only official .gov.in sources',
                    desc: 'Every notification is sourced directly from UPSC, SSC, ISRO, DRDO, SBI and other official government portals — never from newspapers or unofficial sites.',
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Deterministic rule engine',
                    desc: 'Age cutoffs computed against official dates. Statutory relaxations auto-applied. No AI guessing — pure deterministic evaluation based on official gazette rules.',
                  },
                  {
                    icon: Bell,
                    title: 'Personalised alerts only',
                    desc: 'You receive notifications only for exams matching your profile. No generic email blasts about exams you cannot apply for.',
                  },
                  {
                    icon: BookOpen,
                    title: 'Direct official application links',
                    desc: 'Every "Apply Now" button links to the official government portal URL — not a third-party site. We track, we do not redirect through middlemen.',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-accent-green-dim flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-accent-green" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary mb-1">{title}</p>
                      <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="card p-8 tablet:p-10 border-border-accent">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 text-2xs font-semibold text-accent-green bg-accent-green-dim rounded-pill px-3 py-1 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-dot" />
                  Free for all students
                </div>
                <h3 className="display-heading text-xl tablet:text-2xl mb-3">
                  Ready to discover what you qualify for?
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Create a free account, complete your profile in 2 minutes, and get a personalised feed of government opportunities you can actually apply for.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  'No application fees or hidden charges',
                  'Direct links to official government portals',
                  'Deadline alerts before you miss closing dates',
                  'Eligibility checked against official rules',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{point}</span>
                  </div>
                ))}
              </div>

              <Link to="/register" className="btn-primary w-full text-sm py-3 gap-2">
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-xs text-text-disabled mt-3">
                Already have an account? <Link to="/login" className="text-accent-green hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
