/**
 * Safe Translation Hook
 * 
 * Wraps useTranslation to ensure translations never show keys like "common.loading"
 */

import { useTranslation as useI18nTranslation } from 'react-i18next'
import { safeTranslate } from '../utils/translations'

export function useSafeTranslation() {
  const { t, i18n, ready } = useI18nTranslation()

  // Create a safe wrapper for t function
  const safeT = (key: string, fallback?: string) => {
    return safeTranslate(t, key, fallback)
  }

  return {
    t: safeT,
    i18n,
    ready,
  }
}

