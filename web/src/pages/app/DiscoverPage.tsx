import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Clock, Bookmark, FileText, ArrowRight, Search, Bell, TrendingUp,
  CheckCircle2, XCircle, AlertCircle, Sparkles
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { ExaminationWithDetails, CandidateEducation, CandidateApplication } from '../../types'
import { OpportunityCard } from '../../components/shared/OpportunityCard'
import { SearchBar } from '../../components/shared/SearchBar'
import { EligibilityBadge } from '../../components/shared/EligibilityBadge'
import { EmptyState } from '../../components/shared/EmptyState'

type DashboardTab = 'eligible' | 'not_eligible' | 'more_info' | 'saved' | 'applied'

export default function DiscoverPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<DashboardTab>('eligible')

  // 1. Fetch Saved IDs
  const { data: savedIds = new Set<string>() } = useQuery({
    queryKey: ['saved-ids', user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>()
      const { data } = await supabase
        .from('saved_examinations')
        .select('examination_id')
        .eq('candidate_id', user.id)
      return new Set((data || []).map((d: any) => d.examination_id as string))
    },
    enabled: !!user,
  })

  // 2. Fetch User Stats
  const { data: stats = { saved: 0, applied: 0, unread: 0 } } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return { saved: 0, applied: 0, unread: 0 }
      const [savedRes, appsRes, notifsRes] = await Promise.all([
        supabase.from('saved_examinations').select('*', { count: 'exact', head: true }).eq('candidate_id', user.id),
        supabase.from('candidate_applications').select('*', { count: 'exact', head: true }).eq('candidate_id', user.id),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('candidate_id', user.id).eq('is_read', false),
      ])
      return {
        saved: savedRes.count || 0,
        applied: appsRes.count || 0,
        unread: notifsRes.count || 0,
      }
    },
    enabled: !!user,
  })

  // 3. Fetch Candidate Education
  const { data: education = [] } = useQuery<CandidateEducation[]>({
    queryKey: ['candidate-education', user?.id],
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

  // 4. Fetch Candidate Applications
  const { data: applications = [] } = useQuery<any[]>({
    queryKey: ['candidate-applications-dash', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('candidate_applications')
        .select(`
          *,
          examinations:examination_id (
            *,
            organisations (*),
            examination_dates (*),
            eligibility_rules (*)
          )
        `)
        .eq('candidate_id', user.id)
        .order('updated_at', { ascending: false })
      return (data || []) as any[]
    },
    enabled: !!user,
  })

  // 5. Fetch Opportunities
  const { data: allExams = [], isLoading: recLoading } = useQuery<ExaminationWithDetails[]>({
    queryKey: ['dashboard-all-exams'],
    queryFn: async () => {
      const { data } = await supabase
        .from('examinations')
        .select(`*, organisations (*), examination_dates (*), eligibility_rules (*)`)
        .eq('status', 'published')
        .order('last_verified_at', { ascending: false })
        .limit(30)
      return (data || []) as ExaminationWithDetails[]
    },
  })

  // 6. Fetch Deadlines Closing Soon
  const { data: closingSoon = [] } = useQuery<ExaminationWithDetails[]>({
    queryKey: ['closing-soon-exams'],
    queryFn: async () => {
      const nowIso = new Date().toISOString()
      const { data } = await supabase
        .from('examinations')
        .select(`*, organisations (*), examination_dates!inner (*), eligibility_rules (*)`)
        .eq('status', 'published')
        .gte('examination_dates.application_closing_date', nowIso)
        .order('examination_dates(application_closing_date)', { ascending: true })
        .limit(4)
      return (data || []) as ExaminationWithDetails[]
    },
  })

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (examId: string) => {
      if (!user) return
      if (savedIds.has(examId)) {
        await supabase.from('saved_examinations').delete().eq('candidate_id', user.id).eq('examination_id', examId)
      } else {
        await supabase.from('saved_examinations').insert({ candidate_id: user.id, examination_id: examId })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-ids', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['saved-examinations-detailed', user?.id] })
    },
  })

  // Categorize Opportunities by Eligibility
  const { eligibleList, notEligibleList, needMoreInfoList } = useMemo(() => {
    const eligible: ExaminationWithDetails[] = []
    const notEligible: ExaminationWithDetails[] = []
    const needInfo: ExaminationWithDetails[] = []

    const hasDob = !!profile?.date_of_birth
    const hasEducation = education.length > 0

    // Candidate age calculation
    let candidateAge: number | null = null
    let ageRelaxation = 0
    if (profile?.date_of_birth) {
      const dob = new Date(profile.date_of_birth)
      const now = new Date()
      let age = now.getFullYear() - dob.getFullYear()
      const m = now.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
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

    allExams.forEach((exam) => {
      const rules = exam.eligibility_rules
      if (!rules) {
        eligible.push(exam)
        return
      }

      // If user profile is missing required data
      if (!hasDob || (!hasEducation && (rules.educational_qualifications?.length || 0) > 0)) {
        needInfo.push(exam)
        return
      }

      // Age check
      let agePassed = true
      if (candidateAge !== null) {
        const maxAllowed = rules.max_age + ageRelaxation
        if (candidateAge < rules.min_age || candidateAge > maxAllowed) {
          agePassed = false
        }
      }

      // Qualification check
      let qualPassed = true
      const requiredQuals = rules.educational_qualifications || []
      if (requiredQuals.length > 0) {
        qualPassed = education.some((e) =>
          requiredQuals.some((rq) =>
            rq.toLowerCase().includes(e.highest_qualification.toLowerCase()) ||
            e.highest_qualification.toLowerCase().includes(rq.toLowerCase())
          )
        )
      }

      if (agePassed && qualPassed) {
        eligible.push(exam)
      } else {
        notEligible.push(exam)
      }
    })

    return {
      eligibleList: eligible,
      notEligibleList: notEligible,
      needMoreInfoList: needInfo,
    }
  }, [allExams, profile, education])

  // Saved examinations list
  const savedList = useMemo(() => {
    return allExams.filter((e) => savedIds.has(e.id))
  }, [allExams, savedIds])

  const firstName = profile?.full_name?.split(' ')[0] || 'Candidate'
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <Helmet>
        <title>Dashboard — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-content py-6 sm:py-8 space-y-8">

        {/* ── Welcome Header ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 border-b border-border-default pb-6">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              {todayFormatted}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Welcome back, {firstName}
            </h1>
            {profile?.state && (
              <p className="text-sm text-text-secondary mt-1">
                Showing opportunities for <strong className="text-text-primary">{profile.state}</strong>
                {profile.social_category && profile.social_category !== 'General' && (
                  <> · <span className="font-medium text-brand-action">{profile.social_category}</span> statutory relaxation active</>
                )}
                {profile.is_pwbd && <> · <span className="font-medium text-brand-action">PwBD</span> relaxation active</>}
              </p>
            )}
          </div>

          <div className="w-full sm:w-72 flex-shrink-0">
            <SearchBar
              placeholder="Search all exams, jobs..."
              value={search}
              onChange={setSearch}
              onSearch={(q) => navigate(`/explorer?q=${encodeURIComponent(q)}`)}
            />
          </div>
        </div>

        {/* ── Closing Soon Alert ─────────────────────────────── */}
        {closingSoon.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                  Application Deadlines Closing Soon
                </h2>
              </div>
              <Link to="/explorer" className="text-xs font-semibold text-brand-action hover:underline">
                View all deadlines
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {closingSoon.map((exam) => (
                <OpportunityCard
                  key={exam.id}
                  exam={exam}
                  variant="compact"
                  isSaved={savedIds.has(exam.id)}
                  onToggleSave={(id) => saveMutation.mutate(id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Main Dashboard Tabs ───────────────────────────── */}
        <div>
          <div className="border-b border-border-default">
            <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto pb-px" aria-label="Dashboard sections">
              {/* Tab 1: Eligible */}
              <button
                type="button"
                onClick={() => setActiveTab('eligible')}
                className={`min-h-[44px] px-3.5 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'eligible'
                    ? 'border-brand-action text-brand-action'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-status-eligible" />
                Eligible
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-status-eligible-bg text-status-eligible font-bold border border-status-eligible-border">
                  {eligibleList.length}
                </span>
              </button>

              {/* Tab 2: Not eligible */}
              <button
                type="button"
                onClick={() => setActiveTab('not_eligible')}
                className={`min-h-[44px] px-3.5 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'not_eligible'
                    ? 'border-brand-action text-brand-action'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-300'
                }`}
              >
                <XCircle className="w-4 h-4 text-status-ineligible" />
                Not eligible
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-status-ineligible-bg text-status-ineligible font-bold border border-status-ineligible-border">
                  {notEligibleList.length}
                </span>
              </button>

              {/* Tab 3: Need more info */}
              <button
                type="button"
                onClick={() => setActiveTab('more_info')}
                className={`min-h-[44px] px-3.5 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'more_info'
                    ? 'border-brand-action text-brand-action'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-300'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-status-moreinfo" />
                Need more info
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-status-moreinfo-bg text-status-moreinfo font-bold border border-status-moreinfo-border">
                  {needMoreInfoList.length}
                </span>
              </button>

              {/* Tab 4: Saved */}
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`min-h-[44px] px-3.5 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'saved'
                    ? 'border-brand-action text-brand-action'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-300'
                }`}
              >
                <Bookmark className="w-4 h-4 text-brand-action" />
                Saved
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-brand-action font-bold border border-blue-200">
                  {stats.saved}
                </span>
              </button>

              {/* Tab 5: Applied */}
              <button
                type="button"
                onClick={() => setActiveTab('applied')}
                className={`min-h-[44px] px-3.5 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'applied'
                    ? 'border-brand-action text-brand-action'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-300'
                }`}
              >
                <FileText className="w-4 h-4 text-text-secondary" />
                Applied
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-text-secondary font-bold border border-border-default">
                  {stats.applied}
                </span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="pt-6">
            {recLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white border border-border-default rounded-lg p-6 h-56 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* ── Eligible Tab ── */}
                {activeTab === 'eligible' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-text-secondary">
                        Showing opportunities matching your qualifications and age with applicable statutory relaxations.
                      </p>
                      <Link to="/explorer" className="text-xs font-semibold text-brand-action hover:underline flex items-center gap-1">
                        Explore all <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {eligibleList.length === 0 ? (
                      <div className="bg-white border border-border-default rounded-lg p-10 text-center">
                        <CheckCircle2 className="w-10 h-10 text-status-eligible mx-auto mb-3" />
                        <h3 className="text-base font-bold text-text-primary mb-1">No currently open matches</h3>
                        <p className="text-sm text-text-secondary max-w-md mx-auto mb-4">
                          We didn't find active recruitment notifications matching your exact qualification today. Check all listings or update your profile qualifications.
                        </p>
                        <Link
                          to="/explorer"
                          className="inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-lg bg-brand-action text-white text-sm font-semibold hover:bg-brand-action-hover"
                        >
                          Browse All Opportunities
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {eligibleList.map((exam) => (
                          <div key={exam.id} className="relative">
                            <OpportunityCard
                              exam={exam}
                              isSaved={savedIds.has(exam.id)}
                              onToggleSave={(id) => saveMutation.mutate(id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Not Eligible Tab ── */}
                {activeTab === 'not_eligible' && (
                  <div>
                    <div className="p-3.5 mb-5 rounded-lg bg-bg-alternate border border-border-default text-xs text-text-secondary flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-status-ineligible flex-shrink-0 mt-0.5" />
                      <p>
                        These opportunities are currently closed to your profile due to age limits or specific degree requirements in the official notification. We display them for full transparency.
                      </p>
                    </div>

                    {notEligibleList.length === 0 ? (
                      <div className="bg-white border border-border-default rounded-lg p-10 text-center text-text-secondary text-sm">
                        No ineligible opportunities recorded.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {notEligibleList.map((exam) => (
                          <div key={exam.id} className="opacity-80 hover:opacity-100 transition-opacity">
                            <OpportunityCard
                              exam={exam}
                              isSaved={savedIds.has(exam.id)}
                              onToggleSave={(id) => saveMutation.mutate(id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Need More Info Tab ── */}
                {activeTab === 'more_info' && (
                  <div>
                    <div className="p-4 mb-5 rounded-lg bg-status-moreinfo-bg border border-status-moreinfo-border text-sm text-status-moreinfo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-status-moreinfo" />
                        <div>
                          <p className="font-bold">Missing profile details required for verification</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Please provide your Date of Birth or complete your educational qualifications so we can calculate your eligibility.
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/profile/edit"
                        className="min-h-[44px] inline-flex items-center px-4 py-2 rounded-lg bg-white border border-status-moreinfo-border text-text-primary text-xs font-bold hover:bg-slate-50 flex-shrink-0"
                      >
                        Complete Profile
                      </Link>
                    </div>

                    {needMoreInfoList.length === 0 ? (
                      <div className="bg-white border border-border-default rounded-lg p-10 text-center text-text-secondary text-sm">
                        Your profile is complete! All available opportunities have been evaluated.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {needMoreInfoList.map((exam) => (
                          <OpportunityCard
                            key={exam.id}
                            exam={exam}
                            isSaved={savedIds.has(exam.id)}
                            onToggleSave={(id) => saveMutation.mutate(id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Saved Tab ── */}
                {activeTab === 'saved' && (
                  <div>
                    {savedList.length === 0 ? (
                      <EmptyState
                        icon={Bookmark}
                        title="No saved opportunities"
                        description="Click the bookmark icon on any exam or scholarship card to save it for quick review."
                        action={
                          <Link to="/explorer" className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white text-sm font-semibold transition-colors">
                            Browse Opportunities
                          </Link>
                        }
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {savedList.map((exam) => (
                          <OpportunityCard
                            key={exam.id}
                            exam={exam}
                            isSaved={true}
                            onToggleSave={(id) => saveMutation.mutate(id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Applied Tab ── */}
                {activeTab === 'applied' && (
                  <div>
                    {applications.length === 0 ? (
                      <EmptyState
                        icon={FileText}
                        title="No applications tracked yet"
                        description="When you apply on an official website, mark it on the examination page to track admit cards and results."
                        action={
                          <Link to="/explorer" className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white text-sm font-semibold transition-colors">
                            Explore Opportunities
                          </Link>
                        }
                      />
                    ) : (
                      <div className="space-y-3">
                        {applications.map((app) => (
                          <div
                            key={app.id}
                            className="bg-white border border-border-default rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-brand-action border border-blue-200">
                                {app.stage || 'Applied'}
                              </span>
                              <h3 className="text-base font-bold text-text-primary mt-1.5">
                                {app.examinations?.name || 'Examination Application'}
                              </h3>
                              <p className="text-xs text-text-secondary mt-0.5">
                                {app.examinations?.organisations?.name || 'Official Recruitment'}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <Link
                                to={`/opportunities/${app.examinations?.slug || app.examination_id}`}
                                className="min-h-[44px] inline-flex items-center px-4 py-2 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-xs font-semibold text-text-primary transition-colors"
                              >
                                View Details
                              </Link>
                              {app.examinations?.official_application_url && (
                                <a
                                  href={app.examinations.official_application_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white text-xs font-semibold transition-colors"
                                >
                                  Portal Link <ArrowRight className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </>
  )
}
