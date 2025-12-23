/**
 * Dashboard PDF Export Utility (Professional Multi-Page Report)
 * 
 * Exports dashboard data to a high-quality PDF report with:
 * - Cover page with summary statistics
 * - Charts page with visualizations
 * - Tables & insights page with detailed analysis
 * - Header and footer on all pages
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import type { DateRange } from '../types'

interface ExportOptions {
  brandName?: string
  dateRange: DateRange
  totals: {
    totalReviews: number
    averageRating: number
    activeBranches: number
    periodReviews: number
  }
  branchStats: Array<{
    branchId: string
    branchName: string
    totalReviews: number
    averageRating: number
  }>
  dailyStats: Array<{
    date: string // YYYY-MM-DD format
    count: number
    averageRating: number
  }>
  chart1Element: HTMLElement | null // Reviews Over Time chart
  chart2Element: HTMLElement | null // Top Branches chart
  userEmail?: string
}

// Helper to add header to a page
function addHeader(doc: jsPDF, brandName: string, dateRange: DateRange, pageNum: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  
  // Header line
  doc.setDrawColor(237, 120, 33) // Brand color
  doc.setLineWidth(0.5)
  doc.line(margin, 10, pageWidth - margin, 10)
  
  // Brand name (left)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(237, 120, 33)
  doc.text(brandName, margin, 7)
  
  // Date range (right)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const dateRangeText = `${dateRange.startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${dateRange.endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
  const dateWidth = doc.getTextWidth(dateRangeText)
  doc.text(dateRangeText, pageWidth - margin - dateWidth, 7)
}

// Helper to add footer to a page
function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  
  // Footer line
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
  
  // Page number and timestamp
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const pageText = `Page ${pageNum} of ${totalPages}`
  doc.text(pageText, margin, pageHeight - 10)
  
  const timestamp = new Date().toLocaleString('en-US')
  const timestampWidth = doc.getTextWidth(timestamp)
  doc.text(timestamp, pageWidth - margin - timestampWidth, pageHeight - 10)
}

// Calculate insights from data
function calculateInsights(
  branchStats: ExportOptions['branchStats'],
  dailyStats: ExportOptions['dailyStats'],
  totals: ExportOptions['totals']
) {
  // Best branch (highest avg rating, min 3 reviews)
  const eligibleBranches = branchStats.filter(b => b.totalReviews >= 3)
  const bestBranch = eligibleBranches.length > 0
    ? eligibleBranches.reduce((best, curr) => 
        curr.averageRating > best.averageRating ? curr : best
      )
    : null

  // Worst branch (lowest avg rating, min 3 reviews)
  const worstBranch = eligibleBranches.length > 0
    ? eligibleBranches.reduce((worst, curr) => 
        curr.averageRating < worst.averageRating ? curr : worst
      )
    : null

  // Peak review day
  const peakDay = dailyStats.length > 0
    ? dailyStats.reduce((peak, curr) => 
        curr.count > peak.count ? curr : peak
      )
    : null

  // Calculate rating distribution
  // Note: We don't have individual review ratings here, so we'll use branch averages
  // For a more accurate distribution, we'd need to fetch all reviews (not done for performance)
  // TODO: If needed for production, consider adding a Cloud Function to calculate this server-side
  
  // Positive ratings (4-5) and low ratings (1-2) percentages
  // Using branch average ratings as approximation
  const totalBranchRatings = branchStats.reduce((sum, b) => sum + b.totalReviews, 0)
  const positiveCount = branchStats
    .filter(b => b.averageRating >= 4)
    .reduce((sum, b) => sum + b.totalReviews, 0)
  const lowCount = branchStats
    .filter(b => b.averageRating <= 2)
    .reduce((sum, b) => sum + b.totalReviews, 0)
  
  const positivePercent = totalBranchRatings > 0
    ? ((positiveCount / totalBranchRatings) * 100).toFixed(1)
    : '0.0'
  const lowPercent = totalBranchRatings > 0
    ? ((lowCount / totalBranchRatings) * 100).toFixed(1)
    : '0.0'

  return {
    bestBranch,
    worstBranch,
    peakDay,
    positivePercent,
    lowPercent,
  }
}

export async function exportDashboardPdf(options: ExportOptions): Promise<void> {
  const {
    brandName = 'Restaurant',
    dateRange,
    totals,
    branchStats,
    dailyStats,
    chart1Element,
    chart2Element,
    userEmail,
  } = options

  // Create PDF in portrait orientation (A4)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - (margin * 2)

  // Calculate insights
  const insights = calculateInsights(branchStats, dailyStats, totals)

  // ============================================
  // PAGE 1: COVER & SUMMARY
  // ============================================
  addHeader(doc, brandName, dateRange, 1, 3)
  
  // Title
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Restaurant Feedback Report', margin, 40)

  // Date range
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  const dateRangeText = `${dateRange.startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} - ${dateRange.endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`
  doc.text(dateRangeText, margin, 50)

  // Generated timestamp
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, margin, 56)
  if (userEmail) {
    doc.text(`Generated by: ${userEmail}`, margin, 62)
  }

  // Summary cards section
  let yPos = 75
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Summary Statistics', margin, yPos)
  yPos += 10

  // Create summary cards as boxes
  const cardWidth = (contentWidth - 10) / 2
  const cardHeight = 25
  const cardSpacing = 10

  // Card 1: Total Reviews
  doc.setDrawColor(237, 120, 33)
  doc.setFillColor(255, 247, 240)
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'FD')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Total Reviews', margin + 5, yPos + 8)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(totals.totalReviews.toLocaleString(), margin + 5, yPos + 18)

  // Card 2: Average Rating
  doc.roundedRect(margin + cardWidth + cardSpacing, yPos, cardWidth, cardHeight, 3, 3, 'FD')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Average Rating', margin + cardWidth + cardSpacing + 5, yPos + 8)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`${totals.averageRating.toFixed(1)} / 5.0`, margin + cardWidth + cardSpacing + 5, yPos + 18)

  yPos += cardHeight + cardSpacing

  // Card 3: Active Branches
  doc.roundedRect(margin, yPos, cardWidth, cardHeight, 3, 3, 'FD')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Active Branches', margin + 5, yPos + 8)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(totals.activeBranches.toString(), margin + 5, yPos + 18)

  // Card 4: Period Reviews
  doc.roundedRect(margin + cardWidth + cardSpacing, yPos, cardWidth, cardHeight, 3, 3, 'FD')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Reviews in Period', margin + cardWidth + cardSpacing + 5, yPos + 8)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(totals.periodReviews.toLocaleString(), margin + cardWidth + cardSpacing + 5, yPos + 18)

  addFooter(doc, 1, 3)

  // ============================================
  // PAGE 2: CHARTS
  // ============================================
  doc.addPage()
  addHeader(doc, brandName, dateRange, 2, 3)

  let currentY = 25

  // Chart 1: Reviews Over Time
  if (chart1Element) {
    try {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Reviews Over Time', margin, currentY)
      currentY += 8

      const canvas1 = await html2canvas(chart1Element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData1 = canvas1.toDataURL('image/png')
      const imgWidth1 = contentWidth
      const imgHeight1 = (canvas1.height * imgWidth1) / canvas1.width

      // Ensure chart fits on page
      const maxHeight = pageHeight - currentY - 30 // Leave space for footer
      const finalHeight1 = Math.min(imgHeight1, maxHeight)
      const finalWidth1 = (canvas1.width * finalHeight1) / canvas1.height

      doc.addImage(imgData1, 'PNG', margin, currentY, finalWidth1, finalHeight1)
      currentY += finalHeight1 + 15
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
      // Check if we need a new page (but we're already on page 2, so continue)
      if (currentY > pageHeight - 100) {
        // Would add new page, but for this layout we'll continue
        currentY = 25
      }

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Top Branches By Reviews', margin, currentY)
      currentY += 8

      const canvas2 = await html2canvas(chart2Element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData2 = canvas2.toDataURL('image/png')
      const imgWidth2 = contentWidth
      const imgHeight2 = (canvas2.height * imgWidth2) / canvas2.width

      // Ensure chart fits on page
      const maxHeight = pageHeight - currentY - 30
      const finalHeight2 = Math.min(imgHeight2, maxHeight)
      const finalWidth2 = (canvas2.width * finalHeight2) / canvas2.height

      doc.addImage(imgData2, 'PNG', margin, currentY, finalWidth2, finalHeight2)
    } catch (err) {
      console.error('Failed to capture chart 2:', err)
      doc.setFontSize(10)
      doc.setTextColor(200, 0, 0)
      doc.text('Failed to capture Top Branches chart', margin, currentY)
    }
  }

  addFooter(doc, 2, 3)

  // ============================================
  // PAGE 3: TABLES & INSIGHTS
  // ============================================
  doc.addPage()
  addHeader(doc, brandName, dateRange, 3, 3)

  currentY = 25

  // Table: Top Branches
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Top Branches', margin, currentY)
  currentY += 8

  const topBranchesSorted = [...branchStats]
    .sort((a, b) => b.totalReviews - a.totalReviews)
    .slice(0, 10) // Top 10

  autoTable(doc, {
    startY: currentY,
    head: [['Branch Name', 'Review Count', 'Avg Rating']],
    body: topBranchesSorted.map(branch => [
      branch.branchName,
      branch.totalReviews.toString(),
      branch.averageRating.toFixed(2),
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [237, 120, 33],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 15

  // Rating Distribution Table
  // Calculate distribution from branch stats (approximation)
  // TODO: For accurate distribution, fetch all reviews server-side via Cloud Function
  const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  // Approximate distribution based on branch averages
  branchStats.forEach(branch => {
    const roundedRating = Math.round(branch.averageRating)
    if (roundedRating >= 1 && roundedRating <= 5) {
      ratingCounts[roundedRating] += branch.totalReviews
    }
  })

  const totalRatings = Object.values(ratingCounts).reduce((sum, count) => sum + count, 0)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Rating Distribution', margin, currentY)
  currentY += 8

  autoTable(doc, {
    startY: currentY,
    head: [['Rating', 'Count', '%']],
    body: [1, 2, 3, 4, 5].map(rating => {
      const count = ratingCounts[rating] || 0
      const percent = totalRatings > 0 ? ((count / totalRatings) * 100).toFixed(1) : '0.0'
      return [rating.toString(), count.toString(), `${percent}%`]
    }),
    theme: 'striped',
    headStyles: {
      fillColor: [237, 120, 33],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 40, halign: 'center' },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: 50, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 15

  // Insights Section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Key Insights', margin, currentY)
  currentY += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  if (insights.bestBranch) {
    doc.text(
      `Best Branch: ${insights.bestBranch.branchName} (${insights.bestBranch.averageRating.toFixed(2)} avg, ${insights.bestBranch.totalReviews} reviews)`,
      margin,
      currentY
    )
    currentY += 7
  }

  if (insights.worstBranch) {
    doc.text(
      `Worst Branch: ${insights.worstBranch.branchName} (${insights.worstBranch.averageRating.toFixed(2)} avg, ${insights.worstBranch.totalReviews} reviews)`,
      margin,
      currentY
    )
    currentY += 7
  }

  if (insights.peakDay) {
    const peakDate = new Date(insights.peakDay.date)
    doc.text(
      `Peak Review Day: ${peakDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${insights.peakDay.count} reviews)`,
      margin,
      currentY
    )
    currentY += 7
  }

  doc.text(`Positive Ratings (4-5): ${insights.positivePercent}%`, margin, currentY)
  currentY += 7
  doc.text(`Low Ratings (1-2): ${insights.lowPercent}%`, margin, currentY)

  addFooter(doc, 3, 3)

  // Generate filename
  const startDateStr = dateRange.startDate.toISOString().split('T')[0]
  const endDateStr = dateRange.endDate.toISOString().split('T')[0]
  const filename = `feedback-report-${startDateStr}_to_${endDateStr}.pdf`

  // Save PDF
  doc.save(filename)
}
