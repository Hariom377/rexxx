import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '../../lib/i18n'

interface LanguageSwitcherProps {
  className?: string
  compact?: boolean
}

export function LanguageSwitcher({ className = '', compact = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentLang = i18n.language || 'en'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('rexam_lang', code)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code
    }
    setIsOpen(false)
  }

  const activeLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ||
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang.split('-')[0]) ||
    SUPPORTED_LANGUAGES[0]

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select interface language"
        className="min-h-[44px] px-3 py-2 inline-flex items-center gap-2 rounded-lg border border-border bg-bg-card text-text-primary text-sm font-semibold hover:bg-bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors"
      >
        <Globe className="w-4 h-4 text-text-secondary" aria-hidden="true" />
        <span>{compact ? (activeLangObj.code === 'hi-Latn' ? 'HINGLISH' : activeLangObj.code.toUpperCase()) : activeLangObj.nativeName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Supported Languages"
          className="absolute right-0 mt-1.5 w-52 max-h-72 overflow-y-auto bg-bg-card border border-border rounded-lg shadow-elevated py-1 z-50 divide-y divide-border/50"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang || (lang.code === 'hi' && currentLang === 'hi')

            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-brand-light text-brand font-bold'
                    : 'text-text-primary hover:bg-bg-secondary font-medium'
                }`}
              >
                <div>
                  <span className="block leading-tight">{lang.nativeName}</span>
                  <span className="text-2xs text-text-secondary block font-normal">{lang.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
