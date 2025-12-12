/**
 * Reviews List Page
 * 
 * Paginated list of all reviews with filtering options.
 */

import { useState, useEffect, useCallback } from 'react'
import { subDays, format } from 'date-fns'
import {
  Search,
  Filter,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react'
import DOMPurify from 'dompurify'
import DateRangePicker from '../../components/admin/DateRangePicker'
import { getReviews, getBranches } from '../../services/firestore'
import type { Review, Branch, DateRange } from '../../types'
import { DocumentSnapshot } from 'firebase/firestore'

const PAGE_SIZE = 15

export default function ReviewsList() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  })
  const [branches, setBranches] = useState<Branch[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [pageHistory, setPageHistory] = useState<(DocumentSnapshot | null)[]>([null])

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [selectedRating, setSelectedRating] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Load branches on mount
  useEffect(() => {
    getBranches().then(setBranches).catch(console.error)
  }, [])

  // Fetch reviews
  const fetchReviews = useCallback(async (startAfterDoc: DocumentSnapshot | null = null) => {
    setLoading(true)
    try {
      const result = await getReviews({
        branchId: selectedBranch || undefined,
        dateRange,
        minRating: selectedRating ? parseInt(selectedRating) : undefined,
        pageSize: PAGE_SIZE,
        lastDoc: startAfterDoc || undefined,
      })

      setReviews(result.reviews)
      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedBranch, dateRange, selectedRating])

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    setPage(1)
    setPageHistory([null])
    fetchReviews(null)
  }, [fetchReviews])

  // Handle next page
  const handleNextPage = () => {
    if (!hasMore || !lastDoc) return
    setPageHistory([...pageHistory, lastDoc])
    setPage(page + 1)
    fetchReviews(lastDoc)
  }

  // Handle previous page
  const handlePrevPage = () => {
    if (page <= 1) return
    const prevDoc = pageHistory[page - 2]
    setPageHistory(pageHistory.slice(0, -1))
    setPage(page - 1)
    fetchReviews(prevDoc)
  }

  // Get branch name by ID
  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.id === branchId)?.name || 'Unknown'
  }

  // Filter reviews by search term (client-side)
  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      review.comment?.toLowerCase().includes(term) ||
      review.customerName?.toLowerCase().includes(term) ||
      review.contact?.toLowerCase().includes(term) ||
      review.billId?.toLowerCase().includes(term)
    )
  })

  // Clear all filters
  const clearFilters = () => {
    setSelectedBranch('')
    setSelectedRating('')
    setSearchTerm('')
  }

  const hasActiveFilters = selectedBranch || selectedRating || searchTerm

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-charcoal">Reviews</h1>
          <p className="text-gray-500">Browse and search all customer reviews</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search comments, names, contacts..."
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl
                       focus:border-brand-400 transition-colors"
            />
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 
                     rounded-xl hover:bg-gray-50"
          >
            <Filter size={20} className="text-gray-500" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Filter dropdowns (always visible on desktop) */}
          <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col sm:flex-row gap-4`}>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-brand-400 
                       bg-white min-w-[160px]"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-brand-400 
                       bg-white min-w-[140px]"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-4 py-2.5 text-red-600 hover:bg-red-50 
                         rounded-xl transition-colors"
              >
                <X size={18} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-brand-500 spinner" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-lg">No reviews found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-brand-50/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Rating badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl
                      ${review.rating >= 4 ? 'bg-green-100 text-green-600' :
                        review.rating >= 3 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'}`}
                    >
                      {review.rating}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-charcoal">
                        {getBranchName(review.branchId)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">
                        {review.customerName || 'Anonymous'}
                      </span>
                      {review.contact && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-400">{review.contact}</span>
                        </>
                      )}
                    </div>

                    {/* Comment */}
                    {review.comment ? (
                      <p
                        className="text-gray-700 mb-3"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(review.comment),
                        }}
                      />
                    ) : (
                      <p className="text-gray-400 italic mb-3">No comment provided</p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-gray-400">
                        {format(review.createdAt.toDate(), 'MMM d, yyyy • h:mm a')}
                      </span>
                      {review.billId && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500">
                          Bill: {review.billId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredReviews.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {page}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                className="flex items-center gap-1 px-4 py-2 bg-brand-500 text-white rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-600"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

