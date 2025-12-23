/**
 * Feedback Repository Interface
 * 
 * Database-agnostic interface for feedback system operations.
 * Implementations can use Firestore, Postgres, or any other backend.
 */

import type {
  BranchData,
  ReviewData,
  AdminData,
  ReviewInput,
  AdminInput,
  BranchFilterOptions,
  ReviewFilterOptions,
  PaginationOptions,
  PaginatedResult,
  DashboardStats,
  DateRange,
} from './types'

/**
 * Repository interface for feedback system
 */
export interface FeedbackRepository {
  // ============================================
  // BRANCHES
  // ============================================
  
  /**
   * List branches (public can see active, admins can see all)
   */
  listBranches(options?: BranchFilterOptions): Promise<BranchData[]>
  
  /**
   * Get a single branch by ID
   */
  getBranch(branchId: string): Promise<BranchData | null>
  
  /**
   * Create a new branch (owner only)
   */
  createBranch(data: {
    name: string
    location: string
    address?: string | null
    isActive: boolean
  }): Promise<string> // Returns branch ID
  
  /**
   * Update a branch (owner only)
   */
  updateBranch(branchId: string, data: {
    name?: string
    location?: string
    address?: string | null
    isActive?: boolean
  }): Promise<void>
  
  /**
   * Delete a branch (owner only, soft delete by setting isActive=false)
   */
  deleteBranch(branchId: string): Promise<void>
  
  // ============================================
  // REVIEWS
  // ============================================
  
  /**
   * Create a review (public)
   */
  createReview(input: ReviewInput): Promise<string> // Returns review ID
  
  /**
   * List reviews with pagination (admin only, respects RBAC)
   */
  listReviews(
    filters: ReviewFilterOptions,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<ReviewData>>
  
  /**
   * Get dashboard statistics (admin only, respects RBAC)
   */
  getDashboardStats(
    dateRange: DateRange,
    allowedBranchIds: string[] | null // null = all (owner), [] = none, [ids] = specific
  ): Promise<DashboardStats>
  
  /**
   * Get review count for statistics (admin only, respects RBAC)
   */
  getReviewCount(
    filters: ReviewFilterOptions
  ): Promise<number>
  
  // ============================================
  // ADMINS (RBAC)
  // ============================================
  
  /**
   * List all admins (owner only)
   */
  listAdmins(): Promise<AdminData[]>
  
  /**
   * Get admin by UID
   */
  getAdmin(uid: string): Promise<AdminData | null>
  
  /**
   * Create or update admin (owner only)
   */
  setAdmin(uid: string, data: AdminInput): Promise<void>
  
  /**
   * Delete admin (owner only)
   */
  deleteAdmin(uid: string): Promise<void>
}

