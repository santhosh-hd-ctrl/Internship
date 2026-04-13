import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`)
      if (user.role === 'ADMIN') navigate('/admin/dashboard')
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard')
      else navigate('/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async (email, password) => {
    setForm({ email, password })
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Signed in as ${user.role}`)
      if (user.role === 'ADMIN') navigate('/admin/dashboard')
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard')
      else navigate('/patient/dashboard')
    } catch { toast.error('Demo login failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -100, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,200,160,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,200,160,0.04) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 400, position: 'relative' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--teal), #00695c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: '#000',
              boxShadow: '0 0 24px rgba(0,200,160,0.35)'
            }}>S</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>SmartHospital</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Queue Management</div>
            </div>
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
            Welcome<br />
            <span style={{ color: 'var(--teal)' }}>back.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>
            Sign in to access your dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" required
                value={form.email} placeholder="you@example.com"
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" required
                value={form.password} placeholder="••••••••"
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}
              style={{ marginTop: 8 }}>
              {loading ? <span className="spinner" /> : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
            New patient?{' '}
            <Link to="/register" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}>
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel - Demo + Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', gap: 32 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Demo Accounts</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Click to instantly sign in</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { role: 'Admin', email: 'admin@smarthospital.com', password: 'admin123', color: 'var(--amber)' },
              { role: 'Doctor', email: 'dr.sarah@smarthospital.com', password: 'doctor123', color: 'var(--sky)' },
              { role: 'Patient', email: 'patient1@example.com', password: 'patient123', color: 'var(--teal)' },
            ].map(d => (
              <button key={d.role} onClick={() => demoLogin(d.email, d.password)}
                style={{
                  background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 10,
                  padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = d.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: d.color }}>{d.role}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{d.email}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>→</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>✦ Platform Features</h3>
          {[
            'Real-time queue tracking via WebSocket',
            'JWT-secured role-based access control',
            'Appointment booking & cancellation',
            'Automated email & SMS notifications',
            'Doctor schedule management',
            'Admin analytics dashboard',
          ].map(f => (
            <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: 'var(--teal)', fontSize: 12 }}>◆</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
