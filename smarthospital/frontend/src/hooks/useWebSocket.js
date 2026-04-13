import { useEffect, useRef, useCallback } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

export function useWebSocket(onQueueUpdate, doctorId) {
  const clientRef = useRef(null)

  useEffect(() => {
    if (!doctorId) return

    const token = localStorage.getItem('token')
    const client = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/queue/${doctorId}`, (message) => {
          try { onQueueUpdate(JSON.parse(message.body)) } catch(e) {}
        })
      },
      onStompError: () => {},
    })

    client.activate()
    clientRef.current = client

    return () => { if (clientRef.current) clientRef.current.deactivate() }
  }, [doctorId])
}

export function useNotificationSocket(onNotification, userEmail) {
  const clientRef = useRef(null)

  useEffect(() => {
    if (!userEmail) return

    const token = localStorage.getItem('token')
    const client = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/user/queue/notifications`, (message) => {
          try { onNotification(JSON.parse(message.body)) } catch(e) {}
        })
      },
      onStompError: () => {},
    })

    client.activate()
    clientRef.current = client

    return () => { if (clientRef.current) clientRef.current.deactivate() }
  }, [userEmail])
}
