import { useState, useEffect } from 'react'
import { Globe, Check } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
]

interface LanguageSwitcherProps {
  className?: string
  compact?: boolean
}

export function LanguageSwitcher({ className = '', compact = false }: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState<string>('en')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('rexam_lang') || 'en'
    setCurrentLang(saved)
    document.documentElement.lang = saved
  }, [])

  const handleSelect = (code: string) => {
    setCurrentLang(code)
    localStorage.setItem('rexam_lang', code)
    document.documentElement.lang = code
    window.dispatchEvent(new Event('languagechange'))
    setIsOpen(false)
  }

  const activeLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0]

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
        className="min-h-[44px] px-3 py-2 inline-flex items-center gap-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm font-medium hover:bg-bg-secondary focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Globe className="w-4 h-4 text-text-secondary" aria-hidden="true" />
        <span>{compact ? activeLangObj.code.toUpperCase() : activeLangObj.nativeName}</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 mt-1.5 w-36 bg-bg-card border border-border-strong rounded-lg shadow-elevated py-1 z-50"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                className={`w-full min-h-[44px] px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-brand-light text-brand font-semibold'
                    : 'text-text-primary hover:bg-bg-secondary'
                }`}
              >
                <span>{lang.nativeName}</span>
                {isSelected && <Check className="w-4 h-4 text-brand" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
