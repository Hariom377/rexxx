import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck, ArrowRight, Shield } from 'lucide-react'
import type { ExaminationWithDetails } from '../../types'
import { formatDate, formatDeadline, getCategoryColor, cn } from '../../lib/utils'

interface OpportunityCardProps {
  exam: ExaminationWithDetails
  isSaved?: boolean
  isEligible?: boolean
  onToggleSave?: (id: string) => void
  variant?: 'default' | 'compact'
}

export function OpportunityCard({ exam, isSaved, isEligible, onToggleSave, variant = 'default' }: OpportunityCardProps) {
  const deadline = formatDeadline(exam.examination_dates?.application_closing_date)
  const categoryColor = getCategoryColor(exam.category)

  if (variant === 'compact') {
    return (
      <Link to={`/opportunities/${exam.slug}`} className="card-hover block p-4 group">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary leading-snug truncate group-hover:text-accent-green transition-colors">
              {exam.name}
            </p>
            {exam.organisations?.name && (
              <p className="text-xs text-text-muted truncate mt-0.5">{exam.organisations.name}</p>
            )}
          </div>
          {!deadline.expired && deadline.text !== '—' && (
            <span className={cn(
              'badge flex-shrink-0 text-nowrap',
              deadline.urgent ? 'badge-red' : 'badge-muted'
            )}>
              {deadline.text}
            </span>
          )}
        </div>
      </Link>
    )
  }

  return (
    <div className="card-hover flex flex-col group">
      <div className="p-5 flex-1 flex flex-col">

        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('badge', categoryColor)}>
              {exam.category}
            </span>
            {isEligible === true && (
              <span className="badge badge-green">Eligible</span>
            )}
            {exam.is_official_source && (
              <span className="verified-badge">
                <Shield className="w-2.5 h-2.5" />
                Official
              </span>
            )}
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleSave(exam.id) }}
              className="flex-shrink-0 p-1 text-text-muted hover:text-accent-green transition-colors -mt-0.5"
              aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-accent-green" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary leading-snug mb-1 tracking-tight">
          <Link
            to={`/opportunities/${exam.slug}`}
            className="hover:text-accent-green transition-colors"
          >
            {exam.name}
          </Link>
        </h3>

        {/* Org */}
        {exam.organisations?.name && (
          <p className="text-xs text-text-muted mb-3">{exam.organisations.name}</p>
        )}

        {/* Overview */}
        {exam.overview && (
          <p className="text-xs text-text-muted line-clamp-2 mb-4 leading-relaxed flex-1">
            {exam.overview}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-muted border-t border-border pt-3 mt-auto">
          {exam.vacancies && (
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              {exam.vacancies.toLocaleString('en-IN')} posts
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {exam.location}
          </span>
          {exam.examination_dates?.application_closing_date && (
            <span className={cn(
              'flex items-center gap-1.5 ml-auto',
              deadline.urgent ? 'text-accent-red font-medium' : '',
              deadline.expired ? 'text-text-disabled line-through' : ''
            )}>
              <Calendar className="w-3 h-3" />
              {deadline.expired ? 'Closed' : `Closes ${formatDate(exam.examination_dates.application_closing_date, 'short')}`}
            </span>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-4">
        <Link
          to={`/opportunities/${exam.slug}`}
          className="flex items-center justify-between text-xs font-medium text-text-muted hover:text-accent-green transition-colors group-hover:text-accent-green"
        >
          <span>View details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
