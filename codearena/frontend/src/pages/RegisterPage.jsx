import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Code2, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password || !form.fullName)
      return toast.error('Please fill all fields')
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.data)
      toast.success('Account created! Welcome to CodeArena!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder) => (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
      <input type={type === 'password' ? (showPass ? 'text' : 'password') : type}
        className={`input ${type === 'password' ? 'pr-12' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-950 grid-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-arena-900/20 via-dark-950 to-dark-950 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-arena-500 rounded-xl flex items-center justify-center">
              <Code2 size={20} className="text-white" />
            </div>
            <span className="font-extrabold text-xl">Code<span className="text-arena-400">Arena</span></span>
          </Link>
          <h1 className="text-2xl font-extrabold">Create your account</h1>
          <p className="text-white/40 text-sm mt-1">Join thousands of developers competing</p>
        </div>

        <div className="card border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {field('fullName', 'Full Name', 'text', 'John Doe')}
            {field('username', 'Username', 'text', 'john_doe')}
            {field('email', 'Email', 'email', 'john@example.com')}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><UserPlus size={16} /> Create Account</>
              }
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/8 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-arena-400 hover:text-arena-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
