import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2, XCircle, AlertTriangle, ArrowLeft,
  ShieldCheck, FileText, ExternalLink, Calendar, User
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { ExaminationWithDetails, CandidateEducation } from '../../types'
import { formatDate } from '../../lib/utils'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'

export default function EligibilityReportPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  // 1. Fetch Opportunity with Rules
  const { data: exam, isLoading: examLoading } = useQuery<ExaminationWithDetails | null>({
    queryKey: ['eligibility-exam', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await supabase
        .from('examinations')
        .select(`
          *,
          organisations (*),
          examination_dates (*),
          eligibility_rules (*)
        `)
        .eq('id', id)
        .single()
      return data as unknown as ExaminationWithDetails
    },
    enabled: !!id,
  })

  // 2. Fetch Candidate Education
  const { data: education = [], isLoading: eduLoading } = useQuery<CandidateEducation[]>({
    queryKey: ['candidate-education-list', user?.id],
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

  if (examLoading || eduLoading) {
    return <LoadingSpinner fullPage label="Evaluating eligibility criteria..." />
  }

  if (!exam) {
    return (
      <div className="content-frame max-w-report py-16 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-2">Examination Not Found</h2>
        <Link to="/explorer" className="btn-primary">Back to Explorer</Link>
      </div>
    )
  }

  const rules = exam.eligibility_rules
  const highestEdu = education[0]

  // Evaluation Calculations
  // 1. Age Calculation
  let candidateAge: number | null = null
  let maxAllowedAge = rules ? rules.max_age : 35
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

  // Statutory Age Relaxations
  if (profile?.social_category === 'SC' || profile?.social_category === 'ST') {
    ageRelaxation += 5
  } else if (profile?.social_category === 'OBC-NCL') {
    ageRelaxation += 3
  }
  if (profile?.is_pwbd) {
    ageRelaxation += 10
  }
  maxAllowedAge += ageRelaxation

  const isAgeValid =
    candidateAge !== null && rules
      ? candidateAge >= rules.min_age && candidateAge <= maxAllowedAge
      : null

  // 2. Qualification Evaluation
  const requiredQuals = rules?.educational_qualifications || []
  const hasMatchingQual =
    requiredQuals.length === 0 ||
    education.some((e) =>
      requiredQuals.some((rq) => rq.toLowerCase().includes(e.highest_qualification.toLowerCase()) || e.highest_qualification.toLowerCase().includes(rq.toLowerCase()))
    )

  // 3. Overall Verdict
  const isEligible = isAgeValid !== false && hasMatchingQual
  const verdictText = isEligible ? 'Eligible to Apply' : 'Not Eligible'
  const verdictColor = isEligible ? 'bg-accent-green-dim text-accent-green border-accent-green/30' : 'bg-accent-red-dim text-accent-red border-accent-red/30'

  return (
    <>
      <Helmet>
        <title>Eligibility Report — {exam.name} | REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-report py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Top Verdict Banner */}
        <div className={`card p-6 border ${verdictColor} mb-8`}>
          <div className="flex items-start gap-4">
            {isEligible ? (
              <CheckCircle2 className="w-8 h-8 text-accent-green flex-shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-accent-red flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider">Evaluation Verdict</span>
                <span className="text-2xs text-text-muted">Rule Engine v2.4 (Deterministic)</span>
              </div>
              <h1 className="text-xl tablet:text-2xl font-bold mt-1 text-text-primary">{verdictText}</h1>
              <p className="text-sm text-text-secondary mt-1">
                Evaluation for <strong className="text-text-primary">{exam.name}</strong> ({exam.organisations?.name || 'Central Authority'})
              </p>
            </div>
          </div>
        </div>

        {/* Rule-by-Rule Assessment Grid */}
        <div className="space-y-4 mb-8">
          <h2 className="section-heading">Detailed Rule Breakdown</h2>

          {/* 1. Age Criteria Card */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {isAgeValid === true ? (
                  <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                ) : isAgeValid === false ? (
                  <XCircle className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-accent-yellow flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Age Criteria</h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Official range: {rules?.min_age || 18} to {rules?.max_age || 35} years
                    {ageRelaxation > 0 && ` (+${ageRelaxation} yrs category relaxation for ${profile?.social_category})`}
                  </p>
                  <p className="text-xs text-text-secondary mt-2">
                    Your calculated age: <strong className="text-text-primary">{candidateAge !== null ? `${candidateAge} years` : 'Date of birth not provided'}</strong>
                    {rules?.age_cutoff_date && ` as of ${formatDate(rules.age_cutoff_date, 'long')}`}
                  </p>
                </div>
              </div>
              <span className={`badge ${isAgeValid ? 'badge-green' : isAgeValid === false ? 'badge-red' : 'badge-orange'}`}>
                {isAgeValid ? 'Satisfied' : isAgeValid === false ? 'Overage/Underage' : 'Unknown'}
              </span>
            </div>
          </div>

          {/* 2. Educational Qualification Card */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {hasMatchingQual ? (
                  <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Educational Qualification</h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Required: {requiredQuals.length > 0 ? requiredQuals.join(', ') : 'Open to all graduates'}
                  </p>
                  <p className="text-xs text-text-secondary mt-2">
                    Your highest qualification: <strong className="text-text-primary">{highestEdu?.highest_qualification || 'None added to profile'}</strong>
                  </p>
                </div>
              </div>
              <span className={`badge ${hasMatchingQual ? 'badge-green' : 'badge-red'}`}>
                {hasMatchingQual ? 'Satisfied' : 'Missing Requirement'}
              </span>
            </div>
          </div>

          {/* 3. Fee & Exemptions Card */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Application Fee Assessment</h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Standard fee: ₹{rules?.fee_general ?? 0}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Exemption status: <strong className="text-text-primary">{rules?.fee_exemptions || 'Applicable exemptions apply for SC/ST/PwBD/Female'}</strong>
                  </p>
                </div>
              </div>
              <span className="badge badge-green">Evaluated</span>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="card p-6 flex flex-col tablet:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">Proceed with application</p>
            <p className="text-xs text-text-muted">Always review official notification before submitting.</p>
          </div>
          <div className="flex gap-3 w-full tablet:w-auto">
            {exam.official_application_url && (
              <a href={exam.official_application_url} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 tablet:flex-none gap-2">
                Apply on Official Portal <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <Link to={`/opportunities/${exam.slug}`} className="btn-secondary">
              View Notification Details
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
