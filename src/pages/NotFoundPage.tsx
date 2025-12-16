/**
 * 404 Not Found Page
 * 
 * Displays a friendly error page when user navigates to a non-existent route.
 * Supports both English and Arabic with RTL.
 */

import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Home, MessageSquare, ArrowRight, ArrowLeft } from 'lucide-react'
import { safeTranslate } from '../utils/translations'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isRTL = document.documentElement.dir === 'rtl'
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  // Check for suggested page in query params
  const suggestedPage = searchParams.get('target') || searchParams.get('suggest')
  const knownRoutes: Record<string, string> = {
    '/': t('notFound.goHome'),
    '/feedback': t('notFound.goFeedback'),
    '/admin': t('admin.dashboard'),
    '/login': t('login.title'),
  }

  const suggestedLabel = suggestedPage && knownRoutes[suggestedPage]
    ? knownRoutes[suggestedPage]
    : null

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-brand-500 mb-4">404</h1>
          <div className="w-24 h-1 bg-brand-500 mx-auto"></div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-display font-bold text-charcoal mb-4">
          {t('notFound.title')}
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          {t('notFound.message')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white
                     rounded-xl font-medium hover:bg-brand-600 transition-colors
                     shadow-md w-full sm:w-auto"
          >
            <Home size={20} />
            <span>{t('notFound.goHome')}</span>
          </button>

          <button
            onClick={() => navigate('/feedback')}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-brand-500
                     text-brand-600 rounded-xl font-medium hover:bg-brand-50
                     transition-colors shadow-sm w-full sm:w-auto"
          >
            <MessageSquare size={20} />
            <span>{t('notFound.goFeedback')}</span>
          </button>

          {/* Suggested Page Button */}
          {suggestedPage && suggestedLabel && (
            <button
              onClick={() => navigate(suggestedPage)}
              className="flex items-center gap-2 px-6 py-3 bg-brand-100 text-brand-700
                       rounded-xl font-medium hover:bg-brand-200 transition-colors
                       shadow-sm w-full sm:w-auto"
            >
              <span>{t('notFound.goToSuggested')}</span>
              <ArrowIcon size={20} />
            </button>
          )}
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            {safeTranslate(t, 'common.or', 'Or try:')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-brand-600 hover:text-brand-700 underline"
            >
              {t('admin.dashboard')}
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-brand-600 hover:text-brand-700 underline"
            >
              {t('login.title')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

