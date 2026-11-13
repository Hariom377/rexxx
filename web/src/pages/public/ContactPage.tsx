import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Mail, MessageSquare, MapPin } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <Helmet>
        <title>Contact Us — REXAM</title>
        <meta name="description" content="Get in touch with the REXAM team for questions, feedback, or government source integrations." />
        <link rel="canonical" href="https://rexam.in/contact" />
      </Helmet>

      <div className="content-frame max-w-detail py-12">
        <h1 className="text-3xl tablet:text-4xl font-bold text-text-primary mb-4">Contact REXAM</h1>
        <p className="text-sm tablet:text-base text-text-secondary leading-relaxed mb-8">
          Have questions about a notification or suggestions for new examination bodies to index? We'd love to hear from you.
        </p>

        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6 mb-12">
          <div className="card p-6 text-center">
            <Mail className="w-6 h-6 text-accent-green mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-text-primary">Email Us</h3>
            <p className="text-xs text-text-muted mt-1">support@rexam.in</p>
          </div>
          <div className="card p-6 text-center">
            <MessageSquare className="w-6 h-6 text-accent-blue mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-text-primary">Feedback</h3>
            <p className="text-xs text-text-muted mt-1">feedback@rexam.in</p>
          </div>
          <div className="card p-6 text-center">
            <MapPin className="w-6 h-6 text-accent-orange mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-text-primary">Location</h3>
            <p className="text-xs text-text-muted mt-1">New Delhi, India</p>
          </div>
        </div>

        <div className="card p-6 tablet:p-8 max-w-form mx-auto">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-accent-green-dim flex items-center justify-center mx-auto mb-4">
                <span className="text-accent-green text-xl font-bold">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Message Received</h3>
              <p className="text-sm text-text-secondary">Thank you for reaching out. We will respond within 24-48 business hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Send us a message</h2>
              <div>
                <label className="label block mb-1.5">Your Name</label>
                <input type="text" placeholder="Priya Sharma" className="input" required />
              </div>
              <div>
                <label className="label block mb-1.5">Email Address</label>
                <input type="email" placeholder="priya@example.com" className="input" required />
              </div>
              <div>
                <label className="label block mb-1.5">Subject</label>
                <input type="text" placeholder="Question regarding UPSC CSE notification" className="input" required />
              </div>
              <div>
                <label className="label block mb-1.5">Message</label>
                <textarea rows={4} placeholder="Describe your query..." className="input" required />
              </div>
              <button type="submit" className="btn-primary w-full">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
