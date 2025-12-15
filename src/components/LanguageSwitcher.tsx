/**
 * Language Switcher Component
 * 
 * Simple language toggle between English and Arabic.
 */

import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg
               bg-white border border-gray-200 hover:bg-gray-50
               transition-colors text-sm font-medium text-gray-700
               shadow-sm"
      title={i18n.language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <Languages size={16} />
      <span>{i18n.language === 'en' ? 'EN' : 'AR'}</span>
      <span className="text-gray-400">|</span>
      <span>{i18n.language === 'en' ? 'AR' : 'EN'}</span>
    </button>
  )
}

