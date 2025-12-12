/**
 * Dashboard Overview Page
 * 
 * Main admin dashboard with summary stats and charts.
 */

import { useState } from 'react'
import { subDays } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { MessageSquare, Star, Building2, TrendingUp, Loader2 } from 'lucide-react'
import StatCard from '../../components/admin/StatCard'
import DateRangePicker from '../../components/admin/DateRangePicker'
import { useDashboardData, formatDateForDisplay } from '../../hooks/useDashboardData'
import type { DateRange } from '../../types'

export default function DashboardOverview() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  })

  const { totals, branchStats, dailyStats, recentReviews, loading, error } = useDashboardData(dateRange)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={48} className="text-brand-500 spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-brand-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData = dailyStats.map((stat) => ({
    ...stat,
    displayDate: formatDateForDisplay(stat.date),
  }))

  const topBranches = [...branchStats]
    .sort((a, b) => b.totalReviews - a.totalReviews)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header with date picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-charcoal">Overview</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening.</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reviews"
          value={totals.totalReviews.toLocaleString()}
          icon={MessageSquare}
          color="brand"
        />
        <StatCard
          title="Average Rating"
          value={totals.averageRating.toFixed(1)}
          subtitle="out of 5 stars"
          icon={Star}
          color="green"
        />
        <StatCard
          title="Active Branches"
          value={totals.activeBranches}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Period Reviews"
          value={dailyStats.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
          subtitle="in selected range"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews over time */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Reviews Over Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ed7821" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ed7821" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e5' }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e5' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#ed7821"
                  strokeWidth={2}
                  fill="url(#colorCount)"
                  name="Reviews"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top branches */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Top Branches by Reviews</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBranches} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="branchName"
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar
                  dataKey="totalReviews"
                  fill="#ed7821"
                  radius={[0, 4, 4, 0]}
                  name="Reviews"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent reviews */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Recent Reviews</h3>
        {recentReviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews in this period</p>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((review) => {
              const branch = branchStats.find((b) => b.branchId === review.branchId)
              return (
                <div
                  key={review.id}
                  className="flex items-start gap-4 p-4 bg-brand-50/50 rounded-xl"
                >
                  {/* Rating */}
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-brand-600">{review.rating}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-charcoal">
                        {branch?.branchName || 'Unknown Branch'}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {review.customerName || 'Anonymous'}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="text-gray-600 text-sm line-clamp-2">{review.comment}</p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">No comment</p>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="flex-shrink-0 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

