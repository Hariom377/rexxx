// Simple classname merger without external dependencies — keep it lean
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return inputs
    .flatMap((input) => {
      if (!input) return []
      if (typeof input === 'string') return [input]
      return Object.entries(input)
        .filter(([, v]) => v)
        .map(([k]) => k)
    })
    .join(' ')
}

export function formatDate(date: string | null | undefined, format: 'short' | 'long' | 'relative' = 'short'): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'

  if (format === 'relative') {
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 0) {
      const future = Math.abs(days)
      if (future === 1) return 'Tomorrow'
      if (future < 7) return `In ${future} days`
      if (future < 30) return `In ${Math.floor(future / 7)} week${Math.floor(future / 7) > 1 ? 's' : ''}`
    }
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDeadline(date: string | null | undefined): { text: string; urgent: boolean; expired: boolean } {
  if (!date) return { text: '—', urgent: false, expired: false }
  const d = new Date(date)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return { text: 'Deadline passed', urgent: false, expired: true }
  if (days === 0) return { text: 'Closes today', urgent: true, expired: false }
  if (days === 1) return { text: 'Closes tomorrow', urgent: true, expired: false }
  if (days <= 7) return { text: `Closes in ${days} days`, urgent: true, expired: false }
  return { text: `Closes ${formatDate(date, 'short')}`, urgent: false, expired: false }
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    'Government Recruitment': 'badge-green',
    'PSU Recruitment': 'badge-blue',
    'Entrance Examinations': 'badge-orange',
    'University Admissions': 'badge-blue',
    'Scholarships & Fellowships': 'badge-orange',
    'Research & Internships': 'badge-blue',
    'Private Jobs': 'badge-muted',
    'Professional Certifications': 'badge-muted',
  }
  return map[category] || 'badge-muted'
}

export function getCategoryCode(category: string): string {
  const map: Record<string, string> = {
    'Government Recruitment': 'GOV',
    'PSU Recruitment': 'PSU',
    'Entrance Examinations': 'ENT',
    'University Admissions': 'ADM',
    'Scholarships & Fellowships': 'SCH',
    'Research & Internships': 'RES',
    'Private Jobs': 'PVT',
    'Professional Certifications': 'CRT',
  }
  return map[category] || 'GEN'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
