import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import FeedbackPage from './pages/FeedbackPage'
import LoginPage from './pages/LoginPage'
import AdminLayout from './components/admin/AdminLayout'
import DashboardOverview from './pages/admin/DashboardOverview'
import BranchComparison from './pages/admin/BranchComparison'
import ReviewsList from './pages/admin/ReviewsList'
import CustomerFrequency from './pages/admin/CustomerFrequency'

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

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
        <Route path="branches" element={<BranchComparison />} />
        <Route path="reviews" element={<ReviewsList />} />
        <Route path="customers" element={<CustomerFrequency />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

