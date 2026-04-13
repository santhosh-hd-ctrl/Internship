import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import { messageAPI } from '../../services/api';

export default function MessageList() {
  const { user } = useAuth();
  const { activeChat, messages, setMessages, loadMessages, loadingMsgs, typingUsers } = useChat();
  const bottomRef   = useRef(null);
  const listRef     = useRef(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const prevScrollHeight = useRef(0);

  const chatId  = activeChat?.id;
  const msgs    = (chatId && messages[chatId]) || [];
  const typing  = activeChat && typingUsers[activeChat.id];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [msgs.length]);

  // Reset page when chat changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
  }, [chatId]);

  // Load more on scroll to top
  const handleScroll = useCallback(async () => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore || !chatId) return;
    if (el.scrollTop < 80) {
      setLoadingMore(true);
      prevScrollHeight.current = el.scrollHeight;
      const nextPage = page + 1;
      const newMsgs = await loadMessages(chatId, nextPage);
      if (!newMsgs || newMsgs.length < 50) setHasMore(false);
      setPage(nextPage);
      // Restore scroll position after prepend
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight - prevScrollHeight.current;
      });
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, chatId, page, loadMessages]);

  const handleDelete = useCallback((messageId) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: (prev[chatId]||[]).map(m => m.id===messageId ? {...m, isDeleted:true, content:'This message was deleted'} : m)
    }));
  }, [chatId, setMessages]);

  const handleEdit = useCallback((updated) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: (prev[chatId]||[]).map(m => m.id===updated.id ? updated : m)
    }));
  }, [chatId, setMessages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-950 select-none">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-accent-dark/20 border border-accent/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-accent/60" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-200">Welcome to ChatSphere</h3>
            <p className="text-sm text-dark-500 mt-1">Select a conversation or start a new one</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={listRef} onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 bg-dark-950"
      style={{backgroundImage:'radial-gradient(circle at 1px 1px, rgba(42,42,80,0.15) 1px, transparent 0)', backgroundSize:'32px 32px'}}>

      {/* Load more indicator */}
      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin"/>
        </div>
      )}

      {!hasMore && msgs.length > 0 && (
        <p className="text-center text-xs text-dark-600 py-2">Beginning of conversation</p>
      )}

      {loadingMsgs && msgs.length === 0 ? (
        <div className="flex flex-col gap-3 pt-4">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className={`flex items-end gap-2 ${i%3===0?'flex-row-reverse':''}`}>
              <div className="w-8 h-8 rounded-full bg-surface-hover animate-pulse flex-shrink-0"/>
              <div className={`h-10 rounded-2xl bg-surface-hover animate-pulse ${i%3===0?'w-40':'w-56'}`}/>
            </div>
          ))}
        </div>
      ) : msgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-16 text-dark-500 gap-2">
          <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p className="text-sm">No messages yet. Say hello! 👋</p>
        </div>
      ) : (
        msgs.map((msg, i) => (
          <MessageBubble key={msg.id} message={msg} prevMessage={msgs[i-1]||null}
            onDelete={handleDelete} onEdit={handleEdit}/>
        ))
      )}

      {/* Typing indicator */}
      {typing && (
        <div className="flex items-end gap-2 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-surface-hover flex-shrink-0"/>
          <div className="msg-received px-4 py-3 flex items-center gap-1">
            <span className="typing-dot"/>
            <span className="typing-dot"/>
            <span className="typing-dot"/>
          </div>
        </div>
      )}

      <div ref={bottomRef}/>
    </div>
  );
}
