import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="display-heading text-7xl text-text-primary mb-4">404</div>
          <h1 className="text-xl font-semibold text-text-primary mb-2">Page not found</h1>
          <p className="text-text-secondary text-sm mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate(-1)} className="btn-secondary gap-2">
              <ArrowLeft className="w-4 h-4" /> Go back
            </button>
            <Link to="/" className="btn-primary gap-2">
              <Home className="w-4 h-4" /> Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
