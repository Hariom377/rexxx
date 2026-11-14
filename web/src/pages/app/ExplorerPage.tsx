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
        (exam as any).state?.toLowerCase() === selectedState.toLowerCase()

      const matchesTab =
        activeTab === 'all' || eligibleMap.get(exam.id) === true

      return matchesSearch && matchesCategory && matchesState && matchesTab
    })
  }, [examinations, search, selectedCategory, selectedState, activeTab, eligibleMap])

  return (
    <>
      <Helmet>
        <title>Explorer — Opportunity Catalogue | REXAM</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="content-frame max-w-content py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Opportunity Explorer
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Browse and filter verified government examinations, recruitments, and scholarships across India.
          </p>
        </div>

        {/* Tab switcher: All vs Eligible */}
        <div className="flex border-b border-border-default">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`min-h-[44px] pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-brand-action text-brand-action'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-300'
            }`}
          >
            All Opportunities ({examinations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('eligible')}
            className={`min-h-[44px] pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'eligible'
                ? 'border-brand-action text-brand-action'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-status-eligible" />
            Eligible for Me
          </button>
        </div>

        {/* Search & Location Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            placeholder="Search by exam name, post, organization or keywords..."
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
            aria-label="Filter by location"
            className="min-h-[44px] px-3.5 py-2.5 text-base text-text-primary bg-white border border-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action sm:w-56"
          >
            <option value="All">All Locations</option>
            <option value="All India">All India</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-brand-action text-white'
                : 'bg-white text-text-secondary hover:text-text-primary border border-border-default hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {EXAMINATION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-action text-white'
                  : 'bg-white text-text-secondary hover:text-text-primary border border-border-default hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-xs font-semibold text-text-secondary">
          Found {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-border-default rounded-lg p-6 h-56 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No opportunities match your filter"
            description="Try changing your search terms or category selection to see more results."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
