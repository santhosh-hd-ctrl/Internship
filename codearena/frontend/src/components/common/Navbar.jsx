import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Code2, LayoutDashboard, ListChecks, Trophy, History, Shield, LogOut, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth()
  const { isDark, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/problems', icon: ListChecks, label: 'Problems' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/submissions', icon: History, label: 'My Submissions' },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-arena-500 rounded-lg flex items-center justify-center group-hover:bg-arena-400 transition-colors">
              <Code2 className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Code<span className="text-arena-400">Arena</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={isActive(to) ? 'nav-link-active' : 'nav-link'}>
                <span className="flex items-center gap-1.5">
                  <Icon size={15} />
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggle} className="btn-ghost p-2">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-all"
                >
                  <div className="w-7 h-7 bg-arena-500/20 border border-arena-500/40 rounded-full flex items-center justify-center text-xs font-bold text-arena-400">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white/80">{user?.username}</span>
                  <ChevronDown size={14} className="text-white/40" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-dark-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-sm font-semibold">{user?.fullName}</p>
                      <p className="text-xs text-white/40">{user?.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-arena-400 font-mono">{user?.totalScore} pts</span>
                        <span className="text-xs text-white/40">·</span>
                        <span className="text-xs text-white/60">{user?.problemsSolved} solved</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                        <Shield size={14} />Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut size={14} />Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-2 text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 text-sm">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-ghost p-2">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/8 bg-dark-900/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive(to) ? 'bg-arena-500/15 text-arena-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                <Icon size={16} />{label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut size={16} />Sign Out
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary text-sm flex-1 text-center">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm flex-1 text-center">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for profile dropdown */}
      {profileOpen && <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />}
    </nav>
  )
}
