import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Search, X, Check } from 'lucide-react'

interface SearchableSelectProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helperText?: string
  id?: string
  className?: string
}

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  required = false,
  disabled = false,
  error,
  helperText,
  id: customId,
  className = '',
}: SearchableSelectProps) {
  const generatedId = useId()
  const selectId = customId || generatedId
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
    setQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setQuery('')
  }

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      <label htmlFor={selectId} className="label flex items-center justify-between">
        <span>
          {label} {required && <span className="text-status-ineligible-text" aria-hidden="true">*</span>}
        </span>
      </label>

      <div className="relative">
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`input flex items-center justify-between text-left cursor-pointer ${
            error ? 'border-status-ineligible-border ring-1 ring-status-ineligible-border' : ''
          }`}
        >
          <span className={value ? 'text-text-primary' : 'text-text-disabled'}>
            {value || placeholder}
          </span>
          <div className="flex items-center gap-1 text-text-secondary">
            {value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onChange('')
                  }
                }}
                className="p-1 hover:text-text-primary"
                aria-label="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-bg-card border border-border-strong rounded-lg shadow-elevated max-h-72 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-border bg-bg-secondary flex items-center gap-2">
              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none"
                aria-label={searchPlaceholder}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-text-muted hover:text-text-primary"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <ul
              role="listbox"
              className="overflow-y-auto p-1 max-h-56 divide-y divide-border-subtle"
            >
              {filteredOptions.length === 0 ? (
                <li className="py-3 px-3 text-xs text-text-muted text-center">
                  No matching options found
                </li>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt === value
                  return (
                    <li
                      key={opt}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSelect(opt)
                      }}
                      tabIndex={0}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-brand-light text-brand font-semibold'
                          : 'text-text-primary hover:bg-bg-elevated'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-4 h-4 text-brand" />}
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-xs text-text-secondary mt-1">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-status-ineligible-text mt-1">{error}</p>
      )}
    </div>
  )
}
