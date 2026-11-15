import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from '../locales/en/translation.json'
import hinglishTranslation from '../locales/hinglish/translation.json'
import hiTranslation from '../locales/hi/translation.json'

export const resources = {
  en: {
    translation: enTranslation,
  },
  'hi-Latn': {
    translation: hinglishTranslation,
  },
  hi: {
    translation: hiTranslation,
  },
} as const

// Supported languages list: English, Hinglish, Hindi
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', script: 'latin' },
  { code: 'hi-Latn', label: 'Hinglish', nativeName: 'Hinglish (हिंग्लिश)', script: 'latin' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', script: 'devanagari' },
] as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi-Latn', 'hi'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'rexam_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

// Set document html lang attribute on language changes
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng
  }
})

// Set initial html lang attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'en'
}

export default i18n
