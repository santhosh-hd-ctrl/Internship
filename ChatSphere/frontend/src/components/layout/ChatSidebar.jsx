import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import { formatDistanceToNow } from 'date-fns';

export default function ChatSidebar({ onNewChat, onNewGroup, onProfile, onExplore }) {
  const { user } = useAuth();
  const { chats, activeChat, selectChat, onlineUsers, loadingChats } = useChat();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all'); // all | direct | groups

  const filtered = chats.filter(c => {
    const name = getChatName(c, user);
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === 'direct') return c.type === 'PRIVATE';
    if (tab === 'groups') return c.type === 'GROUP';
    return true;
  });

  function getChatName(chat, me) {
    if (chat.type === 'GROUP') return chat.chatName || 'Group Chat';
    const other = chat.members?.find(m => m.user?.id !== me?.id);
    return other?.user?.displayName || other?.user?.username || 'Unknown';
  }

  function getChatAvatar(chat, me) {
    if (chat.type === 'GROUP') return null;
    return chat.members?.find(m => m.user?.id !== me?.id)?.user || null;
  }

  function isOnline(chat) {
    if (chat.type === 'GROUP') return false;
    const other = chat.members?.find(m => m.user?.id !== user?.id);
    return other && onlineUsers.has(other.user?.id);
  }

  return (
    <aside className="flex flex-col h-full w-full bg-dark-900 border-r border-surface-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-glow">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <span className="font-bold text-dark-100 gradient-text font-display text-lg">ChatSphere</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onNewChat} title="New Direct Message"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-accent hover:bg-surface-hover transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
          </button>
          <button onClick={onNewGroup} title="New Group"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-accent hover:bg-surface-hover transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
          <button onClick={onExplore} title="Explore Groups"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-accent hover:bg-surface-hover transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full bg-surface-hover border border-surface-border rounded-xl pl-9 pr-4 py-2 text-sm text-dark-200 placeholder-dark-500 outline-none focus:border-accent/50 transition-all"/>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pb-3">
        {[['all','All'],['direct','Direct'],['groups','Groups']].map(([val,label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${
              tab === val ? 'bg-accent text-white' : 'text-dark-400 hover:text-dark-200 hover:bg-surface-hover'
            }`}>{label}</button>
        ))}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
        {loadingChats ? (
          Array.from({length: 6}).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
              <div className="w-11 h-11 rounded-full bg-surface-hover animate-pulse flex-shrink-0"/>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-hover rounded-full animate-pulse w-2/3"/>
                <div className="h-2.5 bg-surface-hover rounded-full animate-pulse w-1/2"/>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-dark-500 gap-3">
            <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <p className="text-sm">{search ? 'No chats found' : 'No conversations yet'}</p>
            {!search && <button onClick={onNewChat} className="text-xs text-accent hover:underline">Start one →</button>}
          </div>
        ) : filtered.map(chat => {
          const name     = getChatName(chat, user);
          const avatar   = getChatAvatar(chat, user);
          const online   = isOnline(chat);
          const isActive = activeChat?.id === chat.id;
          const lastMsg  = chat.lastMessage;
          const unread   = chat.unreadCount || 0;

          return (
            <button key={chat.id} onClick={() => selectChat(chat)}
              className={`sidebar-item w-full text-left ${isActive ? 'active' : ''}`}>
              <div className="relative flex-shrink-0">
                {chat.type === 'GROUP' ? (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent/40 to-accent-dark/40 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm">
                    {(chat.chatName||'G').charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <Avatar user={avatar} size="md" isOnline={online} showStatus />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-dark-100'}`}>{name}</span>
                  {lastMsg && (
                    <span className="text-xs text-dark-500 flex-shrink-0">
                      {formatDistanceToNow(new Date(lastMsg.createdAt), {addSuffix:false}).replace('about ','').replace(' ago','')}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <p className="text-xs text-dark-400 truncate">
                    {lastMsg
                      ? lastMsg.isDeleted ? '🗑 Deleted'
                        : lastMsg.type === 'IMAGE' ? '📷 Image'
                        : lastMsg.type === 'FILE' ? `📎 ${lastMsg.fileName||'File'}`
                        : (lastMsg.sender?.id === user?.id ? 'You: ' : '') + (lastMsg.content || '')
                      : 'No messages yet'
                    }
                  </p>
                  {unread > 0 && <span className="badge flex-shrink-0">{unread > 99 ? '99+' : unread}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* User profile footer */}
      <div className="px-3 py-3 border-t border-surface-border">
        <button onClick={onProfile} className="flex items-center gap-3 w-full px-2 py-2 rounded-xl hover:bg-surface-hover transition-all group">
          <Avatar user={user} size="sm" isOnline={true} showStatus />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-dark-100 truncate">{user?.displayName || user?.username}</p>
            <p className="text-xs text-online">● Online</p>
          </div>
          <svg className="w-4 h-4 text-dark-500 group-hover:text-dark-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
