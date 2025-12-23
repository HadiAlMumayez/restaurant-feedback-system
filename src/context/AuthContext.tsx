/**
 * Authentication Context
 * 
 * Provides Firebase Auth state and admin RBAC to the entire application.
 * Handles login, logout, auth state persistence, and admin role loading.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { getAdmin } from '../services/admin'
import type { Admin, AdminRole } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  // Admin RBAC
  isAdmin: boolean
  adminRole: AdminRole | null
  allowedBranchIds: string[] | null // null means all branches (owner), [] means none, [ids] means specific branches
  loginWithEmail: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Admin RBAC state
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null)
  const [allowedBranchIds, setAllowedBranchIds] = useState<string[] | null>(null)

  // Load admin data when user changes
  useEffect(() => {
    const loadAdminData = async (uid: string) => {
      try {
        const admin = await getAdmin(uid)
        if (admin) {
          setIsAdmin(true)
          setAdminRole(admin.role)
          // Owners have null (all branches), others have array (specific or empty)
          setAllowedBranchIds(admin.role === 'owner' ? null : (admin.branchIds || []))
        } else {
          setIsAdmin(false)
          setAdminRole(null)
          setAllowedBranchIds(null)
        }
      } catch (err) {
        console.error('Failed to load admin data:', err)
        setIsAdmin(false)
        setAdminRole(null)
        setAllowedBranchIds(null)
      }
    }

    if (user) {
      loadAdminData(user.uid)
    } else {
      setIsAdmin(false)
      setAdminRole(null)
      setAllowedBranchIds(null)
    }
  }, [user])

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Email/Password login
  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const message = getAuthErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  // Google login
  const loginWithGoogle = async () => {
    try {
      setError(null)
      setLoading(true)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      const message = getAuthErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Clear error
  const clearError = () => setError(null)

  const value = {
    user,
    loading,
    error,
    isAdmin,
    adminRole,
    allowedBranchIds,
    loginWithEmail,
    loginWithGoogle,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper to get user-friendly error messages
function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address.'
      case 'auth/user-disabled':
        return 'This account has been disabled.'
      case 'auth/user-not-found':
        return 'No account found with this email.'
      case 'auth/wrong-password':
        return 'Incorrect password.'
      case 'auth/invalid-credential':
        return 'Invalid email or password.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'auth/popup-closed-by-user':
        return 'Login cancelled.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.'
      default:
        return 'An error occurred during login.'
    }
  }
  return 'An unexpected error occurred.'
}

