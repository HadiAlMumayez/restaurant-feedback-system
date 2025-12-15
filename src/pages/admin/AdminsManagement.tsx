/**
 * Admins Management Page
 * 
 * View and manage admin users.
 * Note: Creating Firebase Auth users requires Firebase Console or Admin SDK.
 */

import { useState, useEffect } from 'react'
import { UserPlus, Trash2, Mail, User, ExternalLink, Info, Loader2, Copy, Check } from 'lucide-react'
import { getAdminRecords, addAdminRecord, removeAdminRecord } from '../../services/admin'
import { useAuth } from '../../context/AuthContext'
import type { AdminRecord } from '../../services/admin'

export default function AdminsManagement() {
  const { user } = useAuth()
  const [admins, setAdmins] = useState<AdminRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  // Load admin records
  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminRecords()
      setAdmins(data)
    } catch (err) {
      console.error('Failed to load admins:', err)
      setError('Failed to load admin records')
    } finally {
      setLoading(false)
    }
  }

  // Handle add admin record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      await addAdminRecord({
        email,
        displayName: displayName || undefined,
        createdBy: user?.email || undefined,
      })

      // Reset form
      setEmail('')
      setDisplayName('')
      setShowForm(false)
      await loadAdmins()
    } catch (err) {
      console.error('Failed to add admin:', err)
      setError(err instanceof Error ? err.message : 'Failed to add admin record')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Remove admin record for "${adminEmail}"? This will not delete the Firebase Auth user.`)) {
      return
    }

    try {
      await removeAdminRecord(adminId)
      await loadAdmins()
    } catch (err) {
      console.error('Failed to remove admin:', err)
      setError('Failed to remove admin record')
    }
  }

  // Copy email to clipboard
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  // Get Firebase Console URL
  const getFirebaseAuthUrl = () => {
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
    return `https://console.firebase.google.com/project/${projectId}/authentication/users`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={48} className="text-brand-500 spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-charcoal">Admins Management</h1>
          <p className="text-gray-500">Manage admin user access</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl
                     font-medium hover:bg-brand-600 transition-colors shadow-md"
          >
            <UserPlus size={20} />
            Track Admin
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-medium mb-1">How to Add New Admins</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Go to <a href={getFirebaseAuthUrl()} target="_blank" rel="noopener noreferrer" className="underline font-medium">Firebase Console → Authentication → Users</a></li>
              <li>Click "Add user" and enter the admin's email and password</li>
              <li>Come back here and click "Track Admin" to add their email to the tracking list</li>
            </ol>
            <p className="text-xs text-blue-700 mt-2">
              Note: This page tracks admin emails. The actual user account must be created in Firebase Console.
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fade-in">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-charcoal mb-4">Track New Admin</h2>
          <p className="text-sm text-gray-500 mb-4">
            Add an admin email to the tracking list. Make sure the user account is already created in Firebase Console.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@restaurant.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                         focus:border-brand-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name (optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                         focus:border-brand-400 transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-brand-500 text-white rounded-xl
                         font-medium hover:bg-brand-600 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Admin'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEmail('')
                  setDisplayName('')
                }}
                disabled={isSubmitting}
                className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl
                         font-medium hover:bg-gray-50 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-charcoal">Tracked Admins</h2>
          <p className="text-sm text-gray-500">Admin emails tracked in the system</p>
        </div>
        {admins.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <User size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No admins tracked yet</p>
            <p className="text-sm mt-2">Click "Track Admin" to add an admin email</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="p-6 hover:bg-brand-50/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                      <Mail size={24} className="text-brand-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-charcoal">
                          {admin.displayName || admin.email}
                        </h3>
                        {admin.displayName && (
                          <span className="text-sm text-gray-400">({admin.email})</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Added {admin.createdAt.toDate().toLocaleDateString()}
                        {admin.createdBy && ` by ${admin.createdBy}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyEmail(admin.email)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy email"
                    >
                      {copiedEmail === admin.email ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                    <a
                      href={getFirebaseAuthUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Open Firebase Console"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <button
                      onClick={() => handleDelete(admin.id, admin.email)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from tracking"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

