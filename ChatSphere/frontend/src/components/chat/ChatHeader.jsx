import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';

export default function ChatHeader({ onInfo, onSearch }) {
  const { user } = useAuth();
  const { activeChat, onlineUsers, typingUsers } = useChat();

  if (!activeChat) return null;

  function getChatName() {
    if (activeChat.type === 'GROUP') return activeChat.chatName || 'Group Chat';
    const other = activeChat.members?.find(m => m.user?.id !== user?.id);
    return other?.user?.displayName || other?.user?.username || 'Unknown';
  }

  function getOtherUser() {
    if (activeChat.type !== 'PRIVATE') return null;
    return activeChat.members?.find(m => m.user?.id !== user?.id)?.user || null;
  }

  const otherUser = getOtherUser();
  const online    = otherUser && onlineUsers.has(otherUser.id);
  const typing    = typingUsers[activeChat.id];
  const memberCount = activeChat.members?.length || 0;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-dark-900/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {activeChat.type === 'GROUP' ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/40 to-accent-dark/40 border border-accent/30 flex items-center justify-center text-accent font-bold">
            {(activeChat.chatName||'G').charAt(0).toUpperCase()}
          </div>
        ) : (
          <Avatar user={otherUser} size="sm" isOnline={online} showStatus />
        )}
        <div>
          <h2 className="font-semibold text-dark-100 text-sm leading-tight">{getChatName()}</h2>
          <p className="text-xs leading-tight">
            {typing ? (
              <span className="text-accent-light flex items-center gap-1">
                <span className="typing-dot"/> <span className="typing-dot"/> <span className="typing-dot"/>
                <span className="ml-1">{typing} is typing…</span>
              </span>
            ) : activeChat.type === 'GROUP' ? (
              <span className="text-dark-400">{memberCount} members</span>
            ) : online ? (
              <span className="text-online">Active now</span>
            ) : (
              <span className="text-dark-500">Offline</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={onSearch}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-dark-200 hover:bg-surface-hover transition-all" title="Search messages">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>
        <button onClick={onInfo}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-dark-200 hover:bg-surface-hover transition-all" title="Chat info">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
