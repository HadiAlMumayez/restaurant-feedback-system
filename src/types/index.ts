import { Timestamp } from 'firebase/firestore'

/**
 * Branch document stored in Firestore
 * Collection: branches
 */
export interface Branch {
  id: string
  name: string
  location: string
  address?: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Review document stored in Firestore
 * Collection: reviews
 */
export interface Review {
  id: string
  branchId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  customerName?: string
  contact?: string // email or phone
  billId?: string
  createdAt: Timestamp
}

/**
 * Form data for submitting a review (before Firestore conversion)
 */
export interface ReviewFormData {
  branchId: string
  rating: number
  comment: string
  customerName: string
  contact: string
  billId: string
}

/**
 * Aggregated branch statistics for dashboard
 */
export interface BranchStats {
  branchId: string
  branchName: string
  totalReviews: number
  averageRating: number
  location: string
}

/**
 * Daily review statistics for charts
 */
export interface DailyStats {
  date: string // YYYY-MM-DD format
  count: number
  averageRating: number
}

/**
 * Customer frequency data
 */
export interface CustomerFrequencyData {
  contact: string
  customerName?: string
  reviewCount: number
  averageRating: number
  lastReviewDate: Timestamp
}

/**
 * Date range filter for queries
 */
export interface DateRange {
  startDate: Date
  endDate: Date
}

/**
 * Filter options for reviews list
 */
export interface ReviewFilters {
  branchId?: string
  minRating?: number
  maxRating?: number
  dateRange?: DateRange
  searchTerm?: string
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

/**
 * Admin role types
 */
export type AdminRole = 'owner' | 'manager' | 'viewer'

/**
 * Admin document stored in Firestore
 * Collection: admins
 * Document ID: user's Firebase Auth UID
 */
export interface Admin {
  id: string // Firebase Auth UID
  role: AdminRole
  branchIds?: string[] // Optional: limits managers/viewers to specific branches
  createdAt: Timestamp
  updatedAt: Timestamp
}

