import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Notification } from '../../types'
import { formatDate } from '../../lib/utils'
import { EmptyState } from '../../components/shared/EmptyState'

export default function AlertsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['candidate-notifications', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('candidate_id', user.id)
        .order('sent_at', { ascending: false })

      if (error) throw error
      return (data || []) as Notification[]
    },
    enabled: !!user,
  })

  // Mark Read Mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
    },
  })

  // Mark All Read Mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('candidate_id', user.id)
        .eq('is_read', false)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
    },
  })

  const hasUnread = notifications.some((n) => !n.is_read)

  return (
    <>
      <Helmet>
        <title>Notifications &amp; Alerts — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-report py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Alerts &amp; Notifications
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Official corrigenda, application deadline alerts, and examination announcements.
            </p>
          </div>

          {hasUnread && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-xs font-semibold text-text-primary transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-brand-action" /> Mark all as read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-border-default rounded-lg p-5 h-20 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You will receive alerts here for deadline reminders, corrigenda, and admit cards for followed examinations."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markReadMutation.mutate(notif.id)}
                className={`bg-white border rounded-lg p-4 sm:p-5 transition-colors cursor-pointer ${
                  !notif.is_read
                    ? 'border-brand-action/40 bg-blue-50/20'
                    : 'border-border-default hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-action flex-shrink-0" />
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold uppercase bg-slate-100 text-text-secondary border border-border-default">
                        {notif.notification_type || 'Announcement'}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {formatDate(notif.sent_at, 'relative')}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-text-primary">
                      {notif.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                      {notif.message || notif.body}
                    </p>

                    {notif.official_source_url && (
                      <a
                        href={notif.official_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-action hover:underline mt-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Official Notice Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
