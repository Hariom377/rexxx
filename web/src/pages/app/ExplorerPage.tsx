import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Filter, Compass, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { ExaminationWithDetails } from '../../types'
import { EXAMINATION_CATEGORIES, INDIAN_STATES } from '../../types'
import { OpportunityCard } from '../../components/shared/OpportunityCard'
import { SearchBar } from '../../components/shared/SearchBar'
import { EmptyState } from '../../components/shared/EmptyState'

export default function ExplorerPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQuery = searchParams.get('q') || ''
  const [search, setSearch] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedState, setSelectedState] = useState<string>('All')
  const [activeTab, setActiveTab] = useState<'all' | 'eligible'>('all')

  // Fetch Saved IDs
  const { data: savedIds = new Set<string>() } = useQuery({
    queryKey: ['saved-ids', user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>()
      const { data } = await supabase
        .from('saved_examinations')
        .select('examination_id')
        .eq('candidate_id', user.id)
      return new Set((data || []).map((d: any) => d.examination_id as string))
    },
    enabled: !!user,
  })

  // Fetch Candidate Matches
  const { data: eligibleMap = new Map<string, boolean>() } = useQuery({
    queryKey: ['candidate-matches-map', user?.id],
    queryFn: async () => {
      if (!user) return new Map<string, boolean>()
      const { data } = await supabase
        .from('candidate_matches')
        .select('examination_id, is_eligible')
        .eq('candidate_id', user.id)
      const map = new Map<string, boolean>()
      ;(data || []).forEach((m: any) => map.set(m.examination_id, m.is_eligible))
      return map
    },
    enabled: !!user,
  })

  // Fetch Opportunities
  const { data: examinations = [], isLoading } = useQuery<ExaminationWithDetails[]>({
    queryKey: ['explorer-examinations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('examinations')
        .select(`
          *,
          organisations (*),
          examination_dates (*),
          eligibility_rules (*)
        `)
        .eq('status', 'published')
        .order('last_verified_at', { ascending: false })
      return (data || []) as ExaminationWithDetails[]
    },
  })

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (examId: string) => {
      if (!user) return
      if (savedIds.has(examId)) {
        await supabase.from('saved_examinations').delete().eq('candidate_id', user.id).eq('examination_id', examId)
      } else {
        await supabase.from('saved_examinations').insert({ candidate_id: user.id, examination_id: examId })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-ids', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] })
    },
  })

  // Filtered List
  const filtered = useMemo(() => {
    return examinations.filter((exam) => {
      const matchesSearch =
        search === '' ||
        exam.name.toLowerCase().includes(search.toLowerCase()) ||
        exam.organisations?.name.toLowerCase().includes(search.toLowerCase()) ||
        exam.overview.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        selectedCategory === 'All' || exam.category === selectedCategory

      const matchesState =
        selectedState === 'All' ||
        exam.location.toLowerCase().includes(selectedState.toLowerCase()) ||
        exam.state?.toLowerCase() === selectedState.toLowerCase()

      const matchesTab =
        activeTab === 'all' || eligibleMap.get(exam.id) === true

      return matchesSearch && matchesCategory && matchesState && matchesTab
    })
  }, [examinations, search, selectedCategory, selectedState, activeTab, eligibleMap])

  return (
    <>
      <Helmet>
        <title>Explorer — Opportunity Catalog | REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-content py-6 tablet:py-8">
        <div className="mb-6">
          <h1 className="page-title">Opportunity Explorer</h1>
          <p className="text-sm text-text-secondary mt-1">
            Search and filter verified examinations, recruitments and scholarships.
          </p>
        </div>

        {/* Tab switcher: All vs Eligible */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-accent-green text-accent-green'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            All Opportunities ({examinations.length})
          </button>
          <button
            onClick={() => setActiveTab('eligible')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'eligible'
                ? 'border-accent-green text-accent-green'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Eligible for Me
          </button>
        </div>

        {/* Search & Location Bar */}
        <div className="flex flex-col tablet:flex-row gap-3 mb-4">
          <SearchBar
            placeholder="Search by name, post, ministry or keywords..."
            value={search}
            onChange={(v) => {
              setSearch(v)
              setSearchParams(v ? { q: v } : {})
            }}
            className="flex-1"
          />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="input tablet:w-56"
          >
            <option value="All">All Locations</option>
            <option value="All India">All India</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-accent-green text-bg-primary'
                : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            All Categories
          </button>
          {EXAMINATION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-accent-green text-bg-primary'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-xs text-text-muted mb-4">
          Found {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 h-56 skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No opportunities match your filter"
            description="Try relaxing your search terms or category selection."
          />
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
            {filtered.map((exam) => (
              <OpportunityCard
                key={exam.id}
                exam={exam}
                isSaved={savedIds.has(exam.id)}
                isEligible={eligibleMap.get(exam.id)}
                onToggleSave={(id) => saveMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
