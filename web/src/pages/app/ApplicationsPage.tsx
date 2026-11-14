import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Compass, ExternalLink, Calendar, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { CandidateApplication, ExaminationWithDetails } from '../../types'
import { APPLICATION_STAGES } from '../../types'
import { formatDate } from '../../lib/utils'
import { EmptyState } from '../../components/shared/EmptyState'

type ApplicationWithExam = CandidateApplication & {
  examinations: ExaminationWithDetails
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedStage, setSelectedStage] = useState<string>('all')

  const { data: applications = [], isLoading } = useQuery<ApplicationWithExam[]>({
    queryKey: ['candidate-applications', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
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

      if (error) throw error
      return (data || []) as ApplicationWithExam[]
    },
    enabled: !!user,
  })

  // Update Stage Mutation
  const updateStageMutation = useMutation({
    mutationFn: async ({ appId, newStage }: { appId: string; newStage: string }) => {
      await supabase
        .from('candidate_applications')
        .update({ stage: newStage, status: newStage })
        .eq('id', appId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-applications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['candidate-applications-dash', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
    },
  })

  const filteredApps = selectedStage === 'all'
    ? applications
    : applications.filter((app) => app.stage.toLowerCase() === selectedStage.toLowerCase())

  return (
    <>
      <Helmet>
        <title>Application Tracking — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-content py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Application Tracker
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Track your application lifecycle, admit card releases, and result announcements.
            </p>
          </div>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            aria-label="Filter by application stage"
            className="min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action sm:w-56"
          >
            <option value="all">All Stages ({applications.length})</option>
            {APPLICATION_STAGES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-border-default rounded-lg p-6 h-28 animate-pulse" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications tracked"
            description="When you apply on an official website, mark your application status here to keep key dates organized."
            action={
              <Link to="/explorer" className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white text-sm font-semibold transition-colors">
                <Compass className="w-4 h-4" /> Find Opportunities
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredApps.map((app) => {
              const exam = app.examinations
              return (
                <div
                  key={app.id}
                  className="bg-white border border-border-default rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-brand-action border border-blue-200">
                        {app.stage}
                      </span>
                      {exam?.category && (
                        <span className="text-xs text-text-secondary">· {exam.category}</span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-text-primary">
                      <Link
                        to={`/opportunities/${exam?.slug || exam?.id}`}
                        className="hover:text-brand-action transition-colors"
                      >
                        {exam?.name || 'Examination'}
                      </Link>
                    </h3>

                    {exam?.organisations?.name && (
                      <p className="text-xs text-text-secondary mt-0.5">{exam.organisations.name}</p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-text-secondary">
                      {app.application_number && (
                        <span>Application No: <strong className="text-text-primary">{app.application_number}</strong></span>
                      )}
                      {app.roll_number && (
                        <span>Roll No: <strong className="text-text-primary">{app.roll_number}</strong></span>
                      )}
                      {app.applied_date && (
                        <span>Applied on: {formatDate(app.applied_date, 'short')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Stage Selector */}
                    <select
                      value={app.stage}
                      onChange={(e) => updateStageMutation.mutate({ appId: app.id, newStage: e.target.value })}
                      aria-label="Update application stage"
                      className="min-h-[44px] text-xs font-semibold py-2 px-3 bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action text-text-primary"
                    >
                      {APPLICATION_STAGES.map((st) => (
                        <option key={st.value} value={st.value}>{st.label}</option>
                      ))}
                    </select>

                    <Link
                      to={`/opportunities/${exam?.slug || exam?.id}`}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border-default bg-white hover:bg-slate-50 text-text-secondary hover:text-text-primary transition-colors"
                      title="View details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
