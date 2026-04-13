import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI, doctorAPI } from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const statusColors = {
  SCHEDULED: 'badge-amber', CONFIRMED: 'badge-sky', IN_PROGRESS: 'badge-teal',
  COMPLETED: 'badge-muted', CANCELLED: 'badge-rose'
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        const dRes = await doctorAPI.getAll({ size: 50 })
        const myDoc = dRes.data.data.content?.find(d => d.email === user?.email)
        if (myDoc) {
          setDoctor(myDoc)
          const aRes = await appointmentAPI.getDoctorAppointments(myDoc.id, { page: 0, size: 20 })
          setAppointments(aRes.data.data.content || [])
        }
      } finally { setLoading(false) }
    }
    init()
  }, [user])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await appointmentAPI.updateStatus(id, status)
      toast.success(`Status updated to ${status.replace('_', ' ')}`)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch { toast.error('Update failed') }
    finally { setUpdating(null) }
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayAppts = appointments.filter(a => a.appointmentDate === today)
  const pending = todayAppts.filter(a => ['SCHEDULED', 'CONFIRMED'].includes(a.status))
  const inProgress = todayAppts.find(a => a.status === 'IN_PROGRESS')

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: 'var(--teal)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Doctor Portal</p>
            <h1 className="page-title">Hello, {user?.fullName?.split(' ')[0]} 👨‍⚕️</h1>
            {doctor && <p className="page-subtitle">{doctor.specialization} · {doctor.department}</p>}
          </div>
          {inProgress && (
            <div style={{ background: 'rgba(0,200,160,0.1)', border: '1px solid rgba(0,200,160,0.3)', borderRadius: 10, padding: '12px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--teal)' }}>Seeing Patient #{inProgress.queueNumber}</span>
            </div>
          )}
        </div>
      </div>

      <div className="content-area">
        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: "Today's Total", value: todayAppts.length, color: 'var(--teal)' },
            { label: 'Pending', value: pending.length, color: 'var(--amber)' },
            { label: 'In Progress', value: inProgress ? 1 : 0, color: 'var(--sky)' },
            { label: 'Completed Today', value: todayAppts.filter(a => a.status === 'COMPLETED').length, color: 'var(--text-secondary)' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Today's queue */}
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Today's Patient Queue — {format(new Date(), 'MMMM d, yyyy')}</h2>
          {todayAppts.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📅</div><p>No appointments today</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayAppts.sort((a, b) => a.queueNumber - b.queueNumber).map(appt => (
                <div key={appt.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
                  borderRadius: 10, flexWrap: 'wrap',
                  background: appt.status === 'IN_PROGRESS' ? 'rgba(0,200,160,0.06)' : 'var(--bg-elevated)',
                  border: `1px solid ${appt.status === 'IN_PROGRESS' ? 'rgba(0,200,160,0.3)' : 'var(--border)'}`
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: appt.status === 'IN_PROGRESS' ? 'var(--teal)' : 'var(--text-muted)', width: 40 }}>
                    #{appt.queueNumber}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{appt.patientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{appt.appointmentTime} · {appt.patientEmail}</div>
                    {appt.symptoms && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>"{appt.symptoms}"</div>}
                  </div>
                  <span className={`badge ${statusColors[appt.status] || 'badge-muted'}`}>{appt.status.replace('_', ' ')}</span>
                  {['SCHEDULED', 'CONFIRMED'].includes(appt.status) && (
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(appt.id, 'IN_PROGRESS')} disabled={updating === appt.id || !!inProgress}>
                      {updating === appt.id ? <span className="spinner" /> : 'Start →'}
                    </button>
                  )}
                  {appt.status === 'IN_PROGRESS' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(appt.id, 'COMPLETED')} disabled={updating === appt.id}>
                      {updating === appt.id ? <span className="spinner" /> : 'Complete ✓'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
