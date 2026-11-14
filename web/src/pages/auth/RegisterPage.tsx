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
  { icon: CheckCircle2, text: 'Official notifications from government & public bodies' },
  { icon: Shield, text: 'Eligibility evaluated against notification criteria' },
  { icon: Bell, text: 'Personalised deadline alerts for your profile' },
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
      <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
        <div className="bg-white border border-border-default rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-status-eligible-bg border border-status-eligible-border flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-status-eligible" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Check your email</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            We sent an account activation link to your email address. Please open it to verify your account and begin discovering opportunities.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white text-sm font-semibold transition-colors"
          >
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

      <div className="min-h-screen bg-bg-page flex">
        {/* ── Left Panel — Trust & Information ────────────── */}
        <div className="hidden lg:flex flex-col justify-between w-96 flex-shrink-0 bg-bg-alternate border-r border-border-default p-10">
          <div>
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2 mb-10">
              <span className="font-bold text-2xl tracking-tight text-text-primary">REXAM</span>
            </Link>

            <h2 className="text-xl font-bold text-text-primary leading-snug mb-3">
              Government exams, recruitments and scholarships made simple
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-8">
              Complete your profile once. We check official notification criteria for UPSC, SSC, Railways, State PSCs, and central institutions to show where you qualify.
            </p>

            <div className="space-y-4">
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-blue-50 text-brand-action flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-text-secondary leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom trust note */}
          <div className="p-3.5 rounded-lg bg-white border border-border-default text-xs text-text-secondary">
            <p className="font-medium text-text-primary mb-1">Independent Student Platform</p>
            <p className="leading-relaxed">
              REXAM is not a government website. Always verify on official notifications before applying.
            </p>
          </div>
        </div>

        {/* ── Right Panel — Form ────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            {/* Mobile logo only */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2">
                <span className="font-bold text-2xl text-text-primary tracking-tight">REXAM</span>
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary mb-1">Create account</h1>
              <p className="text-sm text-text-secondary">
                Already registered?{' '}
                <Link to="/login" className="text-brand-action hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="space-y-5">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full min-h-[44px] flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-sm font-semibold text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action disabled:opacity-50"
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
                  <div className="w-full border-t border-border-default" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-bg-page px-3 text-xs text-text-secondary">or register with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-status-ineligible-bg border border-status-ineligible-border text-sm text-status-ineligible">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="reg-name" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Full name
                  </label>
                  <input
                    id="reg-name"
                    {...register('fullName')}
                    type="text"
                    placeholder="Priya Sharma"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:border-brand-action"
                    autoComplete="name"
                  />
                  {errors.fullName && <p className="text-xs text-status-ineligible mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Email address
                  </label>
                  <input
                    id="reg-email"
                    {...register('email')}
                    type="email"
                    placeholder="student@example.com"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:border-brand-action"
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-xs text-status-ineligible mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      {...register('password')}
                      type={showPass ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      className="w-full min-h-[44px] px-3.5 py-2.5 pr-11 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:border-brand-action"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-text-secondary hover:text-text-primary"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-status-ineligible mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label htmlFor="reg-confirm" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Confirm password
                  </label>
                  <input
                    id="reg-confirm"
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="Repeat password"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:border-brand-action"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-status-ineligible mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full gap-2"
                >
                  {loading ? 'Creating account...' : (
                    <>Create account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-text-secondary mt-8 leading-relaxed">
              By registering, you agree to REXAM's{' '}
              <Link to="/terms" className="text-brand-action hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-brand-action hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
