import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/common/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/patient/PatientDashboard'
import DoctorsList from './pages/patient/DoctorsList'
import BookAppointment from './pages/patient/BookAppointment'
import PatientAppointments from './pages/patient/PatientAppointments'
import QueueTracker from './pages/patient/QueueTracker'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminPatients from './pages/admin/AdminPatients'
import Notifications from './pages/Notifications'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />
  return <Navigate to="/patient/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Patient routes */}
          <Route path="/patient" element={<ProtectedRoute roles={['PATIENT']}><AppLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="doctors" element={<DoctorsList />} />
            <Route path="book/:doctorId" element={<BookAppointment />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="queue" element={<QueueTracker />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Doctor routes */}
          <Route path="/doctor" element={<ProtectedRoute roles={['DOCTOR']}><AppLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="queue" element={<QueueTracker />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AppLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" toastOptions={{
          style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '10px', fontFamily: 'var(--font-body)' },
          success: { iconTheme: { primary: 'var(--teal)', secondary: '#000' } },
        }} />
      </AuthProvider>
    </BrowserRouter>
  )
}
