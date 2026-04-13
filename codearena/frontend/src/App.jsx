import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProblemsPage from './pages/ProblemsPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import LeaderboardPage from './pages/LeaderboardPage'
import SubmissionsPage from './pages/SubmissionsPage'
import AdminPage from './pages/AdminPage'
import Navbar from './components/common/Navbar'




function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-arena-500 border-t-transparent rounded-full animate-spin" />
  </div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'Syne, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/leaderboard" element={<><Navbar /><LeaderboardPage /></>} />
            <Route path="/dashboard" element={<ProtectedRoute><Navbar /><DashboardPage /></ProtectedRoute>} />
            <Route path="/problems" element={<ProtectedRoute><Navbar /><ProblemsPage /></ProtectedRoute>} />
            <Route path="/problems/:id" element={<ProtectedRoute><Navbar /><ProblemDetailPage /></ProtectedRoute>} />
            <Route path="/submissions" element={<ProtectedRoute><Navbar /><SubmissionsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Navbar /><AdminPage /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/problems/:id" element={<ProblemDetailPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}
