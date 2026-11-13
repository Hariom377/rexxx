import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Clock, Bookmark, FileText, ArrowRight, Search, Bell, TrendingUp
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { ExaminationWithDetails } from '../../types'
import { OpportunityCard } from '../../components/shared/OpportunityCard'
import { SearchBar } from '../../components/shared/SearchBar'
import { formatDate } from '../../lib/utils'

export default function DiscoverPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

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

  const { data: recommended = [], isLoading: recLoading } = useQuery<ExaminationWithDetails[]>({
    queryKey: ['recommended-exams', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('examinations')
        .select(`*, organisations (*), examination_dates (*), eligibility_rules (*)`)
        .eq('status', 'published')
        .order('last_verified_at', { ascending: false })
        .limit(6)
      return (data || []) as ExaminationWithDetails[]
    },
    enabled: !!user,
  })

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
      queryClient.invalidateQueries({ queryKey: ['saved-examinations', user?.id] })
    },
  })

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
        <title>Discover — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-content py-6 tablet:py-8 space-y-10">

        {/* ── Header Row ───────────────────────────────── */}
        <div className="flex flex-col tablet:flex-row tablet:items-start justify-between gap-5">
          <div>
            <p className="text-xs text-text-muted mb-1">{todayFormatted}</p>
            <h1 className="display-heading text-xl tablet:text-2xl">
              Welcome back, {firstName}
            </h1>
            {profile?.state && (
              <p className="text-sm text-text-muted mt-1">
                Showing opportunities for{' '}
                <span className="text-text-secondary font-medium">{profile.state}</span>
                {profile.social_category && profile.social_category !== 'General' && (
                  <> · <span className="text-text-secondary font-medium">{profile.social_category}</span> relaxation applied</>
                )}
              </p>
            )}
          </div>

          <div className="w-full tablet:w-72 flex-shrink-0">
            <SearchBar
              placeholder="Search opportunities..."
              value={search}
              onChange={setSearch}
              onSearch={(q) => navigate(`/explorer?q=${encodeURIComponent(q)}`)}
            />
          </div>
        </div>

        {/* ── Stat Cards ───────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 tablet:gap-5">
          {[
            {
              to: '/saved',
              icon: Bookmark,
              count: stats.saved,
              label: 'Saved',
              color: 'text-accent-green',
              dimBg: 'bg-accent-green-dim',
            },
            {
              to: '/applications',
              icon: FileText,
              count: stats.applied,
              label: 'Tracking',
              color: 'text-accent-blue',
              dimBg: 'bg-accent-blue-dim',
            },
            {
              to: '/alerts',
              icon: Bell,
              count: stats.unread,
              label: 'Unread',
              color: stats.unread > 0 ? 'text-accent-orange' : 'text-text-muted',
              dimBg: stats.unread > 0 ? 'bg-accent-orange-dim' : 'bg-bg-elevated',
            },
          ].map(({ to, icon: Icon, count, label, color, dimBg }) => (
            <Link
              key={to}
              to={to}
              className="card-hover p-4 tablet:p-5 flex flex-col gap-3 group"
            >
              <div className={`w-8 h-8 rounded-lg ${dimBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-xl tablet:text-2xl font-black text-text-primary tracking-tightest leading-none">
                  {count}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Closing Soon ─────────────────────────────── */}
        {closingSoon.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-label mb-1">Closing soon</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-red" />
                  <h2 className="section-heading text-text-primary">Application deadlines this week</h2>
                </div>
              </div>
              <Link to="/explorer" className="btn-ghost text-xs gap-1 flex-shrink-0">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-3">
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

        {/* ── Recommended ──────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-label mb-1">Personalised feed</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-green" />
                <h2 className="section-heading">Recommended opportunities</h2>
              </div>
            </div>
            <Link to="/explorer" className="btn-ghost text-xs gap-1 flex-shrink-0">
              Full catalogue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recLoading ? (
            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-52 skeleton" />
              ))}
            </div>
          ) : recommended.length === 0 ? (
            <div className="card p-10 text-center border-dashed">
              <p className="text-sm text-text-muted">No opportunities found matching your profile yet.</p>
              <Link to="/explorer" className="btn-outline text-sm mt-4 inline-flex">
                Browse all opportunities
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-5">
              {recommended.map((exam) => (
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

      </div>
    </>
  )
}
