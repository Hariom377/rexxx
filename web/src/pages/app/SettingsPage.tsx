import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Bell, Shield, LogOut, Info } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [pushEnabled, setPushEnabled] = useState(true)
  const [deadlinesEnabled, setDeadlinesEnabled] = useState(true)
  const [corrigendaEnabled, setCorrigendaEnabled] = useState(true)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <Helmet>
        <title>Settings — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-form py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Settings &amp; Preferences
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your notifications, deadline alerts, and session preferences.
          </p>
        </div>

        {/* Notifications Group */}
        <div className="bg-white border border-border-default rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border-default">
            <Bell className="w-4 h-4 text-brand-action" />
            <h2 className="text-base font-bold text-text-primary">Notification Preferences</h2>
          </div>

          <label className="flex items-center justify-between py-3 border-b border-border-default cursor-pointer">
            <div className="pr-4">
              <p className="text-sm font-semibold text-text-primary">Deadline Reminders</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Receive notifications 7 days and 24 hours before application closing dates
              </p>
            </div>
            <input
              type="checkbox"
              checked={deadlinesEnabled}
              onChange={(e) => setDeadlinesEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-brand-action focus:ring-brand-action"
            />
          </label>

          <label className="flex items-center justify-between py-3 border-b border-border-default cursor-pointer">
            <div className="pr-4">
              <p className="text-sm font-semibold text-text-primary">Corrigenda &amp; Post Changes</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Instant alerts if vacancy count, eligibility criteria, or exam dates are modified
              </p>
            </div>
            <input
              type="checkbox"
              checked={corrigendaEnabled}
              onChange={(e) => setCorrigendaEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-brand-action focus:ring-brand-action"
            />
          </label>

          <label className="flex items-center justify-between py-3 cursor-pointer">
            <div className="pr-4">
              <p className="text-sm font-semibold text-text-primary">In-App Alerts</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Display notification badge and unread counters in the navigation header
              </p>
            </div>
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-brand-action focus:ring-brand-action"
            />
          </label>
        </div>

        {/* Account Info */}
        <div className="bg-white border border-border-default rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border-default">
            <Shield className="w-4 h-4 text-brand-action" />
            <h2 className="text-base font-bold text-text-primary">Account &amp; Security</h2>
          </div>

          <div className="flex justify-between py-2 border-b border-border-default text-sm">
            <span className="text-text-secondary">Email</span>
            <span className="text-text-primary font-semibold">{user?.email}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-border-default text-sm">
            <span className="text-text-secondary">Account Created</span>
            <span className="text-text-primary font-semibold">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </span>
          </div>

          <div className="flex justify-between py-2 text-sm">
            <span className="text-text-secondary">Account Type</span>
            <span className="text-brand-action font-semibold">Candidate</span>
          </div>
        </div>

        {/* About App */}
        <div className="bg-white border border-border-default rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border-default">
            <Info className="w-4 h-4 text-text-secondary" />
            <h2 className="text-base font-bold text-text-primary">About REXAM</h2>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            REXAM is an independent student platform providing personalized government exam and scholarship eligibility discovery. Always verify critical dates and requirements on the official government notification before submitting applications.
          </p>
        </div>

        {/* Sign Out */}
        <div className="bg-white border border-border-default rounded-lg p-6">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-status-ineligible font-semibold text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out of REXAM
          </button>
        </div>
      </div>
    </>
  )
}
