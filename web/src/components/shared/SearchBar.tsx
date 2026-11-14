import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  className?: string
  ariaLabel?: string
}

export function SearchBar({
  placeholder = 'Search by exam, department or keyword...',
  value,
  onChange,
  onSearch,
  className = '',
  ariaLabel = 'Search opportunities',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value || '')

  const handleChange = (v: string) => {
    setLocalValue(v)
    onChange?.(v)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange?.('')
    onSearch?.('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.(localValue)
    }
  }

  const displayValue = value !== undefined ? value : localValue

  return (
    <div className={`relative w-full ${className}`}>
      <label htmlFor="search-opportunities-input" className="sr-only">
        {ariaLabel}
      </label>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
        aria-hidden="true"
      />
      <input
        id="search-opportunities-input"
        type="search"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="input pl-10 pr-10 text-base"
      />
      {displayValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-md focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Clear search text"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
