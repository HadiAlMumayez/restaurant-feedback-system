/**
 * Backups & Export Page
 * 
 * Allows admins to export data for backup and migration purposes.
 * RBAC: Owners can export everything, managers can export only allowed branches, viewers cannot export.
 */

import { useState } from 'react'
import { Download, FileJson, FileSpreadsheet, Loader2, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useRoleGuard } from '../../hooks/useRoleGuard'
import { downloadJson, downloadCsv, timestampToIso } from '../../utils/exportData'
import { getAllBranches } from '../../services/firestore'
import { getAllAdmins } from '../../services/admin'
import { getReviews } from '../../services/firestore'
import type { Branch, Review } from '../../types'
import type { DocumentSnapshot } from 'firebase/firestore'

export default function Backups() {
  const { user, loading: authLoading, allowedBranchIds } = useAuth()
  const { canPerform } = useRoleGuard()
  const [exporting, setExporting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canExport = canPerform('exportReports')

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={48} className="text-brand-500 spinner" />
      </div>
    )
  }

  // Check if user can export
  if (!canExport) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-charcoal mb-2">Access Denied</h2>
          <p className="text-gray-500">Only owners and managers can export data.</p>
        </div>
      </div>
    )
  }

  // Export reviews as JSON
  const handleExportReviewsJson = async () => {
    setExporting('reviews-json')
    setError(null)

    try {
      const reviews: Review[] = []
      let lastDoc: DocumentSnapshot | null = null
      let hasMore = true

      // Paginate through all reviews
      while (hasMore) {
        const result = await getReviews({
          pageSize: 500,
          lastDoc,
          allowedBranchIds, // Respects RBAC
        })

        reviews.push(...result.reviews)
        lastDoc = result.lastDoc
        hasMore = result.hasMore

        // Safety limit: prevent infinite loops
        if (reviews.length > 100000) {
          console.warn('Export limit reached: 100,000 reviews')
          break
        }
      }

      // Convert to export format
      const exportData = reviews.map(review => ({
        id: review.id,
        createdAt: timestampToIso(review.createdAt),
        branchId: review.branchId,
        rating: review.rating,
        comment: review.comment || null,
        customerName: review.customerName || null,
        contact: review.contact || null,
        billId: review.billId || null,
      }))

      const filename = `reviews-export-${new Date().toISOString().split('T')[0]}.json`
      downloadJson(filename, exportData)
    } catch (err: any) {
      console.error('Export failed:', err)
      setError(err?.message || 'Failed to export reviews')
    } finally {
      setExporting(null)
    }
  }

  // Export reviews as CSV
  const handleExportReviewsCsv = async () => {
    setExporting('reviews-csv')
    setError(null)

    try {
      const reviews: Review[] = []
      let lastDoc: DocumentSnapshot | null = null
      let hasMore = true

      // Paginate through all reviews
      while (hasMore) {
        const result = await getReviews({
          pageSize: 500,
          lastDoc,
          allowedBranchIds, // Respects RBAC
        })

        reviews.push(...result.reviews)
        lastDoc = result.lastDoc
        hasMore = result.hasMore

        // Safety limit
        if (reviews.length > 100000) {
          console.warn('Export limit reached: 100,000 reviews')
          break
        }
      }

      // Convert to CSV rows
      const rows = reviews.map(review => [
        review.id,
        timestampToIso(review.createdAt),
        review.branchId,
        review.rating,
        review.comment || '',
        review.customerName || '',
        review.contact || '',
        review.billId || '',
      ])

      const columns = ['id', 'createdAt', 'branchId', 'rating', 'comment', 'customerName', 'contact', 'billId']
      const filename = `reviews-export-${new Date().toISOString().split('T')[0]}.csv`
      downloadCsv(filename, rows, columns)
    } catch (err: any) {
      console.error('Export failed:', err)
      setError(err?.message || 'Failed to export reviews')
    } finally {
      setExporting(null)
    }
  }

  // Export branches as JSON
  const handleExportBranchesJson = async () => {
    setExporting('branches-json')
    setError(null)

    try {
      const branches = await getAllBranches()

      // Filter by RBAC if manager/viewer
      const filteredBranches = allowedBranchIds === null
        ? branches // Owner: all branches
        : branches.filter(b => allowedBranchIds.includes(b.id)) // Manager: only allowed

      // Convert to export format
      const exportData = filteredBranches.map(branch => ({
        id: branch.id,
        name: branch.name,
        location: branch.location,
        address: branch.address || null,
        isActive: branch.isActive,
        createdAt: timestampToIso(branch.createdAt),
        updatedAt: timestampToIso(branch.updatedAt),
      }))

      const filename = `branches-export-${new Date().toISOString().split('T')[0]}.json`
      downloadJson(filename, exportData)
    } catch (err: any) {
      console.error('Export failed:', err)
      setError(err?.message || 'Failed to export branches')
    } finally {
      setExporting(null)
    }
  }

  // Export admins as JSON (owner only)
  const handleExportAdminsJson = async () => {
    setExporting('admins-json')
    setError(null)

    try {
      const admins = await getAllAdmins()

      // Convert to export format
      const exportData = admins.map(admin => ({
        uid: admin.id,
        role: admin.role,
        branchIds: admin.branchIds || null,
        createdAt: timestampToIso(admin.createdAt),
        updatedAt: timestampToIso(admin.updatedAt),
      }))

      const filename = `admins-export-${new Date().toISOString().split('T')[0]}.json`
      downloadJson(filename, exportData)
    } catch (err: any) {
      console.error('Export failed:', err)
      setError(err?.message || 'Failed to export admins')
    } finally {
      setExporting(null)
    }
  }

  const isOwner = allowedBranchIds === null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-charcoal">Backups & Export</h1>
        <p className="text-gray-500">Export your data for backup and migration purposes</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fade-in">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reviews Export */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
              <FileJson size={24} className="text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Reviews</h2>
              <p className="text-sm text-gray-500">Export all customer reviews</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportReviewsJson}
              disabled={!!exporting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl
                       font-medium hover:bg-brand-600 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'reviews-json' ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileJson size={18} />
                  JSON
                </>
              )}
            </button>
            <button
              onClick={handleExportReviewsCsv}
              disabled={!!exporting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl
                       font-medium hover:bg-green-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'reviews-csv' ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={18} />
                  CSV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Branches Export */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Download size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Branches</h2>
              <p className="text-sm text-gray-500">Export branch information</p>
            </div>
          </div>
          <button
            onClick={handleExportBranchesJson}
            disabled={!!exporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl
                     font-medium hover:bg-blue-600 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === 'branches-json' ? (
              <>
                <Loader2 size={18} className="spinner" />
                Exporting...
              </>
            ) : (
              <>
                <FileJson size={18} />
                Export JSON
              </>
            )}
          </button>
        </div>

        {/* Admins Export (Owner only) */}
        {isOwner && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield size={24} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-charcoal">Admins</h2>
                <p className="text-sm text-gray-500">Export admin roles (Owner only)</p>
              </div>
            </div>
            <button
              onClick={handleExportAdminsJson}
              disabled={!!exporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 text-white rounded-xl
                       font-medium hover:bg-purple-600 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'admins-json' ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileJson size={18} />
                  Export JSON
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-charcoal mb-2">Export Information</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Exports respect your role permissions (owners see all, managers see only allowed branches)</li>
          <li>• Large datasets are paginated automatically</li>
          <li>• Timestamps are exported in ISO 8601 format</li>
          <li>• Store exports securely (Cloud Drive, S3, etc.)</li>
          <li>• Recommended: Export weekly for backup purposes</li>
        </ul>
      </div>
    </div>
  )
}

