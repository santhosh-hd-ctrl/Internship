import React, { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

export default function NewChatModal({ onClose, onChatCreated }) {
  const { createPrivateChat, onlineUsers } = useChat();
  const [query, setQuery]   = useState('');
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(null);

  const search = useCallback(async (q) => {
    setLoading(true);
    try {
      const { data } = q.trim()
        ? await userAPI.search(q)
        : await userAPI.getAll();
      setUsers(data.data || []);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const handleSelect = async (user) => {
    setCreating(user.id);
    try {
      const chat = await createPrivateChat(user.id);
      onChatCreated(chat);
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not start chat');
    } finally { setCreating(null); }
  };

  return (
    <ModalWrapper onClose={onClose} title="New Direct Message">
      <div className="relative mb-4">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, username or email…"
          className="input-field pl-9" autoFocus/>
      </div>

      <div className="space-y-1 max-h-72 overflow-y-auto">
        {loading ? (
          Array.from({length:4}).map((_,i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-surface-hover animate-pulse"/>
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-surface-hover rounded animate-pulse w-1/2"/>
                <div className="h-2.5 bg-surface-hover rounded animate-pulse w-1/3"/>
              </div>
            </div>
          ))
        ) : users.length === 0 ? (
          <p className="text-center text-dark-500 text-sm py-8">No users found</p>
        ) : users.map(u => (
          <button key={u.id} onClick={() => handleSelect(u)} disabled={creating === u.id}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-surface-hover transition-all text-left disabled:opacity-60">
            <Avatar user={u} size="sm" isOnline={onlineUsers.has(u.id)} showStatus/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-100 truncate">{u.displayName || u.username}</p>
              <p className="text-xs text-dark-500 truncate">@{u.username}</p>
            </div>
            {onlineUsers.has(u.id) && <span className="text-xs text-online">Online</span>}
            {creating === u.id && <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin"/>}
          </button>
        ))}
      </div>
    </ModalWrapper>
  );
}

export function NewGroupModal({ onClose, onGroupCreated }) {
  const { createGroupChat, onlineUsers } = useChat();
  const [step, setStep]     = useState(1);
  const [name, setName]     = useState('');
  const [desc, setDesc]     = useState('');
  const [query, setQuery]   = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    userAPI.getAll().then(r => setAllUsers(r.data.data || [])).catch(() => {});
  }, []);

  const filtered = allUsers.filter(u =>
    !query || u.username.toLowerCase().includes(query.toLowerCase()) ||
    (u.displayName||'').toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (u) => setSelected(prev =>
    prev.find(x => x.id===u.id) ? prev.filter(x=>x.id!==u.id) : [...prev, u]
  );

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Group name required'); return; }
    setCreating(true);
    try {
      const chat = await createGroupChat({ chatName:name.trim(), description:desc.trim(), memberIds:selected.map(u=>u.id) });
      onGroupCreated(chat);
      onClose();
      toast.success(`Group "${name}" created!`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not create group');
    } finally { setCreating(false); }
  };

  return (
    <ModalWrapper onClose={onClose} title={step===1 ? 'Create Group' : 'Add Members'}>
      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">Group Name <span className="text-accent">*</span></label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Team Alpha"
              className="input-field" autoFocus maxLength={100}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">Description</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What's this group about?" rows={2}
              className="input-field resize-none" maxLength={500}/>
          </div>
          <button onClick={() => setStep(2)} disabled={!name.trim()} className="btn-primary w-full">Next: Add Members</button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-dark-400">
            Group: <span className="text-accent-light font-medium">{name}</span> · {selected.length} members selected
          </p>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map(u => (
                <span key={u.id} onClick={()=>toggle(u)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/20 border border-accent/30 text-xs text-accent-light cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all">
                  {u.displayName||u.username}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </span>
              ))}
            </div>
          )}
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users to add…" className="input-field pl-9"/>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filtered.map(u => {
              const isSelected = !!selected.find(x=>x.id===u.id);
              return (
                <button key={u.id} onClick={()=>toggle(u)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all text-left ${isSelected?'bg-accent/10 border border-accent/30':'hover:bg-surface-hover'}`}>
                  <Avatar user={u} size="xs" isOnline={onlineUsers.has(u.id)} showStatus/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100 truncate">{u.displayName||u.username}</p>
                    <p className="text-xs text-dark-500">@{u.username}</p>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={()=>setStep(1)} className="btn-ghost flex-1 border border-surface-border">Back</button>
            <button onClick={handleCreate} disabled={creating} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {creating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating…</> : 'Create Group'}
            </button>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
}

export function ModalWrapper({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="glass rounded-2xl shadow-glass w-full max-w-md animate-bounce-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h3 className="font-semibold text-dark-100">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-400 hover:text-dark-200 hover:bg-surface-hover transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
