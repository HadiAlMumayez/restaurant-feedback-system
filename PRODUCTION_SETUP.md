# Production Setup Guide

This guide covers the production-grade features implemented in the Restaurant Feedback System.

## Table of Contents

1. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
2. [Firebase App Check & Anti-Abuse](#firebase-app-check--anti-abuse)
3. [Export Reports](#export-reports)
4. [Performance Optimizations](#performance-optimizations)
5. [Environment Variables](#environment-variables)
6. [Testing Roles](#testing-roles)

---

## Role-Based Access Control (RBAC)

### Overview

The system implements three admin roles:

- **Owner**: Full access to all features and branches
- **Manager**: Can view analytics/reviews and export reports, but only for allowed branches
- **Viewer**: Can only view analytics/reviews (no exports, no admin/branch management), only for allowed branches

### Data Model

Admin roles are stored in Firestore collection `admins`:

```
admins/{uid}
  - role: "owner" | "manager" | "viewer"
  - branchIds: string[] (optional, for managers/viewers)
  - createdAt: timestamp
  - updatedAt: timestamp
```

**Document ID**: Firebase Auth UID (not email)

### Setting Up Admin Roles

#### 1. Create Firebase Auth User

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email and password (or use Google sign-in)
4. Copy the **UID** (shown in the user list)

#### 2. Create Admin Document

**Option A: Using Admin Dashboard (Recommended)**

1. Log in as an **owner**
2. Go to `/admin/admins`
3. Click "Add Admin"
4. Enter the Firebase Auth UID
5. Select role:
   - **Owner**: Full access (no branch selection needed)
   - **Manager**: Can export, select allowed branches
   - **Viewer**: View only, select allowed branches
6. For managers/viewers, check the branches they can access
7. Click "Add Admin"

**Option B: Using Firebase Console**

1. Go to Firestore Database
2. Create document in `admins` collection
3. Document ID = Firebase Auth UID
4. Add fields:
   ```json
   {
     "role": "owner",
     "branchIds": null,
     "createdAt": [server timestamp],
     "updatedAt": [server timestamp]
   }
   ```

### Example Admin Documents

**Owner (full access):**
```json
{
  "role": "owner",
  "branchIds": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Manager (limited branches):**
```json
{
  "role": "manager",
  "branchIds": ["branch-id-1", "branch-id-2"],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Viewer (limited branches):**
```json
{
  "role": "viewer",
  "branchIds": ["branch-id-1"],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Firestore Security Rules

The security rules enforce RBAC server-side:

- **Branches**: Public can read only active branches; owners can create/update
- **Reviews**: Public can create; admins can read (filtered by branchIds for managers/viewers)
- **Admins**: Only owners can manage admin records

Rules are in `firestore.rules` and should be deployed:

```bash
firebase deploy --only firestore:rules
```

---

## Firebase App Check & Anti-Abuse

### Firebase App Check Setup

1. **Get reCAPTCHA v3 Site Key**
   - Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
   - Create a new site (reCAPTCHA v3)
   - Add your domain(s)
   - Copy the **Site Key**

2. **Add to Environment Variables**
   ```env
   VITE_RECAPTCHA_SITE_KEY=your-site-key-here
   ```

3. **Enable App Check in Firebase Console**
   - Go to Firebase Console → Build → App Check
   - Click "Get Started"
   - Register your web app
   - Select "reCAPTCHA v3"
   - Enter your site key
   - **Enable enforcement** (recommended for production)

### Anti-Abuse Features

The system includes multiple anti-abuse measures:

1. **Honeypot Field**: Hidden field that bots may fill (submissions with filled honeypot are rejected)
2. **Submission Cooldown**: Prevents same device from submitting more than once every 5 seconds
3. **Firebase App Check**: Validates requests are from legitimate app instances
4. **Firestore Security Rules**: Server-side validation of all data

### Testing App Check

In development, App Check uses a debug token. To test:

1. Open browser console
2. Look for App Check debug token
3. Add it in Firebase Console → App Check → Apps → Your App → Debug tokens

---

## Export Reports

### Features

- **PDF Export**: Formatted reports with tables and summaries
- **Excel Export**: Spreadsheet with data and summary sheet
- **RBAC Respect**: Only owners and managers can export (viewers cannot)

### Usage

1. Go to `/admin/reviews`
2. Apply filters (date range, branch, rating) as needed
3. Click "Export" button (visible only to owners/managers)
4. Choose "Export PDF" or "Export Excel"
5. File downloads automatically

### Export Contents

**PDF:**
- Company/branch name
- Date range
- Generated timestamp
- Table with: Date, Branch, Rating, Comment, Customer, Contact, Bill ID
- Summary: Total reviews, Average rating

**Excel:**
- **Reviews Sheet**: All review data in table format
- **Summary Sheet**: Report info, totals, average rating, rating distribution

---

## Performance Optimizations

### Firestore Indexes

The system uses Firestore queries with proper indexes. Required indexes are defined in `firestore.indexes.json`.

**Deploy indexes:**
```bash
firebase deploy --only firestore:indexes
```

Or manually create in Firebase Console → Firestore → Indexes.

### Query Optimization

- Uses `where` clauses for branch filtering when possible
- Falls back to client-side filtering for complex queries (>10 branchIds)
- Implements pagination with cursor-based navigation
- Limits query results to avoid large data transfers

### RBAC Query Filtering

- **Owners**: No branch filtering (queries all reviews)
- **Managers/Viewers**: Uses Firestore `where('branchId', 'in', allowedBranchIds)` when ≤10 branches
- **Managers/Viewers with >10 branches**: Client-side filtering (less efficient but works)

---

## Environment Variables

### Required

```env
# Firebase Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Optional

```env
# Firebase App Check (reCAPTCHA v3)
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Firebase Emulators (development only)
VITE_USE_EMULATORS=false
```

---

## Testing Roles

### Test Owner

1. Create Firebase Auth user
2. Create admin document:
   ```json
   {
     "role": "owner",
     "branchIds": null
   }
   ```
3. Log in → Should see all features, all branches

### Test Manager

1. Create Firebase Auth user
2. Create admin document:
   ```json
   {
     "role": "manager",
     "branchIds": ["branch-id-1", "branch-id-2"]
   }
   ```
3. Log in → Should see:
   - ✅ Dashboard, Reviews, Customers pages
   - ✅ Export buttons
   - ❌ Branches management (hidden)
   - ❌ Admins management (hidden)
   - Only reviews for selected branches

### Test Viewer

1. Create Firebase Auth user
2. Create admin document:
   ```json
   {
     "role": "viewer",
     "branchIds": ["branch-id-1"]
   }
   ```
3. Log in → Should see:
   - ✅ Dashboard, Reviews, Customers pages
   - ❌ Export buttons (hidden)
   - ❌ Branches management (hidden)
   - ❌ Admins management (hidden)
   - Only reviews for selected branch

---

## Package Installation

Install required packages:

```bash
npm install firebase/app-check xlsx jspdf jspdf-autotable
```

Or if using yarn:

```bash
yarn add firebase/app-check xlsx jspdf jspdf-autotable
```

---

## Deployment Checklist

- [ ] Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Set environment variables in Vercel/Netlify
- [ ] Enable Firebase App Check in Firebase Console
- [ ] Create at least one owner admin document
- [ ] Test login with owner account
- [ ] Test role-based access (create manager/viewer accounts)
- [ ] Test export functionality
- [ ] Test anti-abuse features (cooldown, honeypot)
- [ ] Verify App Check is working (check Firebase Console → App Check)

---

## Security Notes

1. **Firestore Rules are the Source of Truth**: UI-level permission checks are for UX only. All security is enforced server-side.
2. **Admin Documents Required**: Users must have an admin document in `admins/{uid}` to access the dashboard.
3. **App Check**: Recommended for production to prevent abuse and unauthorized API access.
4. **Honeypot & Cooldown**: Client-side protections that help reduce spam but are not foolproof. App Check and Firestore rules provide server-side security.

---

## Troubleshooting

### "Access Denied" after login

- Check that admin document exists in `admins/{uid}` where `uid` is the Firebase Auth UID
- Verify the document has `role` field set to "owner", "manager", or "viewer"

### Export button not showing

- Verify user role is "owner" or "manager" (viewers cannot export)
- Check `canPerform('exportReports')` in browser console

### Reviews not showing for manager/viewer

- Check `branchIds` array in admin document
- Verify branch IDs match actual branch document IDs
- Check Firestore rules allow read access

### App Check errors

- Verify `VITE_RECAPTCHA_SITE_KEY` is set
- Check App Check is enabled in Firebase Console
- In development, use debug token (see Firebase Console → App Check)

---

For more information, see the main [README.md](./README.md).

