import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { supabase, getWebRedirectUrl } from '../../lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getWebRedirectUrl(),
      })
      if (error) throw error
      setSent(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="font-bold text-2xl tracking-tight text-text-primary">REXAM</span>
            </Link>
            <p className="text-text-secondary mt-1 text-sm">Reset your password</p>
          </div>
          <div className="bg-white border border-border-default rounded-lg p-6 sm:p-8">
            {sent ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-status-eligible-bg border border-status-eligible-border flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-status-eligible" />
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-1">Check your email</h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  We sent a password reset link to <strong className="text-text-primary">{email}</strong>. Please check your inbox and spam folder.
                </p>
                <Link
                  to="/login"
                  className="w-full min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-sm font-semibold text-text-primary transition-colors"
                >
                  Back to Sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-status-ineligible-bg border border-status-ineligible-border text-sm text-status-ineligible">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:border-brand-action"
                    required
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Sending link...' : 'Send reset link'}
                </button>
                <Link
                  to="/login"
                  className="w-full min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign in
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
