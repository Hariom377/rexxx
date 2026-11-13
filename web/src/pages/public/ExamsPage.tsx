import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ExaminationWithDetails } from '../../types'
import { OpportunityCard } from '../../components/shared/OpportunityCard'
import { SearchBar } from '../../components/shared/SearchBar'
import { EmptyState } from '../../components/shared/EmptyState'
import { GraduationCap } from 'lucide-react'

export default function ExamsPage() {
  const [search, setSearch] = useState('')

  const { data: exams = [], isLoading } = useQuery<ExaminationWithDetails[]>({
    queryKey: ['public-exams'],
    queryFn: async () => {
      const { data } = await supabase
        .from('examinations')
        .select(`
          *,
          organisations (*),
          examination_dates (*),
          eligibility_rules (*)
        `)
        .in('category', ['Entrance Examinations', 'University Admissions', 'Professional Certifications'])
        .eq('status', 'published')
        .order('last_verified_at', { ascending: false })
      return (data || []) as ExaminationWithDetails[]
    },
  })

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      return (
        search === '' ||
        exam.name.toLowerCase().includes(search.toLowerCase()) ||
        exam.organisations?.name.toLowerCase().includes(search.toLowerCase()) ||
        exam.overview.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [exams, search])

  return (
    <>
      <Helmet>
        <title>Upcoming National & State Exams 2026 — REXAM</title>
        <meta
          name="description"
          content="Upcoming competitive entrance examinations, university admissions, eligibility criteria, and important dates in India."
        />
        <link rel="canonical" href="https://rexam.in/exams" />
      </Helmet>

      <div className="content-frame max-w-content py-8">
        <div className="mb-8">
          <h1 className="text-2xl tablet:text-3xl font-bold text-text-primary">National & State Examinations</h1>
          <p className="text-sm text-text-secondary mt-1">
            Competitive entrance tests, eligibility criteria and schedules for higher education and professional certifications.
          </p>
        </div>

        <div className="mb-8">
          <SearchBar
            placeholder="Search exams like GATE, NET, CAT, JEE..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <div className="text-xs text-text-muted mb-4">
          Showing {filteredExams.length} {filteredExams.length === 1 ? 'examination' : 'examinations'}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 h-56 skeleton" />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No examinations found"
            description="Try searching for a different examination name or abbreviation."
          />
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <OpportunityCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
