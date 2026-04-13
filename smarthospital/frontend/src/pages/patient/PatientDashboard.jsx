import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI } from '../../services/api'
import { format } from 'date-fns'

const statusColors = {
  SCHEDULED: 'badge-amber', CONFIRMED: 'badge-sky', IN_PROGRESS: 'badge-teal',
  COMPLETED: 'badge-muted', CANCELLED: 'badge-rose', NO_SHOW: 'badge-rose'
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appointmentAPI.myAppointments({ page: 0, size: 5 })
      .then(res => setAppointments(res.data.data.content || []))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = appointments.filter(a => ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(a.status))
  const past = appointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.status))

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: 'var(--teal)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Patient Portal</p>
            <h1 className="page-title">Hello, {user?.fullName?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Manage your appointments and health records</p>
          </div>
          <Link to="/patient/doctors" className="btn btn-primary">
            + Book Appointment
          </Link>
        </div>
      </div>

      <div className="content-area">
        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: 'Total Visits', value: appointments.length, color: 'var(--teal)' },
            { label: 'Upcoming', value: upcoming.length, color: 'var(--sky)' },
            { label: 'Completed', value: past.filter(a => a.status === 'COMPLETED').length, color: 'var(--amber)' },
            { label: 'Cancelled', value: past.filter(a => a.status === 'CANCELLED').length, color: 'var(--rose)' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Upcoming appointments */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Upcoming Appointments</h2>
            <Link to="/patient/appointments" style={{ color: 'var(--teal)', fontSize: 13, textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" /></div>
          ) : upcoming.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p>No upcoming appointments</p>
              <Link to="/patient/doctors" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Book Now</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} />
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid-3">
          {[
            { to: '/patient/doctors', icon: '⚕', title: 'Find Doctors', desc: 'Browse available specialists', color: 'var(--teal)' },
            { to: '/patient/queue', icon: '🔢', title: 'Queue Status', desc: 'Check live wait times', color: 'var(--sky)' },
            { to: '/patient/appointments', icon: '📋', title: 'All Appointments', desc: 'View your history', color: 'var(--amber)' },
          ].map(link => (
            <Link key={link.to} to={link.to} className="card card-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{link.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 4, color: link.color }}>{link.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function AppointmentCard({ appt }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10,
      padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'rgba(0,200,160,0.1)', border: '1px solid rgba(0,200,160,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
        }}>⚕</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{appt.doctorName}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{appt.specialization} · {appt.department}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          {format(new Date(appt.appointmentDate), 'MMM d, yyyy')}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{appt.appointmentTime} · Queue #{appt.queueNumber}</div>
      </div>
      <span className={`badge ${statusColors[appt.status] || 'badge-muted'}`}>
        {appt.status.replace('_', ' ')}
      </span>
    </div>
  )
}
