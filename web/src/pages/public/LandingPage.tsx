import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight, CheckCircle2, Shield, Search,
  Bell, Building2, GraduationCap, Award, Check, FileText
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ExaminationWithDetails } from '../../types'
import { OpportunityCard } from '../../components/shared/OpportunityCard'
import { EligibilityBadge } from '../../components/shared/EligibilityBadge'

const TRACKED_ORGS = [
  'UPSC',
  'SSC',
  'ISRO',
  'DRDO',
  'SBI',
  'IBPS',
  'Railway Recruitment Boards',
  'State PSCs',
  'PMRF',
  'CSIR-JRF',
  'BARC',
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Add your qualifications once',
    desc: 'Enter your degree, stream, passing year, state and social category in under 2 minutes.',
  },
  {
    step: '02',
    title: 'We check official notification rules',
    desc: 'We check your age, category and qualification against the official notification, including statutory age relaxations.',
  },
  {
    step: '03',
    title: 'See what you qualify for',
    desc: 'Your dashboard displays government jobs, exams and scholarships you are genuinely eligible for, with direct links to official portals.',
  },
  {
    step: '04',
    title: 'Never miss a deadline',
    desc: 'Save opportunities, track application stages, and get timely reminders before application closing dates.',
  },
]

const CATEGORIES = [
  {
    to: '/jobs',
    icon: Building2,
    label: 'Government Jobs',
    desc: 'Central & State recruitments, PSU positions, Banking and Railway vacancies with verified criteria.',
  },
  {
    to: '/exams',
    icon: GraduationCap,
    label: 'National Examinations',
    desc: 'Central entrance examinations and assessment tests for higher education and public sector recruitment.',
  },
  {
    to: '/scholarships',
    icon: Award,
    label: 'Scholarships & Fellowships',
    desc: 'Central and state government student scholarships, DBT schemes and prestigious research fellowships.',
  },
]

