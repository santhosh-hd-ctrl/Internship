import { useState, useEffect } from 'react'
import { appointmentAPI } from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const statusColors = {
  SCHEDULED: 'badge-amber', CONFIRMED: 'badge-sky', IN_PROGRESS: 'badge-teal',
  COMPLETED: 'badge-muted', CANCELLED: 'badge-rose', NO_SHOW: 'badge-rose'
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [cancelling, setCancelling] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await appointmentAPI.myAppointments({ page, size: 10 })
      setAppointments(res.data.data.content || [])
      setTotalPages(res.data.data.totalPages || 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    setCancelling(id)
    try {
      await appointmentAPI.cancel(id, 'Cancelled by patient')
      toast.success('Appointment cancelled')
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    } finally { setCancelling(null) }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">Track and manage all your appointments</p>
      </div>

      <div className="content-area">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : appointments.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><p>No appointments found</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {appointments.map(appt => (
              <div key={appt.id} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,200,160,0.08)', border: '1px solid rgba(0,200,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>⚕</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{appt.doctorName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{appt.specialization}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>DATE</div>
                      <div style={{ fontWeight: 600 }}>{format(new Date(appt.appointmentDate), 'MMM d, yyyy')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>TIME</div>
                      <div style={{ fontWeight: 600 }}>{appt.appointmentTime}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>QUEUE</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--teal)' }}>#{appt.queueNumber}</div>
                    </div>
                    <span className={`badge ${statusColors[appt.status] || 'badge-muted'}`}>
                      {appt.status.replace('_', ' ')}
                    </span>
                    {['SCHEDULED', 'CONFIRMED'].includes(appt.status) && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt.id)}
                        disabled={cancelling === appt.id}>
                        {cancelling === appt.id ? <span className="spinner" /> : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>

                {appt.symptoms && (
                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Symptoms: </span>{appt.symptoms}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-secondary'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
