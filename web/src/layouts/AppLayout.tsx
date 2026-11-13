import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Compass, Bookmark, FileText, User,
  Bell, Settings, LogOut, ChevronRight, Menu, X, Shield
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getInitials } from '../lib/utils'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const NAV_ITEMS = [
  { to: '/discover', icon: LayoutDashboard, label: 'Discover' },
  { to: '/explorer', icon: Compass, label: 'Explorer' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
  { to: '/applications', icon: FileText, label: 'Applications' },
  { to: '/profile', icon: User, label: 'Profile' },
]

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
        <Icon className="w-4 h-4" />
        {badge != null && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-accent-green rounded-full" />
        )}
      </div>
      <span>{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto text-2xs font-semibold bg-accent-green text-text-inverse rounded-pill px-1.5 py-0.5 leading-none">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  )
}

export default function AppLayout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <div className="flex h-screen bg-bg-primary overflow-hidden">

      {/* ── Desktop Sidebar ───────────────────────────────── */}
      <aside className="hidden desktop:flex flex-col w-56 flex-shrink-0 bg-bg-secondary border-r border-border">

        {/* Logo area */}
        <div className="px-4 py-4 border-b border-border flex-shrink-0">
          <Link to="/discover" className="flex items-center gap-0.5 mb-0.5">
            <span className="rexam-logo text-lg">REXAM</span>
            <span className="rexam-logo-dot text-lg font-black">.</span>
          </Link>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-dot flex-shrink-0" />
            <span className="text-2xs text-text-muted">Live — updated daily</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          <div className="pt-3 mt-2 border-t border-border space-y-0.5">
            <NavItem
              to="/alerts"
              icon={Bell}
              label="Alerts"
              badge={unreadCount}
            />
            <NavItem to="/settings" icon={Settings} label="Settings" />
          </div>
        </nav>

        {/* User card */}
        <div className="p-2.5 border-t border-border flex-shrink-0">
          <div
            className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-bg-hover cursor-pointer transition-colors"
            onClick={() => navigate('/profile')}
          >
            <div className="w-8 h-8 rounded-full bg-accent-green-dim border border-accent-green-muted flex items-center justify-center flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="text-2xs font-bold text-accent-green">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate leading-tight">{displayName}</p>
              {profile?.social_category && profile.social_category !== 'General' && (
                <span className="text-2xs text-text-muted">{profile.social_category}</span>
              )}
            </div>
            <ChevronRight className="w-3 h-3 text-text-disabled flex-shrink-0" />
          </div>

          <button
            onClick={handleSignOut}
            className="w-full mt-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-text-muted hover:text-accent-red hover:bg-accent-red-dim transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile Menu Overlay ───────────────────────────── */}
      {mobileMenuOpen && (
        <div className="desktop:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 w-60 bg-bg-secondary h-full flex flex-col border-r border-border animate-slide-in">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-0.5">
                <span className="rexam-logo text-lg">REXAM</span>
                <span className="rexam-logo-dot text-lg font-black">.</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.to} {...item} onClick={() => setMobileMenuOpen(false)} />
              ))}
              <div className="pt-3 mt-2 border-t border-border space-y-0.5">
                <NavItem to="/alerts" icon={Bell} label="Alerts" badge={unreadCount} onClick={() => setMobileMenuOpen(false)} />
                <NavItem to="/settings" icon={Settings} label="Settings" onClick={() => setMobileMenuOpen(false)} />
              </div>
            </nav>

            {/* Mobile user card */}
            <div className="p-2.5 border-t border-border">
              <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-accent-green-dim flex items-center justify-center flex-shrink-0">
                  <span className="text-2xs font-bold text-accent-green">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{displayName}</p>
                  <p className="text-2xs text-text-muted truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-text-muted hover:text-accent-red hover:bg-accent-red-dim transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="desktop:hidden flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-border flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-text-muted hover:text-text-primary p-1 -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-0.5">
            <span className="rexam-logo text-base">REXAM</span>
            <span className="rexam-logo-dot text-base font-black">.</span>
          </div>

          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `relative p-1 -mr-1 ${isActive ? 'text-accent-green' : 'text-text-muted hover:text-text-primary'}`
            }
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-accent-green rounded-full border border-bg-secondary" />
            )}
          </NavLink>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="desktop:hidden grid grid-cols-5 border-t border-border bg-bg-secondary flex-shrink-0">
          {[...NAV_ITEMS, { to: '/alerts', icon: Bell, label: 'Alerts' }].slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2.5 gap-0.5 text-2xs font-medium transition-colors ${
                  isActive ? 'text-accent-green' : 'text-text-muted hover:text-text-secondary'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
