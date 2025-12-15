/**
 * Admin Management Service
 * 
 * Note: Creating Firebase Auth users requires Admin SDK (server-side).
 * This service tracks admin emails in Firestore and provides helper functions.
 * To actually create users, use Firebase Console or a backend function.
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const ADMINS_COLLECTION = 'admins'

export interface AdminRecord {
  id: string
  email: string
  displayName?: string
  createdAt: Timestamp
  createdBy?: string
}

// Get all admin records from Firestore
export async function getAdminRecords(): Promise<AdminRecord[]> {
  const snapshot = await getDocs(collection(db, ADMINS_COLLECTION))
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as AdminRecord[]
}

// Add an admin record (tracking only - user must be created in Firebase Auth separately)
export async function addAdminRecord(data: {
  email: string
  displayName?: string
  createdBy?: string
}): Promise<string> {
  // Check if email already exists
  const existing = await getDocs(
    query(collection(db, ADMINS_COLLECTION), where('email', '==', data.email.toLowerCase().trim()))
  )
  
  if (!existing.empty) {
    throw new Error('Admin with this email already exists')
  }

  const adminRecord = {
    email: data.email.toLowerCase().trim(),
    displayName: data.displayName?.trim() || null,
    createdAt: Timestamp.now(),
    createdBy: data.createdBy || null,
  }

  const docRef = await addDoc(collection(db, ADMINS_COLLECTION), adminRecord)
  return docRef.id
}

// Remove an admin record
export async function removeAdminRecord(adminId: string): Promise<void> {
  const docRef = doc(db, ADMINS_COLLECTION, adminId)
  await deleteDoc(docRef)
}

