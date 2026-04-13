import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.onConnectCallbacks = [];
  }

  connect(token, onConnected, onDisconnected) {
    if (this.client?.active) return;

    this.client = new Client({
      // ✅ Use full URL (avoids issues)
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/chat'),

      connectHeaders: {
        Authorization: `Bearer ${token}`, // ✅ JWT
      },

      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: 3000,

      onConnect: () => {
        this.connected = true;
        this.reconnectAttempts = 0;

        console.log('✅ WebSocket connected');

        // ✅ Execute queued subscriptions
        this.onConnectCallbacks.forEach(cb => cb());
        this.onConnectCallbacks = [];

        onConnected?.();
      },

      onDisconnect: () => {
        this.connected = false;
        console.log('❌ WebSocket disconnected');
        onDisconnected?.();
      },

      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
      },

      onWebSocketError: (error) => {
        console.error('❌ WebSocket error:', error);
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();

    this.client?.deactivate();
    this.connected = false;
  }

  subscribe(destination, callback) {
    // ✅ FIX: wait for REAL connection
    if (!this.client || !this.connected) {
      console.log('⏳ Waiting for WebSocket connection...');

      this.onConnectCallbacks.push(() => {
        this._doSubscribe(destination, callback);
      });

      return () => {};
    }

    return this._doSubscribe(destination, callback);
  }

  _doSubscribe(destination, callback) {
    // ✅ SAFETY CHECK
    if (!this.client || !this.connected) {
      console.warn('❌ Cannot subscribe, not connected');
      return () => {};
    }

    // unsubscribe existing
    if (this.subscriptions.has(destination)) {
      this.subscriptions.get(destination).unsubscribe();
    }

    const sub = this.client.subscribe(destination, (msg) => {
      try {
        callback(JSON.parse(msg.body));
      } catch (e) {
        console.error('❌ Error parsing WS message:', e);
      }
    });

    this.subscriptions.set(destination, sub);

    return () => {
      sub.unsubscribe();
      this.subscriptions.delete(destination);
    };
  }

  publish(destination, body) {
    // ✅ FIX: check real connection
    if (!this.client || !this.connected) {
      console.warn('❌ WS not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  // 🔥 Your existing APIs (unchanged)
  sendMessage(request) {
    this.publish('/app/chat.send', request);
  }

  sendTyping(chatId, isTyping) {
    this.publish('/app/chat.typing', { chatId, isTyping });
  }

  sendReadReceipt(chatId) {
    this.publish('/app/chat.read', { chatId });
  }
}

export const wsService = new WebSocketService();
export default wsService;