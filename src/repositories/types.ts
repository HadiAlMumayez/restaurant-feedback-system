/**
 * Repository Types
 * 
 * Shared types for repository implementations.
 * These types are database-agnostic and can be used with any backend.
 */

import type { Timestamp } from 'firebase/firestore'

/**
 * Date range for filtering
 */
export interface DateRange {
  startDate: Date
  endDate: Date
}

/**
 * Pagination cursor (opaque string, implementation-specific)
 */
export type PaginationCursor = string | null

/**
 * Pagination options
 */
export interface PaginationOptions {
  pageSize: number
  cursor?: PaginationCursor
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[]
  nextCursor: PaginationCursor
  hasMore: boolean
}

/**
 * Branch filter options
 */
export interface BranchFilterOptions {
  includeInactive?: boolean
  limit?: number
}

/**
 * Review filter options
 */
export interface ReviewFilterOptions {
  dateRange?: DateRange
  branchIds?: string[] | null // null = all, [] = none, [ids] = specific
  minRating?: number
  maxRating?: number
}

/**
 * Dashboard stats result
 */
export interface DashboardStats {
  totals: {
    totalReviews: number
    averageRating: number
    activeBranches: number
  }
  dailyStats: Array<{
    date: string // YYYY-MM-DD format
    count: number
    averageRating: number
  }>
  branchStats: Array<{
    branchId: string
    branchName: string
    totalReviews: number
    averageRating: number
  }>
}

/**
 * Review input for creation (public)
 */
export interface ReviewInput {
  branchId: string
  rating: number
  comment?: string
  customerName?: string
  contact?: string
  billId?: string
}

/**
 * Branch data
 */
export interface BranchData {
  id: string
  name: string
  location: string
  address?: string | null
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Review data
 */
export interface ReviewData {
  id: string
  branchId: string
  rating: number
  comment?: string
  customerName?: string
  contact?: string
  billId?: string
  createdAt: Timestamp
  schemaVersion?: number // For future migrations
}

/**
 * Admin data
 */
export interface AdminData {
  id: string // Firebase Auth UID
  role: 'owner' | 'manager' | 'viewer'
  branchIds?: string[] | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Admin input for creation/update
 */
export interface AdminInput {
  role: 'owner' | 'manager' | 'viewer'
  branchIds?: string[] | null
}

