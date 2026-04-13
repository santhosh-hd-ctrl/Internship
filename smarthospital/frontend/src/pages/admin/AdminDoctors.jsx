import { useState, useEffect } from 'react'
import { doctorAPI, adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const INITIAL_FORM = { email: '', fullName: '', phone: '', specialization: '', qualification: '', licenseNumber: '', department: '', yearsOfExperience: '', bio: '', consultationFee: '', appointmentDuration: 20, maxDailyAppointments: 20 }

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [toggling, setToggling] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await doctorAPI.getAll({ page, size: 10 })
      setDoctors(res.data.data.content || [])
      setTotalPages(res.data.data.totalPages || 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await adminAPI.updateDoctor(editingId, form)
        toast.success('Doctor updated')
      } else {
        await adminAPI.createDoctor(form)
        toast.success('Doctor created — default password: doctor123')
      }
      setShowModal(false)
      setForm(INITIAL_FORM)
      setEditingId(null)
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally { setSaving(false) }
  }

  const toggleAvailability = async (id) => {
    setToggling(id)
    try {
      await adminAPI.toggleAvailability(id)
      toast.success('Availability toggled')
      fetch()
    } finally { setToggling(null) }
  }

  const openEdit = (doc) => {
    setForm({ ...INITIAL_FORM, ...doc })
    setEditingId(doc.id)
    setShowModal(true)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title">Doctor Management</h1>
            <p className="page-subtitle">Add, edit, and manage hospital doctors</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(INITIAL_FORM); setEditingId(null); setShowModal(true) }}>
            + Add Doctor
          </button>
        </div>
      </div>

      <div className="content-area">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <>
            <div className="table-wrap" style={{ marginBottom: 24 }}>
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Department</th>
                    <th>Experience</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.fullName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doc.email}</div>
                      </td>
                      <td>{doc.specialization}</td>
                      <td>{doc.department || '—'}</td>
                      <td>{doc.yearsOfExperience ? `${doc.yearsOfExperience}y` : '—'}</td>
                      <td style={{ color: 'var(--amber)' }}>{doc.consultationFee ? `$${doc.consultationFee}` : '—'}</td>
                      <td>
                        <span className={`badge ${doc.available ? 'badge-teal' : 'badge-rose'}`}>
                          {doc.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(doc)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleAvailability(doc.id)} disabled={toggling === doc.id}>
                            {toggling === doc.id ? <span className="spinner" /> : doc.available ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)} className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-secondary'}`}>{i + 1}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
            <h2 style={{ fontWeight: 800, marginBottom: 24 }}>{editingId ? 'Edit Doctor' : 'Add New Doctor'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2">
                {[
                  { key: 'fullName', label: 'Full Name', required: true },
                  { key: 'email', label: 'Email', type: 'email', required: !editingId },
                  { key: 'phone', label: 'Phone' },
                  { key: 'specialization', label: 'Specialization', required: true },
                  { key: 'qualification', label: 'Qualification' },
                  { key: 'licenseNumber', label: 'License Number' },
                  { key: 'department', label: 'Department' },
                  { key: 'yearsOfExperience', label: 'Years of Experience', type: 'number' },
                  { key: 'consultationFee', label: 'Consultation Fee ($)', type: 'number' },
                  { key: 'appointmentDuration', label: 'Appt Duration (min)', type: 'number' },
                ].map(f => (
                  <div className="form-group" key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type={f.type || 'text'} required={!!f.required}
                      value={form[f.key] || ''} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" style={{ minHeight: 80 }} value={form.bio || ''}
                  onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : editingId ? 'Update Doctor' : 'Create Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
