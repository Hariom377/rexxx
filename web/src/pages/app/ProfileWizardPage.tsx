import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, Check, Sparkles, User, GraduationCap, Compass } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { INDIAN_STATES, SOCIAL_CATEGORIES, QUALIFICATIONS, EXAMINATION_CATEGORIES } from '../../types'

export default function ProfileWizardPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Personal
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [dob, setDob] = useState(profile?.date_of_birth || '')
  const [gender, setGender] = useState(profile?.gender || 'Male')
  const [state, setState] = useState(profile?.state || 'Delhi')
  const [socialCategory, setSocialCategory] = useState(profile?.social_category || 'General')
  const [isPwbd, setIsPwbd] = useState(profile?.is_pwbd || false)

  // Step 2: Education
  const [highestQual, setHighestQual] = useState(QUALIFICATIONS[3])
  const [degreeName, setDegreeName] = useState('')
  const [stream, setStream] = useState('')
  const [gradYear, setGradYear] = useState(new Date().getFullYear())

  // Step 3: Preferences
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Government Recruitment',
    'PSU Recruitment',
    'Entrance Examinations',
  ])

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleFinish = async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. Update Profile
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          date_of_birth: dob || null,
          gender,
          state,
          social_category: socialCategory,
          is_pwbd: isPwbd,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      // 2. Insert Education
      await supabase
        .from('candidate_education')
        .insert({
          candidate_id: user.id,
          highest_qualification: highestQual,
          degree_name: degreeName || null,
          stream: stream || null,
          graduation_year: gradYear,
        })

      // 3. Update Preferences
      await supabase
        .from('candidate_preferences')
        .upsert({
          candidate_id: user.id,
          preferred_categories: selectedCategories,
        })

      await refreshProfile()
      navigate('/discover', { replace: true })
    } catch {
      // Navigate anyway
      navigate('/discover', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Onboarding Setup — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-form">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-0.5">
              <span className="rexam-logo text-2xl">REXAM</span>
              <span className="rexam-logo-dot text-2xl font-black">.</span>
            </div>
            <h1 className="display-heading text-lg mt-2">Candidate Profile Setup</h1>
            <p className="text-xs text-text-muted mt-0.5">Step {step} of 3</p>

            {/* Stepper Progress */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step
                      ? 'w-10 bg-accent-green'
                      : s < step
                      ? 'w-6 bg-accent-green/50'
                      : 'w-6 bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="card p-6 tablet:p-8">
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-accent-green text-sm font-semibold">
                  <User className="w-4 h-4" /> Personal &amp; Domicile Info
                </div>

                <div>
                  <label className="label block mb-1.5">Full Name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Priya Sharma" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label block mb-1.5">Date of Birth</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="input" required />
                  </div>
                  <div>
                    <label className="label block mb-1.5">Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="input">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label block mb-1.5">State of Domicile</label>
                    <select value={state} onChange={(e) => setState(e.target.value)} className="input">
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label block mb-1.5">Social Category</label>
                    <select value={socialCategory} onChange={(e) => setSocialCategory(e.target.value)} className="input">
                      {SOCIAL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 p-3 rounded-lg bg-bg-elevated border border-border cursor-pointer">
                  <input type="checkbox" checked={isPwbd} onChange={(e) => setIsPwbd(e.target.checked)} className="w-4 h-4 rounded text-accent-green" />
                  <span className="text-xs text-text-primary">Persons with Benchmark Disabilities (PwBD)</span>
                </label>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!fullName || !dob}
                  className="btn-primary w-full gap-2 mt-4"
                >
                  Continue to Education <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-accent-blue text-sm font-semibold">
                  <GraduationCap className="w-4 h-4" /> Educational Qualification
                </div>

                <div>
                  <label className="label block mb-1.5">Highest Qualification</label>
                  <select value={highestQual} onChange={(e) => setHighestQual(e.target.value)} className="input">
                    {QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label block mb-1.5">Degree / Diploma Name</label>
                  <input value={degreeName} onChange={(e) => setDegreeName(e.target.value)} placeholder="e.g. B.Tech / B.Sc / BA" className="input" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label block mb-1.5">Branch / Specialization</label>
                    <input value={stream} onChange={(e) => setStream(e.target.value)} placeholder="e.g. Mechanical, Physics" className="input" />
                  </div>
                  <div>
                    <label className="label block mb-1.5">Graduation Year</label>
                    <input type="number" value={gradYear} onChange={(e) => setGradYear(parseInt(e.target.value))} className="input" />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 gap-2">
                    Next: Preferences <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-accent-orange text-sm font-semibold">
                  <Compass className="w-4 h-4" /> Preferred Opportunity Types
                </div>
                <p className="text-xs text-text-muted">Select categories you're interested in:</p>

                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-2">
                  {EXAMINATION_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`p-3 rounded-lg border text-left text-xs font-medium flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-accent-green-dim border-accent-green text-accent-green'
                            : 'bg-bg-elevated border-border text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={loading}
                    className="btn-primary flex-1 gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loading ? 'Finalizing...' : 'Enter Dashboard'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
