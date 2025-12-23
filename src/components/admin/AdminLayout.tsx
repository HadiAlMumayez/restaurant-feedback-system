/**
 * Admin Layout Component
 * 
 * Main layout wrapper for admin dashboard pages.
 * Includes sidebar navigation and header.
 */

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Users,
  UserCog,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useRoleGuard } from '../../hooks/useRoleGuard'
import LanguageSwitcher from '../LanguageSwitcher'

export default function AdminLayout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { isOwner, canPerform } = useRoleGuard()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Navigation items with role-based visibility
  const allNavItems = [
    { to: '/admin', icon: LayoutDashboard, label: t('admin.overview'), end: true, show: true },
    { to: '/admin/branches', icon: Building2, label: t('admin.branches'), end: false, show: canPerform('manageBranches') },
    { to: '/admin/reviews', icon: MessageSquare, label: t('admin.reviews'), end: false, show: canPerform('viewReviews') },
    { to: '/admin/customers', icon: Users, label: t('admin.customers'), end: false, show: canPerform('viewReviews') },
    { to: '/admin/admins', icon: UserCog, label: t('admin.admins'), end: false, show: canPerform('manageAdmins') },
  ]

  const navItems = allNavItems.filter(item => item.show)


  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-brand-50/50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl
          transform transition-transform duration-300 ease-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-brand-100">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍽️</span>
            <span className="font-display font-bold text-xl text-charcoal">
              FeedBack
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-brand-50 rounded-lg"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${isActive
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-brand-50 hover:text-brand-600'
                }`
              }
            >
              <item.icon size={22} />
              <span>{item.label}</span>
              <ChevronRight size={18} className="ml-auto opacity-50 [dir=rtl]:ml-0 [dir=rtl]:mr-auto" />
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-brand-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
              <span className="text-brand-600 font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal truncate">
                {user?.displayName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                     bg-red-50 text-red-600 rounded-xl font-medium
                     hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72 [dir=rtl]:lg:ml-0 [dir=rtl]:lg:mr-72">
        {/* Header */}
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-brand-50 rounded-lg"
          >
            <Menu size={24} className="text-gray-600" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-xl font-display font-semibold text-charcoal">
              {t('admin.dashboard')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

