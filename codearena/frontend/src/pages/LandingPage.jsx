import React from 'react'
import { Link } from 'react-router-dom'
import { Code2, Zap, Trophy, Shield, ChevronRight, Terminal, Users, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-arena-500 rounded-lg flex items-center justify-center">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">Code<span className="text-arena-400">Arena</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/leaderboard" className="text-white/60 hover:text-white text-sm transition-colors">Leaderboard</Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Start Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 relative">
        {/* Background effects */}
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-arena-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-arena-500/10 border border-arena-500/20 rounded-full px-4 py-1.5 text-sm text-arena-400 font-medium mb-8">
            <Zap size={14} />
            <span>Smart Code Evaluation Engine</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Master Coding.<br />
            <span className="text-gradient">Dominate the Arena.</span>
          </h1>

          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice with curated problems, submit real Java code, get instant feedback,
            and climb the leaderboard. Built for serious developers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 justify-center group">
              Start Practicing Free
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/problems"
              className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2 justify-center">
              <Terminal size={16} />
              Browse Problems
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Problems', value: '50+', sub: 'and growing' },
            { label: 'Difficulties', value: '3', sub: 'Easy · Medium · Hard' },
            { label: 'Auto-Graded', value: '100%', sub: 'Real execution' },
            { label: 'Languages', value: 'Java', sub: 'More coming soon' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-extrabold text-gradient mb-1">{value}</div>
              <div className="text-sm font-semibold text-white/70">{label}</div>
              <div className="text-xs text-white/30 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-4">Everything you need to level up</h2>
          <p className="text-white/40 text-center mb-16 max-w-lg mx-auto">
            A complete coding platform designed for practice, learning, and competition.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Terminal,
                title: 'Real Code Execution',
                desc: 'Submit Java code that runs against hidden test cases. Get execution time, memory usage, and detailed feedback.',
                color: 'text-arena-400',
                bg: 'bg-arena-500/10',
                border: 'border-arena-500/20',
              },
              {
                icon: Zap,
                title: 'Instant Evaluation',
                desc: 'Your code compiles, runs, and gets graded in seconds. See exactly which test cases pass or fail.',
                color: 'text-cyber-400',
                bg: 'bg-cyber-500/10',
                border: 'border-cyber-500/20',
              },
              {
                icon: Trophy,
                title: 'Live Leaderboard',
                desc: 'Compete with other developers. Rankings update in real-time based on score and efficiency.',
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/20',
              },
              {
                icon: Shield,
                title: 'Secure Sandbox',
                desc: 'Code runs in an isolated environment. Time limits, memory limits, and security enforced.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/20',
              },
              {
                icon: Users,
                title: 'Admin Panel',
                desc: 'Admins can create problems, set test cases, manage users, and monitor platform activity.',
                color: 'text-orange-400',
                bg: 'bg-orange-500/10',
                border: 'border-orange-500/20',
              },
              {
                icon: CheckCircle,
                title: 'Submission History',
                desc: 'Full history of all your submissions with code, results, and performance analytics.',
                color: 'text-pink-400',
                bg: 'bg-pink-500/10',
                border: 'border-pink-500/20',
              },
            ].map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div key={title} className={`card p-6 border ${border} hover:scale-[1.02] transition-all duration-300`}>
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={color} size={20} />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card border border-arena-500/20 glow-arena p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-arena-500/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold mb-4">Ready to compete?</h2>
              <p className="text-white/50 mb-8 text-lg">
                Join CodeArena and start solving problems today. It's free to get started.
              </p>
              <Link to="/register" className="btn-primary text-base px-10 py-3.5">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-arena-500 rounded-md flex items-center justify-center">
              <Code2 size={14} className="text-white" />
            </div>
            <span className="font-bold">Code<span className="text-arena-400">Arena</span></span>
          </div>
          <p className="text-white/30 text-sm">© 2024 CodeArena. Built for developers, by developers.</p>
        </div>
      </footer>
    </div>
  )
}
