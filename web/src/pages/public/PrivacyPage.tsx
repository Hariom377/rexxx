import { Helmet } from 'react-helmet-async'

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — REXAM</title>
        <meta name="description" content="REXAM privacy policy explaining how candidate data is collected, stored, and protected." />
        <link rel="canonical" href="https://rexam.in/privacy" />
      </Helmet>

      <div className="content-frame max-w-detail py-12">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Privacy Policy</h1>
        <p className="text-xs text-text-muted mb-8">Last Updated: November 2026</p>

        <div className="card p-6 md:p-8 space-y-6 text-sm text-text-secondary leading-relaxed bg-white border border-border-default rounded-lg">
          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">1. Overview</h2>
            <p>
              REXAM ("we", "us", or "our") respects your privacy. This policy explains what information we collect when you use our platform, how it is used to evaluate examination eligibility, and how we protect it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">2. Information We Collect</h2>
            <p>
              To check your eligibility against official examination criteria, we collect candidate information provided voluntarily during profile creation, including:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Name, email address, and authentication credentials.</li>
              <li>Date of birth, gender, and social category (General, OBC-NCL, SC, ST, EWS).</li>
              <li>Educational qualifications, graduation year, degrees, percentages/CGPA.</li>
              <li>State of domicile and disability status (PwBD) for applicable statutory relaxations.</li>
            </ul>
            <p className="mt-2 text-xs text-text-secondary">
              Sensitive fields (such as category and income) are used exclusively to check eligibility against notification criteria and are never shared or sold.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">3. How Your Data Is Protected</h2>
            <p>
              All candidate data is stored using secure databases with strict Row Level Security (RLS) policies. Your sensitive candidate attributes are accessible only by your authenticated session. We never sell or share candidate data with third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">4. Contact</h2>
            <p>For any privacy-related questions, please email us at privacy@rexam.in.</p>
          </section>
        </div>
      </div>
    </>
  )
}
