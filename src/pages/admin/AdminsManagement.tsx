/**
 * Admins Management Page (RBAC)
 * 
 * Manage admin roles and permissions.
 * Only owners can access this page.
 * 
 * Note: Creating Firebase Auth users requires Firebase Console or Admin SDK.
 */

import { useState, useEffect } from 'react'
import { UserPlus, Trash2, Shield, Eye, Settings, Loader2, X } from 'lucide-react'
import { getAllAdmins, setAdmin, removeAdmin } from '../../services/admin'
import { useAuth } from '../../context/AuthContext'
import { useRoleGuard } from '../../hooks/useRoleGuard'
import { getAllBranches } from '../../services/firestore'
import type { Admin, AdminRole } from '../../types'
import type { Branch } from '../../types'

export default function AdminsManagement() {
  const { user } = useAuth()
  const { isOwner } = useRoleGuard()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uid, setUid] = useState('')
  const [role, setRole] = useState<AdminRole>('viewer')
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)

  // Load admin records and branches
  useEffect(() => {
    if (!isOwner) return
    loadData()
  }, [isOwner])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [adminsData, branchesData] = await Promise.all([
        getAllAdmins(),
        getAllBranches(),
      ])
      setAdmins(adminsData)
      setBranches(branchesData)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load admin records')
    } finally {
      setLoading(false)
    }
  }

  // Handle add/update admin
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!uid.trim()) {
      setError('Firebase Auth UID is required')
      setIsSubmitting(false)
      return
    }

    // Owners don't need branchIds (they have access to all)
    const branchIds = role === 'owner' ? undefined : selectedBranchIds

    try {
      await setAdmin(uid.trim(), {
        role,
        branchIds,
      })

      // Reset form
      setUid('')
      setRole('viewer')
      setSelectedBranchIds([])
      setShowForm(false)
      setEditingAdmin(null)
      await loadData()
    } catch (err) {
      console.error('Failed to save admin:', err)
      setError(err instanceof Error ? err.message : 'Failed to save admin record')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setUid(admin.id)
    setRole(admin.role)
    setSelectedBranchIds(admin.branchIds || [])
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (adminId: string) => {
    if (adminId === user?.uid) {
      setError('You cannot delete your own admin record')
      return
    }

    if (!confirm('Remove admin access? This will not delete the Firebase Auth user.')) {
      return
    }

    try {
      await removeAdmin(adminId)
      await loadData()
    } catch (err) {
      console.error('Failed to remove admin:', err)
      setError('Failed to remove admin record')
    }
  }

  // Get role icon
  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case 'owner':
        return <Shield size={18} className="text-purple-600" />
      case 'manager':
        return <Settings size={18} className="text-blue-600" />
      case 'viewer':
        return <Eye size={18} className="text-gray-600" />
    }
  }

  // Get role label
  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case 'owner':
        return 'Owner'
      case 'manager':
        return 'Manager'
      case 'viewer':
        return 'Viewer'
    }
  }

  // Get branch names for display
  const getBranchNames = (branchIds: string[] | undefined) => {
    if (!branchIds || branchIds.length === 0) return 'All branches'
    return branchIds.map(id => branches.find(b => b.id === id)?.name || id).join(', ')
  }

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-charcoal mb-2">Access Denied</h2>
          <p className="text-gray-500">Only owners can manage admin roles.</p>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-display font-bold text-charcoal">Admin Roles Management</h1>
          <p className="text-gray-500">Manage admin roles and branch access permissions</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingAdmin(null)
              setUid('')
              setRole('viewer')
              setSelectedBranchIds([])
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl
                     font-medium hover:bg-brand-600 transition-colors shadow-md"
          >
            <UserPlus size={20} />
            Add Admin
          </button>
        )}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-charcoal">
              {editingAdmin ? 'Edit Admin' : 'Add Admin'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingAdmin(null)
                setUid('')
                setRole('viewer')
                setSelectedBranchIds([])
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firebase Auth UID *
              </label>
              <input
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                required
                placeholder="User's Firebase Auth UID"
                disabled={!!editingAdmin}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                         focus:border-brand-400 transition-colors disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get the UID from Firebase Console → Authentication → Users
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value as AdminRole
                  setRole(newRole)
                  if (newRole === 'owner') {
                    setSelectedBranchIds([])
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                         focus:border-brand-400 transition-colors"
              >
                <option value="owner">Owner (full access)</option>
                <option value="manager">Manager (view + export, limited branches)</option>
                <option value="viewer">Viewer (view only, limited branches)</option>
              </select>
            </div>

            {role !== 'owner' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Branches
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3">
                  {branches.map((branch) => (
                    <label key={branch.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBranchIds.includes(branch.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBranchIds([...selectedBranchIds, branch.id])
                          } else {
                            setSelectedBranchIds(selectedBranchIds.filter(id => id !== branch.id))
                          }
                        }}
                        className="w-4 h-4 text-brand-500 rounded focus:ring-brand-400"
                      />
                      <span className="text-sm text-gray-700">{branch.name}</span>
                    </label>
                  ))}
                </div>
                {selectedBranchIds.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No branches selected. This admin will not be able to access any reviews.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-brand-500 text-white rounded-xl
                         font-medium hover:bg-brand-600 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : editingAdmin ? 'Update' : 'Add Admin'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingAdmin(null)
                  setUid('')
                  setRole('viewer')
                  setSelectedBranchIds([])
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
          <h2 className="text-lg font-semibold text-charcoal">Admin Roles</h2>
          <p className="text-sm text-gray-500">{admins.length} admin(s) configured</p>
        </div>
        {admins.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <Shield size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No admins configured yet</p>
            <p className="text-sm mt-2">Add an admin to get started</p>
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
                      {getRoleIcon(admin.role)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-charcoal">
                          {admin.id}
                        </h3>
                        <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded text-xs font-medium">
                          {getRoleLabel(admin.role)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {admin.role === 'owner' 
                          ? 'Access to all branches'
                          : `Branches: ${getBranchNames(admin.branchIds)}`
                        }
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created {admin.createdAt.toDate().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(admin)}
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Settings size={18} />
                    </button>
                    {admin.id !== user?.uid && (
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
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
