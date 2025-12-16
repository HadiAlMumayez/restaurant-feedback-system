/**
 * Feedback Form Component
 * 
 * Main form for customer feedback on tablets.
 * Large touch targets, simple UX, auto-reset after submission.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, User, Phone, Receipt, Send, Loader2 } from 'lucide-react'
import StarRating from './StarRating'
import type { ReviewFormData } from '../../types'

interface FeedbackFormProps {
  branchId: string
  branchName: string
  onSubmit: (data: ReviewFormData) => Promise<void>
  disabled?: boolean
}

export default function FeedbackForm({
  branchId,
  branchName,
  onSubmit,
  disabled = false
}: FeedbackFormProps) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [contact, setContact] = useState('')
  const [billId, setBillId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOptional, setShowOptional] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError(t('feedback.ratingRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        branchId,
        rating,
        comment: comment.trim(),
        customerName: customerName.trim(),
        contact: contact.trim(),
        billId: billId.trim(),
      })
    } catch (err) {
      setError(t('feedback.error'))
      console.error('Submit error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormDisabled = disabled || isSubmitting

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Branch indicator */}
      <div className="text-center mb-8">
        <span className="inline-block px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-lg font-medium">
          📍 {branchName}
        </span>
      </div>

      {/* Rating section */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-center text-charcoal mb-6">
          {t('feedback.rating')}
        </h2>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          size="large"
          disabled={isFormDisabled}
        />
        {rating > 0 && (
          <p className="text-center mt-4 text-xl text-brand-600 animate-fade-in font-medium">
            {getRatingText(rating)}
          </p>
        )}
      </div>

      {/* Comment section */}
      <div className="mb-8">
        <label className="flex items-center gap-2 text-lg font-medium text-charcoal mb-3">
          <MessageSquare size={24} className="text-brand-500" />
          {t('feedback.comment')}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('feedback.commentPlaceholder')}
          disabled={isFormDisabled}
          className="w-full p-4 text-lg border-2 border-brand-200 rounded-xl 
                     focus:border-brand-400 transition-colors resize-none
                     placeholder:text-gray-400 disabled:bg-gray-100"
          rows={4}
          maxLength={1000}
        />
        <p className="text-right text-sm text-gray-400 mt-1">
          {comment.length}/1000
        </p>
      </div>

      {/* Optional fields toggle */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="text-brand-600 hover:text-brand-700 text-lg font-medium 
                     underline underline-offset-4 transition-colors"
        >
          {showOptional ? t('feedback.hideContactDetails') : t('feedback.showContactDetails')}
        </button>
      </div>

      {/* Optional fields */}
      {showOptional && (
        <div className="space-y-4 mb-8 animate-slide-up">
          {/* Customer Name */}
          <div>
            <label className="flex items-center gap-2 text-base font-medium text-charcoal mb-2">
              <User size={20} className="text-brand-500" />
              {t('feedback.customerName')}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('feedback.customerNamePlaceholder')}
              disabled={isFormDisabled}
              className="w-full p-4 text-lg border-2 border-brand-200 rounded-xl 
                         focus:border-brand-400 transition-colors
                         placeholder:text-gray-400 disabled:bg-gray-100"
              maxLength={100}
            />
          </div>

          {/* Contact */}
          <div>
            <label className="flex items-center gap-2 text-base font-medium text-charcoal mb-2">
              <Phone size={20} className="text-brand-500" />
              {t('feedback.contact')}
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t('feedback.contactPlaceholder')}
              disabled={isFormDisabled}
              className="w-full p-4 text-lg border-2 border-brand-200 rounded-xl 
                         focus:border-brand-400 transition-colors
                         placeholder:text-gray-400 disabled:bg-gray-100"
              maxLength={100}
            />
          </div>

          {/* Bill ID */}
          <div>
            <label className="flex items-center gap-2 text-base font-medium text-charcoal mb-2">
              <Receipt size={20} className="text-brand-500" />
              {t('feedback.billId')}
            </label>
            <input
              type="text"
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
              placeholder={t('feedback.billIdPlaceholder')}
              disabled={isFormDisabled}
              className="w-full p-4 text-lg border-2 border-brand-200 rounded-xl 
                         focus:border-brand-400 transition-colors
                         placeholder:text-gray-400 disabled:bg-gray-100"
              maxLength={50}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center animate-fade-in">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isFormDisabled || rating === 0}
        className="w-full py-5 px-8 gradient-brand text-white text-xl font-semibold 
                   rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:transform-none disabled:hover:shadow-lg
                   flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={28} className="spinner" />
            {t('feedback.submitting')}
          </>
        ) : (
          <>
            <Send size={28} />
            {t('feedback.submit')}
          </>
        )}
      </button>
    </form>
  )
}

// Helper function for rating text
function getRatingText(rating: number): string {
  switch (rating) {
    case 1:
      return "We're sorry to hear that 😔"
    case 2:
      return "We can do better 🙁"
    case 3:
      return "Thanks for your feedback 🙂"
    case 4:
      return "Great! We're glad you enjoyed it 😊"
    case 5:
      return "Wonderful! Thank you so much! 🎉"
    default:
      return ""
  }
}

