/**
 * Data Export Utilities
 * 
 * Functions for exporting data to JSON and CSV formats.
 * Used for backups and data migration.
 */

/**
 * Download data as JSON file
 */
export function downloadJson(filename: string, data: any): void {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download data as CSV file
 */
export function downloadCsv(filename: string, rows: any[][], columns: string[]): void {
  // Create CSV content
  const csvRows: string[] = []
  
  // Add header row
  csvRows.push(columns.map(col => escapeCsvValue(col)).join(','))
  
  // Add data rows
  rows.forEach(row => {
    csvRows.push(row.map(cell => escapeCsvValue(cell)).join(','))
  })
  
  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

/**
 * Convert Timestamp to ISO string for export
 */
export function timestampToIso(timestamp: any): string {
  if (!timestamp) return ''
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }
  return String(timestamp)
}

