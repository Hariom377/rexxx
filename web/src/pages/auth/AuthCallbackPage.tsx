import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const routeUser = async (session: Session) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, date_of_birth, state')
          .eq('id', session.user.id)
          .maybeSingle()

        const hasOnboarded = Boolean(profile?.full_name && profile?.date_of_birth && profile?.state)

        if (hasOnboarded) {
          navigate('/discover', { replace: true })
        } else {
          navigate('/profile/wizard', { replace: true })
        }
      } catch {
        navigate('/profile/wizard', { replace: true })
      }
    }

    const handleAuth = async () => {
      try {
        // 1. Check for PKCE authorization code in query string
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const errorParam = params.get('error_description') || params.get('error')

        if (errorParam) {
          throw new Error(decodeURIComponent(errorParam))
        }

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          if (data.session && isMounted) {
            await routeUser(data.session)
            return
          }
        }

        // 2. Check getSession in case tokens were extracted from URL hash by Supabase client
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (session && isMounted) {
          await routeUser(session)
          return
        }

        // 3. Fallback: listen for onAuthStateChange SIGNED_IN event
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && currentSession && isMounted) {
            subscription.unsubscribe()
            await routeUser(currentSession)
          }
        })

        // Safety timeout: if nothing resolves in 6 seconds, redirect to login
        const timer = setTimeout(() => {
          if (isMounted) {
            subscription.unsubscribe()
            navigate('/login', { replace: true })
          }
        }, 6000)

        return () => {
          clearTimeout(timer)
          subscription.unsubscribe()
        }
      } catch (err: unknown) {
        console.error('[REXAM AuthCallback] Authentication error:', err)
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Authentication failed')
          setTimeout(() => navigate('/login', { replace: true }), 2500)
        }
      }
    }

    handleAuth()

    return () => {
      isMounted = false
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        {errorMsg ? (
          <>
            <p className="text-status-ineligible text-sm font-semibold">{errorMsg}</p>
            <p className="text-text-secondary text-xs">Redirecting to sign in...</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full border-3 border-brand-action border-t-transparent animate-spin" />
            <p className="text-text-primary text-sm font-semibold">Completing sign in...</p>
            <p className="text-text-secondary text-xs">Verifying your account details</p>
          </>
        )}
      </div>
    </div>
  )
}
