import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../../utils/socket';
import {
  addDirectMessage,
  fetchDirectMessages,
  getDirectChatThunk,
  createDirectChatThunk,
  setDirectTyping,
  removeDirectTyping,
  clearDirectChat,
} from '../../features/ChatSlice';

const avatarUrl = (user, size = 36) =>
  user?.avatar?.url ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'User')}&background=6366f1&color=fff&size=${size}`;

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const DirectChat = ({ targetUser, onClose, chatListOpen, workspaceId, projectId }) => {
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const { currentRoom, messages, typingUsers } = useSelector((state) => state.chat.directChat);
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);
  const activeRoomIdRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (targetUser) {
      dispatch(getDirectChatThunk({ userId: targetUser._id, workspaceId, projectId }));
    }

    return () => {
      dispatch(clearDirectChat());
    };
  }, [targetUser, workspaceId, projectId, dispatch]);

  useEffect(() => {
    if (!currentRoom || currentRoom.type !== 'private') return;

    const roomId = currentRoom._id;
    activeRoomIdRef.current = roomId;

    dispatch(fetchDirectMessages(roomId));

    socket.connect();
    socket.emit('join_room', { roomId, userId: user._id });

    const receiveHandler = (newMessage) => {
      const msgRoom = newMessage.chatRoomId || newMessage.chatRoom?._id || newMessage.chatRoom;
      if (String(msgRoom) === String(activeRoomIdRef.current)) {
        dispatch(addDirectMessage(newMessage));
      }
    };

    const typingHandler = (data) => {
      if (String(data.roomId) === String(activeRoomIdRef.current)) {
        dispatch(setDirectTyping(data));
      }
    };

    const stopTypingHandler = (data) => {
      if (String(data.roomId) === String(activeRoomIdRef.current)) {
        dispatch(removeDirectTyping(data));
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

  const handleClose = () => {
    dispatch(clearDirectChat());
    onClose?.();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      let activeRoom = currentRoom?.type === 'private' ? currentRoom : null;
      const isNewRoom = !activeRoom;

      if (isNewRoom) {
        try {
          const result = await dispatch(
            createDirectChatThunk({
              userId: targetUser._id,
              workspaceId,
              projectId,
            })
          ).unwrap();
          activeRoom = result;
          activeRoomIdRef.current = result._id;
        } catch (err) {
          console.error('Failed to create chat room:', err);
          return;
        }
      }

      if (activeRoom) {
        if (isNewRoom) {
          socket.connect();
          socket.emit('join_room', { roomId: activeRoom._id, userId: user._id });
        }

        const messageData = {
          chatRoomId: activeRoom._id,
          senderId: user._id,
          content: message.trim(),
          type: 'text',
        };

        socket.emit('send_message', messageData);
        socket.emit('stop_typing', { roomId: activeRoom._id, userId: user._id });
        setMessage('');
      }
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (currentRoom?.type === 'private') {
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

  const displayName = targetUser.name || targetUser.email;

  return (
    <div
      className={`
        fixed bottom-0 z-50 flex flex-col overflow-hidden
        transition-all duration-300 ease-out
        border border-[var(--surface-border)] bg-white
        shadow-[0_-8px_40px_-8px_rgba(15,23,42,0.25)]
        left-0 right-0 w-full rounded-t-2xl rounded-b-none
        md:left-auto md:w-[340px] md:rounded-2xl md:bottom-4 md:shadow-[var(--shadow-glow)]
        ${chatListOpen ? 'md:right-[272px]' : 'md:right-24'}
      `}
      style={{ height: 'min(420px, 85dvh)' }}
    >
      <div className="px-4 py-3.5 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={avatarUrl(targetUser, 40)}
              alt={displayName}
              className="w-10 h-10 rounded-full ring-2 ring-white/30 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate" title={displayName}>
              {displayName}
            </h3>
            <p className="text-[11px] text-blue-100/90">Direct message</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-xl hover:bg-white/15 transition-colors shrink-0"
          aria-label="Close chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center px-2">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              Start a conversation with {displayName.split(' ')[0] || 'them'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Messages are private between you two.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender?._id === user._id || msg.sender === user._id;

            return (
              <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white rounded-tr-md'
                      : 'bg-white text-[var(--text-primary)] border border-[var(--surface-border)] rounded-tl-md'
                  }`}
                >
                  {msg.content}
                  <span
                    className={`text-[10px] mt-1.5 block ${
                      isMe ? 'text-right text-blue-100/80' : 'text-left text-[var(--text-muted)]'
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-1.5 text-[11px] text-[var(--text-muted)] bg-white border-t border-[var(--surface-border-subtle)] flex items-center gap-2">
          <span className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-[var(--brand-primary)] animate-bounce" />
            <span className="w-1 h-1 rounded-full bg-[var(--brand-primary)] animate-bounce" style={{ animationDelay: '120ms' }} />
            <span className="w-1 h-1 rounded-full bg-[var(--brand-primary)] animate-bounce" style={{ animationDelay: '240ms' }} />
          </span>
          typing…
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white border-t border-[var(--surface-border)] flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Type a message…"
          className="field-input !min-h-[44px] !py-2.5 !text-sm flex-1"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="btn-primary !min-h-[44px] !min-w-[44px] !px-0 shrink-0 rounded-xl"
          aria-label="Send message"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default DirectChat;
