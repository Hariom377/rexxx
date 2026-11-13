import { useState } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { Eye, EyeOff, ArrowRight, CheckCircle2, Shield, Bell } from 'lucide-react'
import { supabase, getWebRedirectUrl } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

const TRUST_POINTS = [
  { icon: CheckCircle2, text: 'Only official .gov.in notifications' },
  { icon: Shield, text: 'Eligibility checked before you see it' },
  { icon: Bell, text: 'Deadline alerts personalised to your profile' },
]

export default function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/discover'

  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  if (user) return <Navigate to={from} replace />

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) throw error
      navigate(from, { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getWebRedirectUrl() },
      })
    } catch {
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Sign in — REXAM</title>
        <meta name="description" content="Sign in to your REXAM account to discover personalised government exams and scholarships." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-bg-primary flex">

        {/* ── Left Panel — Trust / Branding ────────────── */}
        <div className="hidden desktop:flex flex-col justify-between w-96 flex-shrink-0 bg-bg-secondary border-r border-border p-10">
          <div>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-0.5 mb-12">
              <span className="rexam-logo text-xl">REXAM</span>
              <span className="rexam-logo-dot text-xl font-black">.</span>
            </Link>

            <h2 className="display-heading text-2xl leading-snug mb-4">
              Your personalised government exam intelligence platform
            </h2>
            <p className="text-sm text-text-muted leading-relaxed mb-10">
              Built for UPSC, SSC, ISRO, DRDO, SBI and all major central and state government recruitments.
              Set your profile once. We tell you exactly what you qualify for.
            </p>

            <div className="space-y-4">
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-accent-green-dim flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-accent-green" />
                  </div>
                  <span className="text-sm text-text-secondary">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom trust note */}
          <div className="verified-badge w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-dot flex-shrink-0" />
            Data updated daily from 18 official sources
          </div>
        </div>

        {/* ── Right Panel — Form ────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-form-xs">

            {/* Mobile logo only */}
            <div className="desktop:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-0.5">
                <span className="rexam-logo text-xl">REXAM</span>
                <span className="rexam-logo-dot text-xl font-black">.</span>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="display-heading text-2xl mb-1">Sign in</h1>
              <p className="text-sm text-text-muted">
                Don't have an account?{' '}
                <Link to="/register" className="text-accent-green hover:underline font-medium">
                  Create one free
                </Link>
              </p>
            </div>

            <div className="space-y-4">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-button border border-border bg-bg-elevated hover:bg-bg-hover hover:border-border-strong text-sm font-medium text-text-primary transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-bg-primary px-3 text-xs text-text-muted">or sign in with email</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-button bg-accent-red-dim border border-accent-red/20 text-sm text-accent-red">
                    {error}
                  </div>
                )}

                <div>
                  <label className="label block mb-1.5">Email address</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="your@email.com"
                    className="input"
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-xs text-accent-red mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label">Password</label>
                    <Link to="/forgot-password" className="text-xs text-text-muted hover:text-accent-green">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-accent-red mt-1">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 gap-2"
                >
                  {loading ? 'Signing in...' : (
                    <>Sign in <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-text-disabled mt-8 leading-relaxed">
              By continuing, you agree to REXAM's{' '}
              <Link to="/terms" className="text-text-muted hover:text-text-primary">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-text-muted hover:text-text-primary">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
