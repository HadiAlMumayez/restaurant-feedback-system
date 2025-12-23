/**
 * Custom hook for dashboard data fetching
 * 
 * Fetches and computes all data needed for dashboard analytics.
 */

import { useState, useEffect, useCallback } from 'react'
import { format, eachDayOfInterval, parseISO } from 'date-fns'
import {
  getDashboardTotals,
  getBranches,
  getReviewsForStats,
  getBranchStats,
  getCustomerFrequency,
} from '../services/firestore'
import { useAuth } from '../context/AuthContext'
import type { Branch, Review, DateRange, DailyStats, BranchStats } from '../types'

interface DashboardData {
  totals: {
    totalReviews: number
    averageRating: number
    activeBranches: number
  }
  branches: Branch[]
  branchStats: BranchStats[]
  dailyStats: DailyStats[]
  recentReviews: Review[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboardData(dateRange: DateRange): DashboardData {
  const { allowedBranchIds } = useAuth()
  const [totals, setTotals] = useState({
    totalReviews: 0,
    averageRating: 0,
    activeBranches: 0,
  })
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchStats, setBranchStats] = useState<BranchStats[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [recentReviews, setRecentReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel (with RBAC filtering)
      const [totalsData, branchesData, statsMap, reviews] = await Promise.all([
        getDashboardTotals(),
        getBranches(),
        getBranchStats(dateRange),
        getReviewsForStats({ dateRange, allowedBranchIds }),
      ])

      setTotals(totalsData)
      setBranches(branchesData)

      // Compute branch stats with names
      const branchStatsData: BranchStats[] = branchesData.map((branch) => {
        const stats = statsMap.get(branch.id) || { count: 0, totalRating: 0 }
        return {
          branchId: branch.id,
          branchName: branch.name,
          location: branch.location,
          totalReviews: stats.count,
          averageRating: stats.count > 0
            ? Math.round((stats.totalRating / stats.count) * 10) / 10
            : 0,
        }
      })
      setBranchStats(branchStatsData)

      // Compute daily stats
      const days = eachDayOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate,
      })

      const dailyMap = new Map<string, { count: number; totalRating: number }>()
      
      // Initialize all days
      days.forEach((day) => {
        dailyMap.set(format(day, 'yyyy-MM-dd'), { count: 0, totalRating: 0 })
      })

      // Aggregate reviews by day
      reviews.forEach((review) => {
        const dayKey = format(review.createdAt.toDate(), 'yyyy-MM-dd')
        const current = dailyMap.get(dayKey)
        if (current) {
          dailyMap.set(dayKey, {
            count: current.count + 1,
            totalRating: current.totalRating + review.rating,
          })
        }
      })

      const dailyStatsData: DailyStats[] = Array.from(dailyMap.entries()).map(
        ([date, data]) => ({
          date,
          count: data.count,
          averageRating: data.count > 0
            ? Math.round((data.totalRating / data.count) * 10) / 10
            : 0,
        })
      )
      setDailyStats(dailyStatsData)

      // Set recent reviews (limit to 10)
      setRecentReviews(reviews.slice(0, 10))

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [dateRange, allowedBranchIds])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    totals,
    branches,
    branchStats,
    dailyStats,
    recentReviews,
    loading,
    error,
    refetch: fetchData,
  }
}

// Hook for customer frequency data
export function useCustomerFrequency(dateRange?: DateRange, minReviews = 1) {
  const [data, setData] = useState<{
    contact: string
    customerName?: string
    count: number
    avgRating: number
    lastReview: import('firebase/firestore').Timestamp
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getCustomerFrequency({ dateRange, minReviews })
      setData(result)
    } catch (err) {
      console.error('Failed to fetch customer frequency:', err)
      setError('Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }, [dateRange, minReviews])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Helper to format date for display
export function formatDateForDisplay(dateStr: string): string {
  const date = parseISO(dateStr)
  return format(date, 'MMM d')
}

