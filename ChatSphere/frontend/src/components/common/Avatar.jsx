import React from 'react';

const COLORS = [
  'from-purple-600 to-indigo-600',
  'from-pink-600 to-rose-600',
  'from-orange-500 to-amber-500',
  'from-teal-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-blue-500 to-sky-500',
  'from-violet-600 to-purple-600',
  'from-red-500 to-orange-500',
];

function getColor(name) {
  if (!name) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const sizeClasses = { xs:'w-7 h-7 text-xs', sm:'w-9 h-9 text-sm', md:'w-11 h-11 text-sm', lg:'w-14 h-14 text-base', xl:'w-20 h-20 text-xl' };

export default function Avatar({ user, size = 'md', isOnline, className = '', showStatus = true }) {
  const name = user?.displayName || user?.username || '';
  const sizeCls = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {user?.avatarUrl
        ? <img src={user.avatarUrl} alt={name}
            className={`${sizeCls} rounded-full object-cover ring-2 ring-surface-border`} />
        : <div className={`avatar ${sizeCls} bg-gradient-to-br ${getColor(name)}`}>
            {getInitials(name)}
          </div>
      }
      {showStatus && isOnline !== undefined && (
        <span className={`absolute bottom-0 right-0 rounded-full border-2 border-dark-800
          ${isOnline ? 'bg-online' : 'bg-offline'}
          ${size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}`} />
      )}
    </div>
  );
}
