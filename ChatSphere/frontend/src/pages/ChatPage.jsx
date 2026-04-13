import React, { useState, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import ChatSidebar from '../components/layout/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import ChatInfoPanel from '../components/chat/ChatInfoPanel';
import NewChatModal, { NewGroupModal } from '../components/modals/NewChatModal';
import ExploreGroupsModal from '../components/modals/ExploreGroupsModal';
import ProfileModal from '../components/modals/ProfileModal';
import SearchPanel from '../components/chat/SearchPanel';

export default function ChatPage() {
  const { sendMessage, selectChat, activeChat } = useChat();

  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(true);

  const handleChatCreated = useCallback((chat) => {
    if (!chat) return;
    selectChat(chat);
    setMobileSidebar(false);
  }, [selectChat]);

  const handleSendMessage = useCallback(async (content, type, extra) => {
    if (!content || !activeChat) return;
    try {
      await sendMessage(content, type, extra);
    } catch (error) {
      console.error("❌ Send message failed:", error);
    }
  }, [sendMessage, activeChat]);

  return (
    <div className="h-screen flex bg-dark-950">

      <div className={`
        flex-shrink-0 w-72 lg:w-80 h-full
        ${mobileSidebar ? 'flex' : 'hidden'} md:flex
      `}>
        <ChatSidebar
          onNewChat={() => setShowNewChat(true)}
          onNewGroup={() => setShowNewGroup(true)}
          onExplore={() => setShowExplore(true)}
          onProfile={() => setShowProfile(true)}
        />
      </div>

      <div className={`
        flex flex-col flex-1 min-w-0 h-full
        ${mobileSidebar && activeChat ? 'hidden md:flex' : 'flex'}
      `}>

        {activeChat && (
          <div className="md:hidden flex items-center px-3 py-2 border-b bg-dark-900">
            <button onClick={() => setMobileSidebar(true)}>←</button>
          </div>
        )}

        <ChatHeader
          onInfo={() => setShowInfo(v => !v)}
          onSearch={() => setShowSearch(v => !v)}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden">

          <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">

            {activeChat ? (
              <>
                <div className="flex-1 overflow-y-auto">
                  <MessageList />
                </div>
                <MessageInput onSend={handleSendMessage} />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-dark-400">
                Select a chat
              </div>
            )}

          </div>

          {showInfo && activeChat && (
            <div className="w-80 overflow-y-auto border-l">
              <ChatInfoPanel onClose={() => setShowInfo(false)} />
            </div>
          )}

          {showSearch && activeChat && (
            <div className="w-80 overflow-y-auto border-l">
              <SearchPanel onClose={() => setShowSearch(false)} />
            </div>
          )}

        </div>
      </div>

      {showNewChat && (
        <NewChatModal onClose={() => setShowNewChat(false)} onChatCreated={handleChatCreated} />
      )}

      {showNewGroup && (
        <NewGroupModal onClose={() => setShowNewGroup(false)} onGroupCreated={handleChatCreated} />
      )}

      {showExplore && (
        <ExploreGroupsModal onClose={() => setShowExplore(false)} />
      )}

      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}