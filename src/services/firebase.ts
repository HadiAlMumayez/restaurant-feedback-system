/**
 * Firebase Configuration and Initialization
 * 
 * This file initializes the Firebase app and exports service instances.
 * Environment variables are loaded from .env file (prefixed with VITE_)
 */

import { initializeApp, getApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

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
let app
try {
  app = initializeApp(firebaseConfig)
  console.log('[Firebase] App initialized successfully')
} catch (error: any) {
  console.error('[Firebase] Failed to initialize app:', error)
  // If app already exists, get it
  if (error?.code === 'app/duplicate-app') {
    app = getApp()
    console.log('[Firebase] Using existing app instance')
  } else {
    throw error
  }
}

// Initialize Firestore
export const db = getFirestore(app)
console.log('[Firebase] Firestore initialized:', !!db)

// Try to enable persistence (will fail if multiple tabs open, that's OK)
try {
  enableIndexedDbPersistence(db).catch((err: any) => {
    if (err.code === 'failed-precondition') {
      console.warn('[Firebase] Persistence already enabled in another tab')
    } else if (err.code === 'unimplemented') {
      console.warn('[Firebase] Persistence not supported in this browser')
    } else {
      console.error('[Firebase] Persistence error:', err)
    }
  })
} catch (err) {
  console.warn('[Firebase] Could not enable persistence:', err)
}

// Initialize Auth
export const auth = getAuth(app)
console.log('[Firebase] Auth initialized:', !!auth)

// Initialize App Check (reCAPTCHA v3)
// Note: In development, App Check uses a debug token
// In production, ensure VITE_RECAPTCHA_SITE_KEY is set
if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    })
    console.log('[Firebase] App Check initialized with reCAPTCHA v3')
  } catch (err) {
    console.warn('[Firebase] App Check initialization failed:', err)
  }
} else {
  console.warn('[Firebase] App Check not initialized: VITE_RECAPTCHA_SITE_KEY not set')
}

// Connect to emulators in development (optional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectAuthEmulator(auth, 'http://localhost:9099')
  console.log('Connected to Firebase emulators')
}

export default app

