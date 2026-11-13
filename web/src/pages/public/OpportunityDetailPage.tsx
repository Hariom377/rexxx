import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar, MapPin, Users, ExternalLink, ShieldCheck,
  ArrowLeft, CheckCircle2, AlertCircle, FileText, ChevronRight
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { ExaminationWithDetails } from '../../types'
import { formatDate, formatDeadline, getCategoryColor } from '../../lib/utils'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'

export default function OpportunityDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()

  const { data: exam, isLoading, error } = useQuery<ExaminationWithDetails | null>({
    queryKey: ['opportunity-detail', slug],
    queryFn: async () => {
      if (!slug) return null
      const { data, error } = await supabase
        .from('examinations')
        .select(`
          *,
          organisations (*),
          examination_dates (*),
          eligibility_rules (*)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) throw error
      return data as ExaminationWithDetails
    },
    enabled: !!slug,
  })

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading opportunity details..." />
  }

  if (error || !exam) {
    return (
      <div className="content-frame max-w-content py-16 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-2">Opportunity Not Found</h2>
        <p className="text-sm text-text-secondary mb-6">
          The notification you're looking for could not be found or has expired.
        </p>
        <Link to="/jobs" className="btn-primary">Browse All Opportunities</Link>
      </div>
    )
  }

  const deadline = formatDeadline(exam.examination_dates?.application_closing_date)
  const rules = exam.eligibility_rules
  const dates = exam.examination_dates
  const org = exam.organisations

  // Structured Data JSON-LD (JobPosting)
  const jobPostingJsonLd = exam.category.includes('Recruitment') || exam.category.includes('Job') ? {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: exam.name,
    description: exam.overview,
    datePosted: dates?.notification_date || exam.created_at,
    validThrough: dates?.application_closing_date || undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: org?.name || 'Government of India',
      sameAs: org?.website_url || undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
        addressRegion: exam.state || 'All India',
      },
    },
    baseSalary: exam.salary_or_pay_scale ? {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: {
        '@type': 'QuantitativeValue',
        value: exam.salary_or_pay_scale,
      },
    } : undefined,
  } : null

  return (
    <>
      <Helmet>
        <title>{exam.name} — Eligibility, Dates & Notification | REXAM</title>
        <meta name="description" content={exam.overview || `${exam.name} eligibility rules, vacancy details, syllabus, and application deadline.`} />
        <link rel="canonical" href={`https://rexam.in/opportunities/${exam.slug}`} />
        <meta property="og:title" content={`${exam.name} | REXAM`} />
        <meta property="og:description" content={exam.overview} />
        {jobPostingJsonLd && (
          <script type="application/ld+json">
            {JSON.stringify(jobPostingJsonLd)}
          </script>
        )}
      </Helmet>

      <div className="content-frame max-w-detail py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link to="/" className="hover:text-text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/jobs" className="hover:text-text-primary">Opportunities</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-secondary truncate max-w-xs">{exam.name}</span>
        </nav>

        {/* Back Link */}
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to opportunities
        </Link>

        {/* Main Header Card */}
        <div className="card p-6 tablet:p-8 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`badge ${getCategoryColor(exam.category)}`}>{exam.category}</span>
            {exam.is_official_source && (
              <span className="badge badge-green flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Official Gazette
              </span>
            )}
            <span className="text-xs text-text-muted ml-auto">
              Verified: {formatDate(exam.last_verified_at, 'long')}
            </span>
          </div>

          <h1 className="text-xl tablet:text-3xl font-bold text-text-primary leading-tight mb-2">
            {exam.name}
          </h1>

          {org?.name && (
            <p className="text-sm tablet:text-base text-text-secondary font-medium mb-4">
              {org.name} {org.parent_ministry ? `• ${org.parent_ministry}` : ''}
            </p>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 tablet:grid-cols-4 gap-4 p-4 rounded-xl bg-bg-elevated border border-border mt-6">
            <div>
              <p className="text-2xs text-text-muted uppercase tracking-wider">Vacancies</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">
                {exam.vacancies ? `${exam.vacancies.toLocaleString('en-IN')} Posts` : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-2xs text-text-muted uppercase tracking-wider">Location</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">{exam.location}</p>
            </div>
            <div>
              <p className="text-2xs text-text-muted uppercase tracking-wider">Application Closes</p>
              <p className={`text-sm font-semibold mt-0.5 ${deadline.urgent ? 'text-accent-red' : 'text-text-primary'}`}>
                {dates?.application_closing_date ? formatDate(dates.application_closing_date, 'short') : 'TBA'}
              </p>
            </div>
            <div>
              <p className="text-2xs text-text-muted uppercase tracking-wider">Salary / Scale</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">
                {exam.salary_or_pay_scale || 'As per Govt Norms'}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 mt-6">
            {user ? (
              <Link to={`/eligibility/${exam.id}`} className="btn-primary flex-1 tablet:flex-none">
                Check My Exact Eligibility
              </Link>
            ) : (
              <Link to="/register" className="btn-primary flex-1 tablet:flex-none">
                Sign in to Check Eligibility
              </Link>
            )}

            {exam.official_application_url && (
              <a
                href={exam.official_application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary gap-2"
              >
                Official Apply Portal <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {exam.official_notification_url && (
              <a
                href={exam.official_notification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost gap-2"
              >
                <FileText className="w-4 h-4" /> Notification PDF
              </a>
            )}
          </div>
        </div>

        {/* Content Tabs / Sections */}
        <div className="space-y-6">
          {/* Overview */}
          {exam.overview && (
            <div className="card p-6">
              <h2 className="section-heading mb-3">Overview & Summary</h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {exam.overview}
              </p>
            </div>
          )}

          {/* Eligibility Rules */}
          {rules && (
            <div className="card p-6">
              <h2 className="section-heading mb-4">Eligibility Criteria</h2>
              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-bg-elevated border border-border">
                  <p className="text-xs text-text-muted font-medium mb-1">Age Limits</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {rules.min_age} to {rules.max_age} years
                  </p>
                  {rules.age_cutoff_date && (
                    <p className="text-2xs text-text-muted mt-0.5">
                      Cutoff date: {formatDate(rules.age_cutoff_date, 'long')}
                    </p>
                  )}
                </div>

                <div className="p-3.5 rounded-lg bg-bg-elevated border border-border">
                  <p className="text-xs text-text-muted font-medium mb-1">Educational Qualification</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {rules.educational_qualifications?.length > 0 ? (
                      rules.educational_qualifications.map((q, i) => (
                        <span key={i} className="badge badge-blue">{q}</span>
                      ))
                    ) : (
                      <span className="text-sm text-text-secondary">Specified in notification</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-bg-elevated border border-border">
                  <p className="text-xs text-text-muted font-medium mb-1">Application Fee</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {rules.fee_general ? `₹${rules.fee_general}` : 'No general fee'}
                  </p>
                  <p className="text-2xs text-text-muted mt-0.5">{rules.fee_exemptions}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-bg-elevated border border-border">
                  <p className="text-xs text-text-muted font-medium mb-1">Nationality & Gender</p>
                  <p className="text-sm text-text-primary">{rules.nationality} • {rules.gender_requirements}</p>
                </div>
              </div>
            </div>
          )}

          {/* Important Dates */}
          {dates && (
            <div className="card p-6">
              <h2 className="section-heading mb-4">Important Schedules & Dates</h2>
              <div className="space-y-3">
                {dates.notification_date && (
                  <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                    <span className="text-text-secondary">Notification Released</span>
                    <span className="font-medium text-text-primary">{formatDate(dates.notification_date, 'long')}</span>
                  </div>
                )}
                {dates.application_opening_date && (
                  <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                    <span className="text-text-secondary">Applications Open</span>
                    <span className="font-medium text-text-primary">{formatDate(dates.application_opening_date, 'long')}</span>
                  </div>
                )}
                {dates.application_closing_date && (
                  <div className="flex justify-between py-2 border-b border-border/50 text-sm">
                    <span className="text-text-secondary">Applications Close</span>
                    <span className={`font-semibold ${deadline.urgent ? 'text-accent-red' : 'text-text-primary'}`}>
                      {formatDate(dates.application_closing_date, 'long')}
                    </span>
                  </div>
                )}
                {dates.examination_start_date && (
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-text-secondary">Examination Date</span>
                    <span className="font-medium text-text-primary">{formatDate(dates.examination_start_date, 'long')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selection & Instructions */}
          {exam.selection_procedure && (
            <div className="card p-6">
              <h2 className="section-heading mb-3">Selection Procedure</h2>
              <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                {exam.selection_procedure}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
