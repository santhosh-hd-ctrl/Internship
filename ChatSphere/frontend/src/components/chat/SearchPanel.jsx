import React, { useState, useCallback } from 'react';
import { messageAPI } from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function SearchPanel({ onClose }) {
  const { activeChat } = useChat();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !activeChat) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await messageAPI.search(activeChat.id, query.trim());
      setResults(data.data || []);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  }, [query, activeChat]);

  return (
    <div className="w-72 h-full bg-dark-900 border-l border-surface-border flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <h3 className="font-semibold text-dark-100 text-sm">Search Messages</h3>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-400 hover:text-dark-200 hover:bg-surface-hover transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="p-4 border-b border-surface-border">
        <div className="flex gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSearch()}
            placeholder="Search in this chat…"
            className="input-field text-sm py-2 flex-1" autoFocus/>
          <button onClick={handleSearch} disabled={!query.trim()||loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent hover:bg-accent-light disabled:opacity-50 transition-all">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            }
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {!searched ? (
          <p className="text-center text-dark-500 text-sm py-8">Type to search messages</p>
        ) : results.length === 0 ? (
          <p className="text-center text-dark-500 text-sm py-8">No results found for "{query}"</p>
        ) : (
          <>
            <p className="text-xs text-dark-500">{results.length} result{results.length!==1?'s':''}</p>
            {results.map(msg => (
              <div key={msg.id} className="p-3 rounded-xl border border-surface-border hover:border-accent/30 hover:bg-surface-hover transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-accent-light">{msg.sender?.displayName||msg.sender?.username}</span>
                  <span className="text-xs text-dark-500">{format(new Date(msg.createdAt),'MMM d, HH:mm')}</span>
                </div>
                <p className="text-xs text-dark-300 line-clamp-2">
                  {msg.content?.replace(new RegExp(query,'gi'), m => `**${m}**`) || msg.content}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
