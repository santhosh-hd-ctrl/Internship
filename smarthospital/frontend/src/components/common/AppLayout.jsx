import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import { notificationAPI } from '../../services/api'
import { useNotificationSocket } from '../../hooks/useWebSocket'

export default function AppLayout() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnread = async () => {
    try {
      const res = await notificationAPI.getUnreadCount()
      setUnreadCount(res.data.data.count || 0)
    } catch {}
  }

  useEffect(() => { fetchUnread() }, [])

  useNotificationSocket((notif) => {
    setUnreadCount(c => c + 1)
  }, user?.email)

  return (
    <div className="app-layout">
      <Sidebar unreadCount={unreadCount} />
      <main className="main-content fade-in">
        <Outlet context={{ refreshUnread: fetchUnread }} />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '10px', fontFamily: 'var(--font-body)' },
          success: { iconTheme: { primary: 'var(--teal)', secondary: '#000' } },
        }}
      />
    </div>
  )
}
