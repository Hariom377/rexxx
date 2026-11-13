import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { Eye, EyeOff, ArrowRight, CheckCircle2, Shield, Bell } from 'lucide-react'
import { supabase, getWebRedirectUrl } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

const TRUST_POINTS = [
  { icon: CheckCircle2, text: 'Only official .gov.in notifications' },
  { icon: Shield, text: 'Custom eligibility verification engine' },
  { icon: Bell, text: 'Personalised deadline and vacancy alerts' },
]

export default function RegisterPage() {
  const { user } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  if (user) return <Navigate to="/discover" replace />

  const onSubmit = async (data: RegisterForm) => {
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName },
          emailRedirectTo: getWebRedirectUrl(),
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed. Please try again.')
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

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="card p-8 max-w-form-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-accent-green-dim flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-accent-green" />
          </div>
          <h2 className="display-heading text-xl mb-2">Check your email</h2>
          <p className="text-text-muted text-sm leading-relaxed mb-6">
            We sent an account activation link to your email address. Verify your email to complete registration.
          </p>
          <Link to="/login" className="btn-primary inline-flex">
            Proceed to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Create Account — REXAM</title>
        <meta
          name="description"
          content="Create your free REXAM account to discover personalized government exams, scholarships and recruitments."
        />
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
              Your personalized government exam intelligence platform
            </h2>
            <p className="text-sm text-text-muted leading-relaxed mb-10">
              Built for UPSC, SSC, ISRO, DRDO, State PSCs, and central institutions.
              Complete your profile once and see the exact examinations and scholarships you are eligible for.
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
            Verified official notifications only · Zero spam
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
              <h1 className="display-heading text-2xl mb-1">Create account</h1>
              <p className="text-sm text-text-muted">
                Already registered?{' '}
                <Link to="/login" className="text-accent-green hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="space-y-4">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-bg-elevated hover:bg-bg-hover hover:border-border-strong text-sm font-medium text-text-primary transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-bg-primary px-3 text-xs text-text-muted">or register with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-accent-red-dim border border-accent-red/20 text-sm text-accent-red">
                    {error}
                  </div>
                )}

                <div>
                  <label className="label block mb-1.5">Full name</label>
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Priya Sharma"
                    className="input"
                    autoComplete="name"
                  />
                  {errors.fullName && <p className="text-xs text-accent-red mt-1">{errors.fullName.message}</p>}
                </div>

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
                  <label className="label block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPass ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      className="input pr-10"
                      autoComplete="new-password"
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

                <div>
                  <label className="label block mb-1.5">Confirm password</label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="Repeat password"
                    className="input"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-accent-red mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 gap-2">
                  {loading ? 'Creating account...' : (
                    <>Create account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-text-disabled mt-8 leading-relaxed">
              By registering, you agree to REXAM's{' '}
              <Link to="/terms" className="text-text-muted hover:text-text-primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-text-muted hover:text-text-primary">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
