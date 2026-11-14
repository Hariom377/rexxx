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

  // Current language code (normalized to 2-letter, e.g., 'en-US' -> 'en')
  const currentLang = (i18n.language || 'en').split('-')[0]

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
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0]

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select interface language"
        className="min-h-[44px] px-3 py-2 inline-flex items-center gap-2 rounded-lg border border-border-default bg-white text-text-primary text-sm font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action transition-colors"
      >
        <Globe className="w-4 h-4 text-text-secondary" aria-hidden="true" />
        <span>{compact ? activeLangObj.code.toUpperCase() : activeLangObj.nativeName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Supported Languages"
          className="absolute right-0 mt-1.5 w-48 max-h-72 overflow-y-auto bg-white border border-border-default rounded-lg shadow-md py-1 z-50 divide-y divide-border-default/50"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang
            const isComingSoon = 'comingSoon' in lang && lang.comingSoon

            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={isComingSoon}
                onClick={() => !isComingSoon && handleSelect(lang.code)}
                className={`w-full min-h-[40px] px-3.5 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-brand-action font-bold'
                    : isComingSoon
                    ? 'text-text-secondary/50 cursor-not-allowed bg-slate-50/50'
                    : 'text-text-primary hover:bg-slate-50 font-medium'
                }`}
              >
                <div>
                  <span className="block leading-tight">{lang.nativeName}</span>
                  <span className="text-2xs text-text-secondary block font-normal">{lang.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-action flex-shrink-0" />}
                {isComingSoon && (
                  <span className="text-2xs text-text-secondary/60 uppercase">Soon</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
