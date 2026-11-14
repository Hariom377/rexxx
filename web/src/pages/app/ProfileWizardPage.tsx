import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, ArrowLeft, Check, Sparkles, User, GraduationCap, Compass, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { INDIAN_STATES, SOCIAL_CATEGORIES, QUALIFICATIONS, EXAMINATION_CATEGORIES } from '../../types'
import { SearchableSelect } from '../../components/shared/SearchableSelect'

const TOTAL_STEPS = 5

export default function ProfileWizardPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Basic Identity
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [dob, setDob] = useState(profile?.date_of_birth || '')
  const [gender, setGender] = useState(profile?.gender || 'Male')

  // Step 2: Domicile & Category (Sensitive fields)
  const [state, setState] = useState(profile?.state || 'Delhi')
  const [socialCategory, setSocialCategory] = useState(profile?.social_category || 'General')
  const [isPwbd, setIsPwbd] = useState(profile?.is_pwbd || false)

  // Step 3: Education Details
  const [highestQual, setHighestQual] = useState(QUALIFICATIONS[3]) // B.Tech / B.E.
  const [degreeName, setDegreeName] = useState('')
  const [stream, setStream] = useState('')

  // Step 4: Academic Year
  const [gradYear, setGradYear] = useState(new Date().getFullYear())

  // Step 5: Preferences
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
      // Navigate anyway to not block user
      navigate('/discover', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Candidate Profile Setup — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-bg-page flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="font-bold text-2xl tracking-tight text-text-primary">REXAM</span>
            <h1 className="text-xl font-bold text-text-primary mt-2">Candidate Profile Setup</h1>
            <p className="text-sm font-semibold text-brand-action mt-1">
              Step {step} of {TOTAL_STEPS}
            </p>

            {/* Stepper Progress Bar */}
            <div className="w-full bg-border-default h-2 rounded-full overflow-hidden mt-3 max-w-xs mx-auto">
              <div
                className="bg-brand-action h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                role="progressbar"
                aria-valuenow={step}
                aria-valuemin={1}
                aria-valuemax={TOTAL_STEPS}
                aria-label={`Step ${step} of ${TOTAL_STEPS}`}
              />
            </div>
          </div>

          <div className="bg-white border border-border-default rounded-lg p-6 sm:p-8 shadow-none">

            {/* ── STEP 1: Basic Identity ────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="border-b border-border-default pb-3">
                  <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-action" /> 1. Basic Details
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Your name and age are checked against minimum and maximum age criteria in official notifications.
                  </p>
                </div>

                <div>
                  <label htmlFor="wizard-fullname" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="wizard-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                    placeholder="e.g. Priya Sharma"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="wizard-dob" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    id="wizard-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                    required
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Used only to check eligibility against notification cutoff dates.
                  </p>
                </div>

                <div>
                  <label htmlFor="wizard-gender" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Gender
                  </label>
                  <select
                    id="wizard-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!fullName.trim() || !dob}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white font-semibold text-sm transition-colors disabled:opacity-50 mt-4"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── STEP 2: Domicile & Category (Sensitive Fields) ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="border-b border-border-default pb-3">
                  <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-action" /> 2. Domicile & Category
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Used to apply statutory age and fee relaxations per official government reservation rules.
                  </p>
                </div>

                <div>
                  <SearchableSelect
                    id="wizard-state"
                    label="State of Domicile"
                    options={INDIAN_STATES}
                    value={state}
                    onChange={setState}
                    placeholder="Search your state..."
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Used only to check state domicile eligibility and local recruitment quotas.
                  </p>
                </div>

                <div>
                  <label htmlFor="wizard-category" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Social Category
                  </label>
                  <select
                    id="wizard-category"
                    value={socialCategory}
                    onChange={(e) => setSocialCategory(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  >
                    {SOCIAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <p className="text-xs text-text-secondary mt-1 font-medium">
                    Used only to check eligibility.
                  </p>
                </div>

                <div>
                  <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border-default bg-bg-alternate cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPwbd}
                      onChange={(e) => setIsPwbd(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-brand-action focus:ring-brand-action"
                    />
                    <div>
                      <span className="text-sm font-semibold text-text-primary block">
                        Person with Benchmark Disability (PwBD)
                      </span>
                      <span className="text-xs text-text-secondary mt-0.5 block">
                        Used only to check eligibility for statutory disability relaxations.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white font-semibold text-sm transition-colors"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Educational Qualification ─────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="border-b border-border-default pb-3">
                  <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-brand-action" /> 3. Educational Qualification
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    We match your education against minimum qualification requirements in official advertisements.
                  </p>
                </div>

                <div>
                  <label htmlFor="wizard-highest-qual" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Highest Qualification
                  </label>
                  <select
                    id="wizard-highest-qual"
                    value={highestQual}
                    onChange={(e) => setHighestQual(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  >
                    {QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="wizard-degree-name" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Degree / Diploma Title
                  </label>
                  <input
                    id="wizard-degree-name"
                    value={degreeName}
                    onChange={(e) => setDegreeName(e.target.value)}
                    placeholder="e.g. B.Tech / B.Sc / BA / Diploma"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  />
                </div>

                <div>
                  <label htmlFor="wizard-stream" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Branch / Specialization
                  </label>
                  <input
                    id="wizard-stream"
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    placeholder="e.g. Computer Science, Mechanical, History"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white font-semibold text-sm transition-colors"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: Academic Year ─────────────────────────── */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="border-b border-border-default pb-3">
                  <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-brand-action" /> 4. Academic Year
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Checks whether you meet passing year eligibility (final year appearing vs already completed).
                  </p>
                </div>

                <div>
                  <label htmlFor="wizard-grad-year" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Year of Graduation / Completion
                  </label>
                  <input
                    id="wizard-grad-year"
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(parseInt(e.target.value) || new Date().getFullYear())}
                    min={1980}
                    max={new Date().getFullYear() + 6}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Used only to check eligibility for recruitments with batch-specific requirements.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white font-semibold text-sm transition-colors"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 5: Opportunity Preferences ───────────────── */}
            {step === 5 && (
              <div className="space-y-5">
                <div className="border-b border-border-default pb-3">
                  <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <Compass className="w-4 h-4 text-brand-action" /> 5. Opportunity Preferences
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Select the categories of opportunities you are looking for:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EXAMINATION_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`min-h-[44px] p-3 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-brand-action text-brand-action'
                            : 'bg-white border-border-default text-text-secondary hover:bg-slate-50 hover:text-text-primary'
                        }`}
                      >
                        <span className="pr-2">{cat}</span>
                        {isSelected && <Check className="w-4 h-4 flex-shrink-0 text-brand-action" />}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={loading}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loading ? 'Saving Profile...' : 'Complete & Open Dashboard'}
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
