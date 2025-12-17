/**
 * Branch Selector Component
 * 
 * Allows selection of a branch if not set via URL.
 * Used for initial tablet setup.
 */

import { useSafeTranslation } from '../../hooks/useSafeTranslation'
import { MapPin, ChevronRight, Loader2 } from 'lucide-react'
import LanguageSwitcher from '../LanguageSwitcher'
import type { Branch } from '../../types'

interface BranchSelectorProps {
  branches: Branch[]
  loading: boolean
  error: string | null
  onSelect: (branch: Branch) => void
}

export default function BranchSelector({
  branches,
  loading,
  error,
  onSelect
}: BranchSelectorProps) {
  const { t } = useSafeTranslation()
  const isRTL = document.documentElement.dir === 'rtl'

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-warm p-8 relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10 [dir=rtl]:right-auto [dir=rtl]:left-4">
          <LanguageSwitcher />
        </div>
        <Loader2 size={48} className="text-brand-500 spinner mb-4" />
        <p className="text-xl text-gray-600">{t('feedback.loadingBranches')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-warm p-8 relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10 [dir=rtl]:right-auto [dir=rtl]:left-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-warm pattern-dots p-8">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10 [dir=rtl]:right-auto [dir=rtl]:left-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🍽️</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-charcoal mb-4">
            {t('feedback.selectBranch')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('feedback.selectBranchDescription')}
          </p>
        </div>

        {/* Branch list */}
        <div className="space-y-4">
          {branches.map((branch, index) => (
            <button
              key={branch.id}
              onClick={() => onSelect(branch)}
              className="w-full p-6 bg-white rounded-2xl shadow-md hover:shadow-xl
                         transform hover:scale-[1.02] transition-all duration-200
                         flex items-center gap-4 animate-slide-up
                         [dir=ltr]:text-left [dir=rtl]:text-right"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={28} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-charcoal truncate">
                  {branch.name}
                </h3>
                <p className="text-gray-500 truncate">
                  {branch.location}
                </p>
              </div>
              <ChevronRight size={24} className={`text-brand-400 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          ))}
        </div>

        {branches.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-4">{t('feedback.noBranches')}</p>
            <p className="text-sm text-gray-400 mb-4">
              {t('feedback.noBranchesHint', 'Please contact the administrator to add branches.')}
            </p>
            {/* Debug info for mobile troubleshooting */}
            <details className="text-xs text-gray-400 mt-4">
              <summary className="cursor-pointer">Debug Info</summary>
              <div className="mt-2 text-left space-y-1">
                <p>Branches array length: {branches.length}</p>
                <p>Error: {error || 'None'}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm"
                >
                  Reload Page
                </button>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}

