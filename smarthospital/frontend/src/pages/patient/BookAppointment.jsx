import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doctorAPI, appointmentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { format, addDays, isWeekend } from 'date-fns'

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    notes: '',
  })

  useEffect(() => {
    doctorAPI.getById(doctorId)
      .then(res => setDoctor(res.data.data))
      .finally(() => setLoading(false))
  }, [doctorId])

  // Generate next 14 days with available days
  const getAvailableDates = () => {
    const dates = []
    const availableDays = doctor?.schedules?.map(s => s.dayOfWeek) || []
    for (let i = 1; i <= 21; i++) {
      const date = addDays(new Date(), i)
      const dayName = format(date, 'EEEE').toUpperCase()
      if (availableDays.includes(dayName)) dates.push(date)
      if (dates.length >= 10) break
    }
    return dates
  }

  const getTimeSlots = () => {
    if (!form.appointmentDate || !doctor?.schedules) return []
    const dayName = format(new Date(form.appointmentDate), 'EEEE').toUpperCase()
    const schedule = doctor.schedules.find(s => s.dayOfWeek === dayName)
    if (!schedule) return []

    const slots = []
    const [sh, sm] = schedule.startTime.split(':').map(Number)
    const [eh, em] = schedule.endTime.split(':').map(Number)
    const breakStart = schedule.breakStartTime ? schedule.breakStartTime.split(':').map(Number) : null
    const breakEnd = schedule.breakEndTime ? schedule.breakEndTime.split(':').map(Number) : null
    const dur = doctor.appointmentDuration || 20

    let cur = sh * 60 + sm
    const end = eh * 60 + em

    while (cur + dur <= end) {
      const h = Math.floor(cur / 60), m = cur % 60
      const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`

      // Skip break time
      if (breakStart && breakEnd) {
        const bs = breakStart[0] * 60 + breakStart[1]
        const be = breakEnd[0] * 60 + breakEnd[1]
        if (cur >= bs && cur < be) { cur += dur; continue }
      }
      slots.push(timeStr)
      cur += dur
    }
    return slots
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.appointmentDate || !form.appointmentTime) {
      toast.error('Please select a date and time')
      return
    }
    setSubmitting(true)
    try {
      await appointmentAPI.book({ ...form, doctorId: Number(doctorId) })
      toast.success('Appointment booked successfully!')
      navigate('/patient/appointments')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>

  const availableDates = getAvailableDates()
  const timeSlots = getTimeSlots()

  return (
    <div className="fade-in">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>← Back</button>
        <h1 className="page-title">Book Appointment</h1>
      </div>

      <div className="content-area">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Doctor info */}
            <div className="card">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,200,160,0.1)', border: '1px solid rgba(0,200,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚕</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{doctor?.fullName}</h3>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span className="badge badge-teal">{doctor?.specialization}</span>
                    {doctor?.department && <span className="badge badge-muted">{doctor.department}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Date picker */}
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Select Date</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {availableDates.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No available dates in the next 3 weeks</p>
                ) : availableDates.map(date => {
                  const iso = format(date, 'yyyy-MM-dd')
                  const selected = form.appointmentDate === iso
                  return (
                    <button key={iso} type="button"
                      onClick={() => setForm(f => ({ ...f, appointmentDate: iso, appointmentTime: '' }))}
                      style={{
                        padding: '10px 16px', borderRadius: 8, border: `1px solid ${selected ? 'var(--teal)' : 'var(--border)'}`,
                        background: selected ? 'rgba(0,200,160,0.12)' : 'var(--bg-elevated)',
                        color: selected ? 'var(--teal)' : 'var(--text-secondary)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                        fontFamily: 'var(--font-display)', fontWeight: selected ? 700 : 400
                      }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{format(date, 'EEE')}</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{format(date, 'd')}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>{format(date, 'MMM')}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            {form.appointmentDate && (
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Select Time</h3>
                {timeSlots.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No slots on this day</p>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {timeSlots.map(t => {
                      const selected = form.appointmentTime === t
                      return (
                        <button key={t} type="button"
                          onClick={() => setForm(f => ({ ...f, appointmentTime: t }))}
                          style={{
                            padding: '8px 16px', borderRadius: 8,
                            border: `1px solid ${selected ? 'var(--teal)' : 'var(--border)'}`,
                            background: selected ? 'rgba(0,200,160,0.12)' : 'var(--bg-elevated)',
                            color: selected ? 'var(--teal)' : 'var(--text-secondary)',
                            cursor: 'pointer', fontSize: 13, fontWeight: selected ? 600 : 400,
                            transition: 'all 0.15s'
                          }}>{t}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Symptoms */}
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Visit Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Symptoms / Reason for Visit</label>
                  <textarea className="form-textarea" placeholder="Describe your symptoms..."
                    value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <textarea className="form-textarea" style={{ minHeight: 80 }} placeholder="Any additional information..."
                    value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
            </div>

            <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={submitting || !form.appointmentDate || !form.appointmentTime}>
              {submitting ? <span className="spinner" /> : 'Confirm Booking →'}
            </button>
          </form>

          {/* Summary */}
          <div className="card" style={{ position: 'sticky', top: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Booking Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Doctor', value: doctor?.fullName },
                { label: 'Specialty', value: doctor?.specialization },
                { label: 'Duration', value: `${doctor?.appointmentDuration} min` },
                { label: 'Fee', value: doctor?.consultationFee ? `$${doctor.consultationFee}` : 'N/A' },
                { label: 'Date', value: form.appointmentDate || '—' },
                { label: 'Time', value: form.appointmentTime || '—' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.label}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: 14, background: 'rgba(0,200,160,0.05)', border: '1px solid rgba(0,200,160,0.15)', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                You'll receive a confirmation notification. Please arrive 10 minutes before your scheduled time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
