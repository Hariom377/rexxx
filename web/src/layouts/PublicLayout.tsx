import { useState } from 'react'
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Shield, Menu, X, AlertCircle } from 'lucide-react'
import { LanguageSwitcher } from '../components/shared/LanguageSwitcher'

const NAV_LINKS = [
  { to: '/jobs', label: 'Govt Jobs' },
  { to: '/exams', label: 'National Exams' },
  { to: '/scholarships', label: 'Scholarships' },
  { to: '/about', label: 'About' },
]

const TRACKED_ORGANISATIONS = [
  'UPSC',
  'SSC',
  'ISRO',
  'DRDO',
  'SBI',
  'IBPS',
  'Railway Recruitment Boards',
  'State PSCs',
  'PMRF',
  'CSIR-JRF',
]

export default function PublicLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col text-text-primary">

      {/* ── Official Disclaimer Top Notice ──────────────── */}
      <div className="bg-bg-secondary border-b border-border py-2 text-xs text-text-secondary">
        <div className="content-frame max-w-content flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-1">
          <div className="flex items-center gap-1.5 font-medium text-text-primary">
            <AlertCircle className="w-3.5 h-3.5 text-brand flex-shrink-0" aria-hidden="true" />
            <span>REXAM is an independent student platform, not a government website. Always verify on official notifications.</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <span>Updated daily from official government and public-body websites</span>
          </div>
        </div>
      </div>

      {/* ── Main Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-bg-primary border-b border-border">
        <div className="content-frame max-w-content flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-0.5 rounded focus-visible:ring-2 focus-visible:ring-brand py-1 px-1"
          >
            <span className="rexam-logo text-xl">REXAM</span>
            <span className="rexam-logo-dot text-xl font-bold">.</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden desktop:flex items-center gap-1" aria-label="Main Navigation">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
                    isActive
                      ? 'text-brand bg-brand-light'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Actions & Language Switcher */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {user ? (
              <Link to="/discover" className="btn-primary text-sm py-2 px-4 hidden tablet:inline-flex">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: { pathname: location.pathname } }}
                  className="btn-secondary text-sm py-2 px-3.5 hidden tablet:inline-flex"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4 hidden tablet:inline-flex">
                  Get started free
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="desktop:hidden min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-lg border border-border text-text-primary hover:bg-bg-secondary focus-visible:ring-2 focus-visible:ring-brand"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="desktop:hidden border-t border-border bg-bg-primary px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center ${
                      isActive ? 'bg-brand-light text-brand' : 'text-text-primary hover:bg-bg-secondary'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-border pt-3 flex flex-col gap-2">
              {user ? (
                <Link
                  to="/discover"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full text-center"
                  >
                    Get started free
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary w-full text-center"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border bg-bg-secondary mt-16 text-text-secondary">

        {/* Static Organisation List (No scrolling marquee, calm text) */}
        <div className="border-b border-border bg-bg-primary/70 py-6">
          <div className="content-frame max-w-content">
            <p className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-2">
              We track official notifications from:
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {TRACKED_ORGANISATIONS.join(' · ')} and other central, state and university recruitment bodies.
            </p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="content-frame max-w-content py-12">
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-8 mb-10">
            <div>
              <Link to="/" className="flex items-center gap-0.5 mb-2">
                <span className="rexam-logo text-lg">REXAM</span>
                <span className="rexam-logo-dot text-lg font-bold">.</span>
              </Link>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                Personalised government examination and scholarship discovery for Indian students. We evaluate your age, category and qualification against official notifications.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-text-secondary font-medium border border-border rounded px-2.5 py-1 bg-bg-primary">
                <Shield className="w-3.5 h-3.5 text-brand" aria-hidden="true" />
                <span>Official government notifications</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
                Discover
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/jobs" className="hover:text-brand focus-visible:ring-2 focus-visible:ring-brand rounded">
                    Government Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/exams" className="hover:text-brand focus-visible:ring-2 focus-visible:ring-brand rounded">
                    National Exams
                  </Link>
                </li>
                <li>
                  <Link to="/scholarships" className="hover:text-brand focus-visible:ring-2 focus-visible:ring-brand rounded">
                    Scholarships &amp; Fellowships
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="hover:text-brand focus-visible:ring-2 focus-visible:ring-brand rounded">
                    About REXAM
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-brand focus-visible:ring-2 focus-visible:ring-brand rounded">
                    Contact &amp; Support
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-brand focus-visible:ring-2 focus-visible:ring-brand rounded">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
                Notice &amp; Legal
              </h4>
              <ul className="space-y-2 text-sm mb-4">
                <li>
                  <Link to="/privacy" className="hover:text-brand focus-visible:ring-2 focus-visible:ring-brand rounded">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-brand focus-visible:ring-2 focus-visible:ring-brand rounded">
                    Terms of Service
                  </Link>
                </li>
              </ul>
              <div className="bg-bg-primary border border-border rounded p-3 text-xs leading-relaxed">
                <strong className="text-text-primary block mb-1">Important Disclaimer</strong>
                REXAM is not affiliated with any government agency. Always read and verify details on the official notification before applying.
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col tablet:flex-row items-start tablet:items-center justify-between gap-3 text-xs text-text-secondary">
            <p>
              &copy; {new Date().getFullYear()} REXAM. All rights reserved.
            </p>
            <p>
              Data sourced directly from official government and public-body websites.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
