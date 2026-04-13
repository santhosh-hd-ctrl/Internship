import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { Trophy, Crown, Loader2, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/leaderboard?limit=50')
      .then(r => setEntries(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const RankBadge = ({ rank }) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>
    if (rank === 2) return <span className="text-2xl">🥈</span>
    if (rank === 3) return <span className="text-2xl">🥉</span>
    return <span className="text-sm font-bold text-white/30 font-mono w-8 text-center">#{rank}</span>
  }

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-arena-400" size={32} />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mb-4">
          <Trophy className="text-yellow-400" size={28} />
        </div>
        <h1 className="text-4xl font-extrabold mb-2">Leaderboard</h1>
        <p className="text-white/40">Top coders ranked by score and problems solved</p>
      </div>

      {/* Podium for top 3 */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-12">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-14 h-14 rounded-full bg-gray-400/20 border-2 border-gray-400/40 flex items-center justify-center text-xl font-extrabold text-gray-300">
              {top3[1].username[0].toUpperCase()}
            </div>
            <p className="text-sm font-bold text-white/80">{top3[1].username}</p>
            <p className="text-xs text-white/40">{top3[1].totalScore} pts</p>
            <div className="w-20 h-20 bg-gray-500/10 border border-gray-500/20 rounded-t-xl flex items-center justify-center">
              <span className="text-2xl">🥈</span>
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <Crown className="text-yellow-400 animate-float" size={24} />
            <div className="w-16 h-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400/60 flex items-center justify-center text-2xl font-extrabold text-yellow-300 glow-arena">
              {top3[0].username[0].toUpperCase()}
            </div>
            <p className="text-sm font-bold text-white">{top3[0].username}</p>
            <p className="text-xs text-yellow-400 font-semibold">{top3[0].totalScore} pts</p>
            <div className="w-20 h-28 bg-yellow-500/10 border border-yellow-500/20 rounded-t-xl flex items-center justify-center">
              <span className="text-3xl">🥇</span>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-400/20 border-2 border-orange-400/40 flex items-center justify-center text-lg font-extrabold text-orange-300">
              {top3[2].username[0].toUpperCase()}
            </div>
            <p className="text-sm font-bold text-white/80">{top3[2].username}</p>
            <p className="text-xs text-white/40">{top3[2].totalScore} pts</p>
            <div className="w-20 h-14 bg-orange-500/10 border border-orange-500/20 rounded-t-xl flex items-center justify-center">
              <span className="text-2xl">🥉</span>
            </div>
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-white/8 text-xs font-semibold text-white/30 uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">User</div>
          <div className="col-span-2">Score</div>
          <div className="col-span-2">Solved</div>
          <div className="col-span-2">Submissions</div>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <Star size={32} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/30">No rankings yet. Be the first to solve a problem!</p>
          </div>
        ) : (
          entries.map((entry) => {
            const isCurrentUser = user?.username === entry.username
            return (
              <div key={entry.userId}
                className={`grid grid-cols-12 px-5 py-4 border-b border-white/5 items-center transition-colors
                  ${isCurrentUser ? 'bg-arena-500/8 border-arena-500/10' : 'hover:bg-white/3'}`}>
                <div className="col-span-1 flex items-center">
                  <RankBadge rank={entry.rank} />
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold
                    ${entry.rank === 1 ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40' :
                      entry.rank === 2 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/40' :
                      entry.rank === 3 ? 'bg-orange-400/20 text-orange-300 border border-orange-400/40' :
                      'bg-white/5 text-white/60 border border-white/10'}`}>
                    {entry.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${isCurrentUser ? 'text-arena-400' : 'text-white/80'}`}>
                        {entry.username}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs bg-arena-500/20 text-arena-400 px-1.5 py-0.5 rounded font-medium">You</span>
                      )}
                    </div>
                    <p className="text-xs text-white/30">{entry.fullName}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className={`text-sm font-bold font-mono ${
                    entry.rank <= 3 ? 'text-yellow-400' : isCurrentUser ? 'text-arena-400' : 'text-white/70'
                  }`}>
                    {entry.totalScore.toLocaleString()}
                  </span>
                  <p className="text-xs text-white/20">points</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-white/70">{entry.problemsSolved}</span>
                  <p className="text-xs text-white/20">problems</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-white/40">{entry.totalSubmissions || '—'}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
