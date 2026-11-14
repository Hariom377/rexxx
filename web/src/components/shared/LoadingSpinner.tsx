import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullPage?: boolean
  label?: string
}

export function LoadingSpinner({ size = 'md', className, fullPage, label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  const spinner = (
    <div className={cn('flex flex-col items-center gap-3', className)} role="status" aria-live="polite">
      <div
        className={cn(
          'rounded-full border-brand border-t-transparent animate-spin',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      {label && <p className="text-sm font-medium text-text-secondary">{label}</p>}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-[50vh] bg-bg-primary flex items-center justify-center p-6">
        {spinner}
      </div>
    )
  }

  return spinner
}
