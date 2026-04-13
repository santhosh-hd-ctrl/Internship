import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Trophy, Code2, CheckCircle, Clock, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react'
import { statusColor, statusLabel, difficultyColor, formatDateTime } from '../utils/helpers'

export default function DashboardPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/submissions/me?page=0&size=5'),
      api.get('/problems?page=0&size=6&sortBy=createdAt&sortDir=desc'),
    ]).then(([subRes, probRes]) => {
      setSubmissions(subRes.data.data?.content || [])
      setProblems(probRes.data.data?.content || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Score', value: user?.totalScore ?? 0, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Problems Solved', value: user?.problemsSolved ?? 0, icon: CheckCircle, color: 'text-arena-400', bg: 'bg-arena-400/10' },
    { label: 'Submissions', value: submissions.length > 0 ? '5+' : '0', icon: Code2, color: 'text-cyber-400', bg: 'bg-cyber-400/10' },
    { label: 'Streak', value: '—', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ]

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">
          Hey, <span className="text-gradient">{user?.fullName?.split(' ')[0] || user?.username}</span> 👋
        </h1>
        <p className="text-white/40 mt-1">Ready to solve some problems today?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-glow p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={color} size={18} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">{value}</div>
            <div className="text-xs text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-white/40" />
              Recent Submissions
            </h2>
            <Link to="/submissions" className="text-xs text-arena-400 hover:text-arena-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <Code2 size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No submissions yet</p>
              <Link to="/problems" className="btn-primary text-sm mt-3 inline-flex items-center gap-1.5">
                Start solving <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{sub.problemTitle}</p>
                    <p className="text-xs text-white/30">{formatDateTime(sub.submittedAt)}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className={`text-xs font-semibold ${statusColor(sub.status)}`}>{statusLabel(sub.status)}</p>
                    <p className="text-xs text-white/30">{sub.executionTimeMs}ms</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Problems */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Target size={16} className="text-white/40" />
              Latest Problems
            </h2>
            <Link to="/problems" className="text-xs text-arena-400 hover:text-arena-300 flex items-center gap-1">
              All problems <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-2">
            {problems.map(p => (
              <Link key={p.id} to={`/problems/${p.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/80 group-hover:text-white truncate transition-colors">
                    {p.solvedByCurrentUser && <CheckCircle size={12} className="inline text-arena-400 mr-1.5 -mt-0.5" />}
                    {p.title}
                  </p>
                  <p className="text-xs text-white/30">{p.points} pts · {p.acceptanceRate?.toFixed(0)}% acceptance</p>
                </div>
                <span className={difficultyColor(p.difficulty)}>{p.difficulty}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      {user?.problemsSolved === 0 && (
        <div className="mt-6 card border border-arena-500/20 glow-arena p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-arena-500/15 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-arena-400" size={22} />
            </div>
            <div>
              <p className="font-bold">Start your journey</p>
              <p className="text-sm text-white/40">Solve your first problem to appear on the leaderboard</p>
            </div>
          </div>
          <Link to="/problems" className="btn-primary shrink-0">
            Solve Now
          </Link>
        </div>
      )}
    </div>
  )
}