export default function LandingPage() {
  const { t } = useTranslation()
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

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <>
      <Helmet>
        <title>{t('meta.site_title')}</title>
        <meta
          name="description"
          content={t('meta.site_description')}
        />
        <link rel="canonical" href="https://rexam.in" />
      </Helmet>

      {/* ── 1. HERO SECTION ────────────────────────────────── */}
      <section className="bg-bg-primary pt-10 pb-16 tablet:pt-16 tablet:pb-24 border-b border-border">
        <div className="content-frame max-w-content">
          <div className="grid grid-cols-1 desktop:grid-cols-12 gap-10 items-center">

            {/* Left: Headline & CTAs */}
            <div className="desktop:col-span-7">
              {/* Dynamic Freshness Notice */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-secondary border border-border text-xs text-text-secondary font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-status-eligible-text" aria-hidden="true" />
                <span>{t('home.hero_freshness')} · {todayFormatted}</span>
              </div>

              <h1 className="text-3xl tablet:text-5xl font-bold text-text-primary leading-tight mb-5 tracking-normal">
                {t('home.hero_title')}
              </h1>

              <p className="text-base tablet:text-lg text-text-secondary leading-relaxed max-w-xl mb-8">
                {t('home.hero_subtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col mobile:flex-row items-stretch mobile:items-center gap-3 mb-8">
                <Link
                  to="/register"
                  className="btn-primary text-base px-6 py-3"
                >
                  <span>{t('home.cta_check')}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/jobs"
                  className="btn-secondary text-base px-6 py-3"
                >
                  <Search className="w-4 h-4 text-text-secondary" aria-hidden="true" />
                  <span>{t('home.cta_browse')}</span>
                </Link>
              </div>

              {/* Trust Strip */}
              <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                <div className="inline-flex items-center gap-1.5 bg-bg-secondary border border-border px-3 py-1.5 rounded-md">
                  <Shield className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                  <span>Official websites only</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-bg-secondary border border-border px-3 py-1.5 rounded-md">
                  <Check className="w-3.5 h-3.5 text-status-eligible-text" aria-hidden="true" />
                  <span>Always free for students</span>
                </div>
              </div>
            </div>

            {/* Right: Static Clearly Labelled "Example" Card */}
            <div className="desktop:col-span-5">
              <div className="card p-6 bg-bg-secondary/40 border-2 border-border shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <span className="text-2xs font-bold uppercase tracking-wider text-brand bg-brand-light px-2.5 py-1 rounded">
                    Example: How REXAM checks for you
                  </span>
                  <span className="text-2xs text-text-secondary">Illustration only</span>
                </div>

                <div className="mb-4">
                  <span className="badge bg-brand-light text-brand border-brand-subtle mb-1.5">
                    Government Recruitment
                  </span>
                  <h2 className="text-base font-bold text-text-primary">
                    Combined Graduate Level Examination (CGL)
                  </h2>
                  <p className="text-xs text-text-secondary font-medium mt-0.5">
                    Staff Selection Commission (SSC)
                  </p>
                </div>

                {/* Example Criteria Table */}
                <div className="bg-bg-primary border border-border rounded-lg p-3.5 space-y-2.5 mb-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">Age Limit (18–30 yrs)</p>
                      <p className="text-2xs text-text-secondary">Candidate age: 24 yrs</p>
                    </div>
                    <EligibilityBadge status="eligible" label="Eligible" size="sm" />
                  </div>

                  <div className="border-t border-border/60 pt-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">Degree Qualification</p>
                      <p className="text-2xs text-text-secondary">Candidate: Bachelor's in Science</p>
                    </div>
                    <EligibilityBadge status="eligible" label="Eligible" size="sm" />
                  </div>

                  <div className="border-t border-border/60 pt-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">Category Relaxation</p>
                      <p className="text-2xs text-text-secondary">OBC-NCL (+3 yrs rule applied)</p>
                    </div>
                    <EligibilityBadge status="eligible" label="Eligible" size="sm" />
                  </div>
                </div>

                {/* Sample Other Status Badges */}
                <div className="bg-bg-primary border border-border rounded-lg p-3 text-xs">
                  <p className="text-2xs font-semibold uppercase text-text-secondary mb-2">
                    Other status examples on your dashboard:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <EligibilityBadge
                      status="ineligible"
                      label="Not eligible"
                      reason="Age cutoff exceeded"
                      size="sm"
                    />
                    <EligibilityBadge
                      status="info"
                      label="Need more info"
                      reason="Degree stream needed"
                      size="sm"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border text-center">
                  <Link
                    to="/register"
                    className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
                  >
                    <span>Create profile to check your actual eligibility</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. PLAIN STATIC ORGANISATION LIST (No ticker, no logos) ── */}
      <section className="bg-bg-secondary py-5 border-b border-border">
        <div className="content-frame max-w-content text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            We track official notifications from:
          </p>
          <p className="text-xs tablet:text-sm text-text-primary font-medium leading-relaxed">
            {TRACKED_ORGS.join(' · ')} and other central, state &amp; banking recruitment bodies.
          </p>
        </div>
      </section>

      {/* ── 3. CATEGORIES SECTION ───────────────────────────── */}
      <section className="py-14 tablet:py-20 bg-bg-primary">
        <div className="content-frame max-w-content">
          <div className="mb-10">
            <p className="section-label">What we cover</p>
            <h2 className="text-2xl tablet:text-3xl font-bold text-text-primary">
              All categories of government opportunities
            </h2>
          </div>

          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6">
            {CATEGORIES.map(({ to, icon: Icon, label, desc }) => (
              <Link
                key={to}
                to={to}
                className="card-hover p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-lg bg-brand-light text-brand flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    {label}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6">
                    {desc}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  <span>Browse {label}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS (01–04) ─────────────────────────── */}
      <section className="py-14 tablet:py-20 bg-bg-secondary border-t border-border">
        <div className="content-frame max-w-content">
          <div className="max-w-xl mb-12">
            <p className="section-label">How it works</p>
            <h2 className="text-2xl tablet:text-3xl font-bold text-text-primary">
              Personalised to your exact profile
            </h2>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Most job portals show every notification to everyone. REXAM evaluates official rules against your credentials so you only see opportunities you can apply for.
            </p>
          </div>

          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="card p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-bg-secondary border border-border flex items-center justify-center flex-shrink-0 font-bold text-brand text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FEATURED OPPORTUNITIES ───────────────────────── */}
      <section className="py-14 tablet:py-20 bg-bg-primary border-t border-border">
        <div className="content-frame max-w-content">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label">Live notifications</p>
              <h2 className="text-2xl tablet:text-3xl font-bold text-text-primary">
                Latest verified opportunities
              </h2>
            </div>
            <Link
              to="/jobs"
              className="text-sm font-semibold text-brand hover:underline inline-flex items-center gap-1 hidden tablet:inline-flex"
            >
              <span>View all opportunities</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {featuredExams.length === 0 ? (
            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-52 skeleton p-6" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
              {featuredExams.map((exam) => (
                <OpportunityCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}

          <div className="mt-8 tablet:hidden text-center">
            <Link to="/jobs" className="btn-secondary w-full">
              View all opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. WHY STUDENTS TRUST REXAM ─────────────────────── */}
      <section className="py-14 tablet:py-20 bg-bg-secondary border-t border-border">
        <div className="content-frame max-w-content">
          <div className="grid grid-cols-1 desktop:grid-cols-12 gap-10 items-center">

            {/* Left: Trust Principles (No talking down, warm direct tone) */}
            <div className="desktop:col-span-7">
              <p className="section-label">Why students trust REXAM</p>
              <h2 className="text-2xl tablet:text-3xl font-bold text-text-primary mb-6">
                Clear, verified exam information you can trust
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-bg-primary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-5 h-5 text-brand" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary mb-1">
                      Official government and public-body websites only
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Every notification is sourced directly from official examination authority portals—never from unverified blogs, social media rumours or newspaper hearsay.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-bg-primary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-status-eligible-text" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary mb-1">
                      We check your age, category and qualification against the official notification
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Cutoff dates are calculated accurately, and statutory age relaxations for OBC-NCL (+3 yrs), SC/ST (+5 yrs) and PwBD (+10 yrs) are evaluated automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-bg-primary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bell className="w-5 h-5 text-brand" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary mb-1">
                      Personalised deadline reminders
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Receive reminders only for opportunities matching your profile, so you never miss an application closing date.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-bg-primary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-text-secondary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary mb-1">
                      Direct official application links
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Every application link opens the official recruitment authority website where the authentic form is submitted.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Registration Card */}
            <div className="desktop:col-span-5">
              <div className="card p-8 bg-bg-primary border border-border shadow-sm">
                <span className="badge bg-status-eligible-bg text-status-eligible-text border-status-eligible-border mb-3">
                  Always free for all students
                </span>

                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Ready to discover what you qualify for?
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  Set up your student profile in 2 minutes to get a personalised feed of government recruitments and scholarships you can apply for right now.
                </p>

                <div className="space-y-2.5 mb-6 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-status-eligible-text flex-shrink-0" />
                    <span>No application fees or charges from REXAM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-status-eligible-text flex-shrink-0" />
                    <span>Direct links to official application portals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-status-eligible-text flex-shrink-0" />
                    <span>Deadline reminders before closing dates</span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="btn-primary w-full text-base py-3 mb-3"
                >
                  <span>Create free account</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <p className="text-center text-xs text-text-secondary">
                  Already have an account?{' '}
                  <Link to="/login" className="text-brand font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
