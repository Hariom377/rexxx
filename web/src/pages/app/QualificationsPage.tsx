import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, GraduationCap, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { CandidateEducation } from '../../types'
import { QUALIFICATIONS } from '../../types'

export default function QualificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showAddModal, setShowAddModal] = useState(false)
  const [highestQual, setHighestQual] = useState(QUALIFICATIONS[3]) // B.Tech default
  const [degreeName, setDegreeName] = useState('')
  const [stream, setStream] = useState('')
  const [institution, setInstitution] = useState('')
  const [gradYear, setGradYear] = useState<number>(new Date().getFullYear())
  const [percentage, setPercentage] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const { data: qualifications = [] } = useQuery<CandidateEducation[]>({
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

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!user) return
      setLoading(true)
      const { error } = await supabase
        .from('candidate_education')
        .insert({
          candidate_id: user.id,
          highest_qualification: highestQual,
          degree_name: degreeName || null,
          stream: stream || null,
          institution: institution || null,
          graduation_year: gradYear || null,
          cgpa_or_percentage: percentage ? parseFloat(percentage) : null,
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-education', user?.id] })
      setShowAddModal(false)
      setDegreeName('')
      setStream('')
      setInstitution('')
      setPercentage('')
    },
    onSettled: () => setLoading(false),
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('candidate_education').delete().eq('id', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-education', user?.id] })
    },
  })

  return (
    <>
      <Helmet>
        <title>Manage Qualifications — REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-form py-6 sm:py-8">
        <button
          onClick={() => navigate('/profile')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Educational Qualifications</h1>
            <p className="text-xs text-text-secondary mt-1">
              Add all your degrees and diplomas to evaluate eligibility across different recruitment streams.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Degree
          </button>
        </div>

        {/* Qualifications List */}
        <div className="space-y-3">
          {qualifications.length === 0 ? (
            <div className="bg-white border border-border-default rounded-lg p-8 text-center text-text-secondary">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40 text-text-secondary" />
              <p className="text-sm font-medium text-text-primary mb-1">No qualifications added yet</p>
              <p className="text-xs text-text-secondary mb-4">Add your degree to discover matching examinations.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="min-h-[44px] inline-flex items-center px-4 py-2 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-xs font-semibold text-text-primary transition-colors"
              >
                Add Your First Qualification
              </button>
            </div>
          ) : (
            qualifications.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-border-default rounded-lg p-5 flex items-start justify-between gap-4"
              >
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-brand-action border border-blue-200">
                    {q.highest_qualification}
                  </span>
                  <h3 className="text-base font-bold text-text-primary mt-1.5">
                    {q.degree_name || q.highest_qualification}
                    {q.stream && <span className="font-normal text-text-secondary"> ({q.stream})</span>}
                  </h3>
                  {q.institution && (
                    <p className="text-xs text-text-secondary mt-0.5">{q.institution}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-text-secondary font-medium">
                    {q.graduation_year && <span>Passing Year: <strong className="text-text-primary">{q.graduation_year}</strong></span>}
                    {q.cgpa_or_percentage && <span>Score: <strong className="text-text-primary">{q.cgpa_or_percentage}%</strong></span>}
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(q.id)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-secondary hover:text-status-ineligible transition-colors rounded-lg hover:bg-red-50"
                  title="Remove qualification"
                  aria-label="Remove qualification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white border border-border-default rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 border-b border-border-default pb-3">
                <h2 className="text-base font-bold text-text-primary">Add Educational Qualification</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded text-text-secondary hover:text-text-primary"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="qual-level" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Qualification Level
                  </label>
                  <select
                    id="qual-level"
                    value={highestQual}
                    onChange={(e) => setHighestQual(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  >
                    {QUALIFICATIONS.map((ql) => (
                      <option key={ql} value={ql}>{ql}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="qual-degree" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Degree / Course Title
                  </label>
                  <input
                    id="qual-degree"
                    value={degreeName}
                    onChange={(e) => setDegreeName(e.target.value)}
                    placeholder="e.g. Bachelor of Technology (B.Tech)"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  />
                </div>

                <div>
                  <label htmlFor="qual-stream" className="block text-sm font-semibold text-text-primary mb-1.5">
                    Branch / Specialization
                  </label>
                  <input
                    id="qual-stream"
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    placeholder="e.g. Computer Science, Mechanical"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  />
                </div>

                <div>
                  <label htmlFor="qual-inst" className="block text-sm font-semibold text-text-primary mb-1.5">
                    College / University / Board
                  </label>
                  <input
                    id="qual-inst"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Delhi Technological University"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="qual-year" className="block text-sm font-semibold text-text-primary mb-1.5">
                      Passing Year
                    </label>
                    <input
                      id="qual-year"
                      type="number"
                      value={gradYear}
                      onChange={(e) => setGradYear(parseInt(e.target.value) || new Date().getFullYear())}
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                    />
                  </div>
                  <div>
                    <label htmlFor="qual-pct" className="block text-sm font-semibold text-text-primary mb-1.5">
                      Score (Percentage %)
                    </label>
                    <input
                      id="qual-pct"
                      type="number"
                      step="0.01"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      placeholder="e.g. 74.5"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border-default">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="min-h-[44px] px-4 py-2 rounded-lg border border-border-default bg-white hover:bg-slate-50 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => addMutation.mutate()}
                    disabled={loading}
                    className="min-h-[44px] px-5 py-2 rounded-lg bg-brand-action hover:bg-brand-action-hover text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Qualification'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
