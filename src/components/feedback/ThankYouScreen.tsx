/**
 * Thank You Screen Component
 * 
 * Displayed after successful feedback submission.
 * Auto-resets to form after countdown.
 */

import { useEffect, useState } from 'react'
import { useSafeTranslation } from '../../hooks/useSafeTranslation'
import { CheckCircle, RotateCcw } from 'lucide-react'
import LanguageSwitcher from '../LanguageSwitcher'

interface ThankYouScreenProps {
  onReset: () => void
  autoResetSeconds?: number
}

export default function ThankYouScreen({
  onReset,
  autoResetSeconds = 5
}: ThankYouScreenProps) {
  const { t } = useSafeTranslation()
  const [countdown, setCountdown] = useState(autoResetSeconds)

  useEffect(() => {
    if (countdown <= 0) {
      onReset()
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, onReset])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gradient-warm relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10 [dir=rtl]:right-auto [dir=rtl]:left-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center animate-slide-up">
        {/* Success icon */}
        <div className="mb-8">
          <CheckCircle 
            size={120} 
            className="mx-auto text-green-500 animate-bounce-gentle" 
            strokeWidth={1.5}
          />
        </div>

        {/* Thank you message */}
        <h1 className="text-4xl md:text-5xl font-display font-bold text-charcoal mb-4">
          {t('feedback.thankYou')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-md mx-auto">
          {t('feedback.thankYouMessage')}
        </p>

        {/* Countdown */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 rounded-full shadow-md">
            <RotateCcw size={20} className="text-brand-500 spinner" />
            <span className="text-lg text-gray-600">
              {t('common.loading', 'Resetting in')} <span className="font-bold text-brand-600">{countdown}</span>s
            </span>
          </div>
        </div>

        {/* Manual reset button */}
        <button
          onClick={onReset}
          className="px-8 py-4 bg-white text-brand-600 font-semibold text-lg 
                     rounded-xl shadow-md hover:shadow-lg hover:bg-brand-50
                     transition-all duration-200"
        >
          {t('feedback.newFeedback')}
        </button>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-30 animate-pulse-soft">✨</div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-30 animate-pulse-soft" style={{ animationDelay: '0.5s' }}>🌟</div>
      <div className="absolute top-1/4 right-1/4 text-4xl opacity-20 animate-pulse-soft" style={{ animationDelay: '1s' }}>⭐</div>
    </div>
  )
}

