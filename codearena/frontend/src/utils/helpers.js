export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const difficultyColor = (diff) => {
  switch (diff?.toUpperCase()) {
    case 'EASY': return 'badge-easy'
    case 'MEDIUM': return 'badge-medium'
    case 'HARD': return 'badge-hard'
    default: return 'text-white/40'
  }
}

export const statusColor = (status) => {
  switch (status) {
    case 'ACCEPTED': return 'text-arena-400'
    case 'WRONG_ANSWER': return 'text-red-400'
    case 'TIME_LIMIT_EXCEEDED': return 'text-yellow-400'
    case 'COMPILATION_ERROR': return 'text-orange-400'
    case 'RUNTIME_ERROR': return 'text-orange-400'
    case 'RUNNING': return 'text-blue-400'
    case 'PENDING': return 'text-white/40'
    default: return 'text-white/60'
  }
}

export const statusLabel = (status) => {
  switch (status) {
    case 'ACCEPTED': return 'Accepted'
    case 'WRONG_ANSWER': return 'Wrong Answer'
    case 'TIME_LIMIT_EXCEEDED': return 'Time Limit Exceeded'
    case 'COMPILATION_ERROR': return 'Compilation Error'
    case 'RUNTIME_ERROR': return 'Runtime Error'
    case 'RUNNING': return 'Running...'
    case 'PENDING': return 'Pending'
    default: return status
  }
}

export const rankMedal = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}
