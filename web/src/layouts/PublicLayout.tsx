import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Shield } from 'lucide-react'

const NAV_LINKS = [
  { to: '/jobs', label: 'Govt Jobs' },
  { to: '/exams', label: 'Exams' },
  { to: '/scholarships', label: 'Scholarships' },
  { to: '/about', label: 'About' },
]

export default function PublicLayout() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">

      {/* Trust Top Bar */}
      <div className="bg-bg-secondary border-b border-border">
        <div className="content-frame max-w-content flex items-center justify-between h-9">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <span className="flex items-center gap-1.5 text-2xs text-text-muted whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-dot flex-shrink-0" />
              Updated daily from official .gov.in portals
            </span>
            <span className="text-border hidden tablet:block">|</span>
            <span className="text-2xs text-text-muted hidden tablet:block whitespace-nowrap">Sources: UPSC · SSC · ISRO · DRDO · SBI · PMRF</span>
          </div>
          <div className="flex items-center gap-1.5 text-2xs text-text-muted whitespace-nowrap">
            <Shield className="w-3 h-3 text-accent-green flex-shrink-0" />
            <span className="hidden tablet:block">Official notifications only</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-bg-primary/90 backdrop-blur-md border-b border-border">
        <div className="content-frame max-w-content flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-0.5 group">
            <span className="rexam-logo">REXAM</span>
            <span className="rexam-logo-dot text-xl font-black">.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden tablet:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-text-primary bg-bg-elevated'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/discover" className="btn-primary text-sm py-2">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: { pathname: location.pathname } }}
                  className="btn-ghost text-sm py-2 hidden tablet:inline-flex"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-secondary mt-20">

        {/* Source Organisations Strip */}
        <div className="border-b border-border">
          <div className="content-frame max-w-content py-5">
            <p className="text-2xs text-text-muted uppercase tracking-wider text-center mb-4">
              Official Data Sources
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['UPSC', 'SSC', 'ISRO', 'DRDO', 'SBI', 'IBPS', 'PMRF', 'CSIR-JRF', 'Railway Board', 'State PSCs'].map((org) => (
                <span key={org} className="source-chip">{org}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="content-frame max-w-content py-10">
          <div className="grid grid-cols-2 tablet:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 tablet:col-span-1">
              <Link to="/" className="flex items-center gap-0.5 mb-3">
                <span className="rexam-logo text-base">REXAM</span>
                <span className="rexam-logo-dot text-base font-black">.</span>
              </Link>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                India's personalised government examination and scholarship discovery platform. Built for serious aspirants.
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="verified-badge w-fit">
                  <Shield className="w-3 h-3" />
                  Official sources only
                </div>
                <div className="verified-badge w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-dot" />
                  Updated daily at 06:30 IST
                </div>
              </div>
            </div>

            <div>
              <h4 className="section-label mb-4">Discover</h4>
              <div className="space-y-2.5">
                <Link to="/jobs" className="block text-sm text-text-muted hover:text-text-primary">Government Jobs</Link>
                <Link to="/exams" className="block text-sm text-text-muted hover:text-text-primary">National Exams</Link>
                <Link to="/scholarships" className="block text-sm text-text-muted hover:text-text-primary">Scholarships</Link>
              </div>
            </div>

            <div>
              <h4 className="section-label mb-4">Platform</h4>
              <div className="space-y-2.5">
                <Link to="/about" className="block text-sm text-text-muted hover:text-text-primary">About REXAM</Link>
                <Link to="/contact" className="block text-sm text-text-muted hover:text-text-primary">Contact</Link>
                <Link to="/register" className="block text-sm text-text-muted hover:text-text-primary">Create Account</Link>
              </div>
            </div>

            <div>
              <h4 className="section-label mb-4">Legal</h4>
              <div className="space-y-2.5">
                <Link to="/privacy" className="block text-sm text-text-muted hover:text-text-primary">Privacy Policy</Link>
                <Link to="/terms" className="block text-sm text-text-muted hover:text-text-primary">Terms of Service</Link>
              </div>
              <div className="mt-5">
                <h4 className="section-label mb-2">Disclaimer</h4>
                <p className="text-2xs text-text-disabled leading-relaxed">
                  REXAM aggregates from official government portals. Always verify from primary sources before applying.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col tablet:flex-row items-start tablet:items-center justify-between gap-3">
            <p className="text-xs text-text-disabled">
              &copy; {new Date().getFullYear()} REXAM. All rights reserved. Not affiliated with any government body.
            </p>
            <p className="text-xs text-text-disabled">
              Data sourced exclusively from official Indian government portals (.gov.in, .nic.in, .ac.in)
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
