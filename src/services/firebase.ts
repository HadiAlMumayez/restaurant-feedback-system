/**
 * Firebase Configuration and Initialization
 * 
 * This file initializes the Firebase app and exports service instances.
 * Environment variables are loaded from .env file (prefixed with VITE_)
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

// Firebase configuration from environment variables
// These are safe to expose in client-side code (they identify the project, not authenticate)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate required config
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const
for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    console.error(`Missing Firebase config: ${key}. Check your .env file.`)
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

// Connect to emulators in development (optional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectAuthEmulator(auth, 'http://localhost:9099')
  console.log('Connected to Firebase emulators')
}

export default app

