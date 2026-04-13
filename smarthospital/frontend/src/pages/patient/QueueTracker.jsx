import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { appointmentAPI, doctorAPI } from '../../services/api'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

export default function QueueTracker() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const presetDoctorId = searchParams.get('doctorId')

  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(presetDoctorId || '')
  const [queueData, setQueueData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    doctorAPI.getAll({ size: 50 }).then(res => {
      setDoctors(res.data.data.content || [])
    })
  }, [])

  useEffect(() => {
    if (selectedDoctor) fetchQueue()
  }, [selectedDoctor])

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const res = await appointmentAPI.getQueue(selectedDoctor, today)
      setQueueData(res.data.data)
      setLastUpdated(new Date())
    } catch { setQueueData(null) }
    finally { setLoading(false) }
  }

  // WebSocket live updates
  useWebSocket((data) => {
    setQueueData(data)
    setLastUpdated(new Date())
  }, selectedDoctor || null)

  const statusColor = (status) => {
    if (status === 'IN_PROGRESS') return 'var(--teal)'
    if (status === 'COMPLETED') return 'var(--text-muted)'
    return 'var(--text-secondary)'
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Live Queue Tracker</h1>
        <p className="page-subtitle">Real-time queue status — updates automatically</p>
      </div>

      <div className="content-area">
        {/* Doctor selector */}
        <div style={{ marginBottom: 28, maxWidth: 400 }}>
          <div className="form-group">
            <label className="form-label">Select Doctor</label>
            <select className="form-select" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
              <option value="">— Choose a doctor —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.fullName} · {d.specialization}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        )}

        {!selectedDoctor && !loading && (
          <div className="empty-state">
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔢</div>
            <p>Select a doctor to view the live queue</p>
          </div>
        )}

        {queueData && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
            {/* Main queue display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="pulse-dot" />
                <span style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>LIVE</span>
                {lastUpdated && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Updated {format(lastUpdated, 'HH:mm:ss')}
                  </span>
                )}
                <button className="btn btn-ghost btn-sm" onClick={fetchQueue} style={{ marginLeft: 'auto' }}>↻ Refresh</button>
              </div>

              {/* Current serving */}
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0,200,160,0.08), rgba(0,200,160,0.02))', border: '1px solid rgba(0,200,160,0.25)', textAlign: 'center', padding: '40px 28px' }}>
                <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Now Serving
                </div>
                <div className="queue-number">
                  {queueData.currentQueueNumber > 0 ? `#${queueData.currentQueueNumber}` : '—'}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                  {queueData.totalQueued} patients in queue today
                </div>
              </div>

              {/* Your position (if patient has a booking) */}
              {queueData.yourQueueNumber && (
                <div className="card" style={{ background: 'rgba(56,182,255,0.05)', border: '1px solid rgba(56,182,255,0.2)' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky)', marginBottom: 16 }}>Your Position</h3>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--sky)', lineHeight: 1 }}>
                        #{queueData.yourQueueNumber}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Your queue #</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--amber)', lineHeight: 1 }}>
                        {queueData.patientsAhead}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Ahead of you</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--rose)', lineHeight: 1 }}>
                        {queueData.estimatedWaitMinutes}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Est. wait (min)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Queue list */}
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Today's Queue</h3>
                {queueData.queue?.length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}>
                    <p>No patients in queue</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {queueData.queue?.map((item, idx) => (
                      <div key={item.queueNumber} style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                        borderRadius: 8, background: item.isCurrentPatient ? 'rgba(0,200,160,0.08)' : 'var(--bg-elevated)',
                        border: `1px solid ${item.isCurrentPatient ? 'rgba(0,200,160,0.3)' : 'var(--border)'}`,
                        transition: 'all 0.2s'
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                          background: item.isCurrentPatient ? 'var(--teal)' : 'var(--bg-card)',
                          border: `1px solid ${item.isCurrentPatient ? 'var(--teal)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14,
                          color: item.isCurrentPatient ? '#000' : statusColor(item.status)
                        }}>
                          {item.queueNumber}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: item.isCurrentPatient ? 'var(--teal)' : 'var(--text-primary)' }}>
                            {item.patientName}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.appointmentTime}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {item.isCurrentPatient && <span className="pulse-dot" />}
                          <span className={`badge ${item.status === 'IN_PROGRESS' ? 'badge-teal' : item.status === 'COMPLETED' ? 'badge-muted' : 'badge-amber'}`} style={{ fontSize: 11 }}>
                            {item.status === 'IN_PROGRESS' ? 'In Progress' : item.status === 'COMPLETED' ? 'Done' : 'Waiting'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Doctor info panel */}
            <div className="card" style={{ position: 'sticky', top: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Doctor Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{queueData.doctorName}</div>
                <span className="badge badge-teal" style={{ width: 'fit-content' }}>{queueData.specialization}</span>
                <hr className="divider" style={{ margin: '4px 0' }} />
                {[
                  { label: 'Date', value: format(new Date(queueData.date), 'MMMM d, yyyy') },
                  { label: 'Total Queued', value: queueData.totalQueued },
                  { label: 'Currently Serving', value: queueData.currentQueueNumber > 0 ? `#${queueData.currentQueueNumber}` : 'None' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.label}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, padding: 14, background: 'rgba(0,200,160,0.05)', borderRadius: 8, border: '1px solid rgba(0,200,160,0.15)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  ◆ Queue updates in real-time via WebSocket<br />
                  ◆ You'll be notified when it's your turn<br />
                  ◆ Please arrive 10 min before your slot
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
