import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
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

      <div className="content-frame max-w-content py-6 tablet:py-8">
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="page-title">Application Tracker</h1>
            <p className="text-sm text-text-secondary mt-1">
              Track your progress across every government exam and scholarship lifecycle.
            </p>
          </div>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="input tablet:w-56"
          >
            <option value="all">All Stages ({applications.length})</option>
            {APPLICATION_STAGES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 h-28 skeleton" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications tracked"
            description="When you apply or plan to apply for an opportunity, track it here to monitor deadlines and admit cards."
            action={
              <Link to="/explorer" className="btn-primary gap-2">
                <Compass className="w-4 h-4" /> Find Opportunities
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => {
              const exam = app.examinations
              return (
                <div key={app.id} className="card p-5 hover:border-border-strong transition-colors">
                  <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge badge-green uppercase">{app.stage}</span>
                        {exam?.category && <span className="text-2xs text-text-muted">• {exam.category}</span>}
                      </div>

                      <h3 className="text-base font-semibold text-text-primary hover:text-accent-green transition-colors">
                        <Link to={`/opportunities/${exam?.slug}`}>{exam?.name || 'Examination'}</Link>
                      </h3>

                      {exam?.organisations?.name && (
                        <p className="text-xs text-text-muted mt-0.5">{exam.organisations.name}</p>
                      )}

                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-text-muted">
                        {app.application_number && (
                          <span>App #: <strong className="text-text-primary">{app.application_number}</strong></span>
                        )}
                        {app.roll_number && (
                          <span>Roll #: <strong className="text-text-primary">{app.roll_number}</strong></span>
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
                        className="input text-xs py-1.5 px-2.5 w-auto"
                      >
                        {APPLICATION_STAGES.map((st) => (
                          <option key={st.value} value={st.value}>{st.label}</option>
                        ))}
                      </select>

                      <Link
                        to={`/opportunities/${exam?.slug}`}
                        className="btn-ghost text-xs p-2"
                        title="View details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
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
