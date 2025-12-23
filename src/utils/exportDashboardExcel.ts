/**
 * Dashboard Excel Export Utility
 * 
 * Exports dashboard visualization data to Excel (.xlsx) using xlsx library
 */

import * as XLSX from 'xlsx'
import type { DateRange } from '../types'

interface ExportOptions {
  dateRange: DateRange
  totals: {
    totalReviews: number
    averageRating: number
    activeBranches: number
    periodReviews: number
  }
  dailyStats: Array<{
    date: string // Format: 'yyyy-MM-dd'
    count: number
    averageRating?: number
  }>
  branchStats: Array<{
    branchId: string
    branchName: string
    location?: string
    totalReviews: number
    averageRating: number
  }>
}

export function exportDashboardExcel(options: ExportOptions): void {
  const { dateRange, totals, dailyStats, branchStats } = options

  // Create workbook
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Summary Statistics
  const summaryData = [
    ['Restaurant Feedback Report'],
    [],
    ['Report Information'],
    ['Date Range', `${dateRange.startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} - ${dateRange.endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}`],
    ['Generated', new Date().toLocaleString('en-US')],
    [],
    ['Summary Statistics'],
    ['Total Reviews', totals.totalReviews],
    ['Average Rating', totals.averageRating.toFixed(2)],
    ['Active Branches', totals.activeBranches],
    ['Period Reviews', totals.periodReviews],
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  
  // Set column widths for summary
  summarySheet['!cols'] = [
    { wch: 20 }, // Label column
    { wch: 25 }, // Value column
  ]

  // Style the title row
  if (!summarySheet['A1']) summarySheet['A1'] = { t: 's', v: 'Restaurant Feedback Report' }
  summarySheet['A1'].s = {
    font: { bold: true, sz: 16 },
  }

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Sheet 2: Reviews Over Time
  const reviewsOverTimeData = [
    ['Date', 'Reviews Count'],
    ...dailyStats.map((stat) => {
      // Parse date string (format: 'yyyy-MM-dd') to Date for formatting
      const dateParts = stat.date.split('-')
      const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]))
      return [
        date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        stat.count,
      ]
    }),
  ]

  const reviewsOverTimeSheet = XLSX.utils.aoa_to_sheet(reviewsOverTimeData)
  
  // Set column widths
  reviewsOverTimeSheet['!cols'] = [
    { wch: 15 }, // Date
    { wch: 15 }, // Count
  ]

  // Style header row
  if (reviewsOverTimeSheet['A1']) {
    reviewsOverTimeSheet['A1'].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'FFED7821' } },
    }
  }
  if (reviewsOverTimeSheet['B1']) {
    reviewsOverTimeSheet['B1'].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'FFED7821' } },
    }
  }

  XLSX.utils.book_append_sheet(workbook, reviewsOverTimeSheet, 'Reviews Over Time')

  // Sheet 3: Top Branches
  const topBranchesSorted = [...branchStats]
    .sort((a, b) => b.totalReviews - a.totalReviews)

  const topBranchesData = [
    ['Branch Name', 'Total Reviews', 'Average Rating'],
    ...topBranchesSorted.map((branch) => [
      branch.branchName,
      branch.totalReviews,
      branch.averageRating.toFixed(2),
    ]),
  ]

  const topBranchesSheet = XLSX.utils.aoa_to_sheet(topBranchesData)
  
  // Set column widths
  topBranchesSheet['!cols'] = [
    { wch: 30 }, // Branch Name
    { wch: 15 }, // Total Reviews
    { wch: 15 }, // Average Rating
  ]

  // Style header row
  if (topBranchesSheet['A1']) {
    topBranchesSheet['A1'].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'FFED7821' } },
    }
  }
  if (topBranchesSheet['B1']) {
    topBranchesSheet['B1'].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'FFED7821' } },
    }
  }
  if (topBranchesSheet['C1']) {
    topBranchesSheet['C1'].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'FFED7821' } },
    }
  }

  XLSX.utils.book_append_sheet(workbook, topBranchesSheet, 'Top Branches')

  // Generate filename
  const startDateStr = dateRange.startDate.toISOString().split('T')[0]
  const endDateStr = dateRange.endDate.toISOString().split('T')[0]
  const filename = `dashboard-report-${startDateStr}_to_${endDateStr}.xlsx`

  // Save file
  XLSX.writeFile(workbook, filename)
}

