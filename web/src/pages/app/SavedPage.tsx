import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Compass } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { ExaminationWithDetails } from '../../types'
import { OpportunityCard } from '../../components/shared/OpportunityCard'
import { EmptyState } from '../../components/shared/EmptyState'

export default function SavedPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: savedExams = [], isLoading } = useQuery<ExaminationWithDetails[]>({
    queryKey: ['saved-examinations-detailed', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('saved_examinations')
        .select(`
          examination_id,
          examinations:examination_id (
            *,
            organisations (*),
            examination_dates (*),
            eligibility_rules (*)
          )
        `)
        .eq('candidate_id', user.id)
        .order('saved_at', { ascending: false })

      if (error) throw error
      return (data || [])
        .map((item: any) => item.examinations)
        .filter(Boolean) as ExaminationWithDetails[]
    },
    enabled: !!user,
  })

  const removeMutation = useMutation({
    mutationFn: async (examId: string) => {
      if (!user) return
      await supabase
        .from('saved_examinations')
        .delete()
        .eq('candidate_id', user.id)
        .eq('examination_id', examId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-examinations-detailed', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['saved-ids', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
    },
  })

  return (
    <>
      <Helmet>
        <title>Saved Opportunities — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-content py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Saved Opportunities
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Keep track of notifications and examinations you plan to apply for before their closing dates.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-border-default rounded-lg p-6 h-56 animate-pulse" />
            ))}
          </div>
        ) : savedExams.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved opportunities yet"
            description="Bookmark jobs and examinations from the explorer or discover feed to review and track them here."
            action={
              <Link to="/explorer" className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white text-sm font-semibold transition-colors">
                <Compass className="w-4 h-4" /> Explore Opportunities
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedExams.map((exam) => (
              <OpportunityCard
                key={exam.id}
                exam={exam}
                isSaved={true}
                onToggleSave={(id) => removeMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
