import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Bell, Shield, LogOut, Moon, Info, HelpCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
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

      <div className="content-frame max-w-form py-6 tablet:py-8 space-y-6">
        <div>
          <h1 className="page-title">Settings &amp; Preferences</h1>
          <p className="text-sm text-text-secondary mt-1">Manage notifications and session preferences.</p>
        </div>

        {/* Notifications Group */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-accent-green" />
            <h2 className="section-heading">Notification Preferences</h2>
          </div>

          <label className="flex items-center justify-between py-2 border-b border-border/50 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-text-primary">Deadline Reminders</p>
              <p className="text-xs text-text-muted">Receive alerts 7 days and 24 hours before application closure</p>
            </div>
            <input
              type="checkbox"
              checked={deadlinesEnabled}
              onChange={(e) => setDeadlinesEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-accent-green"
            />
          </label>

          <label className="flex items-center justify-between py-2 border-b border-border/50 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-text-primary">Corrigenda &amp; Post Changes</p>
              <p className="text-xs text-text-muted">Instant alerts if vacancy count, eligibility or exam date changes</p>
            </div>
            <input
              type="checkbox"
              checked={corrigendaEnabled}
              onChange={(e) => setCorrigendaEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-accent-green"
            />
          </label>

          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-text-primary">In-App Push Alerts</p>
              <p className="text-xs text-text-muted">Show notification badge in navigation</p>
            </div>
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-accent-green"
            />
          </label>
        </div>

        {/* Account Info */}
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-accent-blue" />
            <h2 className="section-heading">Account &amp; Security</h2>
          </div>

          <div className="flex justify-between py-2 border-b border-border/50 text-sm">
            <span className="text-text-secondary">Email</span>
            <span className="text-text-primary font-medium">{user?.email}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-border/50 text-sm">
            <span className="text-text-secondary">Account Created</span>
            <span className="text-text-primary font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : '—'}
            </span>
          </div>

          <div className="flex justify-between py-2 text-sm">
            <span className="text-text-secondary">Role</span>
            <span className="text-accent-green font-medium">Candidate</span>
          </div>
        </div>

        {/* About App */}
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-text-muted" />
            <h2 className="section-heading">About REXAM Web</h2>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-text-secondary">Version</span>
            <span className="text-text-primary">2.4.0 (React 19 SaaS)</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-text-secondary">Database Host</span>
            <span className="text-text-muted text-xs">Supabase AWS ap-south-1</span>
          </div>
        </div>

        {/* Sign Out */}
        <div className="card p-6">
          <button
            onClick={handleSignOut}
            className="btn-danger w-full gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign out of REXAM
          </button>
        </div>
      </div>
    </>
  )
}
