/**
 * Translation Utilities
 * 
 * Helper functions to safely get translations with fallbacks.
 */

import { TFunction } from 'i18next'

/**
 * Safely get a translation with fallback
 * Removes any "common." or namespace prefixes if translation fails
 */
export function safeTranslate(
  t: TFunction,
  key: string,
  fallback?: string
): string {
  try {
    const result = t(key, fallback || key.split('.').pop() || key)
    
    // If result contains the key pattern (e.g., "common.loading"), use fallback
    if (result && result.includes('common.') && result.startsWith('common.')) {
      return fallback || key.split('.').pop() || key
    }
    
    // If result is the same as the key, use fallback
    if (result === key) {
      return fallback || key.split('.').pop() || key
    }
    
    return result
  } catch {
    return fallback || key.split('.').pop() || key
  }
}

