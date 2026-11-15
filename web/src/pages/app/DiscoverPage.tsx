import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Clock, Bookmark, FileText, ArrowRight,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { ExaminationWithDetails, CandidateEducation } from '../../types'
import { OpportunityCard } from '../../components/shared/OpportunityCard'
import { SearchBar } from '../../components/shared/SearchBar'
import { EmptyState } from '../../components/shared/EmptyState'
import { calculateAge, isAgeEligible, isEducationEligible } from '../../lib/eligibility'

type DashboardTab = 'eligible' | 'not_eligible' | 'more_info' | 'saved' | 'applied'

export default function DiscoverPage() {
  const { user, profile } = useAuth()
  const { t } = useTranslation()
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

  // 5. Fetch Opportunities (up to 30 published)
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

  // Categorize Opportunities by Personalized Eligibility Engine
  const { eligibleList, notEligibleList, needMoreInfoList } = useMemo(() => {
    const eligible: ExaminationWithDetails[] = []
    const notEligible: ExaminationWithDetails[] = []
    const needInfo: ExaminationWithDetails[] = []

    const hasDob = !!profile?.date_of_birth
    const hasEducation = education.length > 0

    // Accurate candidate age calculation
    const candidateAge = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null

    // Statutory age relaxations per official GoI rules
    let ageRelaxation = 0
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

      // Age check with statutory relaxation
      const agePassed = isAgeEligible(candidateAge, rules.min_age, rules.max_age, ageRelaxation)

      // Qualification check using Indian degree & hierarchy matching engine
      const qualPassed = isEducationEligible(education, rules.educational_qualifications)

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
        <title>{t('nav.dashboard')} — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-content py-6 sm:py-8 space-y-8">

        {/* ── Welcome Header ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              {todayFormatted}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              {t('dashboard.welcome_back')}, {firstName}
            </h1>
            {profile?.state && (
              <p className="text-sm text-text-secondary mt-1">
                {t('dashboard.showing_for', { state: profile.state })}
                {profile.social_category && profile.social_category !== 'General' && (
                  <> · <span className="font-semibold text-brand">{profile.social_category}</span> {t('eligibility.statutory_relaxation_applied')}</>
                )}
                {profile.is_pwbd && <> · <span className="font-semibold text-brand">PwBD</span> {t('eligibility.statutory_relaxation_applied')}</>}
              </p>
            )}
          </div>

          <div className="w-full sm:w-72 flex-shrink-0">
            <SearchBar
              placeholder={t('common.search_placeholder')}
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
                  {t('dashboard.deadlines_title')}
                </h2>
              </div>
              <Link to="/explorer" className="text-xs font-semibold text-brand hover:underline">
                {t('dashboard.view_all_deadlines')}
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
          <div className="border-b border-border">
            <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto pb-px" aria-label="Dashboard sections">
              {/* Tab 1: Eligible */}
              <button
                type="button"
                onClick={() => setActiveTab('eligible')}
                className={`min-h-[44px] px-3.5 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'eligible'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-status-eligible-text" />
                {t('dashboard.tab_eligible')}
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-status-eligible-bg text-status-eligible-text font-bold border border-status-eligible-border">
                  {eligibleList.length}
                </span>
              </button>

              {/* Tab 2: Not eligible */}
              <button
                type="button"
                onClick={() => setActiveTab('not_eligible')}
                className={`min-h-[44px] px-3.5 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'not_eligible'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <XCircle className="w-4 h-4 text-status-ineligible-text" />
                {t('dashboard.tab_not_eligible')}
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-status-ineligible-bg text-status-ineligible-text font-bold border border-status-ineligible-border">
                  {notEligibleList.length}
                </span>
              </button>

              {/* Tab 3: Need more info */}
              <button
                type="button"
                onClick={() => setActiveTab('more_info')}
                className={`min-h-[44px] px-3.5 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'more_info'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-amber-600" />
                {t('dashboard.tab_more_info')}
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                  {needMoreInfoList.length}
                </span>
              </button>

              {/* Tab 4: Saved */}
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`min-h-[44px] px-3.5 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'saved'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <Bookmark className="w-4 h-4 text-brand" />
                {t('dashboard.tab_saved')}
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-brand-light text-brand font-bold border border-brand-subtle">
                  {stats.saved}
                </span>
              </button>

              {/* Tab 5: Applied */}
              <button
                type="button"
                onClick={() => setActiveTab('applied')}
                className={`min-h-[44px] px-3.5 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'applied'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <FileText className="w-4 h-4 text-text-secondary" />
                {t('dashboard.tab_applied')}
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-bg-secondary text-text-secondary font-bold border border-border">
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
                  <div key={i} className="card p-6 h-56 skeleton" />
                ))}
              </div>
            ) : (
              <>
                {/* ── Eligible Tab ── */}
                {activeTab === 'eligible' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-text-secondary">
                        {t('dashboard.matching_subtitle')}
                      </p>
                      <Link to="/explorer" className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
                        {t('dashboard.explore_all')} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {eligibleList.length === 0 ? (
                      <div className="card p-10 text-center">
                        <CheckCircle2 className="w-10 h-10 text-status-eligible-text mx-auto mb-3" />
                        <h3 className="text-base font-bold text-text-primary mb-1">
                          {t('dashboard.no_matches_title')}
                        </h3>
                        <p className="text-sm text-text-secondary max-w-md mx-auto mb-4">
                          {t('dashboard.no_matches_desc')}
                        </p>
                        <Link
                          to="/explorer"
                          className="btn-primary text-sm font-semibold"
                        >
                          {t('dashboard.browse_all')}
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
                    <div className="p-3.5 mb-5 rounded-lg bg-bg-secondary border border-border text-xs text-text-secondary flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-status-ineligible-text flex-shrink-0 mt-0.5" />
                      <p>
                        {t('dashboard.not_eligible_notice')}
                      </p>
                    </div>

                    {notEligibleList.length === 0 ? (
                      <div className="card p-10 text-center text-text-secondary text-sm">
                        {t('dashboard.no_ineligible')}
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
                    <div className="p-4 mb-5 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <p className="font-bold">{t('dashboard.missing_profile_title')}</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {t('dashboard.missing_profile_desc')}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/profile/edit"
                        className="btn-secondary text-xs font-bold flex-shrink-0"
                      >
                        {t('dashboard.complete_profile')}
                      </Link>
                    </div>

                    {needMoreInfoList.length === 0 ? (
                      <div className="card p-10 text-center text-text-secondary text-sm">
                        {t('dashboard.profile_complete')}
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
                        title={t('dashboard.no_saved_title')}
                        description={t('dashboard.no_saved_desc')}
                        action={
                          <Link to="/explorer" className="btn-primary text-sm font-semibold">
                            {t('dashboard.browse_all')}
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
                        title={t('dashboard.no_applied_title')}
                        description={t('dashboard.no_applied_desc')}
                        action={
                          <Link to="/explorer" className="btn-primary text-sm font-semibold">
                            {t('dashboard.track_application')}
                          </Link>
                        }
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {applications.map((app) => (
                          <div key={app.id} className="card p-5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="badge bg-brand-light text-brand">
                                {app.stage}
                              </span>
                              <span className="text-2xs text-text-secondary">
                                {new Date(app.updated_at).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            <h3 className="font-bold text-text-primary text-sm mb-1">
                              {app.examinations?.name || 'Examination Application'}
                            </h3>
                            {app.application_number && (
                              <p className="text-xs text-text-secondary">
                                App No: {app.application_number}
                              </p>
                            )}
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
