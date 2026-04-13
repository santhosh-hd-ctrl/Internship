import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { ModalWrapper } from './NewChatModal';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

export default function ProfileModal({ onClose }) {
  const { user, refreshUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: user?.displayName||'', bio: user?.bio||'', avatarUrl: user?.avatarUrl||'' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile(form);
      await refreshUser();
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Could not update profile'); }
    finally { setSaving(false); }
  };

  return (
    <ModalWrapper onClose={onClose} title="Profile">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar user={editing ? {...user, ...form} : user} size="xl" isOnline showStatus/>
          {editing && (
            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:bg-accent-light transition-colors">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </label>
          )}
        </div>

        {editing ? (
          <div className="w-full space-y-3">
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Display Name</label>
              <input value={form.displayName} onChange={e=>setForm(p=>({...p,displayName:e.target.value}))} className="input-field text-sm" placeholder="Your display name"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Bio</label>
              <textarea value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} className="input-field text-sm resize-none" rows={2} placeholder="Tell us about yourself…" maxLength={200}/>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Avatar URL</label>
              <input value={form.avatarUrl} onChange={e=>setForm(p=>({...p,avatarUrl:e.target.value}))} className="input-field text-sm" placeholder="https://…"/>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setEditing(false)} className="btn-ghost flex-1 border border-surface-border text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5">
                {saving ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full text-center space-y-1">
            <h3 className="font-bold text-dark-100 text-lg">{user?.displayName||user?.username}</h3>
            <p className="text-sm text-dark-500">@{user?.username}</p>
            <p className="text-sm text-dark-400">{user?.email}</p>
            {user?.bio && <p className="text-sm text-dark-300 mt-2 italic">"{user.bio}"</p>}
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user?.role==='ADMIN'?'bg-amber-500/20 text-amber-400 border border-amber-500/30':'bg-accent/20 text-accent-light border border-accent/30'}`}>
                {user?.role==='ADMIN' ? '👑 Admin' : '👤 User'}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setEditing(true)} className="btn-primary flex-1 text-sm">Edit Profile</button>
              <button onClick={logout} className="flex-1 text-sm py-2.5 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-medium">Sign Out</button>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
