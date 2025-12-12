/**
 * Branch Comparison Page
 * 
 * Compare ratings and review counts across branches.
 */

import { useState } from 'react'
import { subDays } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { Star, Loader2, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import DateRangePicker from '../../components/admin/DateRangePicker'
import { useDashboardData } from '../../hooks/useDashboardData'
import type { DateRange } from '../../types'

export default function BranchComparison() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  })

  const { branchStats, loading, error } = useDashboardData(dateRange)

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
        </div>
      </div>
    )
  }

  // Sort by average rating for ranking
  const sortedByRating = [...branchStats].sort((a, b) => b.averageRating - a.averageRating)
  const sortedByCount = [...branchStats].sort((a, b) => b.totalReviews - a.totalReviews)

  // Prepare radar chart data (normalize to 100)
  const maxReviews = Math.max(...branchStats.map((b) => b.totalReviews), 1)
  const radarData = branchStats.slice(0, 6).map((branch) => ({
    branch: branch.branchName.length > 15 
      ? branch.branchName.substring(0, 12) + '...' 
      : branch.branchName,
    rating: (branch.averageRating / 5) * 100,
    reviews: (branch.totalReviews / maxReviews) * 100,
  }))

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-500'
    if (rating >= 4) return 'text-green-400'
    if (rating >= 3.5) return 'text-yellow-500'
    if (rating >= 3) return 'text-orange-500'
    return 'text-red-500'
  }

  const getTrendIcon = (rating: number) => {
    if (rating >= 4) return <TrendingUp size={16} className="text-green-500" />
    if (rating >= 3) return <Minus size={16} className="text-yellow-500" />
    return <TrendingDown size={16} className="text-red-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-charcoal">Branch Comparison</h1>
          <p className="text-gray-500">Compare performance across all branches</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Branch table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Branch</th>
                <th>Location</th>
                <th>Reviews</th>
                <th>Avg Rating</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {sortedByRating.map((branch, index) => (
                <tr key={branch.branchId}>
                  <td>
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' : 
                        'bg-brand-50 text-brand-600'}`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                        <MapPin size={20} className="text-brand-500" />
                      </div>
                      <span className="font-medium text-charcoal">{branch.branchName}</span>
                    </div>
                  </td>
                  <td className="text-gray-500">{branch.location}</td>
                  <td>
                    <span className="font-semibold text-charcoal">{branch.totalReviews}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Star size={18} className="text-yellow-400 fill-current" />
                      <span className={`font-bold ${getRatingColor(branch.averageRating)}`}>
                        {branch.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td>
                    {getTrendIcon(branch.averageRating)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {branchStats.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No branch data available
          </div>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart comparison */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-charcoal mb-4">
            Reviews & Ratings Comparison
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedByCount.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="branchName"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(name) => name.length > 10 ? name.substring(0, 8) + '..' : name}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="totalReviews"
                  fill="#ed7821"
                  name="Total Reviews"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="averageRating"
                  fill="#22c55e"
                  name="Avg Rating"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-charcoal mb-4">
            Performance Radar (Top 6)
          </h3>
          <div className="h-80">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e5e5" />
                  <PolarAngleAxis dataKey="branch" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Rating Score"
                    dataKey="rating"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Review Volume"
                    dataKey="reviews"
                    stroke="#ed7821"
                    fill="#ed7821"
                    fillOpacity={0.3}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Not enough data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

