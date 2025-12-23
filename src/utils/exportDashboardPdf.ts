/**
 * Dashboard PDF Export Utility
 * 
 * Exports dashboard visuals (charts and stats) to PDF using html2canvas and jsPDF
 */

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { DateRange } from '../types'

interface ExportOptions {
  dateRange: DateRange
  totals: {
    totalReviews: number
    averageRating: number
    activeBranches: number
    periodReviews: number
  }
  chart1Element: HTMLElement | null // Reviews Over Time chart
  chart2Element: HTMLElement | null // Top Branches chart
}

export async function exportDashboardPdf(options: ExportOptions): Promise<void> {
  const { dateRange, totals, chart1Element, chart2Element } = options

  // Create PDF in landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - (margin * 2)

  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Restaurant Feedback Report', margin, margin + 10)

  // Date range
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  const dateRangeText = `${dateRange.startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })} - ${dateRange.endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}`
  doc.text(`Date Range: ${dateRangeText}`, margin, margin + 18)

  // Generated date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, margin, margin + 24)

  // Summary stats
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary Statistics', margin, margin + 32)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  let yPos = margin + 38
  doc.text(`Total Reviews: ${totals.totalReviews.toLocaleString()}`, margin, yPos)
  yPos += 6
  doc.text(`Average Rating: ${totals.averageRating.toFixed(1)} / 5.0`, margin, yPos)
  yPos += 6
  doc.text(`Active Branches: ${totals.activeBranches}`, margin, yPos)
  yPos += 6
  doc.text(`Period Reviews: ${totals.periodReviews.toLocaleString()}`, margin, yPos)

  // Capture and add charts
  let currentY = margin + 60

  // Chart 1: Reviews Over Time
  if (chart1Element) {
    try {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Reviews Over Time', margin, currentY)
      currentY += 8

      const canvas1 = await html2canvas(chart1Element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      })

      const imgData1 = canvas1.toDataURL('image/png')
      const imgWidth1 = contentWidth
      const imgHeight1 = (canvas1.height * imgWidth1) / canvas1.width

      // Check if we need a new page
      if (currentY + imgHeight1 > pageHeight - margin) {
        doc.addPage()
        currentY = margin
      }

      doc.addImage(imgData1, 'PNG', margin, currentY, imgWidth1, imgHeight1)
      currentY += imgHeight1 + 10
    } catch (err) {
      console.error('Failed to capture chart 1:', err)
      doc.setFontSize(10)
      doc.setTextColor(200, 0, 0)
      doc.text('Failed to capture Reviews Over Time chart', margin, currentY)
      currentY += 10
    }
  }

  // Chart 2: Top Branches
  if (chart2Element) {
    try {
      // Check if we need a new page
      if (currentY > pageHeight - 100) {
        doc.addPage()
        currentY = margin
      }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Top Branches By Reviews', margin, currentY)
      currentY += 8

      const canvas2 = await html2canvas(chart2Element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      })

      const imgData2 = canvas2.toDataURL('image/png')
      const imgWidth2 = contentWidth
      const imgHeight2 = (canvas2.height * imgWidth2) / canvas2.width

      // Check if we need a new page
      if (currentY + imgHeight2 > pageHeight - margin) {
        doc.addPage()
        currentY = margin
      }

      doc.addImage(imgData2, 'PNG', margin, currentY, imgWidth2, imgHeight2)
    } catch (err) {
      console.error('Failed to capture chart 2:', err)
      doc.setFontSize(10)
      doc.setTextColor(200, 0, 0)
      doc.text('Failed to capture Top Branches chart', margin, currentY)
    }
  }

  // Generate filename
  const startDateStr = dateRange.startDate.toISOString().split('T')[0]
  const endDateStr = dateRange.endDate.toISOString().split('T')[0]
  const filename = `feedback-report-${startDateStr}_to_${endDateStr}.pdf`

  // Save PDF
  doc.save(filename)
}

