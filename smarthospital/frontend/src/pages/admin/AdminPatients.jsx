import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { format } from 'date-fns'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    setLoading(true)
    adminAPI.getPatients({ page, size: 15 })
      .then(res => { setPatients((res.data.data.content || []).filter(u => u.role === 'PATIENT')); setTotalPages(res.data.data.totalPages || 0) })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Patients</h1>
        <p className="page-subtitle">{patients.length} registered patients</p>
      </div>
      <div className="content-area">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Patient</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.fullName}</td>
                    <td>{p.email}</td>
                    <td>{p.phone || '—'}</td>
                    <td>{p.createdAt ? format(new Date(p.createdAt), 'MMM d, yyyy') : '—'}</td>
                    <td><span className="badge badge-teal">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-secondary'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
