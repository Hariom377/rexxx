import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  User, Mail, Calendar, MapPin, GraduationCap,
  Award, Edit3, Plus, ShieldCheck, CheckCircle2
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

      <div className="content-frame max-w-report py-6 tablet:py-8 space-y-6">
        {/* Profile Header Card */}
        <div className="card p-6 tablet:p-8">
          <div className="flex flex-col tablet:flex-row items-start tablet:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-green-dim flex items-center justify-center flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  <span className="text-xl font-bold text-accent-green">{getInitials(displayName)}</span>
                )}
              </div>
              <div>
                <h1 className="text-xl tablet:text-2xl font-bold text-text-primary">{displayName}</h1>
                <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {profile?.email || user?.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="badge badge-green">{profile?.social_category || 'General'}</span>
                  {profile?.state && <span className="badge badge-blue">{profile.state}</span>}
                  {profile?.is_pwbd && <span className="badge badge-orange">PwBD</span>}
                </div>
              </div>
            </div>

            <Link to="/profile/edit" className="btn-secondary gap-2 w-full tablet:w-auto">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </Link>
          </div>
        </div>

        {/* Personal Details */}
        <div className="card p-6">
          <h2 className="section-heading mb-4">Personal & Domicile Details</h2>
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-lg bg-bg-elevated border border-border">
              <p className="text-2xs text-text-muted uppercase tracking-wider">Date of Birth</p>
              <p className="font-medium text-text-primary mt-1">
                {profile?.date_of_birth ? formatDate(profile.date_of_birth, 'long') : 'Not provided'}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-bg-elevated border border-border">
              <p className="text-2xs text-text-muted uppercase tracking-wider">Gender</p>
              <p className="font-medium text-text-primary mt-1">{profile?.gender || 'Not specified'}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-bg-elevated border border-border">
              <p className="text-2xs text-text-muted uppercase tracking-wider">State of Domicile</p>
              <p className="font-medium text-text-primary mt-1">{profile?.state || 'Not specified'}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-bg-elevated border border-border">
              <p className="text-2xs text-text-muted uppercase tracking-wider">Social Category</p>
              <p className="font-medium text-text-primary mt-1">{profile?.social_category || 'General'}</p>
            </div>
          </div>
        </div>

        {/* Educational Qualifications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading">Educational Qualifications</h2>
            <Link to="/profile/qualifications" className="btn-ghost text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> Manage Qualifications
            </Link>
          </div>

          {education.length === 0 ? (
            <div className="text-center py-6 text-text-muted text-sm">
              <p>No qualifications added yet.</p>
              <Link to="/profile/qualifications" className="btn-primary mt-3 text-xs inline-flex">
                Add Qualifications
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="p-4 rounded-lg bg-bg-elevated border border-border flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{edu.highest_qualification}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {edu.degree_name || edu.stream ? `${edu.degree_name || ''} ${edu.stream ? `• ${edu.stream}` : ''}` : ''}
                    </p>
                    {edu.institution && (
                      <p className="text-xs text-text-muted mt-1">{edu.institution}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-2xs text-text-muted">
                      {edu.graduation_year && <span>Passed: {edu.graduation_year}</span>}
                      {edu.cgpa_or_percentage && <span>Score: {edu.cgpa_or_percentage}%</span>}
                    </div>
                  </div>
                  <span className="badge badge-green">Verified</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
