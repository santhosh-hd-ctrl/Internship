import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { ModalWrapper } from './NewChatModal';
import toast from 'react-hot-toast';

export default function ExploreGroupsModal({ onClose, onJoined }) {
  const { loadChats } = useChat();
  const [groups, setGroups]   = useState([]);
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    chatAPI.getAllGroups().then(r => setGroups(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = groups.filter(g =>
    !query || (g.chatName||'').toLowerCase().includes(query.toLowerCase()) ||
    (g.description||'').toLowerCase().includes(query.toLowerCase())
  );

  const handleJoin = async (group) => {
    setJoining(group.id);
    try {
      await chatAPI.joinGroup(group.id);
      await loadChats();
      toast.success(`Joined "${group.chatName}"!`);
      onJoined?.();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not join group');
    } finally { setJoining(null); }
  };

  return (
    <ModalWrapper onClose={onClose} title="Explore Groups">
      <div className="space-y-3">
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search public groups…" className="input-field pl-9" autoFocus/>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            Array.from({length:4}).map((_,i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-hover animate-pulse h-16"/>
            ))
          ) : filtered.length === 0 ? (
            <p className="text-center text-dark-500 text-sm py-8">No groups found</p>
          ) : filtered.map(g => (
            <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border border-surface-border hover:border-accent/30 hover:bg-surface-hover transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-accent-dark/30 border border-accent/30 flex items-center justify-center text-accent font-bold flex-shrink-0">
                {(g.chatName||'G').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dark-100 truncate">{g.chatName}</p>
                <p className="text-xs text-dark-500 truncate">{g.description || 'No description'} · {g.members?.length||0} members</p>
              </div>
              <button onClick={()=>handleJoin(g)} disabled={joining===g.id}
                className="btn-primary text-xs py-1.5 px-3 flex-shrink-0 flex items-center gap-1">
                {joining===g.id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Join'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
}
