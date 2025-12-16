/**
 * Feedback Page
 * 
 * Main page for customer tablet feedback.
 * Handles branch selection, form display, and submission flow.
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSafeTranslation } from '../hooks/useSafeTranslation'
import FeedbackForm from '../components/feedback/FeedbackForm'
import ThankYouScreen from '../components/feedback/ThankYouScreen'
import BranchSelector from '../components/feedback/BranchSelector'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { getBranches, getBranch, submitReview } from '../services/firestore'
import type { Branch, ReviewFormData } from '../types'

type PageState = 'loading' | 'select-branch' | 'form' | 'thank-you'

export default function FeedbackPage() {
  const { t } = useSafeTranslation()
  const { branchId: urlBranchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load branches on mount
  useEffect(() => {
    async function loadData() {
      try {
        setError(null)

        // If branchId in URL, load that specific branch
        if (urlBranchId) {
          const branch = await getBranch(urlBranchId)
          if (branch && branch.isActive) {
            setSelectedBranch(branch)
            setPageState('form')
            return
          }
          // Invalid branch ID, fall through to branch selection
        }

        // Load all branches for selection
        const allBranches = await getBranches()
        setBranches(allBranches)
        
        // If only one branch, auto-select it
        if (allBranches.length === 1) {
          setSelectedBranch(allBranches[0])
          setPageState('form')
        } else {
          setPageState('select-branch')
        }
      } catch (err: any) {
        console.error('Failed to load branches:', err)
        // Provide more specific error message
        let errorMessage = 'Failed to load. Please check your connection.'
        if (err?.message?.includes('permission') || err?.code === 'permission-denied') {
          errorMessage = 'Unable to load branches. Please check your connection and try again.'
        } else if (err?.message) {
          errorMessage = err.message
        } else {
          try {
            errorMessage = t('feedback.error') || errorMessage
          } catch {
            // i18n not ready, use default
          }
        }
        setError(errorMessage)
        setPageState('select-branch')
      }
    }

    loadData()
  }, [urlBranchId])

  // Handle branch selection
  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch)
    navigate(`/feedback/${branch.id}`, { replace: true })
    setPageState('form')
  }

  // Handle form submission
  const handleSubmit = async (data: ReviewFormData) => {
    try {
      await submitReview(data)
      setPageState('thank-you')
    } catch (err) {
      console.error('Failed to submit review:', err)
      // Error is handled by FeedbackForm component
      throw err // Re-throw so FeedbackForm can show the error
    }
  }

  // Reset to form
  const handleReset = useCallback(() => {
    setPageState('form')
  }, [])

  // Render based on state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-warm relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10 [dir=rtl]:right-auto [dir=rtl]:left-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-500 rounded-full spinner mx-auto mb-4" />
          <p className="text-xl text-gray-600">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    )
  }

  if (pageState === 'select-branch') {
    return (
      <BranchSelector
        branches={branches}
        loading={false}
        error={error}
        onSelect={handleBranchSelect}
      />
    )
  }

  if (pageState === 'thank-you') {
    return <ThankYouScreen onReset={handleReset} />
  }

  // Form state
  if (!selectedBranch) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-warm">
        <p className="text-xl text-red-600">{t('feedback.invalidBranch')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-warm pattern-dots">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Header */}
      <header className="py-8 text-center">
        <div className="text-5xl mb-2">🍽️</div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-charcoal">
          {t('feedback.title')}
        </h1>
        <p className="text-lg text-gray-600 mt-2">{t('feedback.subtitle')}</p>
      </header>

      {/* Form */}
      <main className="px-6 pb-12">
        <FeedbackForm
          branchId={selectedBranch.id}
          branchName={selectedBranch.name}
          onSubmit={handleSubmit}
        />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>{t('feedback.thankYouMessage')}</p>
      </footer>
    </div>
  )
}

