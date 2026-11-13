import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import JobsPage from './pages/public/JobsPage'
import ExamsPage from './pages/public/ExamsPage'
import ScholarshipsPage from './pages/public/ScholarshipsPage'
import OpportunityDetailPage from './pages/public/OpportunityDetailPage'
import AboutPage from './pages/public/AboutPage'
import ContactPage from './pages/public/ContactPage'
import PrivacyPage from './pages/public/PrivacyPage'
import TermsPage from './pages/public/TermsPage'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import AuthCallbackPage from './pages/auth/AuthCallbackPage'

// Protected App Pages
import DiscoverPage from './pages/app/DiscoverPage'
import ExplorerPage from './pages/app/ExplorerPage'
import SavedPage from './pages/app/SavedPage'
import ApplicationsPage from './pages/app/ApplicationsPage'
import ProfilePage from './pages/app/ProfilePage'
import EditProfilePage from './pages/app/EditProfilePage'
import QualificationsPage from './pages/app/QualificationsPage'
import ProfileWizardPage from './pages/app/ProfileWizardPage'
import EligibilityReportPage from './pages/app/EligibilityReportPage'
import AlertsPage from './pages/app/AlertsPage'
import SettingsPage from './pages/app/SettingsPage'

// 404
import NotFoundPage from './components/shared/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Marketing & Discovery Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
          <Route path="/opportunities/:slug" element={<OpportunityDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Mandatory Onboarding Wizard (Protected, bypasses full AppLayout) */}
        <Route
          path="/profile/wizard"
          element={
            <ProtectedRoute requireOnboarding={false}>
              <ProfileWizardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Candidate Application Shell */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/dashboard" element={<Navigate to="/discover" replace />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/qualifications" element={<QualificationsPage />} />
          <Route path="/eligibility/:id" element={<EligibilityReportPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
