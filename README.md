# 🍽️ Restaurant Chain Feedback System

A complete, production-ready feedback collection and analytics system for restaurant chains. Built with React, TypeScript, Firebase, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.7-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)

## 📋 Features:

### Customer Tablet App
- 🌟 Beautiful, touch-friendly star rating interface
- 📝 Optional comment and contact fields
- 🔄 Auto-reset after submission (configurable timeout)
- 📍 Branch auto-selection via URL or manual picker
- 📱 Fully responsive for tablet displays

### Admin Dashboard
- 📊 Real-time analytics with Recharts visualizations
- 🏢 Branch comparison and performance ranking
- 📈 Reviews over time (daily/weekly trends)
- 👥 Customer frequency tracking
- 🔍 Advanced filtering and search
- 📄 Paginated review browsing
- 🔐 Secure Firebase Authentication

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Customer       │     │  Admin          │
│  Tablet App     │     │  Dashboard      │
│  (Public)       │     │  (Protected)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    ┌──────────────────┤
         │    │                  │
         ▼    ▼                  ▼
┌─────────────────────────────────────────┐
│           Firebase Firestore            │
│  ┌─────────────┐    ┌────────────────┐  │
│  │  branches   │    │    reviews     │  │
│  └─────────────┘    └────────────────┘  │
└─────────────────────────────────────────┘
                      │
              ┌───────┴───────┐
              │ Firebase Auth │
              │ (Admin Only)  │
              └───────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account (free Spark plan works)
- Vercel or Netlify account (for deployment)

### 1. Clone and Install

```bash
cd "Restaurant Project"
npm install
```

### 2. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" → Name it (e.g., "restaurant-feedback")
3. Disable Google Analytics (optional, not needed for this project)
4. Click "Create Project"

#### Enable Firestore

1. In Firebase Console → Build → Firestore Database
2. Click "Create Database"
3. Start in **production mode** (we'll set up rules)
4. Select a region close to your users

#### Enable Authentication

1. In Firebase Console → Build → Authentication
2. Click "Get Started"
3. Enable **Email/Password** provider
4. (Optional) Enable **Google** provider

#### Create Admin User

1. In Authentication → Users → Add user
2. Enter admin email and password
3. This user can access the dashboard

#### Get Firebase Config

1. Go to Project Settings (⚙️ gear icon)
2. Scroll to "Your apps" → Click Web icon (</>)
3. Register app with a nickname
4. Copy the `firebaseConfig` object

### 3. Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Optional: Connect to Firebase emulators in development
VITE_USE_EMULATORS=false
```

### 4. Deploy Security Rules

Install Firebase CLI and deploy rules:

```bash
npm install -g firebase-tools
firebase login
firebase init # Select Firestore, use existing project
firebase deploy --only firestore:rules,firestore:indexes
```

### 5. Seed Initial Data

Add at least one branch via Firebase Console:

1. Go to Firestore Database
2. Start collection → Name: `branches`
3. Add document with fields:
   - `name` (string): "Downtown"
   - `location` (string): "123 Main Street"
   - `isActive` (boolean): true
   - `createdAt` (timestamp): Click clock icon
   - `updatedAt` (timestamp): Click clock icon

### 6. Run Development Server

```bash
npm run dev
```

Visit:
- **Customer Form**: http://localhost:5173/
- **Admin Dashboard**: http://localhost:5173/admin
- **Specific Branch**: http://localhost:5173/feedback/BRANCH_ID

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx      # Dashboard layout with sidebar
│   │   ├── DateRangePicker.tsx  # Date range selector
│   │   └── StatCard.tsx         # Metric display card
│   └── feedback/
│       ├── BranchSelector.tsx   # Branch selection screen
│       ├── FeedbackForm.tsx     # Main feedback form
│       ├── StarRating.tsx       # Interactive star rating
│       └── ThankYouScreen.tsx   # Post-submission screen
├── context/
│   └── AuthContext.tsx          # Firebase Auth provider
├── hooks/
│   └── useDashboardData.ts      # Dashboard data fetching
├── pages/
│   ├── admin/
│   │   ├── BranchComparison.tsx # Branch analytics
│   │   ├── CustomerFrequency.tsx# Customer tracking
│   │   ├── DashboardOverview.tsx# Main dashboard
│   │   └── ReviewsList.tsx      # Paginated reviews
│   ├── FeedbackPage.tsx         # Customer feedback page
│   └── LoginPage.tsx            # Admin login
├── services/
│   ├── firebase.ts              # Firebase initialization
│   └── firestore.ts             # Firestore operations
├── types/
│   └── index.ts                 # TypeScript interfaces
├── App.tsx                      # Route definitions
├── index.css                    # Global styles
└── main.tsx                     # App entry point
```

## 🗄️ Data Model

### `branches` Collection

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Branch display name |
| `location` | string | Short location description |
| `address` | string? | Full address |
| `isActive` | boolean | Whether branch is operational |
| `createdAt` | timestamp | Creation date |
| `updatedAt` | timestamp | Last update date |

### `reviews` Collection

| Field | Type | Description |
|-------|------|-------------|
| `branchId` | string | Reference to branch document |
| `rating` | number (1-5) | Star rating |
| `comment` | string? | Optional feedback text |
| `customerName` | string? | Optional customer name |
| `contact` | string? | Email or phone |
| `billId` | string? | Receipt/bill number |
| `createdAt` | timestamp | Submission timestamp |

### Required Indexes

The `firestore.indexes.json` file defines composite indexes for:
- `reviews`: branchId + createdAt (branch filtering)
- `reviews`: contact + createdAt (customer frequency)
- `reviews`: rating + createdAt (rating filtering)
- `branches`: isActive + name (active branch listing)

## 🔐 Security Rules

The security rules implement these policies:

| Collection | Create | Read | Update | Delete |
|------------|--------|------|--------|--------|
| branches | ❌ | ✅ (active only) | ❌ | ❌ |
| reviews | ✅ (validated) | 🔐 (auth) | ❌ | ❌ |

**Key Security Features:**
- Reviews are write-only for public (customers)
- Rating validation (must be 1-5)
- Field length limits (prevent abuse)
- Server timestamp enforcement
- XSS protection via DOMPurify

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com) → Import Project
3. Connect your GitHub repository
4. Add environment variables:
   - Add all `VITE_FIREBASE_*` variables
