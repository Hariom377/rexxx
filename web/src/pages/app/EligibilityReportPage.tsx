import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2, XCircle, AlertCircle, ArrowLeft,
  ShieldCheck, FileText, ExternalLink, Calendar, User
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { ExaminationWithDetails, CandidateEducation } from '../../types'
import { formatDate } from '../../lib/utils'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner'
import { EligibilityBadge } from '../../components/shared/EligibilityBadge'
import { calculateAge, isAgeEligible, isEducationEligible } from '../../lib/eligibility'

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
        <Link
          to="/explorer"
          className="inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-lg bg-brand-action text-white font-semibold text-sm hover:bg-brand-action-hover"
        >
          Back to Explorer
        </Link>
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
      ? isAgeEligible(candidateAge, rules.min_age, rules.max_age, ageRelaxation)
      : null

  // 2. Qualification Evaluation
  const requiredQuals = rules?.educational_qualifications || []
  const hasMatchingQual = isEducationEligible(education, requiredQuals)

  // 3. Overall Verdict
  const hasProfileData = candidateAge !== null && education.length > 0
  const isEligible = isAgeValid !== false && hasMatchingQual
  const overallStatus: 'eligible' | 'ineligible' | 'info' = !hasProfileData ? 'info' : isEligible ? 'eligible' : 'ineligible'

  return (
    <>
      <Helmet>
        <title>Eligibility Report — {exam.name} | REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-report py-6 sm:py-8 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Top Verdict Banner */}
        <div className="bg-white border border-border-default rounded-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-default pb-5">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Official Criteria Evaluation
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary mt-1">
                {exam.name}
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                {exam.organisations?.name || 'Recruiting Body'}
              </p>
            </div>
            <div>
              <EligibilityBadge
                status={overallStatus}
                reason={
                  overallStatus === 'eligible'
                    ? 'All age & qualification criteria met'
                    : overallStatus === 'ineligible'
                    ? 'Does not meet notification criteria'
                    : 'Add missing profile details to verify'
                }
              />
            </div>
          </div>

          <div className="pt-4 text-xs text-text-secondary">
            Evaluated against the criteria published in the official notification. Statutory relaxations for{' '}
            <strong className="text-text-primary">{profile?.social_category || 'General'}</strong>
            {profile?.is_pwbd && <> and <strong className="text-text-primary">PwBD</strong></>} have been applied.
          </div>
        </div>

        {/* Criterion-by-Criterion Table */}
        <div className="bg-white border border-border-default rounded-lg overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border-default">
            <h2 className="text-base font-bold text-text-primary">Detailed Criteria Breakdown</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Comparison between requirements in official notification and your saved profile.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-bg-alternate border-b border-border-default text-xs font-semibold text-text-secondary uppercase">
                  <th className="py-3 px-4 sm:px-6">Criterion</th>
                  <th className="py-3 px-4 sm:px-6">Required in Notification</th>
                  <th className="py-3 px-4 sm:px-6">Your Profile</th>
                  <th className="py-3 px-4 sm:px-6">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default text-sm">
                {/* Age row */}
                <tr>
                  <td className="py-4 px-4 sm:px-6 font-semibold text-text-primary">Age Limit</td>
                  <td className="py-4 px-4 sm:px-6 text-text-secondary">
                    {rules?.min_age || 18} to {rules?.max_age || 35} years
                    {ageRelaxation > 0 && (
                      <span className="block text-xs text-brand-action mt-0.5">
                        (+{ageRelaxation} yrs {profile?.social_category} relaxation)
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-text-primary">
                    {candidateAge !== null ? `${candidateAge} years` : 'Not provided'}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    {isAgeValid === true ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-status-eligible">
                        <CheckCircle2 className="w-4 h-4" /> Eligible
                      </span>
                    ) : isAgeValid === false ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-status-ineligible">
                        <XCircle className="w-4 h-4" /> Limit Exceeded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-status-moreinfo">
                        <AlertCircle className="w-4 h-4" /> Missing DOB
                      </span>
                    )}
                  </td>
                </tr>

                {/* Qualification row */}
                <tr>
                  <td className="py-4 px-4 sm:px-6 font-semibold text-text-primary">Education</td>
                  <td className="py-4 px-4 sm:px-6 text-text-secondary">
                    {requiredQuals.length > 0 ? requiredQuals.join(', ') : 'Open to all graduates'}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-text-primary">
                    {highestEdu?.highest_qualification || 'No degree listed'}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    {education.length === 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-status-moreinfo">
                        <AlertCircle className="w-4 h-4" /> Add Degree
                      </span>
                    ) : hasMatchingQual ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-status-eligible">
                        <CheckCircle2 className="w-4 h-4" /> Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-status-ineligible">
                        <XCircle className="w-4 h-4" /> Mismatch
                      </span>
                    )}
                  </td>
                </tr>

                {/* Application Fee */}
                <tr>
                  <td className="py-4 px-4 sm:px-6 font-semibold text-text-primary">Application Fee</td>
                  <td className="py-4 px-4 sm:px-6 text-text-secondary">
                    ₹{rules?.fee_general ?? 0} (General/OBC)
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-text-primary">
                    {profile?.social_category || 'General'}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-xs text-text-secondary">
                    {rules?.fee_exemptions || 'Applicable exemptions per notification'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="bg-white border border-border-default rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-text-primary">Ready to apply?</p>
            <p className="text-xs text-text-secondary">
              Always review the complete official notification PDF on the portal before submitting.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {exam.official_application_url && (
              <a
                href={exam.official_application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white text-sm font-semibold transition-colors"
              >
                Apply on Official Website <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <Link
              to={`/opportunity/${exam.slug}`}
              className="min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-sm font-semibold text-text-primary transition-colors"
            >
              View Overview
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
