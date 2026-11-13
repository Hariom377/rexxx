import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, ExternalLink, Calendar } from 'lucide-react'
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
      queryClient.invalidateQueries({ queryKey: ['unread-notifications', user?.id] })
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
      queryClient.invalidateQueries({ queryKey: ['unread-notifications', user?.id] })
    },
  })

  const hasUnread = notifications.some((n) => !n.is_read)

  return (
    <>
      <Helmet>
        <title>Notifications &amp; Alerts — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-report py-6 tablet:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">Alerts &amp; Notifications</h1>
            <p className="text-sm text-text-secondary mt-1">Official corrigenda, deadline alerts and exam announcements.</p>
          </div>

          {hasUnread && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="btn-ghost text-xs gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 h-20 skeleton" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You'll receive alerts for deadline reminders, corrigenda, and admit cards for followed examinations."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markReadMutation.mutate(notif.id)}
                className={`card p-4 transition-colors cursor-pointer ${
                  !notif.is_read ? 'border-accent-green/40 bg-accent-green-dim/10' : 'hover:bg-bg-elevated'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-accent-green" />}
                      <span className="badge badge-muted text-2xs uppercase">{notif.notification_type || 'Announcement'}</span>
                      <span className="text-2xs text-text-muted">{formatDate(notif.sent_at, 'relative')}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-text-primary">{notif.title}</h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      {notif.message || notif.body}
                    </p>

                    {notif.official_source_url && (
                      <a
                        href={notif.official_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-2xs text-accent-green hover:underline mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Official Notice <ExternalLink className="w-3 h-3" />
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
