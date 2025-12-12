/**
 * Stat Card Component
 * 
 * Displays a single statistic with icon and trend.
 */

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  trend?: {
    value: number
    positive: boolean
  }
  color?: 'brand' | 'green' | 'blue' | 'purple'
}

const colorClasses = {
  brand: {
    bg: 'bg-brand-100',
    icon: 'text-brand-500',
    trend: 'text-brand-600',
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-500',
    trend: 'text-green-600',
  },
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-500',
    trend: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-500',
    trend: 'text-purple-600',
  },
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'brand',
}: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-charcoal">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Icon size={24} className={colors.icon} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={`text-sm font-medium ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-sm text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  )
}

