import { Helmet } from 'react-helmet-async'

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service — REXAM</title>
        <meta name="description" content="Terms of service and user agreements for the REXAM platform." />
        <link rel="canonical" href="https://rexam.in/terms" />
      </Helmet>

      <div className="content-frame max-w-detail py-12">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Terms of Service</h1>
        <p className="text-xs text-text-muted mb-8">Last Updated: November 2026</p>

        <div className="card p-6 md:p-8 space-y-6 text-sm text-text-secondary leading-relaxed bg-white border border-border-default rounded-lg">
          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing or using REXAM, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">2. Information Disclaimer</h2>
            <p>
              REXAM aggregates and summarizes publicly published notifications from government ministries, departments, testing agencies, and official bodies. While we strive for accuracy through rigorous verification, REXAM is an independent student platform and not an official government website. Users must always cross-reference critical dates, criteria, and instructions directly from the official notification PDF before submitting applications.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">3. User Conduct</h2>
            <p>
              You agree to provide accurate information during profile creation and eligibility checks. Creating unauthorized automated scrapers against REXAM or attempting to bypass access controls is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">4. Limitation of Liability</h2>
            <p>
              REXAM is not an examination conducting body or government authority. We are not liable for changes in government examination schedules, canceled recruitments, or candidate application errors.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
