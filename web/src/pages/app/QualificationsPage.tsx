import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, GraduationCap } from 'lucide-react'
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

      <div className="content-frame max-w-form py-8">
        <button onClick={() => navigate('/profile')} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Educational Qualifications</h1>
            <p className="text-xs text-text-muted mt-1">Add your degrees and diplomas for matching.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary gap-1.5 text-xs">
            <Plus className="w-4 h-4" /> Add Degree
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {qualifications.length === 0 ? (
            <div className="card p-8 text-center text-text-muted">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No educational qualifications added.</p>
              <button onClick={() => setShowAddModal(true)} className="btn-secondary mt-4 text-xs">
                Add Your First Qualification
              </button>
            </div>
          ) : (
            qualifications.map((q) => (
              <div key={q.id} className="card p-5 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{q.highest_qualification}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {q.degree_name || q.stream ? `${q.degree_name || ''} ${q.stream ? `(${q.stream})` : ''}` : ''}
                  </p>
                  {q.institution && <p className="text-xs text-text-muted mt-1">{q.institution}</p>}
                  <div className="flex gap-4 mt-2 text-2xs text-text-muted">
                    {q.graduation_year && <span>Year: {q.graduation_year}</span>}
                    {q.cgpa_or_percentage && <span>Score: {q.cgpa_or_percentage}%</span>}
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(q.id)}
                  className="text-text-muted hover:text-accent-red p-1 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
            <div className="card relative z-10 w-full max-w-md p-6">
              <h2 className="text-base font-bold text-text-primary mb-4">Add Qualification</h2>
              <div className="space-y-4">
                <div>
                  <label className="label block mb-1.5">Level</label>
                  <select value={highestQual} onChange={(e) => setHighestQual(e.target.value)} className="input">
                    {QUALIFICATIONS.map((ql) => (
                      <option key={ql} value={ql}>{ql}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label block mb-1.5">Degree / Course Name</label>
                  <input value={degreeName} onChange={(e) => setDegreeName(e.target.value)} placeholder="e.g. Bachelor of Technology" className="input" />
                </div>
                <div>
                  <label className="label block mb-1.5">Branch / Specialization</label>
                  <input value={stream} onChange={(e) => setStream(e.target.value)} placeholder="e.g. Computer Science Engineering" className="input" />
                </div>
                <div>
                  <label className="label block mb-1.5">Institution / University</label>
                  <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Delhi Technological University" className="input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label block mb-1.5">Passing Year</label>
                    <input type="number" value={gradYear} onChange={(e) => setGradYear(parseInt(e.target.value))} className="input" />
                  </div>
                  <div>
                    <label className="label block mb-1.5">Score (Percentage/CGPA)</label>
                    <input type="number" step="0.01" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="e.g. 78.5" className="input" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-xs">Cancel</button>
                  <button type="button" onClick={() => addMutation.mutate()} disabled={loading} className="btn-primary text-xs">
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
