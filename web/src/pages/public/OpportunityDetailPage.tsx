import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar, MapPin, Users, ExternalLink, ShieldCheck,
  ArrowLeft, FileText, ChevronRight, AlertCircle, Building2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { ExaminationWithDetails, CandidateEducation } from '../../types'
import { formatDate, formatDeadline, getCategoryColor } from '../../lib/utils'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { EligibilityBadge } from '../../components/shared/EligibilityBadge'
import { useAuth } from '../../contexts/AuthContext'
import { calculateAge, isAgeEligible, isEducationEligible } from '../../lib/eligibility'

export default function OpportunityDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user, profile } = useAuth()

  // 1. Fetch Opportunity Details
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

  // 2. Fetch User Education (if logged in) for comparison table
  const { data: userEducation = [] } = useQuery<CandidateEducation[]>({
    queryKey: ['candidate-education-detail', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('candidate_education')
        .select('*')
        .eq('candidate_id', user.id)
      return (data || []) as CandidateEducation[]
    },
    enabled: !!user,
  })

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading notification details..." />
  }

  if (error || !exam) {
    return (
      <div className="content-frame max-w-content py-16 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-2">Notification Not Found</h2>
        <p className="text-sm text-text-secondary mb-6">
          The opportunity you are looking for could not be found or has expired.
        </p>
        <Link to="/jobs" className="btn-primary">Browse All Opportunities</Link>
      </div>
    )
  }

  const deadline = formatDeadline(exam.examination_dates?.application_closing_date)
  const rules = exam.eligibility_rules
  const dates = exam.examination_dates
  const org = exam.organisations

  // Calculate age if profile exists
  let candidateAge: number | null = null
  let ageRelaxation = 0
  if (profile?.date_of_birth) {
    const dob = new Date(profile.date_of_birth)
    const cutoff = rules?.age_cutoff_date ? new Date(rules.age_cutoff_date) : new Date()
    let age = cutoff.getFullYear() - dob.getFullYear()
    const m = cutoff.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && cutoff.getDate() < dob.getDate())) {
      age--
    }
    candidateAge = age
  }

  if (profile?.social_category === 'SC' || profile?.social_category === 'ST') {
    ageRelaxation += 5
  } else if (profile?.social_category === 'OBC-NCL') {
    ageRelaxation += 3
  }
  if (profile?.is_pwbd) {
    ageRelaxation += 10
  }
  const maxAllowedAge = (rules?.max_age || 35) + ageRelaxation

  const isAgeValid = candidateAge !== null && rules
    ? isAgeEligible(candidateAge, rules.min_age, rules.max_age, ageRelaxation)
    : null

  const requiredQuals = rules?.educational_qualifications || []
  const highestEdu = userEducation[0]
  const hasMatchingQual = userEducation.length > 0 && requiredQuals.length > 0
    ? isEducationEligible(userEducation, requiredQuals)
    : null

  // Structured Data JSON-LD for Google & Gemini AI Overviews
  const jobPostingJsonLd = exam.category.includes('Recruitment') || exam.category.includes('Job') ? {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: exam.name,
    description: exam.overview,
    datePosted: dates?.notification_date || exam.created_at,
    validThrough: dates?.application_closing_date || undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: org?.name || 'Government Authority',
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
    qualifications: requiredQuals.join('; ') || undefined,
  } : null

  // FAQ Schema: Heavily rewarded by Google and Gemini Search for Instant Answers
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the educational qualification for ${exam.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: requiredQuals.length > 0
            ? requiredQuals.join('. ')
            : `Candidates should refer to the official notification published by ${org?.name || 'the examination authority'}.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the age limit for ${exam.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: rules
            ? `The minimum age is ${rules.min_age} years and maximum age is ${rules.max_age} years. Statutory age relaxations apply for SC/ST (+5 years), OBC-NCL (+3 years), and PwBD (+10 years) per Government of India rules.`
            : 'Please refer to the official notification for cutoff date and age criteria.',
        },
      },
      {
        '@type': 'Question',
        name: `What is the last date to apply for ${exam.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: dates?.application_closing_date
            ? `The last date to submit the application form is ${formatDate(dates.application_closing_date, 'long')}.`
            : 'The closing date will be announced in the official examination calendar.',
        },
      },
      {
        '@type': 'Question',
        name: `How many vacancies are announced for ${exam.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: exam.vacancies
            ? `A total of ${exam.vacancies.toLocaleString('en-IN')} vacancies have been notified.`
            : 'Vacancies are notified per the official notification breakdown.',
        },
      },
    ],
  }

  // Breadcrumbs Schema for Google Search Snippets
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rexam.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: exam.category,
        item: 'https://rexam.in/jobs',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: exam.name,
        item: `https://rexam.in/opportunities/${exam.slug}`,
      },
    ],
  }

  return (
    <>
      <Helmet>
        <title>{exam.name} — Eligibility, Dates &amp; Official Notification | REXAM</title>
        <meta name="description" content={exam.overview || `${exam.name} eligibility rules, vacancy details, and official application deadline.`} />
        <link rel="canonical" href={`https://rexam.in/opportunities/${exam.slug}`} />
        {jobPostingJsonLd && (
          <script type="application/ld+json">
            {JSON.stringify(jobPostingJsonLd)}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>

      <div className="content-frame max-w-detail py-8 pb-28 tablet:pb-12">

        {/* ── Breadcrumb ───────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand focus-visible:ring-1 focus-visible:ring-brand rounded">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
          <Link to="/jobs" className="hover:text-brand focus-visible:ring-1 focus-visible:ring-brand rounded">Opportunities</Link>
          <ChevronRight className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
          <span className="text-text-primary font-medium truncate max-w-xs">{exam.name}</span>
        </nav>

        {/* Back Link */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand mb-6 focus-visible:ring-2 focus-visible:ring-brand rounded p-1"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to all opportunities</span>
        </Link>

        {/* ── Main Header Card ─────────────────────────────── */}
        <div className="card p-6 tablet:p-8 mb-8 border border-border">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`badge ${getCategoryColor(exam.category)}`}>
              {exam.category}
            </span>
            {exam.is_official_source && (
              <span className="verified-badge">
                <ShieldCheck className="w-3.5 h-3.5 text-status-eligible-text" aria-hidden="true" />
                <span>Official government notification</span>
              </span>
            )}
            <span className="text-xs text-text-secondary margin-inline-start-auto">
              Verified on: {formatDate(exam.last_verified_at, 'long')}
            </span>
          </div>

          <h1 className="text-2xl tablet:text-3xl font-bold text-text-primary leading-tight mb-2">
            {exam.name}
          </h1>

          {org?.name && (
            <p className="text-sm tablet:text-base text-text-secondary font-medium mb-6">
              {org.name} {org.parent_ministry ? `· ${org.parent_ministry}` : ''}
            </p>
          )}

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 tablet:grid-cols-4 gap-4 p-4 rounded-lg bg-bg-secondary border border-border mb-6">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-text-secondary">Vacancies</p>
              <p className="text-sm font-bold text-text-primary mt-0.5">
                {exam.vacancies ? `${exam.vacancies.toLocaleString('en-IN')} Posts` : 'Refer notification'}
              </p>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-text-secondary">Location</p>
              <p className="text-sm font-bold text-text-primary mt-0.5">{exam.location}</p>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-text-secondary">Application Closes</p>
              <p className={`text-sm font-bold mt-0.5 ${deadline.urgent ? 'text-urgent-text' : 'text-text-primary'}`}>
                {dates?.application_closing_date ? formatDate(dates.application_closing_date, 'short') : 'Check notice'}
              </p>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-text-secondary">Salary / Pay Scale</p>
              <p className="text-sm font-bold text-text-primary mt-0.5">
                {exam.salary_or_pay_scale || 'As per norms'}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            {exam.official_application_url && (
              <a
                href={exam.official_application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm px-5 py-2.5 gap-2"
              >
                <span>Apply on official website</span>
                <span className="text-2xs opacity-80">(Opens external site)</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            )}

            {user ? (
              <Link to={`/eligibility/${exam.id}`} className="btn-secondary text-sm px-5 py-2.5">
                View My Eligibility Report
              </Link>
            ) : (
              <Link to="/register" className="btn-secondary text-sm px-5 py-2.5">
                Sign in to check eligibility
              </Link>
            )}

            {exam.official_notification_url && (
              <a
                href={exam.official_notification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-sm px-4 py-2.5 gap-1.5"
              >
                <FileText className="w-4 h-4 text-text-secondary" aria-hidden="true" />
                <span>Notification PDF</span>
              </a>
            )}
          </div>
        </div>

        {/* ── Criterion-by-Criterion Table ─────────────────── */}
        <section className="card p-6 tablet:p-8 mb-8 border border-border">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-text-primary">
              Eligibility Criteria Breakdown
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Comparison between official gazette rules and your candidate profile.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-secondary text-xs uppercase font-bold text-text-secondary">
                  <th className="py-3 px-4">Criterion</th>
                  <th className="py-3 px-4">Required in Notification</th>
                  <th className="py-3 px-4">Your Profile</th>
                  <th className="py-3 px-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* 1. Age Limit */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-text-primary">
                    Age Limit
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {rules ? `${rules.min_age} to ${rules.max_age} years` : 'Refer notification'}
                    {rules?.age_cutoff_date && (
                      <span className="block text-2xs text-text-secondary">
                        Cutoff: {formatDate(rules.age_cutoff_date, 'short')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {candidateAge !== null ? (
                      <span>
                        {candidateAge} years
                        {ageRelaxation > 0 && ` (+${ageRelaxation}y ${profile?.social_category})`}
                      </span>
                    ) : (
                      <span className="text-text-secondary italic">Date of birth not added</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {user ? (
                      <EligibilityBadge
                        status={isAgeValid}
                        label={isAgeValid ? 'Eligible' : isAgeValid === false ? 'Overage' : 'Need info'}
                        size="sm"
                      />
                    ) : (
                      <Link to="/login" className="text-xs text-brand font-semibold hover:underline">
                        Sign in to check
                      </Link>
                    )}
                  </td>
                </tr>

                {/* 2. Educational Qualification */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-text-primary">
                    Education
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {requiredQuals.length > 0 ? requiredQuals.join(', ') : 'Graduation or as specified'}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {highestEdu ? highestEdu.highest_qualification : (
                      <span className="text-text-secondary italic">No degree on profile</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {user ? (
                      <EligibilityBadge
                        status={hasMatchingQual}
                        label={hasMatchingQual ? 'Eligible' : hasMatchingQual === false ? 'Unmatched' : 'Need info'}
                        size="sm"
                      />
                    ) : (
                      <Link to="/login" className="text-xs text-brand font-semibold hover:underline">
                        Sign in to check
                      </Link>
                    )}
                  </td>
                </tr>

                {/* 3. Social Category & Fee */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-text-primary">
                    Application Fee
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {rules?.fee_general ? `₹${rules.fee_general} (General)` : 'No general fee specified'}
                    <span className="block text-2xs text-text-secondary">{rules?.fee_exemptions}</span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {profile?.social_category || 'General'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge bg-bg-secondary text-text-secondary border-border">
                      Exemptions apply
                    </span>
                  </td>
                </tr>

                {/* 4. Domicile & Nationality */}
                <tr>
                  <td className="py-3 px-4 font-semibold text-text-primary">
                    Location &amp; Citizenship
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {rules?.nationality || 'Citizen of India'} · {exam.location}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {profile?.state || 'Indian Citizen'}
                  </td>
                  <td className="py-3 px-4">
                    <EligibilityBadge status="eligible" label="Eligible" size="sm" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Overview & Summary ───────────────────────────── */}
        {exam.overview && (
          <section className="card p-6 tablet:p-8 mb-8 border border-border">
            <h2 className="text-lg font-bold text-text-primary mb-3">
              Overview &amp; Job Description
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {exam.overview}
            </p>
          </section>
        )}

        {/* ── Important Schedule Dates ─────────────────────── */}
        {dates && (
          <section className="card p-6 tablet:p-8 mb-8 border border-border">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Important Schedules &amp; Key Dates
            </h2>
            <div className="space-y-3">
              {dates.notification_date && (
                <div className="flex justify-between py-2 border-b border-border text-sm">
                  <span className="text-text-secondary font-medium">Notification Released</span>
                  <span className="font-semibold text-text-primary">{formatDate(dates.notification_date, 'long')}</span>
                </div>
              )}
              {dates.application_opening_date && (
                <div className="flex justify-between py-2 border-b border-border text-sm">
                  <span className="text-text-secondary font-medium">Application Portal Opens</span>
                  <span className="font-semibold text-text-primary">{formatDate(dates.application_opening_date, 'long')}</span>
                </div>
              )}
              {dates.application_closing_date && (
                <div className="flex justify-between py-2 border-b border-border text-sm">
                  <span className="text-text-secondary font-medium">Last Date to Submit Application</span>
                  <span className={`font-bold ${deadline.urgent ? 'text-urgent-text' : 'text-text-primary'}`}>
                    {formatDate(dates.application_closing_date, 'long')}
                  </span>
                </div>
              )}
              {dates.examination_start_date && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-text-secondary font-medium">Scheduled Exam Date</span>
                  <span className="font-semibold text-text-primary">{formatDate(dates.examination_start_date, 'long')}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Selection Procedure ──────────────────────────── */}
        {exam.selection_procedure && (
          <section className="card p-6 tablet:p-8 border border-border">
            <h2 className="text-lg font-bold text-text-primary mb-3">
              Selection Procedure
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {exam.selection_procedure}
            </p>
          </section>
        )}

      </div>

      {/* ── Mobile Sticky Bottom Apply Button ─────────────── */}
      {exam.official_application_url && (
        <div className="tablet:hidden fixed bottom-0 left-0 right-0 p-3 bg-bg-primary border-t border-border shadow-elevated z-40">
          <a
            href={exam.official_application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            <span>Apply on official website</span>
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
          <p className="text-center text-2xs text-text-secondary mt-1">
            Opens external government application portal
          </p>
        </div>
      )}
    </>
  )
}
