import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  User, Mail, Calendar, MapPin, GraduationCap,
  Award, Edit3, Plus, ShieldCheck, CheckCircle2, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { CandidateEducation, CandidatePreferences } from '../../types'
import { formatDate, getInitials } from '../../lib/utils'

export default function ProfilePage() {
  const { user, profile } = useAuth()

  // 1. Fetch Candidate Education
  const { data: education = [] } = useQuery<CandidateEducation[]>({
    queryKey: ['candidate-education', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('candidate_education')
        .select('*')
        .eq('candidate_id', user.id)
        .order('created_at', { ascending: false })
      return (data || []) as CandidateEducation[]
    },
    enabled: !!user,
  })

  // 2. Fetch Preferences
  const { data: preferences } = useQuery<CandidatePreferences | null>({
    queryKey: ['candidate-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data } = await supabase
        .from('candidate_preferences')
        .select('*')
        .eq('candidate_id', user.id)
        .single()
      return data as unknown as CandidatePreferences
    },
    enabled: !!user,
  })

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Candidate'

  return (
    <>
      <Helmet>
        <title>Candidate Profile — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-report py-6 sm:py-8 space-y-6">

        {/* Profile Header Card */}
        <div className="bg-white border border-border-default rounded-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-blue-50 border border-blue-200 text-brand-action flex items-center justify-center flex-shrink-0 text-xl font-bold">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <span>{getInitials(displayName)}</span>
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{displayName}</h1>
                <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {profile?.email || user?.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-brand-action border border-blue-200">
                    {profile?.social_category || 'General'}
                  </span>
                  {profile?.state && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-text-secondary border border-border-default">
                      {profile.state}
                    </span>
                  )}
                  {profile?.is_pwbd && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      PwBD
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              to="/profile/edit"
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-sm font-semibold text-text-primary transition-colors"
            >
              <Edit3 className="w-4 h-4 text-text-secondary" /> Edit Profile
            </Link>
          </div>
        </div>

        {/* Sensitive Information Disclaimer */}
        <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-xs text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-brand-action flex-shrink-0 mt-0.5" />
          <p>
            Your date of birth, domicile, category, and disability details are used only to evaluate examination eligibility against official rules and are never publicly visible.
          </p>
        </div>

        {/* Personal & Domicile Details */}
        <div className="bg-white border border-border-default rounded-lg p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">Personal & Domicile Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-lg bg-bg-alternate border border-border-default">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Date of Birth</p>
              <p className="font-semibold text-text-primary mt-1">
                {profile?.date_of_birth ? formatDate(profile.date_of_birth, 'long') : 'Not provided'}
              </p>
              <p className="text-2xs text-text-secondary mt-1">Used to evaluate age limits &amp; cutoff dates</p>
            </div>

            <div className="p-3.5 rounded-lg bg-bg-alternate border border-border-default">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Gender</p>
              <p className="font-semibold text-text-primary mt-1">{profile?.gender || 'Not specified'}</p>
              <p className="text-2xs text-text-secondary mt-1">Used to check gender-specific vacancies</p>
            </div>

            <div className="p-3.5 rounded-lg bg-bg-alternate border border-border-default">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">State of Domicile</p>
              <p className="font-semibold text-text-primary mt-1">{profile?.state || 'Not specified'}</p>
              <p className="text-2xs text-text-secondary mt-1">Used to check state-level recruitment quotas</p>
            </div>

            <div className="p-3.5 rounded-lg bg-bg-alternate border border-border-default">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Social Category</p>
              <p className="font-semibold text-text-primary mt-1">{profile?.social_category || 'General'}</p>
              <p className="text-2xs text-text-secondary mt-1">Used only to check eligibility for statutory relaxations</p>
            </div>
          </div>
        </div>

        {/* Educational Qualifications */}
        <div className="bg-white border border-border-default rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-text-primary">Educational Qualifications</h2>
            <Link
              to="/qualifications"
              className="text-xs font-semibold text-brand-action hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Manage Qualifications
            </Link>
          </div>

          {education.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-border-default rounded-lg">
              <GraduationCap className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-50" />
              <p className="text-sm text-text-secondary mb-3">No educational qualifications added yet.</p>
              <Link
                to="/qualifications"
                className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg bg-brand-action text-white text-xs font-semibold hover:bg-brand-action-hover"
              >
                Add Your Degree
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-4 rounded-lg bg-bg-alternate border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-brand-action">
                      {edu.highest_qualification}
                    </span>
                    <h3 className="text-sm font-bold text-text-primary mt-0.5">
                      {edu.degree_name || edu.highest_qualification}
                      {edu.stream && ` · ${edu.stream}`}
                    </h3>
                    {edu.institution && (
                      <p className="text-xs text-text-secondary mt-0.5">{edu.institution}</p>
                    )}
                  </div>
                  <div className="text-right sm:text-right text-xs text-text-secondary">
                    {edu.graduation_year && <p className="font-semibold text-text-primary">Graduated {edu.graduation_year}</p>}
                    {edu.cgpa_or_percentage && <p className="mt-0.5">{edu.cgpa_or_percentage}%</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opportunity Preferences */}
        {preferences?.preferred_categories && preferences.preferred_categories.length > 0 && (
          <div className="bg-white border border-border-default rounded-lg p-6">
            <h2 className="text-base font-bold text-text-primary mb-3">Preferred Opportunity Types</h2>
            <div className="flex flex-wrap gap-2">
              {preferences.preferred_categories.map((cat: string) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded text-xs font-medium bg-slate-100 text-text-primary border border-border-default"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
