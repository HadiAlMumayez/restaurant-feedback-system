/**
 * PDF Export Utility
 * 
 * Exports reviews to PDF using jsPDF and jsPDF-AutoTable
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Review } from '../types'
import type { Branch } from '../types'

interface ExportOptions {
  reviews: Review[]
  branches: Branch[]
  dateRange?: { startDate: Date; endDate: Date }
  branchName?: string
  companyName?: string
}

export function exportReviewsToPdf(options: ExportOptions): void {
  const { reviews, branches, dateRange, branchName, companyName = 'Restaurant Feedback System' } = options

  // Create PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  // Title
  doc.setFontSize(18)
  doc.text(companyName, 14, 15)
  
  // Subtitle
  doc.setFontSize(12)
  let subtitle = 'Customer Reviews Report'
  if (branchName) {
    subtitle += ` - ${branchName}`
  }
  if (dateRange) {
    subtitle += ` (${dateRange.startDate.toLocaleDateString('en-US')} - ${dateRange.endDate.toLocaleDateString('en-US')})`
  }
  doc.text(subtitle, 14, 22)

  // Generated date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 14, 28)

  // Prepare table data
  const tableData = reviews.map((review) => {
    const branch = branches.find((b) => b.id === review.branchId)
    return [
      review.createdAt.toDate().toLocaleDateString('en-US'),
      branch?.name || 'Unknown',
      review.rating.toString(),
      review.comment || '-',
      review.customerName || 'Anonymous',
      review.contact || '-',
      review.billId || '-',
    ]
  })

  // Add table
  autoTable(doc, {
    head: [['Date', 'Branch', 'Rating', 'Comment', 'Customer', 'Contact', 'Bill ID']],
    body: tableData,
    startY: 35,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 30 }, // Branch
      2: { cellWidth: 15 }, // Rating
      3: { cellWidth: 60 }, // Comment
      4: { cellWidth: 30 }, // Customer
      5: { cellWidth: 30 }, // Contact
      6: { cellWidth: 20 }, // Bill ID
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 35, left: 14, right: 14 },
  })

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY || 35
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(`Total Reviews: ${reviews.length}`, 14, finalY + 10)
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    doc.text(`Average Rating: ${avgRating.toFixed(2)}`, 14, finalY + 15)
  }

  // Save PDF
  const filename = `reviews-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

