import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { doctorAPI } from '../../services/api'

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const res = await doctorAPI.getAll({ page, size: 9, search: search || undefined })
      setDoctors(res.data.data.content || [])
      setTotalPages(res.data.data.totalPages || 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchDoctors() }, [page, search])

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Find a Doctor</h1>
        <p className="page-subtitle">Browse our specialists and book your appointment</p>
      </div>

      <div className="content-area">
        {/* Search */}
        <div style={{ marginBottom: 28, maxWidth: 480 }}>
          <input className="form-input" placeholder="Search by name, specialty, or department..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={{ fontSize: 15, padding: '14px 18px' }} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
        ) : doctors.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔍</div><p>No doctors found</p></div>
        ) : (
          <div className="grid-3" style={{ marginBottom: 32 }}>
            {doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-secondary'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DoctorCard({ doctor }) {
  const dayAbbr = { MONDAY: 'M', TUESDAY: 'T', WEDNESDAY: 'W', THURSDAY: 'Th', FRIDAY: 'F', SATURDAY: 'Sa', SUNDAY: 'Su' }

  return (
    <div className="card card-glow" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(0,200,160,0.2), rgba(0,200,160,0.05))',
          border: '1px solid rgba(0,200,160,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, color: 'var(--teal)'
        }}>⚕</div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{doctor.fullName}</h3>
          <span className="badge badge-teal" style={{ fontSize: 11 }}>{doctor.specialization}</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {doctor.department && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Dept</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{doctor.department}</span>
          </div>
        )}
        {doctor.yearsOfExperience && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Exp</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{doctor.yearsOfExperience} years</span>
          </div>
        )}
        {doctor.consultationFee && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Fee</span>
            <span style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600 }}>${doctor.consultationFee}</span>
          </div>
        )}
      </div>

      {/* Schedule tags */}
      {doctor.schedules?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {doctor.schedules.map(s => (
            <span key={s.id} className="tag" style={{ fontSize: 11, padding: '3px 8px' }}>
              {dayAbbr[s.dayOfWeek]} {s.startTime?.slice(0, 5)}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Link to={`/patient/book/${doctor.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
          Book Appointment
        </Link>
        <Link to={`/patient/queue?doctorId=${doctor.id}`} className="btn btn-secondary btn-sm">
          Queue
        </Link>
      </div>
    </div>
  )
}
