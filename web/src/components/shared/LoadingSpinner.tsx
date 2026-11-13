import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullPage?: boolean
  label?: string
}

export function LoadingSpinner({ size = 'md', className, fullPage, label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const spinner = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className={cn('rounded-full border-2 border-accent-green border-t-transparent animate-spin', sizeClasses[size])} />
      {label && <p className="text-sm text-text-muted">{label}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
