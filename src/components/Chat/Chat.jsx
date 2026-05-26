import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../../utils/socket';
import {
  addGroupMessage,
  fetchGroupMessages,
  getOrCreateChat,
  getOrCreateProjectChat,
  setGroupTyping,
  removeGroupTyping,
  isGroupRoom,
} from '../../features/ChatSlice';

const avatarUrl = (name, size = 36) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff&size=${size}`;

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const Chat = ({ workspaceId, projectId }) => {
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const { currentRoom, messages, typingUsers } = useSelector((state) => state.chat.groupChat);
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);
  const activeRoomIdRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (projectId) {
      dispatch(getOrCreateProjectChat(projectId));
    } else if (workspaceId) {
      dispatch(getOrCreateChat(workspaceId));
    }
  }, [workspaceId, projectId, dispatch]);

  useEffect(() => {
    if (!currentRoom || !isGroupRoom(currentRoom)) return;

    const roomId = currentRoom._id;
    activeRoomIdRef.current = roomId;

    dispatch(fetchGroupMessages(roomId));

    socket.connect();
    socket.emit('join_room', { roomId, userId: user._id });

    const receiveHandler = (newMessage) => {
      const msgRoom = newMessage.chatRoomId || newMessage.chatRoom?._id || newMessage.chatRoom;
      if (String(msgRoom) === String(activeRoomIdRef.current)) {
        dispatch(addGroupMessage(newMessage));
      }
    };

    const typingHandler = (data) => {
      if (String(data.roomId) === String(activeRoomIdRef.current)) {
        dispatch(setGroupTyping(data));
      }
    };

    const stopTypingHandler = (data) => {
      if (String(data.roomId) === String(activeRoomIdRef.current)) {
        dispatch(removeGroupTyping(data));
      }
    };

    socket.on('receive_message', receiveHandler);
    socket.on('user_typing', typingHandler);
    socket.on('user_stop_typing', stopTypingHandler);

    return () => {
      socket.off('receive_message', receiveHandler);
      socket.off('user_typing', typingHandler);
      socket.off('user_stop_typing', stopTypingHandler);
    };
  }, [currentRoom, user._id, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && currentRoom && isGroupRoom(currentRoom)) {
      const messageData = {
        chatRoomId: currentRoom._id,
        senderId: user._id,
        content: message.trim(),
        type: 'text',
      };

      socket.emit('send_message', messageData);
      socket.emit('stop_typing', { roomId: currentRoom._id, userId: user._id });
      setMessage('');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (currentRoom && isGroupRoom(currentRoom)) {
      if (e.target.value.length > 0) {
        socket.emit('typing', {
          roomId: currentRoom._id,
          userId: user._id,
          userName: user.name || user.email,
        });
      } else {
        socket.emit('stop_typing', { roomId: currentRoom._id, userId: user._id });
      }
    }
  };

  const roomName = currentRoom?.name || (projectId ? 'Project Chat' : 'Workspace Chat');
  const memberCount = currentRoom?.participants?.length || 0;

  return (
    <div className="flex flex-col min-h-[min(70vh,620px)] max-h-[calc(100dvh-14rem)] sm:max-h-[620px] h-[min(70vh,620px)] rounded-2xl border border-[var(--surface-border)] bg-white shadow-[var(--shadow-card)] overflow-hidden min-w-0 w-full">
      <div className="relative px-4 sm:px-6 py-4 border-b border-[var(--surface-border)] bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate">{roomName}</h2>
              <p className="text-xs text-blue-100/90">Group conversation</p>
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm border border-white/20">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-semibold text-[var(--text-primary)]">No messages yet</p>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
              Say hello to your team — messages appear here in real time.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender?._id === user._id || msg.sender === user._id;
            const senderName = msg.sender?.name || msg.sender?.email || 'User';

            return (
              <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] sm:max-w-[72%] flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <img
                      src={msg.sender?.avatar?.url || avatarUrl(senderName)}
                      alt={senderName}
                      className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm shrink-0 mt-5"
                    />
                  )}
                  <div className={`min-w-0 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <span className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 ml-1">
                        {senderName}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white rounded-2xl rounded-tr-md'
                          : 'bg-white text-[var(--text-primary)] rounded-2xl rounded-tl-md border border-[var(--surface-border)]'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className={`text-[10px] text-[var(--text-muted)] mt-1.5 ${isMe ? 'mr-1' : 'ml-1'}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-5 py-2 text-xs text-[var(--text-muted)] bg-white border-t border-[var(--surface-border-subtle)] flex items-center gap-2">
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          {typingUsers.map((u) => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 bg-white border-t border-[var(--surface-border)] flex gap-2 sm:gap-3 shrink-0"
      >
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Write a message…"
          className="field-input !min-h-[48px] !py-3 flex-1"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="btn-primary !min-h-[48px] !min-w-[48px] !px-0 shrink-0 rounded-xl"
          aria-label="Send message"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Chat;