5. Deploy!

**Custom Domain (Optional):**
1. In Vercel → Settings → Domains
2. Add your domain and configure DNS

### Deploy to Netlify

1. Push code to GitHub
2. Go to [Netlify](https://netlify.com) → New site from Git
3. Connect repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Site settings → Environment variables
6. Deploy!

### Firebase Hosting (Alternative)

```bash
npm run build
firebase deploy --only hosting
```

## 💾 Backup & Migration Readiness

The system includes built-in backup and export capabilities to protect your data and enable future database migrations.

### Manual Export

1. **Access Export Page**: Log in as owner/manager → Navigate to **Admin Dashboard → Backups**
2. **Export Options**:
   - **Reviews**: Export as JSON or CSV (respects RBAC - managers only see allowed branches)
   - **Branches**: Export as JSON
   - **Admins**: Export as JSON (owner only)
3. **Automatic Pagination**: Large datasets are automatically paginated during export
4. **ISO Timestamps**: All timestamps exported in ISO 8601 format for compatibility

### Backup Schedule

**Recommended**: 
- Export reviews **weekly** (most frequently changing)
- Export branches **monthly** (rarely changes)
- Export admins **when roles change** (infrequent)

### Storage Recommendations

- **Local**: Secure local drive with encryption
- **Cloud**: Google Drive, AWS S3, Azure Blob Storage, Dropbox
- **Multiple Copies**: Keep backups in 2+ locations
- **Version Control**: Name files with dates (e.g., `reviews-2025-01-15.json`)

### Automated Backups

**Option 1: Firebase Managed Exports** (Recommended)
- Go to Firebase Console → Firestore Database → Export tab
- Configure automated exports to Cloud Storage
- Set schedule (daily/weekly/monthly)
- No code required, handles large datasets efficiently

**Option 2: Cloud Function** (Future)
- Custom scheduled export function
- Automated notifications
- Integration with other systems

See [docs/backups.md](docs/backups.md) for detailed backup and migration guide.

### Migration Readiness

The system uses a **repository pattern** (`src/repositories/FeedbackRepository.ts`) that abstracts database operations. This makes it easy to migrate to a different database (Postgres, MySQL, etc.) in the future:

1. Create new repository implementation (e.g., `PostgresFeedbackRepository.ts`)
2. Implement the `FeedbackRepository` interface
3. Update `RepositoryProvider` to use new implementation
4. **No UI changes required!**

All reviews include a `schemaVersion` field (currently version 1) to help with future migrations.

## 🖥️ Tablet Kiosk Mode

For production tablet deployment:

### URL Setup

Use branch-specific URLs to auto-select the branch:
```
https://your-domain.com/feedback/BRANCH_ID
```

### Chrome Kiosk Mode (Recommended)

```bash
# Windows
chrome.exe --kiosk --app=https://your-domain.com/feedback/BRANCH_ID

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk --app=https://your-domain.com/feedback/BRANCH_ID

# Linux
google-chrome --kiosk --app=https://your-domain.com/feedback/BRANCH_ID
```

### Android Tablet

1. Install a kiosk browser app (e.g., "Fully Kiosk Browser")
2. Configure to open your feedback URL
3. Enable kiosk mode to prevent navigation

### iPad

1. Open Safari → Add to Home Screen
2. Use Guided Access (Settings → Accessibility → Guided Access)
3. Triple-click home button to start Guided Access

## ⚡ Performance Considerations

### Firestore Optimization

1. **Efficient Queries**: All queries use indexed fields
2. **Pagination**: Reviews list uses cursor-based pagination
3. **Client-side Aggregation**: Stats computed client-side to avoid Cloud Functions costs
4. **Date Range Limits**: Default 30-day range prevents expensive queries

### Free Tier Limits (Firebase Spark Plan)

| Resource | Limit | Estimated Usage |
|----------|-------|-----------------|
| Firestore reads | 50K/day | ~500 dashboard loads |
| Firestore writes | 20K/day | ~20K reviews |
| Firestore storage | 1 GiB | ~1M reviews |
| Auth users | Unlimited | ✅ |

### Scaling Beyond Free Tier

If you exceed limits:
1. Enable Firestore Blaze plan (pay-as-you-go)
2. Consider using aggregation documents for high-volume stats
3. Implement Cloud Functions for background processing

## 🧪 Local Development with Emulators

Use Firebase emulators for local development:

```bash
# Start emulators
firebase emulators:start

# In .env, set:
VITE_USE_EMULATORS=true
```

## 🛠️ Customization

### Branding

Update `tailwind.config.js` to change colors:

```js
colors: {
  brand: {
    500: '#your-primary-color',
    // ... other shades
  }
}
```

### Thank You Screen Duration

In `ThankYouScreen.tsx`:
```tsx
<ThankYouScreen onReset={handleReset} autoResetSeconds={10} />
```

### Rating Labels

In `FeedbackForm.tsx`, modify the `getRatingText()` function.

## 📝 License

MIT License - feel free to use this for your restaurant chain!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🐛 Troubleshooting

### "Permission denied" errors
- Check Firestore security rules are deployed
- Verify Firebase config in `.env`
- Ensure admin user exists in Firebase Auth

### Charts not rendering
- Verify Recharts is installed: `npm install recharts`
- Check browser console for errors

### Reviews not saving
- Check branchId exists in branches collection
- Verify security rules allow create
- Check browser network tab for errors

### No branches loading on mobile / "No active branches available"
- **Geographic restrictions**: Firebase services may be blocked in certain regions (e.g., Syria, Iran). Users may need to use a VPN.
- **Network issues**: Check internet connection and firewall settings
- **Cache issues**: Clear browser cache or use incognito mode
- **Mobile-specific**: Try different mobile browsers (Chrome, Safari)
- Check browser console for detailed error messages

---

Built with ❤️ for better restaurant experiences

