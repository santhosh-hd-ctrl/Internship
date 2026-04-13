import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { fileAPI } from '../../services/api';
import wsService from '../../services/websocket';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';

export default function MessageInput({ onSend }) {
  const { activeChat } = useChat();
  const [text, setText]           = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replyTo, setReplyTo]     = useState(null);
  const textRef   = useRef(null);
  const fileRef   = useRef(null);
  const typingRef = useRef(null);
  const isTypingRef = useRef(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const stopTyping = useCallback(() => {
    if (isTypingRef.current && activeChat) {
      wsService.sendTyping(activeChat.id, false);
      isTypingRef.current = false;
    }
  }, [activeChat]);

  const handleTyping = () => {
    if (!activeChat) return;
    if (!isTypingRef.current) {
      wsService.sendTyping(activeChat.id, true);
      isTypingRef.current = true;
    }
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(stopTyping, 2500);
  };

  const handleSend = async () => {
    if (!text.trim() || !activeChat) return;
    stopTyping();
    const content = text.trim();
    setText('');
    try {
      await onSend(content, 'TEXT', replyTo ? { replyToId: replyTo.id } : {});
      setReplyTo(null);
    } catch { toast.error('Failed to send message'); setText(content); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await fileAPI.upload(fd);
      const { fileUrl, fileName, fileSize, contentType } = data.data;
      const type = contentType?.startsWith('image/') ? 'IMAGE' : 'FILE';
      await onSend(null, type, { fileUrl, fileName, fileSize: Number(fileSize) });
      toast.success('File sent!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); fileRef.current.value = ''; }
  };

  const handleEmoji = (emojiData) => {
    const pos = textRef.current?.selectionStart ?? text.length;
    setText(t => t.slice(0, pos) + emojiData.emoji + t.slice(pos));
    setShowEmoji(false);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  useEffect(() => { return () => { clearTimeout(typingRef.current); stopTyping(); }; }, [stopTyping]);

  return (
    <div className="border-t border-surface-border bg-dark-900 px-4 py-3">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-surface-hover border-l-2 border-accent">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-accent-light">{replyTo.sender?.displayName}</p>
            <p className="text-xs text-dark-400 truncate">{replyTo.content}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-dark-400 hover:text-dark-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Emoji button */}
        <div className="relative">
          <button onClick={() => setShowEmoji(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-400 hover:text-accent hover:bg-surface-hover transition-all flex-shrink-0">
            😊
          </button>
          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-50" style={{filter:'drop-shadow(0 8px 24px rgba(0,0,0,0.6))'}}>
              <EmojiPicker onEmojiClick={handleEmoji} theme="dark"
                skinTonesDisabled previewConfig={{showPreview:false}}
                height={350} width={300}/>
            </div>
          )}
        </div>

        {/* File upload button */}
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-400 hover:text-accent hover:bg-surface-hover transition-all flex-shrink-0 disabled:opacity-50">
          {uploading
            ? <div className="w-4 h-4 border-2 border-dark-400 border-t-accent rounded-full animate-spin"/>
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
          }
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"/>

        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            ref={textRef}
            value={text}
            onChange={e => { setText(e.target.value); handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder={activeChat ? `Message ${activeChat.type==='GROUP' ? activeChat.chatName : ''}…` : 'Select a chat…'}
            disabled={!activeChat}
            rows={1}
            className="w-full bg-surface-hover border border-surface-border rounded-xl px-4 py-2.5 text-sm text-dark-100 placeholder-dark-500 outline-none resize-none transition-all focus:border-accent/50 focus:ring-1 focus:ring-accent/20 disabled:opacity-40"
            style={{maxHeight:'120px'}}
          />
        </div>

        {/* Send button */}
        <button onClick={handleSend}
          disabled={!text.trim() || !activeChat}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow hover:shadow-glow-lg flex-shrink-0">
          <svg className="w-4 h-4 text-white translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>

      {/* Click outside to close emoji */}
      {showEmoji && (
        <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)}/>
      )}
    </div>
  );
}
