import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { INDIAN_STATES, SOCIAL_CATEGORIES } from '../../types'

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

  const { register, handleSubmit, watch } = useForm<EditProfileForm>({
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
      setTimeout(() => navigate('/profile'), 800)
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

      <div className="content-frame max-w-form py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
        </button>

        <div className="card p-6 tablet:p-8">
          <h1 className="text-xl font-bold text-text-primary mb-1">Edit Candidate Profile</h1>
          <p className="text-xs text-text-muted mb-6">
            Ensure your details are accurate for precise deterministic eligibility evaluation.
          </p>

          {error && <div className="p-3 rounded-lg bg-accent-red-dim text-sm text-accent-red mb-4">{error}</div>}
          {success && <div className="p-3 rounded-lg bg-accent-green-dim text-sm text-accent-green mb-4">Profile updated successfully!</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label block mb-1.5">Full Name</label>
              <input {...register('full_name')} className="input" required />
            </div>

            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-1.5">Date of Birth</label>
                <input {...register('date_of_birth')} type="date" className="input" required />
              </div>
              <div>
                <label className="label block mb-1.5">Gender</label>
                <select {...register('gender')} className="input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
              <div>
                <label className="label block mb-1.5">State of Domicile</label>
                <select {...register('state')} className="input">
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label block mb-1.5">District (Optional)</label>
                <input {...register('district')} placeholder="e.g. Central Delhi" className="input" />
              </div>
            </div>

            <div>
              <label className="label block mb-1.5">Social Category</label>
              <select {...register('social_category')} className="input">
                {SOCIAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-2xs text-text-muted mt-1">Used to calculate statutory age relaxations and fee concessions.</p>
            </div>

            <div className="p-4 rounded-lg bg-bg-elevated border border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('is_pwbd')} className="w-4 h-4 rounded text-accent-green" />
                <span className="text-sm font-medium text-text-primary">Persons with Benchmark Disabilities (PwBD)</span>
              </label>

              {isPwbd && (
                <div className="mt-3">
                  <label className="label block mb-1.5">Disability Category</label>
                  <input {...register('pwbd_disability_type')} placeholder="e.g. Locomotor, Visual, Hearing" className="input text-sm" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => navigate('/profile')} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary gap-2">
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
