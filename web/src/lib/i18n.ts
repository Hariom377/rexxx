import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from '../locales/en/translation.json'
import hiTranslation from '../locales/hi/translation.json'

export const resources = {
  en: {
    translation: enTranslation,
  },
  hi: {
    translation: hiTranslation,
  },
} as const

// Supported languages list with native scripts
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', script: 'latin' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', script: 'devanagari' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', script: 'bengali', comingSoon: true },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', script: 'devanagari', comingSoon: true },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', script: 'telugu', comingSoon: true },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', script: 'tamil', comingSoon: true },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', script: 'gujarati', comingSoon: true },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'kannada', comingSoon: true },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', script: 'malayalam', comingSoon: true },
  { code: 'or', label: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'odia', comingSoon: true },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'gurmukhi', comingSoon: true },
  { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া', script: 'bengali', comingSoon: true },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو', script: 'arabic', comingSoon: true },
] as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
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
