/**
 * Role Guard Hook
 * 
 * Provides utilities to check admin permissions based on RBAC.
 */

import { useAuth } from '../context/AuthContext'

export function useRoleGuard() {
  const { isAdmin, adminRole, allowedBranchIds } = useAuth()

  // Check if user is owner
  const isOwner = () => isAdmin && adminRole === 'owner'

  // Check if user is manager or owner
  const isManagerOrOwner = () => isAdmin && (adminRole === 'owner' || adminRole === 'manager')

  // Check if user can access a specific branch
  const canAccessBranch = (branchId: string): boolean => {
    if (!isAdmin) return false
    if (adminRole === 'owner') return true // Owners can access all
    if (!allowedBranchIds) return false // No allowed branches
    return allowedBranchIds.includes(branchId)
  }

  // Check if user can perform an action based on role
  const canPerform = (action: 'manageAdmins' | 'manageBranches' | 'exportReports' | 'viewReviews'): boolean => {
    if (!isAdmin) return false

    switch (action) {
      case 'manageAdmins':
        return adminRole === 'owner'
      case 'manageBranches':
        return adminRole === 'owner'
      case 'exportReports':
        return adminRole === 'owner' || adminRole === 'manager'
      case 'viewReviews':
        return true // All admins can view reviews (filtered by branchIds)
      default:
        return false
    }
  }

  // Get allowed branch IDs (null = all, [] = none, [ids] = specific)
  const getAllowedBranchIds = (): string[] | null => {
    return allowedBranchIds
  }

  return {
    isAdmin,
    adminRole,
    isOwner,
    isManagerOrOwner,
    canAccessBranch,
    canPerform,
    getAllowedBranchIds,
  }
}

