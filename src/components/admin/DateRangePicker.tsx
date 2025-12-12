/**
 * Date Range Picker Component
 * 
 * Simple date range selector with preset options.
 */

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { format, subDays, startOfWeek, startOfMonth, subMonths } from 'date-fns'
import type { DateRange } from '../../types'

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

type PresetKey = '7d' | '30d' | 'week' | 'month' | '3months' | 'custom'

const presets: { key: PresetKey; label: string; getRange: () => DateRange }[] = [
  {
    key: '7d',
    label: 'Last 7 days',
    getRange: () => ({
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
    }),
  },
  {
    key: '30d',
    label: 'Last 30 days',
    getRange: () => ({
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
    }),
  },
  {
    key: 'week',
    label: 'This week',
    getRange: () => ({
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
      endDate: new Date(),
    }),
  },
  {
    key: 'month',
    label: 'This month',
    getRange: () => ({
      startDate: startOfMonth(new Date()),
      endDate: new Date(),
    }),
  },
  {
    key: '3months',
    label: 'Last 3 months',
    getRange: () => ({
      startDate: subMonths(new Date(), 3),
      endDate: new Date(),
    }),
  },
]

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState(format(value.startDate, 'yyyy-MM-dd'))
  const [customEnd, setCustomEnd] = useState(format(value.endDate, 'yyyy-MM-dd'))
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCustom(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePresetSelect = (preset: typeof presets[0]) => {
    onChange(preset.getRange())
    setIsOpen(false)
    setShowCustom(false)
  }

  const handleCustomApply = () => {
    onChange({
      startDate: new Date(customStart),
      endDate: new Date(customEnd),
    })
    setIsOpen(false)
    setShowCustom(false)
  }

  const displayText = `${format(value.startDate, 'MMM d, yyyy')} - ${format(value.endDate, 'MMM d, yyyy')}`

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 
                   rounded-xl hover:border-brand-300 transition-colors text-sm font-medium"
      >
        <Calendar size={18} className="text-brand-500" />
        <span className="text-charcoal">{displayText}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in">
          {!showCustom ? (
            <>
              <div className="p-2">
                {presets.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-brand-50 
                             text-charcoal font-medium transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => setShowCustom(true)}
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-brand-50 
                           text-brand-600 font-medium transition-colors"
                >
                  Custom range...
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-brand-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustom(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCustomApply}
                  className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

