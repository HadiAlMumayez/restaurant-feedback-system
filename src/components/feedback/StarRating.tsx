/**
 * Star Rating Component
 * 
 * Large, touch-friendly star rating for tablet use.
 * Supports both tap and swipe interactions.
 */

import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  size?: 'normal' | 'large'
  disabled?: boolean
}

export default function StarRating({
  rating,
  onRatingChange,
  size = 'large',
  disabled = false
}: StarRatingProps) {
  const starSize = size === 'large' ? 64 : 32
  const gapClass = size === 'large' ? 'gap-4' : 'gap-2'

  const handleStarClick = (starIndex: number) => {
    if (disabled) return
    onRatingChange(starIndex)
  }

  return (
    <div className={`flex items-center justify-center ${gapClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={disabled}
          className={`
            star-hover p-2 rounded-full transition-all duration-200
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            ${star <= rating 
              ? 'text-yellow-400 drop-shadow-lg' 
              : 'text-gray-300 hover:text-yellow-200'
            }
            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
          `}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={starSize}
            fill={star <= rating ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

