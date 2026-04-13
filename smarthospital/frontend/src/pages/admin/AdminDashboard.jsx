import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getDashboard().then(res => setData(res.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <p style={{ color: 'var(--amber)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Admin Control</p>
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">Hospital-wide analytics and management</p>
      </div>

      <div className="content-area">
        {/* Key metrics */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: 'Total Patients', value: data?.totalPatients || 0, color: 'var(--teal)', icon: '👥' },
            { label: 'Total Doctors', value: data?.totalDoctors || 0, color: 'var(--sky)', icon: '⚕' },
            { label: "Today's Appts", value: data?.totalAppointmentsToday || 0, color: 'var(--amber)', icon: '📅' },
            { label: 'This Month', value: data?.totalAppointmentsThisMonth || 0, color: 'var(--rose)', icon: '📊' },
          ].map(s => (
            <div className="stat-card" key={s.label} style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: 16, top: 16, fontSize: 28, opacity: 0.15 }}>{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Appointment breakdown */}
        <div className="grid-3" style={{ marginBottom: 32 }}>
          {[
            { label: 'Pending', value: data?.pendingAppointments || 0, color: 'var(--amber)', width: `${Math.min(100, (data?.pendingAppointments / Math.max(data?.totalAppointmentsThisMonth, 1)) * 100)}%` },
            { label: 'Completed', value: data?.completedAppointments || 0, color: 'var(--teal)', width: `${Math.min(100, (data?.completedAppointments / Math.max(data?.totalAppointmentsThisMonth, 1)) * 100)}%` },
            { label: 'Cancelled', value: data?.cancelledAppointments || 0, color: 'var(--rose)', width: `${Math.min(100, (data?.cancelledAppointments / Math.max(data?.totalAppointmentsThisMonth, 1)) * 100)}%` },
          ].map(s => (
            <div className="card" key={s.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: s.color }}>{s.value}</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: s.width, background: s.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
          <div className="grid-4">
            {[
              { to: '/admin/doctors', label: 'Manage Doctors', icon: '⚕', color: 'var(--sky)' },
              { to: '/admin/patients', label: 'View Patients', icon: '👥', color: 'var(--teal)' },
              { to: '/admin/appointments', label: 'All Appointments', icon: '📋', color: 'var(--amber)' },
              { to: '/admin/doctors', label: 'Add Doctor', icon: '➕', color: 'var(--rose)' },
            ].map(a => (
              <Link key={a.to + a.label} to={a.to} className="card card-glow" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 24, color: a.color }}>{a.icon}</div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Available doctors */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Available Doctors ({data?.availableDoctors?.length || 0})</h2>
            <Link to="/admin/doctors" style={{ color: 'var(--teal)', fontSize: 13, textDecoration: 'none' }}>Manage →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Department</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.availableDoctors?.slice(0, 5).map(doc => (
                  <tr key={doc.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{doc.fullName}</td>
                    <td>{doc.specialization}</td>
                    <td>{doc.department || '—'}</td>
                    <td>{doc.yearsOfExperience ? `${doc.yearsOfExperience} yrs` : '—'}</td>
                    <td style={{ color: 'var(--amber)' }}>{doc.consultationFee ? `$${doc.consultationFee}` : '—'}</td>
                    <td><span className="badge badge-teal">Available</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
