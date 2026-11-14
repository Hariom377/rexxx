import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ExaminationWithDetails } from '../../types'
import { OpportunityCard } from '../../components/shared/OpportunityCard'
import { SearchBar } from '../../components/shared/SearchBar'
import { EmptyState } from '../../components/shared/EmptyState'
import { Award } from 'lucide-react'

export default function ScholarshipsPage() {
  const [search, setSearch] = useState('')

  const { data: scholarships = [], isLoading } = useQuery<ExaminationWithDetails[]>({
    queryKey: ['public-scholarships'],
    queryFn: async () => {
      const { data } = await supabase
        .from('examinations')
        .select(`
          *,
          organisations (*),
          examination_dates (*),
          eligibility_rules (*)
        `)
        .in('category', ['Scholarships & Fellowships', 'Research & Internships'])
        .eq('status', 'published')
        .order('last_verified_at', { ascending: false })
      return (data || []) as ExaminationWithDetails[]
    },
  })

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((s) => {
      return (
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.organisations?.name.toLowerCase().includes(search.toLowerCase()) ||
        s.overview.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [scholarships, search])

  return (
    <>
      <Helmet>
        <title>Government Scholarships &amp; Fellowships 2026 — REXAM</title>
        <meta
          name="description"
          content="Central and state government scholarships, financial assistance schemes, research fellowships and DBT grants for Indian students."
        />
        <link rel="canonical" href="https://rexam.in/scholarships" />
      </Helmet>

      <div className="content-frame max-w-content py-8 tablet:py-12">
        <div className="mb-8">
          <p className="section-label">Financial Aid &amp; Grants</p>
          <h1 className="text-2xl tablet:text-3xl font-bold text-text-primary">
            Scholarships &amp; Fellowships
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Explore national central sector scholarships, state government DBT schemes and research fellowships.
          </p>
        </div>

        <div className="mb-6">
          <SearchBar
            placeholder="Search by scholarship name, awarding ministry or degree level..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <div className="text-xs font-medium text-text-secondary mb-4">
          Showing {filteredScholarships.length} {filteredScholarships.length === 1 ? 'scholarship' : 'scholarships'}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 h-64 skeleton" />
            ))}
          </div>
        ) : filteredScholarships.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No scholarships found"
            description="Try searching for a different keyword or scheme name."
          />
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
            {filteredScholarships.map((s) => (
              <OpportunityCard key={s.id} exam={s} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
