/**
 * Firestore Service
 * 
 * All Firestore operations for branches and reviews.
 * Includes efficient queries with proper indexing considerations.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  getDocsFromServer,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  DocumentSnapshot,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Branch, Review, ReviewFormData, DateRange } from '../types'

// Collection references
const BRANCHES_COLLECTION = 'branches'
const REVIEWS_COLLECTION = 'reviews'

/**
 * BRANCH OPERATIONS
 */

// Get all active branches (simplified query - no index needed)
export async function getBranches(): Promise<Branch[]> {
  try {
    // Log for debugging (works in production too)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    console.log('[getBranches] Starting fetch, isMobile:', isMobile)
    console.log('[getBranches] Firebase db initialized:', !!db)
    console.log('[getBranches] Collection path:', BRANCHES_COLLECTION)
    
    // Force network fetch on mobile to avoid cache issues
    const collectionRef = collection(db, BRANCHES_COLLECTION)
    console.log('[getBranches] Collection ref created:', !!collectionRef)
    
    // Simple query without composite index requirement
    // Try server fetch first (force network), fallback to regular getDocs
    let snapshot
    try {
      // Try to get from server first (force network) - this bypasses cache
      console.log('[getBranches] Attempting server fetch (bypassing cache)...')
      snapshot = await getDocsFromServer(collectionRef)
      console.log('[getBranches] Server fetch successful')
    } catch (serverError: any) {
      console.warn('[getBranches] Server fetch failed, trying regular getDocs:', serverError)
      // Fallback to regular getDocs (may use cache)
      snapshot = await getDocs(collectionRef)
      console.log('[getBranches] Regular fetch successful')
    }
    
    console.log('[getBranches] Snapshot received')
    console.log('[getBranches] Snapshot size:', snapshot.size)
    console.log('[getBranches] Snapshot empty:', snapshot.empty)
    console.log('[getBranches] Snapshot metadata:', {
      fromCache: snapshot.metadata.fromCache,
      hasPendingWrites: snapshot.metadata.hasPendingWrites
    })
    
    if (snapshot.empty) {
      console.warn('[getBranches] WARNING: Snapshot is empty!')
      console.warn('[getBranches] This could mean:')
      console.warn('[getBranches] 1. No documents in collection')
      console.warn('[getBranches] 2. Permission denied (but no error thrown)')
      console.warn('[getBranches] 3. Cache issue on mobile')
      
      // Try one more time with regular getDocs to see if we get different results
      console.log('[getBranches] Retrying with regular getDocs...')
      const retrySnapshot = await getDocs(collectionRef)
      console.log('[getBranches] Retry snapshot size:', retrySnapshot.size)
      if (retrySnapshot.size > 0) {
        console.log('[getBranches] Retry found documents! Using retry snapshot')
        snapshot = retrySnapshot
      }
    }
    
    // Filter and sort client-side to avoid index requirements
    const branches = snapshot.docs
      .map((doc, index) => {
        const data = doc.data()
        const branch = {
          id: doc.id,
          name: data.name || '',
          location: data.location || '',
          address: data.address || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }
        console.log(`[getBranches] Branch ${index + 1}:`, {
          id: branch.id,
          name: branch.name,
          location: branch.location,
          isActive: branch.isActive,
          rawData: data
        })
        return branch
      }) as Branch[]
    
    console.log('[getBranches] Total branches mapped:', branches.length)
    console.log('[getBranches] All branch data:', JSON.stringify(branches, null, 2))
    
    const activeBranches = branches
      .filter(b => {
        const isActive = b.isActive !== false
        if (!isActive) {
          console.log('[getBranches] Filtered out inactive branch:', b.id, b.name)
        }
        return isActive
      })
      .sort((a, b) => a.name.localeCompare(b.name))
    
    console.log('[getBranches] Active branches after filter:', activeBranches.length)
    console.log('[getBranches] Active branch names:', activeBranches.map(b => b.name))
    
    if (activeBranches.length === 0 && branches.length > 0) {
      console.error('[getBranches] ERROR: All branches were filtered out!')
      console.error('[getBranches] This means all branches have isActive=false')
    }
    
    return activeBranches
  } catch (error: any) {
    console.error('[getBranches] ERROR:', error)
    console.error('[getBranches] Error code:', error?.code)
    console.error('[getBranches] Error message:', error?.message)
    console.error('[getBranches] Error stack:', error?.stack)
    console.error('[getBranches] Error name:', error?.name)
    
    // Re-throw with more context
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied: Unable to read branches. Please check Firestore security rules.')
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. This may be due to network restrictions in your region. Please check your internet connection or try using a VPN.')
    }
    if (error?.code === 'deadline-exceeded') {
      throw new Error('Request timeout. This may be due to network restrictions. Please check your internet connection or try using a VPN.')
    }
    if (error?.code === 'failed-precondition') {
      throw new Error('Database error. Please refresh the page and try again.')
    }
    // Include original error message for debugging
    throw new Error(error?.message || 'Failed to load branches. Please check your connection.')
  }
}

