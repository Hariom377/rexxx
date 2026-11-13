import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
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
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-form-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-0.5">
              <span className="rexam-logo text-xl">REXAM</span>
              <span className="rexam-logo-dot text-xl font-black">.</span>
            </Link>
            <p className="text-text-secondary mt-2 text-sm">Reset your password</p>
          </div>
          <div className="card p-6">
            {sent ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent-green-dim flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent-green text-xl font-bold">✓</span>
                </div>
                <p className="text-text-primary font-medium mb-1">Check your email</p>
                <p className="text-text-secondary text-sm">We sent a password reset link to <strong>{email}</strong></p>
                <Link to="/login" className="btn-secondary mt-4 inline-flex">Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 rounded-lg bg-accent-red-dim text-sm text-accent-red">{error}</div>}
                <div>
                  <label className="label block mb-1.5">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
                <Link to="/login" className="btn-ghost w-full">Back to Login</Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
