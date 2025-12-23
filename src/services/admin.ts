/**
 * Admin Management Service (RBAC)
 * 
 * Manages admin roles and permissions in Firestore.
 * Document ID: Firebase Auth UID
 * Fields: role, branchIds, timestamps
 * 
 * Note: Creating Firebase Auth users requires Admin SDK (server-side).
 * To actually create users, use Firebase Console or a backend function.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Admin, AdminRole } from '../types'

const ADMINS_COLLECTION = 'admins'

// Get admin document by UID (for current user)
export async function getAdmin(uid: string): Promise<Admin | null> {
  const docRef = doc(db, ADMINS_COLLECTION, uid)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) {
    return null
  }
  
  const data = docSnap.data()
  return {
    id: docSnap.id,
    role: data.role as AdminRole,
    branchIds: data.branchIds || undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Admin
}

// Get all admin records (for owners to manage)
export async function getAllAdmins(): Promise<Admin[]> {
  const snapshot = await getDocs(collection(db, ADMINS_COLLECTION))
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      role: data.role as AdminRole,
      branchIds: data.branchIds || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Admin
  })
}

// Create or update an admin record (owners only)
export async function setAdmin(uid: string, data: {
  role: AdminRole
  branchIds?: string[]
}): Promise<void> {
  const docRef = doc(db, ADMINS_COLLECTION, uid)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    // Update existing
    await updateDoc(docRef, {
      role: data.role,
      branchIds: data.branchIds || null,
      updatedAt: serverTimestamp(),
    })
  } else {
    // Create new
    await setDoc(docRef, {
      role: data.role,
      branchIds: data.branchIds || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

// Remove an admin record (owners only, cannot delete self)
export async function removeAdmin(uid: string): Promise<void> {
  const docRef = doc(db, ADMINS_COLLECTION, uid)
  await deleteDoc(docRef)
}

