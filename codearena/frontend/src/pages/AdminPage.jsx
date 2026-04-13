import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, ListChecks, Users, Plus, Edit2, Trash2,
  Loader2, ChevronLeft, ChevronRight, X, Save, AlertTriangle,
  TrendingUp, Code2, CheckCircle
} from 'lucide-react'
import { difficultyColor, formatDateTime } from '../utils/helpers'

const EMPTY_PROBLEM = {
  title: '', description: '', constraints: '', inputFormat: '', outputFormat: '',
  difficulty: 'EASY', points: 100, timeLimitMs: 2000, memoryLimitMb: 256,
  sampleInput: '', sampleOutput: '', starterCode: '', tags: '',
  testCases: [{ input: '', expectedOutput: '', isHidden: false, orderIndex: 0 }]
}

export default function AdminPage() {
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [problems, setProblems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [editProblem, setEditProblem] = useState(EMPTY_PROBLEM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { loadData() }, [tab, page])

  const loadData = async () => {
    setLoading(true)
    try {
      if (tab === 'stats') {
        const r = await api.get('/admin/stats')
        setStats(r.data.data)
      } else if (tab === 'problems') {
        const r = await api.get(`/admin/problems?page=${page}&size=10`)
        setProblems(r.data.data?.content || [])
        setTotalPages(r.data.data?.totalPages || 1)
      } else if (tab === 'users') {
        const r = await api.get(`/admin/users?page=${page}&size=15`)
        setUsers(r.data.data?.content || [])
        setTotalPages(r.data.data?.totalPages || 1)
      }
    } catch (e) {
      toast.error('Failed to load data')
    }
    setLoading(false)
  }

  const openCreate = () => {
    setEditProblem({ ...EMPTY_PROBLEM, testCases: [{ input: '', expectedOutput: '', isHidden: false, orderIndex: 0 }] })
    setModal('create')
  }

  const openEdit = async (id) => {
    try {
      const r = await api.get(`/admin/problems/${id}`)
      const p = r.data.data
      setEditProblem({
        ...p,
        testCases: p.testCases?.length > 0
          ? p.testCases
          : [{ input: '', expectedOutput: '', isHidden: false, orderIndex: 0 }]
      })
      setModal('edit')
    } catch { toast.error('Failed to load problem') }
  }

  const handleSave = async () => {
    if (!editProblem.title.trim()) return toast.error('Title is required')
    if (!editProblem.description.trim()) return toast.error('Description is required')
    setSaving(true)
    try {
      if (modal === 'create') {
        await api.post('/admin/problems', editProblem)
        toast.success('Problem created!')
      } else {
        await api.put(`/admin/problems/${editProblem.id}`, editProblem)
        toast.success('Problem updated!')
      }
      setModal(null)
      setPage(0)
      loadData()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/problems/${id}`)
      toast.success('Problem deleted')
      setConfirmDelete(null)
      loadData()
    } catch { toast.error('Delete failed') }
  }

  const addTestCase = () => setEditProblem(p => ({
    ...p, testCases: [...p.testCases, { input: '', expectedOutput: '', isHidden: true, orderIndex: p.testCases.length }]
  }))

  const removeTestCase = (i) => setEditProblem(p => ({
    ...p, testCases: p.testCases.filter((_, idx) => idx !== i)
  }))

  const updateTestCase = (i, field, value) => setEditProblem(p => ({
    ...p,
    testCases: p.testCases.map((tc, idx) => idx === i ? { ...tc, [field]: value } : tc)
  }))

  const tabs = [
    { id: 'stats', icon: LayoutDashboard, label: 'Overview' },
    { id: 'problems', icon: ListChecks, label: 'Problems' },
    { id: 'users', icon: Users, label: 'Users' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Admin Panel</h1>
          <p className="text-white/40 text-sm mt-1">Manage CodeArena platform</p>
        </div>
        {tab === 'problems' && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Problem
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900/60 border border-white/8 rounded-xl p-1 mb-8 w-fit">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { setTab(id); setPage(0) }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-arena-500/20 text-arena-400' : 'text-white/50 hover:text-white'
            }`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-arena-400" size={32} />
        </div>
      ) : (
        <>
          {/* STATS */}
          {tab === 'stats' && stats && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-cyber-400', bg: 'bg-cyber-400/10' },
                  { label: 'Total Problems', value: stats.totalProblems, icon: ListChecks, color: 'text-arena-400', bg: 'bg-arena-400/10' },
                  { label: 'Total Submissions', value: stats.totalSubmissions, icon: Code2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                  { label: 'Accepted Solutions', value: stats.acceptedSubmissions, icon: CheckCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="card-glow p-5">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className={color} size={20} />
                    </div>
                    <div className="text-3xl font-extrabold">{value?.toLocaleString()}</div>
                    <div className="text-xs text-white/40 mt-1">{label}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Easy', value: stats.easyProblems, color: 'text-arena-400', bg: 'bg-arena-500/10', border: 'border-arena-500/20' },
                  { label: 'Medium', value: stats.mediumProblems, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                  { label: 'Hard', value: stats.hardProblems, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                ].map(({ label, value, color, bg, border }) => (
                  <div key={label} className={`card border ${border} p-5 text-center`}>
                    <div className={`text-4xl font-extrabold ${color}`}>{value}</div>
                    <div className="text-sm text-white/40 mt-1">{label} Problems</div>
                  </div>
                ))}
              </div>

              {stats.totalSubmissions > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-arena-400" /> Platform Stats
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 bg-arena-500 rounded-full transition-all"
                        style={{ width: `${(stats.acceptedSubmissions / stats.totalSubmissions) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-arena-400">
                      {((stats.acceptedSubmissions / stats.totalSubmissions) * 100).toFixed(1)}% acceptance rate
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROBLEMS */}
          {tab === 'problems' && (
            <div className="card overflow-hidden">
              <div className="grid grid-cols-12 px-5 py-3 border-b border-white/8 text-xs font-semibold text-white/30 uppercase tracking-wider">
                <div className="col-span-1">ID</div>
                <div className="col-span-4">Title</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-1">Points</div>
                <div className="col-span-1">Tests</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
              {problems.map(p => (
                <div key={p.id} className="grid grid-cols-12 px-5 py-4 border-b border-white/5 items-center hover:bg-white/3 transition-colors">
                  <div className="col-span-1 text-xs text-white/30 font-mono">#{p.id}</div>
                  <div className="col-span-4 text-sm font-medium text-white/80 truncate pr-2">{p.title}</div>
                  <div className="col-span-2"><span className={difficultyColor(p.difficulty)}>{p.difficulty}</span></div>
                  <div className="col-span-1 text-sm text-white/60 font-mono">{p.points}</div>
                  <div className="col-span-1 text-sm text-white/50">{p.testCases?.length ?? 0}</div>
                  <div className="col-span-2 text-xs text-white/30">{formatDateTime(p.createdAt)}</div>
                  <div className="col-span-1">
                    <span className={`text-xs font-medium ${p.isActive !== false ? 'text-arena-400' : 'text-red-400'}`}>
                      {p.isActive !== false ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center gap-2">
                    <button onClick={() => openEdit(p.id)} className="btn-ghost p-1.5 text-white/40 hover:text-white">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setConfirmDelete(p)} className="btn-ghost p-1.5 text-white/40 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {problems.length === 0 && (
                <div className="text-center py-12 text-white/30">No problems found</div>
              )}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="card overflow-hidden">
              <div className="grid grid-cols-12 px-5 py-3 border-b border-white/8 text-xs font-semibold text-white/30 uppercase tracking-wider">
                <div className="col-span-3">Username</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Full Name</div>
                <div className="col-span-1">Role</div>
                <div className="col-span-1">Score</div>
                <div className="col-span-1">Solved</div>
                <div className="col-span-1">Joined</div>
              </div>
              {users.map(u => (
                <div key={u.id} className="grid grid-cols-12 px-5 py-3.5 border-b border-white/5 items-center hover:bg-white/3 transition-colors">
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-arena-500/20 rounded-full flex items-center justify-center text-xs font-bold text-arena-400">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white/80">{u.username}</span>
                  </div>
                  <div className="col-span-3 text-sm text-white/40 truncate">{u.email}</div>
                  <div className="col-span-2 text-sm text-white/60 truncate">{u.fullName}</div>
                  <div className="col-span-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-red-500/15 text-red-400' : 'bg-white/8 text-white/50'
                    }`}>{u.role}</span>
                  </div>
                  <div className="col-span-1 text-sm font-mono text-arena-400">{u.totalScore}</div>
                  <div className="col-span-1 text-sm text-white/60">{u.problemsSolved}</div>
                  <div className="col-span-1 text-xs text-white/30">{formatDateTime(u.createdAt)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {(tab === 'problems' || tab === 'users') && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost p-2 disabled:opacity-30">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-white/50">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-ghost p-2 disabled:opacity-30">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Problem Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <h2 className="text-lg font-bold">{modal === 'create' ? 'Create Problem' : 'Edit Problem'}</h2>
              <button onClick={() => setModal(null)} className="btn-ghost p-2"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Title *</label>
                  <input className="input" placeholder="Problem title" value={editProblem.title}
                    onChange={e => setEditProblem(p => ({ ...p, title: e.target.value }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Difficulty</label>
                  <select className="input" value={editProblem.difficulty}
                    onChange={e => setEditProblem(p => ({ ...p, difficulty: e.target.value }))}>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Points</label>
                  <input type="number" className="input" value={editProblem.points}
                    onChange={e => setEditProblem(p => ({ ...p, points: Number(e.target.value) }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Time Limit (ms)</label>
                  <input type="number" className="input" value={editProblem.timeLimitMs}
                    onChange={e => setEditProblem(p => ({ ...p, timeLimitMs: Number(e.target.value) }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Memory Limit (MB)</label>
                  <input type="number" className="input" value={editProblem.memoryLimitMb}
                    onChange={e => setEditProblem(p => ({ ...p, memoryLimitMb: Number(e.target.value) }))} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Tags (comma-separated)</label>
                  <input className="input" placeholder="array,dynamic-programming,graph" value={editProblem.tags}
                    onChange={e => setEditProblem(p => ({ ...p, tags: e.target.value }))} />
                </div>
              </div>

              {[
                { key: 'description', label: 'Description * (Markdown supported)', rows: 6 },
                { key: 'constraints', label: 'Constraints', rows: 3 },
                { key: 'inputFormat', label: 'Input Format', rows: 2 },
                { key: 'outputFormat', label: 'Output Format', rows: 2 },
              ].map(({ key, label, rows }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>
                  <textarea className="input resize-none font-mono text-sm" rows={rows}
                    placeholder={label} value={editProblem[key] || ''}
                    onChange={e => setEditProblem(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Sample Input</label>
                  <textarea className="input resize-none font-mono text-sm" rows={3}
                    value={editProblem.sampleInput || ''}
                    onChange={e => setEditProblem(p => ({ ...p, sampleInput: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Sample Output</label>
                  <textarea className="input resize-none font-mono text-sm" rows={3}
                    value={editProblem.sampleOutput || ''}
                    onChange={e => setEditProblem(p => ({ ...p, sampleOutput: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Starter Code</label>
                <textarea className="input resize-none font-mono text-sm" rows={6}
                  value={editProblem.starterCode || ''}
                  onChange={e => setEditProblem(p => ({ ...p, starterCode: e.target.value }))} />
              </div>

              {/* Test Cases */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white/60">Test Cases</label>
                  <button onClick={addTestCase} className="btn-secondary text-xs flex items-center gap-1 py-1.5">
                    <Plus size={13} /> Add Test Case
                  </button>
                </div>
                <div className="space-y-3">
                  {editProblem.testCases.map((tc, i) => (
                    <div key={i} className="bg-dark-900 border border-white/8 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-white/50">Test Case {i + 1}</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                            <input type="checkbox" checked={tc.isHidden}
                              onChange={e => updateTestCase(i, 'isHidden', e.target.checked)}
                              className="accent-arena-500" />
                            Hidden
                          </label>
                          {editProblem.testCases.length > 1 && (
                            <button onClick={() => removeTestCase(i)} className="text-red-400/60 hover:text-red-400 transition-colors">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-white/30 mb-1">Input</label>
                          <textarea className="input font-mono text-xs resize-none" rows={3}
                            placeholder="stdin input" value={tc.input}
                            onChange={e => updateTestCase(i, 'input', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs text-white/30 mb-1">Expected Output</label>
                          <textarea className="input font-mono text-xs resize-none" rows={3}
                            placeholder="expected stdout" value={tc.expectedOutput}
                            onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/8">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {modal === 'create' ? 'Create Problem' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={20} />
              </div>
              <h3 className="text-lg font-bold">Delete Problem</h3>
            </div>
            <p className="text-white/60 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">"{confirmDelete.title}"</span>?
              This will hide it from users but preserve submission history.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)}
                className="bg-red-500 hover:bg-red-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
