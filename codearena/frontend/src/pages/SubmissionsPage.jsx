import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { Loader2, ChevronLeft, ChevronRight, Code2, ChevronDown, ChevronUp } from 'lucide-react'
import { statusColor, statusLabel, difficultyColor, formatDateTime } from '../utils/helpers'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [expanded, setExpanded] = useState({})
  const size = 15

  useEffect(() => {
    setLoading(true)
    api.get(`/submissions/me?page=${page}&size=${size}`)
      .then(r => {
        setSubmissions(r.data.data?.content || [])
        setTotalPages(r.data.data?.totalPages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">My Submissions</h1>
        <p className="text-white/40 text-sm mt-1">Your complete submission history</p>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden md:grid grid-cols-12 px-5 py-3 border-b border-white/8 text-xs font-semibold text-white/30 uppercase tracking-wider">
          <div className="col-span-4">Problem</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Tests</div>
          <div className="col-span-1">Time</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-1">Submitted</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-arena-400" size={28} />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <Code2 size={36} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30 font-medium">No submissions yet</p>
            <p className="text-white/20 text-sm mt-1">Solve a problem to see your submissions here</p>
          </div>
        ) : (
          submissions.map(sub => (
            <div key={sub.id} className="border-b border-white/5 last:border-0">
              <button
                onClick={() => toggle(sub.id)}
                className="w-full text-left hover:bg-white/3 transition-colors">
                <div className="grid grid-cols-12 px-5 py-4 items-center gap-2">
                  <div className="col-span-12 md:col-span-4">
                    <p className="text-sm font-semibold text-white/80 truncate">{sub.problemTitle}</p>
                    <p className="text-xs text-white/30 font-mono mt-0.5 md:hidden">{formatDateTime(sub.submittedAt)}</p>
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <span className={`text-xs font-bold ${statusColor(sub.status)}`}>
                      {statusLabel(sub.status)}
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <span className="text-sm text-white/60">{sub.testCasesPassed}/{sub.totalTestCases}</span>
                    <div className="w-full bg-white/10 rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className={`h-1 rounded-full transition-all ${sub.status === 'ACCEPTED' ? 'bg-arena-500' : 'bg-red-500'}`}
                        style={{ width: sub.totalTestCases > 0 ? `${(sub.testCasesPassed / sub.totalTestCases) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-1">
                    <span className="text-sm text-white/50 font-mono">{sub.executionTimeMs ? `${sub.executionTimeMs}ms` : '—'}</span>
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <span className={`text-sm font-bold font-mono ${sub.scoreEarned > 0 ? 'text-arena-400' : 'text-white/30'}`}>
                      +{sub.scoreEarned}
                    </span>
                  </div>
                  <div className="col-span-4 md:col-span-1 text-right md:text-left hidden md:block">
                    <span className="text-xs text-white/30">{formatDateTime(sub.submittedAt)}</span>
                  </div>
                </div>
              </button>

              {/* Expanded code view */}
              {expanded[sub.id] && (
                <div className="px-5 pb-5 border-t border-white/5 bg-dark-900/40">
                  <div className="flex items-center justify-between pt-4 pb-2">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Submitted Code</span>
                    <span className="text-xs font-mono text-white/20">{sub.language}</span>
                  </div>
                  <pre className="text-xs font-mono text-white/70 bg-dark-950 border border-white/8 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {sub.code}
                  </pre>
                  {sub.errorMessage && (
                    <div className="mt-3 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-orange-400 mb-1">Error Output:</p>
                      <pre className="text-xs font-mono text-orange-300 whitespace-pre-wrap">{sub.errorMessage}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="btn-ghost p-2 disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-white/50">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="btn-ghost p-2 disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
