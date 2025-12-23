/**
 * Dashboard Overview Page
 * 
 * Main admin dashboard with summary stats and charts.
 */

import { useState, useRef } from 'react'
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
import { MessageSquare, Star, Building2, TrendingUp, Loader2, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { useSafeTranslation } from '../../hooks/useSafeTranslation'
import { useRoleGuard } from '../../hooks/useRoleGuard'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/admin/StatCard'
import DateRangePicker from '../../components/admin/DateRangePicker'
import { useDashboardData, formatDateForDisplay } from '../../hooks/useDashboardData'
import { exportDashboardPdf } from '../../utils/exportDashboardPdf'
import { exportDashboardExcel } from '../../utils/exportDashboardExcel'
import type { DateRange } from '../../types'

export default function DashboardOverview() {
  const { t } = useSafeTranslation()
  const { canPerform } = useRoleGuard()
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const { totals, branchStats, dailyStats, recentReviews, loading, error } = useDashboardData(dateRange)

  // Refs for chart containers
  const chart1Ref = useRef<HTMLDivElement>(null) // Reviews Over Time
  const chart2Ref = useRef<HTMLDivElement>(null) // Top Branches

  // Handle PDF export
  const handleExportPdf = async () => {
    if (!chart1Ref.current || !chart2Ref.current) {
      setExportError('Charts not ready. Please wait for page to load.')
      return
    }

    setIsExporting(true)
    setExportError(null)
    setShowExportMenu(false)

    try {
      const periodReviews = dailyStats.reduce((sum, d) => sum + d.count, 0)
      
      // Get brand name from environment variable
      const brandName = import.meta.env.VITE_BRAND_NAME || 'Restaurant'
      
      // Get user email from auth context (if available)
      const userEmail = user?.email || undefined
      
      await exportDashboardPdf({
        brandName,
        dateRange,
        totals: {
          ...totals,
          periodReviews,
        },
        branchStats,
        dailyStats,
        chart1Element: chart1Ref.current,
        chart2Element: chart2Ref.current,
        userEmail,
      })
    } catch (err: any) {
      console.error('Export failed:', err)
      setExportError(err?.message || 'Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle Excel export
  const handleExportExcel = () => {
    setIsExporting(true)
    setExportError(null)
    setShowExportMenu(false)

    try {
      const periodReviews = dailyStats.reduce((sum, d) => sum + d.count, 0)
      
      exportDashboardExcel({
        dateRange,
        totals: {
          ...totals,
          periodReviews,
        },
        dailyStats,
        branchStats,
      })
    } catch (err: any) {
      console.error('Export failed:', err)
      setExportError(err?.message || 'Failed to export Excel. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const canExport = canPerform('exportReports')

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
            {t('admin.retry', 'Retry')}
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
      {/* Header with date picker and export button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-charcoal">{t('admin.overview')}</h1>
          <p className="text-gray-500">{t('admin.welcomeBack')}</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          {canExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting || loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl
                         font-medium hover:bg-brand-600 transition-colors shadow-md
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Export Visuals
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
              
              {showExportMenu && !isExporting && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                    <button
                      onClick={handleExportPdf}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <FileText size={18} className="text-brand-500" />
                      <span>Export as PDF</span>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-200"
                    >
                      <FileSpreadsheet size={18} className="text-green-600" />
                      <span>Export as Excel</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export error message */}
      {exportError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fade-in">
          {exportError}
          <button
            onClick={() => setExportError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('admin.totalReviews')}
          value={totals.totalReviews.toLocaleString()}
          icon={MessageSquare}
          color="brand"
        />
        <StatCard
          title={t('admin.averageRating')}
          value={totals.averageRating.toFixed(1)}
          subtitle={t('admin.outOf5Stars')}
          icon={Star}
          color="green"
        />
        <StatCard
          title={t('admin.activeBranches')}
          value={totals.activeBranches}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title={t('admin.periodReviews')}
          value={dailyStats.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
          subtitle={t('admin.inSelectedRange')}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews over time */}
        <div className="bg-white rounded-2xl p-6 shadow-sm" ref={chart1Ref}>
          <h3 className="text-lg font-semibold text-charcoal mb-4">{t('admin.reviewsOverTime')}</h3>
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
                  name={t('admin.reviews')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top branches */}
        <div className="bg-white rounded-2xl p-6 shadow-sm" ref={chart2Ref}>
          <h3 className="text-lg font-semibold text-charcoal mb-4">{t('admin.topBranchesByReviews')}</h3>
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
                  name={t('admin.reviews')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent reviews */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-charcoal mb-4">{t('admin.recentReviews')}</h3>
        {recentReviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('admin.noReviewsInPeriod')}</p>
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
                        {branch?.branchName || t('admin.unknownBranch')}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {review.customerName || t('admin.anonymous')}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="text-gray-600 text-sm line-clamp-2">{review.comment}</p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">{t('admin.noComment')}</p>
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

