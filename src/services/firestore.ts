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
  // Simple query without composite index requirement
  const snapshot = await getDocs(collection(db, BRANCHES_COLLECTION))
  
  // Filter and sort client-side to avoid index requirements
  const branches = snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Branch[]
  
  return branches
    .filter(b => b.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))
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

  // Sanitize and prepare review document
  const review = {
    branchId: data.branchId,
    rating: Math.round(data.rating) as 1 | 2 | 3 | 4 | 5,
    comment: data.comment?.trim() || null,
    customerName: data.customerName?.trim() || null,
    contact: data.contact?.trim() || null,
    billId: data.billId?.trim() || null,
    createdAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), review)
  return docRef.id
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

