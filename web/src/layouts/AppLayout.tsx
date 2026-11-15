import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Compass, Bookmark, FileText, User,
  Bell, Settings, LogOut, ChevronRight, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { getInitials } from '../lib/utils'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { LanguageSwitcher } from '../components/shared/LanguageSwitcher'

function NavItem({
  to,
  icon: Icon,
  label,
  onClick,
  badge,
}: {
  to: string
  icon: typeof LayoutDashboard
  label: string
  onClick?: () => void
  badge?: number
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        isActive ? 'nav-item-active' : 'nav-item'
      }
    >
      <div className="relative flex-shrink-0">
        <Icon className="w-4 h-4" aria-hidden="true" />
        {badge != null && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full" />
        )}
      </div>
      <span>{label}</span>
      {badge != null && badge > 0 && (
        <span className="margin-inline-start-auto text-2xs font-semibold bg-brand text-text-inverse rounded-full px-2 py-0.5 leading-none">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  )
}

export default function AppLayout() {
  const { user, profile, signOut } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { to: '/discover', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/explorer', icon: Compass, label: t('nav.explorer') },
    { to: '/saved', icon: Bookmark, label: t('nav.saved') },
    { to: '/applications', icon: FileText, label: t('nav.applications') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ]

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications', user?.id],
    queryFn: async () => {
      if (!user) return 0
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('candidate_id', user.id)
        .eq('is_read', false)
      return count || 0
    },
    enabled: !!user,
    refetchInterval: 60_000,
  })

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Candidate'
  const initials = getInitials(displayName)

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden text-text-primary">

      {/* ── Desktop Sidebar ───────────────────────────────── */}
      <aside className="hidden desktop:flex flex-col w-60 flex-shrink-0 bg-bg-secondary border-r border-border">

        {/* Logo area */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <Link to="/discover" className="flex items-center gap-0.5 rounded focus-visible:ring-2 focus-visible:ring-brand">
              <span className="rexam-logo text-lg">REXAM</span>
              <span className="rexam-logo-dot text-lg font-bold">.</span>
            </Link>
            <p className="text-2xs text-text-secondary mt-0.5">{t('common.updated_daily', 'Updated daily')}</p>
          </div>
          <LanguageSwitcher compact />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Sidebar Navigation">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          <div className="pt-3 mt-3 border-t border-border space-y-1">
            <NavItem
              to="/alerts"
              icon={Bell}
              label={t('nav.alerts', 'Alerts')}
              badge={unreadCount}
            />
            <NavItem to="/settings" icon={Settings} label={t('nav.settings', 'Settings')} />
          </div>
        </nav>

        {/* User Profile Card */}
        <div className="p-3 border-t border-border flex-shrink-0 bg-bg-primary/50">
          <div
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-bg-elevated cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-brand"
            tabIndex={0}
            role="button"
            onClick={() => navigate('/profile')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/profile')
            }}
            aria-label="Go to candidate profile"
          >
            <div className="w-8 h-8 rounded-full bg-brand-light text-brand font-bold text-xs flex items-center justify-center flex-shrink-0 border border-brand/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate leading-tight">{displayName}</p>
              {profile?.social_category && profile.social_category !== 'General' && (
                <span className="text-2xs text-text-secondary font-medium">{profile.social_category}</span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full mt-2 min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:text-status-ineligible-text hover:bg-status-ineligible-bg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('nav.sign_out', 'Sign out')}</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Menu Overlay ───────────────────────────── */}
      {mobileMenuOpen && (
        <div className="desktop:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-text-primary/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 bg-bg-primary h-full flex flex-col border-r border-border shadow-elevated">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-0.5">
                <span className="rexam-logo text-lg">REXAM</span>
                <span className="rexam-logo-dot text-lg font-bold">.</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-11 h-11 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-border bg-bg-secondary flex items-center justify-between">
              <span className="text-xs text-text-secondary font-medium">Language:</span>
              <LanguageSwitcher />
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Mobile Navigation">
              {navItems.map((item) => (
                <NavItem key={item.to} {...item} onClick={() => setMobileMenuOpen(false)} />
              ))}
              <div className="pt-3 mt-2 border-t border-border space-y-1">
                <NavItem to="/alerts" icon={Bell} label={t('nav.alerts', 'Alerts')} badge={unreadCount} onClick={() => setMobileMenuOpen(false)} />
                <NavItem to="/settings" icon={Settings} label={t('nav.settings', 'Settings')} onClick={() => setMobileMenuOpen(false)} />
              </div>
            </nav>

            <div className="p-3 border-t border-border bg-bg-secondary">
              <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand-light text-brand font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{displayName}</p>
                  <p className="text-2xs text-text-secondary truncate">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-status-ineligible-text bg-status-ineligible-bg"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('nav.sign_out', 'Sign out')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Area ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="desktop:hidden flex items-center justify-between px-4 py-3 bg-bg-primary border-b border-border flex-shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="w-11 h-11 flex items-center justify-center -ml-2 rounded-lg text-text-secondary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-0.5">
            <span className="rexam-logo text-base">REXAM</span>
            <span className="rexam-logo-dot text-base font-bold">.</span>
          </div>

          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `relative w-11 h-11 flex items-center justify-center -mr-2 rounded-lg ${
                isActive ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
              }`
            }
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full" />
            )}
          </NavLink>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (44px min height for every item) */}
        <nav
          className="desktop:hidden grid grid-cols-5 border-t border-border bg-bg-primary flex-shrink-0 shadow-sm"
          aria-label="Bottom Navigation"
        >
          {[...navItems, { to: '/alerts', icon: Bell, label: t('nav.alerts', 'Alerts') }].slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `min-h-[50px] flex flex-col items-center justify-center py-1.5 gap-1 text-2xs font-semibold transition-colors ${
                  isActive ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
