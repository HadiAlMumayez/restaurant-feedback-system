/**
 * Excel Export Utility
 * 
 * Exports reviews to Excel (.xlsx) using xlsx library
 */

import * as XLSX from 'xlsx'
import type { Review } from '../types'
import type { Branch } from '../types'

interface ExportOptions {
  reviews: Review[]
  branches: Branch[]
  dateRange?: { startDate: Date; endDate: Date }
  branchName?: string
  companyName?: string
}

export function exportReviewsToExcel(options: ExportOptions): void {
  const { reviews, branches, dateRange, branchName, companyName = 'Restaurant Feedback System' } = options

  // Prepare worksheet data
  const worksheetData = [
    // Header row
    ['Date', 'Branch', 'Rating', 'Comment', 'Customer Name', 'Contact', 'Bill ID'],
    // Data rows
    ...reviews.map((review) => {
      const branch = branches.find((b) => b.id === review.branchId)
      return [
        review.createdAt.toDate().toLocaleDateString('en-US'),
        branch?.name || 'Unknown',
        review.rating,
        review.comment || '',
        review.customerName || '',
        review.contact || '',
        review.billId || '',
      ]
    }),
  ]

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 20 }, // Branch
    { wch: 8 },  // Rating
    { wch: 50 }, // Comment
    { wch: 20 }, // Customer Name
    { wch: 20 }, // Contact
    { wch: 15 }, // Bill ID
  ]

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reviews')

  // Add summary sheet
  const summaryData = [
    ['Report Information'],
    ['Company', companyName],
    ['Branch', branchName || 'All Branches'],
    ['Date Range', dateRange 
      ? `${dateRange.startDate.toLocaleDateString('en-US')} - ${dateRange.endDate.toLocaleDateString('en-US')}`
      : 'All Time'],
    ['Generated', new Date().toLocaleString('en-US')],
    [],
    ['Summary'],
    ['Total Reviews', reviews.length],
  ]

  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    summaryData.push(['Average Rating', avgRating.toFixed(2)])
    
    // Rating distribution
    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
    }))
    summaryData.push([])
    summaryData.push(['Rating Distribution'])
    summaryData.push(['Rating', 'Count'])
    ratingCounts.forEach(({ rating, count }) => {
      summaryData.push([rating, count])
    })
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Generate filename
  const filename = `reviews-${new Date().toISOString().split('T')[0]}.xlsx`

  // Save file
  XLSX.writeFile(workbook, filename)
}