// Get a single branch by ID
export async function getBranch(branchId: string): Promise<Branch | null> {
  const docRef = doc(db, BRANCHES_COLLECTION, branchId)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) {
    return null
  }
  
  return {
    id: docSnap.id,
    ...docSnap.data()
  } as Branch
}

// Get all branches (including inactive) - for admin use
export async function getAllBranches(): Promise<Branch[]> {
  const snapshot = await getDocs(collection(db, BRANCHES_COLLECTION))
  
  const branches = snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Branch[]
  
  return branches.sort((a, b) => a.name.localeCompare(b.name))
}

// Create a new branch
export async function createBranch(data: {
  name: string
  location: string
  address?: string
  isActive?: boolean
}): Promise<string> {
  const branch = {
    name: data.name.trim(),
    location: data.location.trim(),
    address: data.address?.trim() || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, BRANCHES_COLLECTION), branch)
  return docRef.id
}

// Update a branch
export async function updateBranch(
  branchId: string,
  data: {
    name?: string
    location?: string
    address?: string
    isActive?: boolean
  }
): Promise<void> {
  const docRef = doc(db, BRANCHES_COLLECTION, branchId)
  const updates: any = {
    updatedAt: serverTimestamp(),
  }

  if (data.name !== undefined) updates.name = data.name.trim()
  if (data.location !== undefined) updates.location = data.location.trim()
  if (data.address !== undefined) updates.address = data.address?.trim() || null
  if (data.isActive !== undefined) updates.isActive = data.isActive

  await updateDoc(docRef, updates)
}

// Delete a branch
export async function deleteBranch(branchId: string): Promise<void> {
  const docRef = doc(db, BRANCHES_COLLECTION, branchId)
  await deleteDoc(docRef)
}

/**
 * REVIEW OPERATIONS
 */

// Submit a new review (used by customer tablet)
export async function submitReview(data: ReviewFormData): Promise<string> {
  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // Validate branchId
  if (!data.branchId || data.branchId.trim().length === 0) {
    throw new Error('Branch ID is required')
  }

  // Sanitize and prepare review document
  const review = {
    branchId: data.branchId.trim(),
    rating: Math.round(data.rating) as 1 | 2 | 3 | 4 | 5,
    comment: data.comment?.trim() || null,
    customerName: data.customerName?.trim() || null,
    contact: data.contact?.trim() || null,
    billId: data.billId?.trim() || null,
    createdAt: serverTimestamp(),
  }

  try {
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), review)
    return docRef.id
  } catch (error: any) {
    console.error('Error submitting review:', error)
    // Provide more specific error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your connection.')
    }
    if (error?.code === 'invalid-argument') {
      throw new Error('Invalid data. Please check all fields.')
    }
    throw new Error('Failed to submit feedback. Please try again.')
  }
}

// Get reviews with filters and pagination (for admin dashboard)
// Simplified to use client-side filtering to avoid index requirements
export async function getReviews(options: {
  branchId?: string
  dateRange?: DateRange
  minRating?: number
  maxRating?: number
  pageSize?: number
  lastDoc?: DocumentSnapshot
}): Promise<{ reviews: Review[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  const {
    branchId,
    dateRange,
    minRating,
    maxRating,
    pageSize = 20,
    lastDoc,
  } = options

  // Simple query - just order by createdAt (single field index auto-created)
  const constraints: QueryConstraint[] = [
    orderBy('createdAt', 'desc'),
    limit(500) // Get more to allow for client-side filtering
  ]

  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }

  const q = query(collection(db, REVIEWS_COLLECTION), ...constraints)
  const snapshot = await getDocs(q)

  // Filter client-side to avoid composite index requirements
  let allReviews = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    doc: docSnap,
    ...docSnap.data()
  })) as (Review & { doc: DocumentSnapshot })[]

  // Apply filters
  allReviews = allReviews.filter(review => {
    // Branch filter
    if (branchId && review.branchId !== branchId) return false
    
    // Date range filter
    if (dateRange) {
      const reviewTime = review.createdAt.toDate().getTime()
      if (reviewTime < dateRange.startDate.getTime()) return false
      if (reviewTime > dateRange.endDate.getTime()) return false
    }
    
    // Rating filter
    if (minRating !== undefined && review.rating < minRating) return false
    if (maxRating !== undefined && review.rating > maxRating) return false
    
    return true
  })

  // Paginate the filtered results
  const paginatedReviews = allReviews.slice(0, pageSize)
  const hasMore = allReviews.length > pageSize

  const reviews: Review[] = paginatedReviews.map(({ doc: _doc, ...review }) => review)
  const newLastDoc = paginatedReviews.length > 0 
    ? paginatedReviews[paginatedReviews.length - 1].doc 
    : null

  return { reviews, lastDoc: newLastDoc, hasMore }
}

