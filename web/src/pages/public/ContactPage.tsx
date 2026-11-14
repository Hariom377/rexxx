import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Mail, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react'

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
        <meta
          name="description"
          content="Get in touch with the REXAM team for questions, suggestions, or official portal integrations."
        />
        <link rel="canonical" href="https://rexam.in/contact" />
      </Helmet>

      <div className="content-frame max-w-detail py-10 tablet:py-16">
        <p className="section-label">Get in Touch</p>
        <h1 className="text-3xl tablet:text-4xl font-bold text-text-primary mb-3">
          Contact REXAM
        </h1>
        <p className="text-sm tablet:text-base text-text-secondary leading-relaxed mb-8 max-w-xl">
          Have questions about a notification or suggestions for state or central bodies to track? We are here to help.
        </p>

        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6 mb-10">
          <div className="card p-6 text-center border border-border">
            <Mail className="w-6 h-6 text-brand mx-auto mb-2" aria-hidden="true" />
            <h3 className="text-sm font-bold text-text-primary">Email Support</h3>
            <p className="text-xs text-text-secondary mt-1">support@rexam.in</p>
          </div>
          <div className="card p-6 text-center border border-border">
            <MessageSquare className="w-6 h-6 text-brand mx-auto mb-2" aria-hidden="true" />
            <h3 className="text-sm font-bold text-text-primary">Student Feedback</h3>
            <p className="text-xs text-text-secondary mt-1">feedback@rexam.in</p>
          </div>
          <div className="card p-6 text-center border border-border">
            <MapPin className="w-6 h-6 text-brand mx-auto mb-2" aria-hidden="true" />
            <h3 className="text-sm font-bold text-text-primary">Headquarters</h3>
            <p className="text-xs text-text-secondary mt-1">New Delhi, India</p>
          </div>
        </div>

        <div className="card p-6 tablet:p-8 max-w-form mx-auto border border-border">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-status-eligible-bg text-status-eligible-text flex items-center justify-center mx-auto mb-4 border border-status-eligible-border">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Message Received</h3>
              <p className="text-sm text-text-secondary">
                Thank you for reaching out. We will review your message and respond within 24 to 48 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-text-primary mb-4">Send us a message</h2>
              <div>
                <label htmlFor="contact-name" className="label">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Priya Sharma"
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="label">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="priya@example.com"
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="label">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="Question regarding UPSC CSE notification"
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="label">Message</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Write your query or suggestion here..."
                  className="input py-2.5 h-auto resize-y"
                  required
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
