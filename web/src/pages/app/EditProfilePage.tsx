import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm, Controller } from 'react-hook-form'
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { INDIAN_STATES, SOCIAL_CATEGORIES } from '../../types'
import { SearchableSelect } from '../../components/shared/SearchableSelect'

interface EditProfileForm {
  full_name: string
  date_of_birth: string
  gender: string
  state: string
  district: string
  social_category: string
  is_pwbd: boolean
  pwbd_disability_type: string
}

export default function EditProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, watch, control } = useForm<EditProfileForm>({
    defaultValues: {
      full_name: profile?.full_name || '',
      date_of_birth: profile?.date_of_birth || '',
      gender: profile?.gender || 'Male',
      state: profile?.state || 'Delhi',
      district: profile?.district || '',
      social_category: profile?.social_category || 'General',
      is_pwbd: profile?.is_pwbd || false,
      pwbd_disability_type: profile?.pwbd_disability_type || '',
    },
  })

  const isPwbd = watch('is_pwbd')

  const onSubmit = async (data: EditProfileForm) => {
    if (!user) return
    setError(null)
    setLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          date_of_birth: data.date_of_birth || null,
          gender: data.gender,
          state: data.state,
          district: data.district,
          social_category: data.social_category,
          is_pwbd: data.is_pwbd,
          pwbd_disability_type: data.is_pwbd ? data.pwbd_disability_type : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError
      await refreshProfile()
      setSuccess(true)
      setTimeout(() => navigate('/profile'), 700)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Edit Profile — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-form py-6 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
        </button>

        <div className="bg-white border border-border-default rounded-lg p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">Edit Candidate Profile</h1>
          <p className="text-xs text-text-secondary mb-6">
            Ensure your details are accurate. We match your details against criteria published in official recruitment notifications.
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-status-ineligible-bg border border-status-ineligible-border text-sm text-status-ineligible mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-status-eligible-bg border border-status-eligible-border text-sm text-status-eligible mb-4">
              Profile updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-semibold text-text-primary mb-1.5">
                Full Name
              </label>
              <input
                id="edit-name"
                {...register('full_name')}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-dob" className="block text-sm font-semibold text-text-primary mb-1.5">
                  Date of Birth
                </label>
                <input
                  id="edit-dob"
                  {...register('date_of_birth')}
                  type="date"
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  required
                />
                <p className="text-xs text-text-secondary mt-1">Used only to check eligibility for age limits</p>
              </div>

              <div>
                <label htmlFor="edit-gender" className="block text-sm font-semibold text-text-primary mb-1.5">
                  Gender
                </label>
                <select
                  id="edit-gender"
                  {...register('gender')}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      id="edit-state"
                      label="State of Domicile"
                      options={INDIAN_STATES}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Search state..."
                    />
                  )}
                />
                <p className="text-xs text-text-secondary mt-1">Used only to check state-specific quotas</p>
              </div>

              <div>
                <label htmlFor="edit-category" className="block text-sm font-semibold text-text-primary mb-1.5">
                  Social Category
                </label>
                <select
                  id="edit-category"
                  {...register('social_category')}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                >
                  {SOCIAL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-xs text-text-secondary mt-1 font-medium">Used only to check eligibility</p>
              </div>
            </div>

            <div>
              <label htmlFor="edit-district" className="block text-sm font-semibold text-text-primary mb-1.5">
                District (Optional)
              </label>
              <input
                id="edit-district"
                {...register('district')}
                placeholder="e.g. New Delhi / Pune"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
              />
            </div>

            {/* PwBD Checkbox */}
            <div className="p-3.5 rounded-lg border border-border-default bg-bg-alternate">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_pwbd')}
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

              {isPwbd && (
                <div className="mt-3 pl-7">
                  <label htmlFor="edit-pwbd-type" className="block text-xs font-semibold text-text-primary mb-1">
                    Disability Category / Type
                  </label>
                  <input
                    id="edit-pwbd-type"
                    {...register('pwbd_disability_type')}
                    placeholder="e.g. Visual Impairment (VH), Locomotor (OH)"
                    className="w-full min-h-[44px] px-3 py-2 text-sm text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
