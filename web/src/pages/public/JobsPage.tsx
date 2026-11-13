import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ExaminationWithDetails } from '../../types'
import { OpportunityCard } from '../../components/shared/OpportunityCard'
import { SearchBar } from '../../components/shared/SearchBar'
import { EmptyState } from '../../components/shared/EmptyState'
import { Briefcase } from 'lucide-react'
import { INDIAN_STATES } from '../../types'

export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [selectedState, setSelectedState] = useState<string>('all')

  const { data: jobs = [], isLoading } = useQuery<ExaminationWithDetails[]>({
    queryKey: ['public-govt-jobs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('examinations')
        .select(`
          *,
          organisations (*),
          examination_dates (*),
          eligibility_rules (*)
        `)
        .in('category', ['Government Recruitment', 'PSU Recruitment'])
        .eq('status', 'published')
        .order('last_verified_at', { ascending: false })
      return (data || []) as ExaminationWithDetails[]
    },
  })

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        search === '' ||
        job.name.toLowerCase().includes(search.toLowerCase()) ||
        job.organisations?.name.toLowerCase().includes(search.toLowerCase()) ||
        job.overview.toLowerCase().includes(search.toLowerCase())

      const matchesState =
        selectedState === 'all' ||
        job.location.toLowerCase().includes(selectedState.toLowerCase()) ||
        job.state?.toLowerCase() === selectedState.toLowerCase()

      return matchesSearch && matchesState
    })
  }, [jobs, search, selectedState])

  return (
    <>
      <Helmet>
        <title>Government Jobs & Recruitments 2026 — REXAM</title>
        <meta
          name="description"
          content="Latest central & state government job notifications, vacancies, eligibility criteria and application deadlines in India."
        />
        <link rel="canonical" href="https://rexam.in/jobs" />
      </Helmet>

      <div className="content-frame max-w-content py-8">
        <div className="mb-8">
          <h1 className="text-2xl tablet:text-3xl font-bold text-text-primary">Government Jobs & Recruitments</h1>
          <p className="text-sm text-text-secondary mt-1">
            Browse verified central government, state government and PSU opportunities.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col tablet:flex-row gap-3 mb-8">
          <SearchBar
            placeholder="Search by exam, department, or keywords..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="input tablet:w-56"
          >
            <option value="all">All Locations / States</option>
            <option value="All India">All India</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <div className="text-xs text-text-muted mb-4">
          Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'opportunity' : 'opportunities'}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 h-56 skeleton" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No government jobs found"
            description="Try adjusting your search query or state filter."
          />
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <OpportunityCard key={job.id} exam={job} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
