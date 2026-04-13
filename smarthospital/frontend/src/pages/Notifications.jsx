import { useState, useEffect } from 'react'
import { notificationAPI } from '../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useOutletContext } from 'react-router-dom'

const typeColors = {
  APPOINTMENT_BOOKED: 'badge-teal',
  APPOINTMENT_CANCELLED: 'badge-rose',
  APPOINTMENT_REMINDER: 'badge-amber',
  QUEUE_UPDATE: 'badge-sky',
  GENERAL: 'badge-muted',
}
const typeIcons = {
  APPOINTMENT_BOOKED: '✓', APPOINTMENT_CANCELLED: '✕',
  APPOINTMENT_REMINDER: '⏰', QUEUE_UPDATE: '🔢', GENERAL: '📢'
}

export default function Notifications() {
  const context = useOutletContext()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await notificationAPI.getAll({ page, size: 15 })
      setNotifications(res.data.data.content || [])
      setTotalPages(res.data.data.totalPages || 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page])

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      context?.refreshUnread?.()
      toast.success('All notifications marked as read')
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      context?.refreshUnread?.()
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all as read</button>
          )}
        </div>
      </div>

      <div className="content-area">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔔</div><p>No notifications yet</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(n => (
              <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                style={{
                  background: n.read ? 'var(--bg-card)' : 'rgba(0,200,160,0.04)',
                  border: `1px solid ${n.read ? 'var(--border)' : 'rgba(0,200,160,0.2)'}`,
                  borderRadius: 12, padding: '16px 20px', cursor: n.read ? 'default' : 'pointer',
                  display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'all 0.15s'
                }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: n.read ? 'var(--bg-elevated)' : 'rgba(0,200,160,0.1)',
                  border: `1px solid ${n.read ? 'var(--border)' : 'rgba(0,200,160,0.2)'}`
                }}>
                  {typeIcons[n.type] || '📢'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: n.read ? 500 : 700, fontSize: 14 }}>{n.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {n.createdAt ? format(new Date(n.createdAt), 'MMM d, HH:mm') : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                    <span className={`badge ${typeColors[n.type] || 'badge-muted'}`} style={{ fontSize: 11 }}>
                      {n.type?.replace(/_/g, ' ')}
                    </span>
                    {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-secondary'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
