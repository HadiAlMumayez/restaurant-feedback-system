/**
 * i18n Configuration
 * 
 * Sets up internationalization with English and Arabic support.
 * Handles RTL direction for Arabic.
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from '../locales/en.json'
import arTranslations from '../locales/ar.json'

// Get saved language from localStorage or default to 'en'
const getInitialLanguage = (): string => {
  const saved = localStorage.getItem('app-language')
  if (saved === 'ar' || saved === 'en') {
    return saved
  }
  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      ar: {
        translation: arTranslations,
      },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    // Ensure translations are available immediately
    initImmediate: false,
    // Add default values for missing keys
    returnEmptyString: false,
    returnNull: false,
    returnObjects: false,
    keySeparator: '.',
    nsSeparator: ':',
    // Don't return the key if translation is missing - use fallback
    returnKeyIfMissing: false,
    // Use fallback language if key is missing
    fallbackOnEmpty: true,
  })

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
  localStorage.setItem('app-language', lng)
})

// Set initial direction
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
document.documentElement.lang = i18n.language

export default i18n

