/**
 * Branches Management Page
 * 
 * Create, edit, and manage restaurant branches.
 */

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, Building2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { getAllBranches, createBranch, updateBranch, deleteBranch } from '../../services/firestore'
import type { Branch } from '../../types'

interface BranchFormData {
  name: string
  location: string
  address: string
  isActive: boolean
}

export default function BranchesManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    location: '',
    address: '',
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load branches
  useEffect(() => {
    loadBranches()
  }, [])

  const loadBranches = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllBranches()
      setBranches(data)
    } catch (err) {
      console.error('Failed to load branches:', err)
      setError('Failed to load branches')
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingBranch) {
        // Update existing branch
        await updateBranch(editingBranch.id, {
          name: formData.name,
          location: formData.location,
          address: formData.address || undefined,
          isActive: formData.isActive,
        })
      } else {
        // Create new branch
        await createBranch({
          name: formData.name,
          location: formData.location,
          address: formData.address || undefined,
          isActive: formData.isActive,
        })
      }

      // Reset form and reload
      setFormData({ name: '', location: '', address: '', isActive: true })
      setShowForm(false)
      setEditingBranch(null)
      await loadBranches()
    } catch (err) {
      console.error('Failed to save branch:', err)
      setError(err instanceof Error ? err.message : 'Failed to save branch')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      location: branch.location,
      address: branch.address || '',
      isActive: branch.isActive,
    })
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (branchId: string, branchName: string) => {
    if (!confirm(`Are you sure you want to delete "${branchName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteBranch(branchId)
      await loadBranches()
    } catch (err) {
      console.error('Failed to delete branch:', err)
      setError('Failed to delete branch')
    }
  }

  // Toggle active status
  const handleToggleActive = async (branch: Branch) => {
    try {
      await updateBranch(branch.id, { isActive: !branch.isActive })
      await loadBranches()
    } catch (err) {
      console.error('Failed to update branch:', err)
      setError('Failed to update branch status')
    }
  }

  // Cancel form
  const handleCancel = () => {
    setShowForm(false)
    setEditingBranch(null)
    setFormData({ name: '', location: '', address: '', isActive: true })
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
          <h1 className="text-2xl font-display font-bold text-charcoal">Branches Management</h1>
          <p className="text-gray-500">Create and manage restaurant branches</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl
                     font-medium hover:bg-brand-600 transition-colors shadow-md"
          >
            <Plus size={20} />
            Add Branch
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
          <h2 className="text-xl font-semibold text-charcoal mb-4">
            {editingBranch ? 'Edit Branch' : 'Add New Branch'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Downtown Branch"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                         focus:border-brand-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="123 Main Street"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                         focus:border-brand-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address (optional)
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street, Suite 100, New York, NY 10001"
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                         focus:border-brand-400 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-brand-500 rounded focus:ring-brand-400"
                />
                <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-brand-500 text-white rounded-xl
                         font-medium hover:bg-brand-600 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
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

      {/* Branches list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {branches.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No branches yet</p>
            <p className="text-sm mt-2">Click "Add Branch" to create your first branch</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="p-6 hover:bg-brand-50/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                        <MapPin size={24} className="text-brand-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-charcoal">{branch.name}</h3>
                        <p className="text-gray-500">{branch.location}</p>
                        {branch.address && (
                          <p className="text-sm text-gray-400 mt-1">{branch.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 ml-16">
                      <button
                        onClick={() => handleToggleActive(branch)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${branch.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        {branch.isActive ? (
                          <>
                            <ToggleRight size={18} />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={18} />
                            Inactive
                          </>
                        )}
                      </button>
                      <span className="text-xs text-gray-400">
                        ID: {branch.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Edit branch"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id, branch.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete branch"
                    >
                      <Trash2 size={20} />
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