// Get all reviews for a date range (for statistics calculation)
// Simplified to avoid index requirements - filters client-side
export async function getReviewsForStats(options: {
  branchId?: string
  dateRange: DateRange
}): Promise<Review[]> {
  const { branchId, dateRange } = options
  
  // Simple query - get all reviews
  const snapshot = await getDocs(collection(db, REVIEWS_COLLECTION))
  
  // Filter client-side to avoid composite index requirements
  const startTime = dateRange.startDate.getTime()
  const endTime = dateRange.endDate.getTime()
  
  const reviews = snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[]
  
  return reviews
    .filter(review => {
      const reviewTime = review.createdAt.toDate().getTime()
      const inDateRange = reviewTime >= startTime && reviewTime <= endTime
      const matchesBranch = !branchId || review.branchId === branchId
      return inDateRange && matchesBranch
    })
    .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
}

// Get review statistics per branch (simplified - no index needed)
export async function getBranchStats(dateRange?: DateRange): Promise<Map<string, { count: number; totalRating: number }>> {
  // Simple query - get all reviews
  const snapshot = await getDocs(collection(db, REVIEWS_COLLECTION))

  const stats = new Map<string, { count: number; totalRating: number }>()

  snapshot.docs.forEach(docSnap => {
    const review = docSnap.data() as Review
    
    // Filter by date range client-side if specified
    if (dateRange) {
      const reviewTime = review.createdAt.toDate().getTime()
      const startTime = dateRange.startDate.getTime()
      const endTime = dateRange.endDate.getTime()
      if (reviewTime < startTime || reviewTime > endTime) {
        return // Skip this review
      }
    }
    
    const current = stats.get(review.branchId) || { count: 0, totalRating: 0 }
    stats.set(review.branchId, {
      count: current.count + 1,
      totalRating: current.totalRating + review.rating
    })
  })

  return stats
}

// Get customer frequency data (reviews per customer contact)
// Simplified to avoid index requirements - filters client-side
export async function getCustomerFrequency(options: {
  dateRange?: DateRange
  minReviews?: number
}): Promise<{ contact: string; customerName?: string; count: number; avgRating: number; lastReview: Timestamp }[]> {
  const { dateRange, minReviews = 1 } = options

  // Simple query - get all reviews
  const snapshot = await getDocs(collection(db, REVIEWS_COLLECTION))

  // Aggregate by contact (filter client-side)
  const customerMap = new Map<string, {
    customerName?: string
    count: number
    totalRating: number
    lastReview: Timestamp
  }>()

  snapshot.docs.forEach(docSnap => {
    const review = docSnap.data() as Review
    
    // Skip reviews without contact
    if (!review.contact) return
    
    // Filter by date range client-side if specified
    if (dateRange) {
      const reviewTime = review.createdAt.toDate().getTime()
      const startTime = dateRange.startDate.getTime()
      const endTime = dateRange.endDate.getTime()
      if (reviewTime < startTime || reviewTime > endTime) {
        return // Skip this review
      }
    }

    const current = customerMap.get(review.contact)
    if (!current) {
      customerMap.set(review.contact, {
        customerName: review.customerName || undefined,
        count: 1,
        totalRating: review.rating,
        lastReview: review.createdAt
      })
    } else {
      current.count++
      current.totalRating += review.rating
      // Keep the latest review date
      if (review.createdAt.toDate() > current.lastReview.toDate()) {
        current.lastReview = review.createdAt
      }
      // Update name if we have one
      if (review.customerName && !current.customerName) {
        current.customerName = review.customerName
      }
    }
  })

  // Convert to array and filter by min reviews
  const results = Array.from(customerMap.entries())
    .filter(([, data]) => data.count >= minReviews)
    .map(([contact, data]) => ({
      contact,
      customerName: data.customerName,
      count: data.count,
      avgRating: Math.round((data.totalRating / data.count) * 10) / 10,
      lastReview: data.lastReview
    }))
    .sort((a, b) => b.count - a.count)

  return results
}

// Get total counts for dashboard overview (simplified - no index needed)
export async function getDashboardTotals(): Promise<{
  totalReviews: number
  averageRating: number
  activeBranches: number
}> {
  // Get all data without complex queries to avoid index requirements
  const [reviewsSnap, branchesSnap] = await Promise.all([
    getDocs(collection(db, REVIEWS_COLLECTION)),
    getDocs(collection(db, BRANCHES_COLLECTION))
  ])

  let totalRating = 0
  reviewsSnap.docs.forEach(doc => {
    totalRating += (doc.data() as Review).rating
  })

  // Count active branches client-side
  const activeBranches = branchesSnap.docs.filter(
    doc => doc.data().isActive === true
  ).length

  return {
    totalReviews: reviewsSnap.size,
    averageRating: reviewsSnap.size > 0 
      ? Math.round((totalRating / reviewsSnap.size) * 10) / 10 
      : 0,
    activeBranches
  }
}

