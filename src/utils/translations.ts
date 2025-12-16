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
    // Generate a sensible fallback if not provided
    const defaultFallback = fallback || key.split('.').pop() || key
    
    // Get the translation
    let result: string
    try {
      result = t(key, defaultFallback)
    } catch {
      return defaultFallback
    }
    
    // If result is empty, null, or undefined, use fallback
    if (!result || typeof result !== 'string' || result.trim() === '') {
      return defaultFallback
    }
    
    // If result contains "common." prefix (translation failed), use fallback
    if (result.startsWith('common.')) {
      return defaultFallback
    }
    
    // If result is exactly the same as the key (translation not found), use fallback
    if (result === key) {
      return defaultFallback
    }
    
    // If result looks like a key pattern (starts with the namespace), use fallback
    const keyParts = key.split('.')
    if (keyParts.length >= 2 && result.startsWith(keyParts[0] + '.')) {
      return defaultFallback
    }
    
    return result
  } catch {
    return fallback || key.split('.').pop() || key
  }
}

