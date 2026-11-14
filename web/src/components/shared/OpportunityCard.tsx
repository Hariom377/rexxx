import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck, ArrowRight, Shield } from 'lucide-react'
import type { ExaminationWithDetails } from '../../types'
import { formatDate, formatDeadline, getCategoryColor, cn } from '../../lib/utils'
import { EligibilityBadge } from './EligibilityBadge'

interface OpportunityCardProps {
  exam: ExaminationWithDetails
  isSaved?: boolean
  isEligible?: boolean
  eligibilityReason?: string
  onToggleSave?: (id: string) => void
  variant?: 'default' | 'compact'
}

export function OpportunityCard({
  exam,
  isSaved,
  isEligible,
  eligibilityReason,
  onToggleSave,
  variant = 'default',
}: OpportunityCardProps) {
  const deadline = formatDeadline(exam.examination_dates?.application_closing_date)
  const categoryColor = getCategoryColor(exam.category)

  if (variant === 'compact') {
    return (
      <Link
        to={`/opportunities/${exam.slug}`}
        className="card-hover block p-4 focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-bg-secondary border border-border flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-text-secondary" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary leading-snug truncate">
              {exam.name}
            </p>
            {exam.organisations?.name && (
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {exam.organisations.name}
              </p>
            )}
          </div>
          {!deadline.expired && deadline.text !== '—' && (
            <span
              className={cn(
                'badge flex-shrink-0 text-nowrap',
                deadline.urgent
                  ? 'bg-urgent-bg text-urgent-text border-urgent-border'
                  : 'bg-bg-secondary text-text-secondary border-border'
              )}
            >
              {deadline.text}
            </span>
          )}
        </div>
      </Link>
    )
  }

  return (
    <article className="card-hover flex flex-col h-full">
      <div className="p-5 flex-1 flex flex-col">
        {/* Header Badges & Bookmark */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn('badge', categoryColor)}>
              {exam.category}
            </span>

            {isEligible !== undefined && (
              <EligibilityBadge
                status={isEligible}
                reason={eligibilityReason}
                size="sm"
              />
            )}

            {exam.is_official_source && (
              <span className="verified-badge">
                <Shield className="w-3 h-3 text-text-secondary" aria-hidden="true" />
                <span>Official source</span>
              </span>
            )}
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onToggleSave(exam.id)
              }}
              className="flex items-center justify-center w-11 h-11 -mt-2 -mr-2 text-text-secondary hover:text-brand rounded-md focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={isSaved ? `Remove ${exam.name} from saved` : `Save ${exam.name}`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-brand" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-text-primary leading-snug mb-1">
          <Link
            to={`/opportunities/${exam.slug}`}
            className="hover:text-brand focus-visible:ring-2 focus-visible:ring-brand rounded"
          >
            {exam.name}
          </Link>
        </h3>

        {/* Organisation */}
        {exam.organisations?.name && (
          <p className="text-xs font-semibold text-text-secondary mb-3">
            {exam.organisations.name}
          </p>
        )}

        {/* Brief Overview */}
        {exam.overview && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed flex-1">
            {exam.overview}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary border-t border-border pt-3 mt-auto">
          {exam.vacancies && (
            <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
              <Users className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
              {exam.vacancies.toLocaleString('en-IN')} posts
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
            {exam.location}
          </span>

          {exam.examination_dates?.application_closing_date && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 margin-inline-start-auto font-medium',
                deadline.urgent
                  ? 'text-urgent-text bg-urgent-bg px-2 py-0.5 rounded border border-urgent-border'
                  : 'text-text-secondary'
              )}
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {deadline.expired
                ? 'Closed'
                : `Last date: ${formatDate(exam.examination_dates.application_closing_date, 'short')}`}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-4 pt-1 border-t border-border bg-bg-secondary/40 rounded-b-lg">
        <Link
          to={`/opportunities/${exam.slug}`}
          className="inline-flex items-center justify-between w-full min-h-[44px] text-sm font-semibold text-brand hover:text-brand-hover focus-visible:ring-2 focus-visible:ring-brand rounded"
        >
          <span>View details &amp; eligibility</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
