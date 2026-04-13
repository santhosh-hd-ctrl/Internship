import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { chatAPI, messageAPI } from '../services/api';
import wsService from '../services/websocket';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats]                 = useState([]);
  const [activeChat, setActiveChat]       = useState(null);
  const [messages, setMessages]           = useState({});
  const [onlineUsers, setOnlineUsers]     = useState(new Set());
  const [typingUsers, setTypingUsers]     = useState({});
  const [loadingChats, setLoadingChats]   = useState(false);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const unsubscribers = useRef([]);

  const loadChats = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingChats(true);
    try {
      const { data } = await chatAPI.getMyChats();
      setChats(data.data || []);
    } catch (e) { console.error('Load chats error:', e); }
    finally { setLoadingChats(false); }
  }, [isAuthenticated]);

  const loadMessages = useCallback(async (chatId, page = 0) => {
    setLoadingMsgs(true);
    try {
      const { data } = await messageAPI.getForChat(chatId, page);
      const msgs = data.data || [];
      setMessages(prev => ({
        ...prev,
        [chatId]: page === 0 ? msgs : [...(prev[chatId] || []), ...msgs]
      }));
      return msgs;
    } catch (e) { console.error('Load messages error:', e); }
    finally { setLoadingMsgs(false); }
  }, []);

  const selectChat = useCallback(async (chat) => {
    setActiveChat(chat);
    if (chat && !messages[chat.id]) {
      await loadMessages(chat.id);
    }
    if (chat) {
      chatAPI.markRead(chat.id).catch(() => {});
      wsService.sendReadReceipt(chat.id);
      setChats(prev => prev.map(c =>
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, [messages, loadMessages]);

  const sendMessage = useCallback(async (content, type = 'TEXT', extra = {}) => {
    if (!activeChat) return;
    try {
      const { data } = await messageAPI.send({
        chatId: activeChat.id, content, type, ...extra
      });
      const msg = data.data;
      addMessageToChat(activeChat.id, msg);
      return msg;
    } catch (e) { console.error('Send message error:', e); throw e; }
  }, [activeChat]);

  const addMessageToChat = useCallback((chatId, message) => {
    setMessages(prev => {
      const existing = prev[chatId] || [];
      if (existing.find(m => m.id === message.id)) return prev;
      return { ...prev, [chatId]: [...existing, message] };
    });
    setChats(prev => prev.map(c =>
      c.id === chatId ? { ...c, lastMessage: message, updatedAt: message.createdAt } : c
    ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  }, []);

  // WebSocket subscriptions
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Online status
    const u1 = wsService.subscribe('/topic/online', ({ senderId, senderUsername, payload }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (payload) next.add(senderId); else next.delete(senderId);
        return next;
      });
    });

    // User notifications
    const u2 = wsService.subscribe(`/user/queue/notifications`, (message) => {
      if (message.chatId !== activeChat?.id) {
        setChats(prev => prev.map(c =>
          c.id === message.chatId
            ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: message }
            : c
        ));
      }
    });

    unsubscribers.current = [u1, u2];
    return () => unsubscribers.current.forEach(u => u?.());
  }, [isAuthenticated, user]); // eslint-disable-line

  // Subscribe to active chat messages + typing
  useEffect(() => {
    if (!activeChat) return;
    const chatId = activeChat.id;

    const u1 = wsService.subscribe(`/topic/chat/${chatId}`, (message) => {
      if (message.sender?.id !== user?.id) {
        addMessageToChat(chatId, message);
        wsService.sendReadReceipt(chatId);
        chatAPI.markRead(chatId).catch(() => {});
      }
    });

    const u2 = wsService.subscribe(`/topic/chat/${chatId}/typing`, ({ senderId, senderUsername, payload }) => {
      if (senderId === user?.id) return;
      setTypingUsers(prev => ({ ...prev, [chatId]: payload ? senderUsername : null }));
    });

    const u3 = wsService.subscribe(`/topic/chat/${chatId}/read`, ({ senderId }) => {
      if (senderId !== user?.id) {
        setMessages(prev => ({
          ...prev,
          [chatId]: (prev[chatId] || []).map(m =>
            m.sender?.id === user?.id ? { ...m, status: 'READ' } : m
          )
        }));
      }
    });

    return () => { u1?.(); u2?.(); u3?.(); };
  }, [activeChat?.id]); // eslint-disable-line

  useEffect(() => { if (isAuthenticated) loadChats(); }, [isAuthenticated]); // eslint-disable-line

  const createPrivateChat = useCallback(async (recipientId) => {
    const { data } = await chatAPI.createPrivate(recipientId);
    const chat = data.data;
    setChats(prev => prev.find(c => c.id === chat.id) ? prev : [chat, ...prev]);
    return chat;
  }, []);

  const createGroupChat = useCallback(async (formData) => {
    const { data } = await chatAPI.createGroup(formData);
    const chat = data.data;
    setChats(prev => [chat, ...prev]);
    return chat;
  }, []);

  return (
    <ChatContext.Provider value={{
      chats, setChats,
      activeChat, selectChat,
      messages, setMessages, loadMessages,
      onlineUsers,
      typingUsers,
      loadingChats, loadingMsgs,
      sendMessage, addMessageToChat,
      loadChats,
      createPrivateChat, createGroupChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
