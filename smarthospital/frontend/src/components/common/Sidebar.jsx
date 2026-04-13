import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const icons = {
  dashboard: '⬡',
  doctors: '⚕',
  appointments: '📋',
  queue: '🔢',
  patients: '👥',
  notifications: '🔔',
  profile: '◎',
  logout: '↩',
}

export default function Sidebar({ unreadCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const adminLinks = [
    { to: '/admin/dashboard', icon: icons.dashboard, label: 'Dashboard' },
    { to: '/admin/doctors', icon: icons.doctors, label: 'Doctors' },
    { to: '/admin/patients', icon: icons.patients, label: 'Patients' },
    { to: '/admin/appointments', icon: icons.appointments, label: 'Appointments' },
  ]

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: icons.dashboard, label: 'Dashboard' },
    { to: '/doctor/appointments', icon: icons.appointments, label: 'My Appointments' },
    { to: '/doctor/queue', icon: icons.queue, label: 'Live Queue' },
  ]

  const patientLinks = [
    { to: '/patient/dashboard', icon: icons.dashboard, label: 'Dashboard' },
    { to: '/patient/doctors', icon: icons.doctors, label: 'Find Doctors' },
    { to: '/patient/appointments', icon: icons.appointments, label: 'My Appointments' },
    { to: '/patient/queue', icon: icons.queue, label: 'Queue Status' },
  ]

  const links = user?.role === 'ADMIN' ? adminLinks
    : user?.role === 'DOCTOR' ? doctorLinks
    : patientLinks

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--teal), #006d58)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#000', fontFamily: 'var(--font-display)',
            boxShadow: '0 0 16px rgba(0,200,160,0.3)'
          }}>S</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>
              SmartHospital
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 8, textDecoration: 'none',
            fontSize: 14, fontWeight: isActive ? 600 : 400,
            background: isActive ? 'rgba(0,200,160,0.1)' : 'transparent',
            color: isActive ? 'var(--teal)' : 'var(--text-secondary)',
            borderLeft: isActive ? '3px solid var(--teal)' : '3px solid transparent',
            transition: 'all 0.15s'
          })}>
            <span style={{ fontSize: 16 }}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}

        <NavLink to={user?.role === 'ADMIN' ? '/admin/notifications' : user?.role === 'DOCTOR' ? '/doctor/notifications' : '/patient/notifications'}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 8, textDecoration: 'none',
            fontSize: 14, fontWeight: isActive ? 600 : 400,
            background: isActive ? 'rgba(0,200,160,0.1)' : 'transparent',
            color: isActive ? 'var(--teal)' : 'var(--text-secondary)',
            borderLeft: isActive ? '3px solid var(--teal)' : '3px solid transparent',
            transition: 'all 0.15s', position: 'relative'
          })}>
          <span style={{ fontSize: 16 }}>{icons.notifications}</span>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              marginLeft: 'auto', background: 'var(--rose)', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10
            }}>{unreadCount}</span>
          )}
        </NavLink>
      </nav>

      {/* User footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', marginBottom: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #006d58, var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0
          }}>
            {user?.fullName?.charAt(0)}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}
          style={{ justifyContent: 'flex-start', gap: 10 }}>
          <span>{icons.logout}</span> Sign out
        </button>
      </div>
    </aside>
  )
}
