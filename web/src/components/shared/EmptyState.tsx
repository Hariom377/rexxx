import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-bg-secondary/50 border border-border rounded-lg max-w-lg mx-auto my-6">
      <div className="w-12 h-12 rounded-lg bg-bg-primary border border-border flex items-center justify-center mb-3 text-text-secondary">
        <Icon className="w-6 h-6 text-brand" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
