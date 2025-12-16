/**
 * Customer Frequency Page
 * 
 * Shows how many reviews each customer (by contact) has submitted.
 */

import { useState } from 'react'
import { subMonths, format } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Users, Star, MessageSquare, Loader2, Award } from 'lucide-react'
import { useSafeTranslation } from '../../hooks/useSafeTranslation'
import DateRangePicker from '../../components/admin/DateRangePicker'
import { useCustomerFrequency } from '../../hooks/useDashboardData'
import type { DateRange } from '../../types'

const COLORS = ['#ed7821', '#22c55e', '#3b82f6', '#a855f7', '#f43f5e', '#eab308']

export default function CustomerFrequency() {
  const { t } = useSafeTranslation()
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subMonths(new Date(), 3),
    endDate: new Date(),
  })
  const [minReviews, setMinReviews] = useState(1)

  const { data: customers, loading, error } = useCustomerFrequency(dateRange, minReviews)

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  // Prepare pie chart data for top customers
  const topCustomers = customers.slice(0, 6)
  const pieData = topCustomers.map((c) => ({
    name: c.customerName || c.contact.substring(0, 15) + '...',
    value: c.count,
  }))

  // Calculate summary stats
  const totalCustomers = customers.length
  const totalReviewsFromRepeats = customers.filter(c => c.count >= 2).reduce((sum, c) => sum + c.count, 0)
  const avgReviewsPerCustomer = totalCustomers > 0
    ? (customers.reduce((sum, c) => sum + c.count, 0) / totalCustomers).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-charcoal">{t('admin.customerFrequency')}</h1>
          <p className="text-gray-500">{t('admin.customerFrequencyDescription')}</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-100 rounded-xl">
              <Users size={24} className="text-brand-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('admin.uniqueCustomers', 'Unique Customers')}</p>
              <p className="text-2xl font-bold text-charcoal">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Award size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Repeat Reviews</p>
              <p className="text-2xl font-bold text-charcoal">{totalReviewsFromRepeats}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MessageSquare size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('admin.avgReviewsPerCustomer', 'Avg Reviews/Customer')}</p>
              <p className="text-2xl font-bold text-charcoal">{avgReviewsPerCustomer}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Top Contributors</h3>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={32} className="text-brand-500 spinner" />
              </div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Customer table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-charcoal">Customer Details</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500">Min reviews:</label>
                <select
                  value={minReviews}
                  onChange={(e) => setMinReviews(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="5">5+</option>
                  <option value="10">10+</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="text-brand-500 spinner" />
            </div>
          ) : customers.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg">No customers found</p>
              <p className="text-sm mt-2">
                Only customers with contact info are tracked
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Reviews</th>
                    <th>Avg Rating</th>
                    <th>Last Review</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 20).map((customer, index) => (
                    <tr key={customer.contact}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          >
                            {customer.customerName?.[0]?.toUpperCase() || '#'}
                          </div>
                          <span className="font-medium text-charcoal">
                            {customer.customerName || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="text-gray-500 text-sm">{customer.contact}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full font-semibold text-sm">
                          {customer.count}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="font-medium">{customer.avgRating}</span>
                        </div>
                      </td>
                      <td className="text-gray-500 text-sm">
                        {format(customer.lastReview.toDate(), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {customers.length > 20 && (
            <div className="p-4 border-t border-gray-100 text-center text-gray-500 text-sm">
              Showing top 20 of {customers.length} customers
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

