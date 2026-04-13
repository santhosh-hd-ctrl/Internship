import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../services/api';
import Avatar from '../common/Avatar';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MessageBubble({ message, prevMessage, onDelete, onEdit }) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [editText, setEditText] = useState(message.content || '');

  const isMine    = message.sender?.id === user?.id;
  const isDeleted = message.isDeleted;
  const showAvatar = !prevMessage || prevMessage.sender?.id !== message.sender?.id;
  const showDate   = !prevMessage || !sameDay(prevMessage.createdAt, message.createdAt);

  function sameDay(a, b) {
    if (!a || !b) return false;
    const da = new Date(a), db = new Date(b);
    return da.getFullYear()===db.getFullYear() && da.getMonth()===db.getMonth() && da.getDate()===db.getDate();
  }

  const handleEdit = async () => {
    if (!editText.trim()) return;
    try {
      await messageAPI.edit(message.id, editText.trim());
      onEdit?.({ ...message, content: editText.trim(), editedAt: new Date().toISOString() });
      setEditing(false);
      toast.success('Message edited');
    } catch { toast.error('Could not edit message'); }
  };

  const handleDelete = async () => {
    try {
      await messageAPI.delete(message.id);
      onDelete?.(message.id);
      toast.success('Message deleted');
    } catch { toast.error('Could not delete message'); }
    setShowMenu(false);
  };

  const statusIcon = {
    SENT:      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
    DELIVERED: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/></svg>,
    READ:      <svg className="w-3.5 h-3.5 text-accent-light" fill="currentColor" viewBox="0 0 24 24"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/></svg>,
  }[message.status] || null;

  return (
    <>
      {showDate && (
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-surface-border"/>
          <span className="text-xs text-dark-500 px-2 py-1 bg-surface rounded-full">
            {format(new Date(message.createdAt), 'MMMM d, yyyy')}
          </span>
          <div className="flex-1 h-px bg-surface-border"/>
        </div>
      )}

      <div className={`flex items-end gap-2 group mb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
        {/* Avatar */}
        {!isMine && (
          <div className="w-8 flex-shrink-0 self-end mb-1">
            {showAvatar
              ? <Avatar user={message.sender} size="xs" showStatus={false}/>
              : <div className="w-7"/>
            }
          </div>
        )}

        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[72%]`}>
          {showAvatar && !isMine && (
            <span className="text-xs text-dark-400 font-medium ml-1 mb-1">
              {message.sender?.displayName || message.sender?.username}
            </span>
          )}

          {/* Reply preview */}
          {message.replyTo && (
            <div className={`mb-1 px-3 py-1.5 rounded-lg border-l-2 border-accent bg-surface-hover text-xs text-dark-400 max-w-full ${isMine?'mr-0':'ml-0'}`}>
              <span className="font-medium text-accent-light">{message.replyTo.sender?.displayName}</span>
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          )}

          <div className="relative flex items-end gap-1">
            {/* Context menu trigger */}
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${isMine?'order-first':'order-last'}`}>
              <button onClick={() => setShowMenu(v => !v)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-dark-500 hover:text-dark-300 hover:bg-surface-hover transition-all">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>

            {/* Bubble */}
            {editing ? (
              <div className="flex gap-2 items-center">
                <input value={editText} onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => { if (e.key==='Enter') handleEdit(); if (e.key==='Escape') setEditing(false); }}
                  className="input-field text-sm py-2 min-w-[200px]" autoFocus/>
                <button onClick={handleEdit} className="text-xs btn-primary py-2 px-3">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs btn-ghost">Cancel</button>
              </div>
            ) : (
              <div className={`px-4 py-2.5 rounded-2xl relative ${isMine ? 'msg-sent' : 'msg-received'} ${isDeleted ? 'opacity-50' : ''}`}>
                {/* File/Image */}
                {message.type === 'IMAGE' && message.fileUrl && !isDeleted && (
                  <img src={message.fileUrl} alt="shared" className="rounded-xl max-w-[240px] max-h-[200px] object-cover mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.fileUrl, '_blank')}/>
                )}
                {message.type === 'FILE' && message.fileUrl && !isDeleted && (
                  <a href={message.fileUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface-hover hover:bg-surface-active transition-colors mb-1">
                    <svg className="w-8 h-8 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-dark-100 truncate max-w-[160px]">{message.fileName||'File'}</p>
                      {message.fileSize && <p className="text-xs text-dark-500">{(message.fileSize/1024).toFixed(1)} KB</p>}
                    </div>
                  </a>
                )}

                {/* Text */}
                {message.content && (
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isDeleted ? 'italic text-dark-500' : 'text-dark-100'}`}>
                    {message.content}
                  </p>
                )}

                {/* Meta */}
                <div className={`flex items-center gap-1 mt-1 ${isMine?'justify-end':'justify-start'}`}>
                  {message.editedAt && !isDeleted && <span className="text-xs text-dark-500 italic">edited</span>}
                  <span className="text-xs text-dark-500">{format(new Date(message.createdAt), 'HH:mm')}</span>
                  {isMine && !isDeleted && <span className="text-dark-500">{statusIcon}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Context menu */}
          {showMenu && !isDeleted && !editing && (
            <div className={`mt-1 glass rounded-xl shadow-glass overflow-hidden z-10 ${isMine?'mr-8':'ml-8'}`}
              style={{position:'absolute', bottom:'calc(100% + 4px)', [isMine?'right':'left']:0}}>
              {isMine && (
                <button onClick={() => { setEditing(true); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-dark-200 hover:bg-surface-hover transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Edit
                </button>
              )}
              {isMine && (
                <button onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-surface-hover transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  Delete
                </button>
              )}
              <button onClick={() => setShowMenu(false)}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-dark-400 hover:bg-surface-hover transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
