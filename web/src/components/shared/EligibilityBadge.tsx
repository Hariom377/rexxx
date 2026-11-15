import React from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

export type EligibilityStatus = 'eligible' | 'ineligible' | 'info' | boolean | null | undefined

interface EligibilityBadgeProps {
  status: EligibilityStatus
  label?: string
  reason?: string
  size?: 'sm' | 'md'
  className?: string
}

export function EligibilityBadge({
  status,
  label,
  reason,
  size = 'md',
  className = '',
}: EligibilityBadgeProps) {
  const { t } = useTranslation()
  if (status === null || status === undefined) return null

  const isEligible = status === true || status === 'eligible'
  const isIneligible = status === false || status === 'ineligible'
  const isInfo = status === 'info'

  let textClass = 'text-status-info-text'
  let bgClass = 'bg-status-info-bg'
  let borderClass = 'border-status-info-border'
  let Icon = AlertTriangle
  let defaultLabel = t('eligibility.need_more_info', 'Need more info')

  if (isEligible) {
    textClass = 'text-status-eligible-text'
    bgClass = 'bg-status-eligible-bg'
    borderClass = 'border-status-eligible-border'
    Icon = CheckCircle2
    defaultLabel = t('eligibility.eligible', 'Eligible')
  } else if (isIneligible) {
    textClass = 'text-status-ineligible-text'
    bgClass = 'bg-status-ineligible-bg'
    borderClass = 'border-status-ineligible-border'
    Icon = XCircle
    defaultLabel = t('eligibility.not_eligible', 'Not eligible')
  }

  const displayLabel = label || defaultLabel
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <div className={`inline-flex flex-col gap-0.5 ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-md border ${bgClass} ${textClass} ${borderClass} ${paddingClass}`}
        role="status"
        aria-label={`${displayLabel}${reason ? `: ${reason}` : ''}`}
      >
        <Icon className={`${iconSize} flex-shrink-0`} aria-hidden="true" />
        <span>{displayLabel}</span>
      </span>
      {reason && (
        <span className="text-2xs text-text-secondary leading-tight mt-0.5">
          {reason}
        </span>
      )}
    </div>
  )
}
