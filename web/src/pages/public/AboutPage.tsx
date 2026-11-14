import { Helmet } from 'react-helmet-async'
import { Target, CheckCircle2 } from 'lucide-react'

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About REXAM — Government Opportunity Discovery Platform</title>
        <meta
          name="description"
          content="Learn about REXAM's mission to simplify government exam discovery and official eligibility checking for Indian students."
        />
        <link rel="canonical" href="https://rexam.in/about" />
      </Helmet>

      <div className="content-frame max-w-detail py-10 tablet:py-16">
        <p className="section-label">About the Platform</p>
        <h1 className="text-3xl tablet:text-4xl font-bold text-text-primary mb-4">
          About REXAM
        </h1>
        <p className="text-base tablet:text-lg text-text-secondary leading-relaxed mb-10 max-w-2xl">
          REXAM is an independent student information platform designed to help Indian college students, graduates and job seekers find government examinations and scholarships they are eligible to apply for.
        </p>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6 mb-10">
          <div className="card p-6 border border-border">
            <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center mb-4">
              <Target className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">Our Purpose</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Every year, thousands of eligible students miss out on government recruitment or scholarship deadlines simply because official notifications are scattered across hundreds of separate portals and lengthy PDF gazettes. REXAM centralises and indexes these opportunities in one calm, accessible place.
            </p>
          </div>

          <div className="card p-6 border border-border">
            <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-brand" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">Official Rule Matching</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Unlike generic job portals that show every opening to everyone, REXAM evaluates your educational degrees, age cutoffs, and statutory category relaxations against official notification rules so you only spend time on exams you qualify for.
            </p>
          </div>
        </div>

        <div className="card p-8 border border-border">
          <h2 className="text-xl font-bold text-text-primary mb-4">Our Core Commitments</h2>
          <ul className="space-y-4 text-sm text-text-secondary">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-status-eligible-text flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="text-text-primary font-semibold">100% Official Links:</strong>
                <p className="mt-0.5">We always link directly to official examination authority websites and gazette notification documents. We do not intermediate applications.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-status-eligible-text flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="text-text-primary font-semibold">Privacy by Design:</strong>
                <p className="mt-0.5">Your personal credentials, social category and dates of birth are stored securely and used solely to match eligibility rules.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-status-eligible-text flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="text-text-primary font-semibold">Free for All Students:</strong>
                <p className="mt-0.5">REXAM never charges fees to view notifications or check eligibility.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
