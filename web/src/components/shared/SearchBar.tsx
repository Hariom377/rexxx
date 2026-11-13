import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  className?: string
}

export function SearchBar({ placeholder = 'Search opportunities...', value, onChange, onSearch, className }: SearchBarProps) {
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
    if (e.key === 'Enter') onSearch?.(localValue)
  }

  const displayValue = value !== undefined ? value : localValue

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      <input
        type="search"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="input pl-9 pr-9"
      />
      {displayValue && (
        <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
