import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import FeedbackPage from './pages/FeedbackPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminLayout from './components/admin/AdminLayout'
import DashboardOverview from './pages/admin/DashboardOverview'
import BranchComparison from './pages/admin/BranchComparison'
import BranchesManagement from './pages/admin/BranchesManagement'
import ReviewsList from './pages/admin/ReviewsList'
import CustomerFrequency from './pages/admin/CustomerFrequency'
import AdminsManagement from './pages/admin/AdminsManagement'
import Backups from './pages/admin/Backups'

// Protected Route wrapper - requires authentication AND admin membership
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full spinner" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Require admin membership (presence of admin doc in Firestore)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-charcoal mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You are logged in, but you don't have admin access. Please contact an administrator to grant you access.
          </p>
          <button
            onClick={async () => {
              // Logout and redirect to login
              const { logout } = useAuth()
              await logout()
              window.location.href = '/login'
            }}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Customer Tablet Feedback - Public */}
      <Route path="/" element={<FeedbackPage />} />
      <Route path="/feedback/:branchId" element={<FeedbackPage />} />

      {/* Admin Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Dashboard - Protected */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="branches" element={<BranchesManagement />} />
        <Route path="branches/comparison" element={<BranchComparison />} />
        <Route path="reviews" element={<ReviewsList />} />
        <Route path="customers" element={<CustomerFrequency />} />
        <Route path="admins" element={<AdminsManagement />} />
        <Route path="backups" element={<Backups />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

