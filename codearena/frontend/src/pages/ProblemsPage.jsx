import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Search, Filter, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { difficultyColor } from '../utils/helpers'

const DIFFICULTIES = ['ALL', 'EASY', 'MEDIUM', 'HARD']

export default function ProblemsPage() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const size = 15

  const fetchProblems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, size, sortBy: 'id', sortDir: 'asc' })
      if (search.trim()) params.set('query', search.trim())
      if (difficulty !== 'ALL') params.set('difficulty', difficulty)
      const { data } = await api.get(`/problems?${params}`)
      setProblems(data.data?.content || [])
      setTotalPages(data.data?.totalPages || 1)
      setTotalElements(data.data?.totalElements || 0)
    } catch {}
    setLoading(false)
  }, [page, search, difficulty])

  useEffect(() => { fetchProblems() }, [fetchProblems])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(0)
  }

  const handleDifficulty = (d) => {
    setDifficulty(d)
    setPage(0)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-1">Problems</h1>
        <p className="text-white/40 text-sm">{totalElements} problems available</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search problems by title or tag..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-white/30 shrink-0" />
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => handleDifficulty(d)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                difficulty === d
                  ? 'bg-arena-500/20 text-arena-400 border border-arena-500/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              {d === 'ALL' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 border-b border-white/8 text-xs font-semibold text-white/30 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Points</div>
          <div className="col-span-2">Acceptance</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-arena-400" size={28} />
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30">No problems found</p>
          </div>
        ) : (
          problems.map((p, i) => (
            <Link key={p.id} to={`/problems/${p.id}`}
              className="grid grid-cols-12 px-4 py-4 border-b border-white/5 hover:bg-white/3 transition-colors group items-center">
              <div className="col-span-1 text-sm text-white/30 font-mono">{page * size + i + 1}</div>
              <div className="col-span-5 flex items-center gap-2">
                {p.solvedByCurrentUser && (
                  <CheckCircle size={14} className="text-arena-400 shrink-0" />
                )}
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">
                  {p.title}
                </span>
                {p.tags && (
                  <div className="hidden md:flex gap-1">
                    {p.tags.split(',').slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-white/5 text-white/30 px-1.5 py-0.5 rounded">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <span className={difficultyColor(p.difficulty)}>
                  {p.difficulty?.charAt(0) + p.difficulty?.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="col-span-2 text-sm text-white/60 font-mono">{p.points} pts</div>
              <div className="col-span-2 text-sm text-white/50 font-mono">
                {p.totalSubmissions > 0 ? `${p.acceptanceRate?.toFixed(1)}%` : '—'}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="btn-ghost p-2 disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-white/50">
            Page {page + 1} of {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="btn-ghost p-2 disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
