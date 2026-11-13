import { Helmet } from 'react-helmet-async'
import { Shield, Sparkles, Target, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About REXAM — Government Opportunity Discovery Platform</title>
        <meta name="description" content="Learn about REXAM's mission to simplify government exam discovery and deterministic eligibility assessment for Indian students." />
        <link rel="canonical" href="https://rexam.in/about" />
      </Helmet>

      <div className="content-frame max-w-detail py-12">
        <h1 className="text-3xl tablet:text-4xl font-bold text-text-primary mb-4">About REXAM</h1>
        <p className="text-base text-text-secondary leading-relaxed mb-8">
          REXAM is a personalized government examination, recruitment and scholarship discovery platform built for Indian college students, graduates and government job aspirants.
        </p>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6 mb-12">
          <div className="card p-6">
            <Target className="w-8 h-8 text-accent-green mb-3" />
            <h2 className="text-base font-semibold text-text-primary mb-2">Our Mission</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Every year, thousands of students miss out on government recruitment or scholarship deadlines simply because official notifications are scattered across hundreds of disparate portals and lengthy PDF gazettes. REXAM centralizes, extracts and verifies every opportunity.
            </p>
          </div>

          <div className="card p-6">
            <Sparkles className="w-8 h-8 text-accent-blue mb-3" />
            <h2 className="text-base font-semibold text-text-primary mb-2">Deterministic Eligibility</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Unlike generic job boards, REXAM evaluates your educational degrees, percentages, age relaxations, and domicile against official gazette rules with mathematical precision.
            </p>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-text-primary mb-3">Our Core Principles</h2>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-accent-green font-bold">✓</span>
              <span><strong>100% Official Links:</strong> We always link directly to official examination authority websites and gazette PDFs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-green font-bold">✓</span>
              <span><strong>Privacy First:</strong> Your personal data, category, and date of birth are stored securely and never sold to third parties.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-green font-bold">✓</span>
              <span><strong>Zero Sponsored Noise:</strong> Clean, ad-free notifications focused solely on verified opportunities.</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
