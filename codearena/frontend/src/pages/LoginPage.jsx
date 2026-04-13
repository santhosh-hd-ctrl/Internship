import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Code2, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.data)
      toast.success(`Welcome back, ${data.data.username}!`)
      navigate(data.data.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to continue your journey</p>
        </div>

        <div className="card border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Username</label>
              <input
                type="text"
                className="input"
                placeholder="your_username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
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
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/8 text-center">
            <p className="text-white/40 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-arena-400 hover:text-arena-300 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 bg-white/3 border border-white/8 rounded-lg p-3">
            <p className="text-xs text-white/30 font-medium mb-2">Demo credentials:</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-dark-900 rounded p-2">
                <span className="text-arena-400">admin</span><br/>
                <span className="text-white/40">admin123</span>
              </div>
              <div className="bg-dark-900 rounded p-2">
                <span className="text-cyber-400">testuser</span><br/>
                <span className="text-white/40">test123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
