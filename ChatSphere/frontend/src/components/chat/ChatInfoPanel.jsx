import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { chatAPI } from '../../services/api';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

export default function ChatInfoPanel({ onClose }) {
  const { user } = useAuth();
  const { activeChat, selectChat, loadChats, onlineUsers } = useChat();

  if (!activeChat) return null;

  const isGroup = activeChat.type === 'GROUP';
  const otherUser = !isGroup ? activeChat.members?.find(m => m.user?.id !== user?.id)?.user : null;
  const isAdmin = activeChat.members?.find(m => m.user?.id === user?.id)?.role === 'ADMIN';

  const handleLeave = async () => {
    if (!window.confirm('Leave this group?')) return;
    try {
      await chatAPI.leaveGroup(activeChat.id);
      await loadChats();
      selectChat(null);
      onClose();
      toast.success('Left the group');
    } catch (e) { toast.error(e.response?.data?.error || 'Could not leave group'); }
  };

  return (
    <div className="h-full w-72 bg-dark-900 border-l border-surface-border flex flex-col animate-slide-in-right overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <h3 className="font-semibold text-dark-100 text-sm">{isGroup ? 'Group Info' : 'Contact Info'}</h3>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-400 hover:text-dark-200 hover:bg-surface-hover transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Avatar & name */}
      <div className="flex flex-col items-center gap-3 py-6 px-4">
        {isGroup ? (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/40 to-accent-dark/40 border-2 border-accent/40 flex items-center justify-center text-3xl font-bold text-accent">
            {(activeChat.chatName||'G').charAt(0).toUpperCase()}
          </div>
        ) : (
          <Avatar user={otherUser} size="xl" isOnline={onlineUsers.has(otherUser?.id)} showStatus/>
        )}
        <div className="text-center">
          <h2 className="font-bold text-dark-100">
            {isGroup ? activeChat.chatName : (otherUser?.displayName || otherUser?.username)}
          </h2>
          {!isGroup && <p className="text-xs text-dark-500 mt-0.5">@{otherUser?.username}</p>}
          {isGroup && (
            <p className="text-xs text-dark-500 mt-0.5">{activeChat.members?.length} members</p>
          )}
          {!isGroup && (
            <p className={`text-xs mt-1 ${onlineUsers.has(otherUser?.id) ? 'text-online' : 'text-dark-500'}`}>
              {onlineUsers.has(otherUser?.id) ? '● Active now' : '○ Offline'}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {isGroup && activeChat.description && (
        <div className="px-4 pb-4">
          <p className="text-xs font-medium text-dark-400 mb-1.5">Description</p>
          <p className="text-sm text-dark-300">{activeChat.description}</p>
        </div>
      )}

      {/* Bio for private */}
      {!isGroup && otherUser?.bio && (
        <div className="px-4 pb-4">
          <p className="text-xs font-medium text-dark-400 mb-1.5">Bio</p>
          <p className="text-sm text-dark-300 italic">"{otherUser.bio}"</p>
        </div>
      )}

      {/* Members list for groups */}
      {isGroup && (
        <div className="px-4 pb-4">
          <p className="text-xs font-medium text-dark-400 mb-2">Members ({activeChat.members?.length})</p>
          <div className="space-y-1">
            {activeChat.members?.map(member => (
              <div key={member.id} className="flex items-center gap-2.5 py-1.5">
                <Avatar user={member.user} size="xs" isOnline={onlineUsers.has(member.user?.id)} showStatus/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-200 truncate font-medium">
                    {member.user?.displayName || member.user?.username}
                    {member.user?.id === user?.id && <span className="text-dark-500 font-normal"> (you)</span>}
                  </p>
                </div>
                {member.role === 'ADMIN' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto px-4 pb-6 space-y-2">
        {isGroup && (
          <button onClick={handleLeave}
            className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium">
            Leave Group
          </button>
        )}
      </div>
    </div>
  );
}
