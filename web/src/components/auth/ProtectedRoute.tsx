import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../shared/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, loading, hasCompletedOnboarding } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner fullPage label="Authenticating..." />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireOnboarding && !hasCompletedOnboarding && location.pathname !== '/profile/wizard') {
    return <Navigate to="/profile/wizard" replace />
  }

  return <>{children}</>
}
