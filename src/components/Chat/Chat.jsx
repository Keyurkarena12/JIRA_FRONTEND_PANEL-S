import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../../utils/socket';
import { addMessage, fetchMessages, getOrCreateChat, setTyping, removeTyping } from '../../features/ChatSlice';

const Chat = ({ workspaceId, projectId }) => {
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const { currentRoom, messages, typingUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (workspaceId) {
      dispatch(getOrCreateChat(workspaceId));
    }
  }, [workspaceId, dispatch]);

  useEffect(() => {
    if (currentRoom) {
      dispatch(fetchMessages(currentRoom._id));

      // Connect and join room
      socket.connect();
      socket.emit('join_room', { roomId: currentRoom._id, userId: user._id });

      // Listen for messages
      socket.on('receive_message', (newMessage) => {
        dispatch(addMessage(newMessage));
      });

      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        dispatch(setTyping(data));
      });

      socket.on('user_stop_typing', (data) => {
        dispatch(removeTyping(data));
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
        socket.disconnect();
      };
    }
  }, [currentRoom, user._id, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && currentRoom) {
      const messageData = {
        chatRoomId: currentRoom._id,
        senderId: user._id,
        content: message.trim(),
        type: 'text'
      };

      socket.emit('send_message', messageData);
      socket.emit('stop_typing', { roomId: currentRoom._id, userId: user._id });
      setMessage('');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (currentRoom) {
      if (e.target.value.length > 0) {
        socket.emit('typing', {
          roomId: currentRoom._id,
          userId: user._id,
          userName: user.name || user.email
        });
      } else {
        socket.emit('stop_typing', { roomId: currentRoom._id, userId: user._id });
      }
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {currentRoom?.name || 'Workspace Chat'}
          </h2>
          <p className="text-xs text-gray-500">
            {currentRoom?.participants?.length || 0} members
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F9FAFB]">
        {messages.map((msg, index) => {
          const isMe = msg.sender?._id === user._id || msg.sender === user._id;
          return (
            <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && (
                  <img
                    src={`https://ui-avatars.com/api/?name=${msg.sender?.name || 'User'}&background=random&size=32`}
                    alt={msg.sender?.name}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                )}
                <div>
                  {!isMe && (
                    <span className="text-xs text-gray-500 mb-1 block ml-1">
                      {msg.sender?.name || 'User'}
                    </span>
                  )}
                  <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe
                      ? 'bg-[#0052CC] text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                    {msg.content}
                  </div>
                  <span className={`text-[10px] text-gray-400 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-1 text-xs text-gray-400 italic bg-white">
          {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3">
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] transition-all"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-[#0052CC] text-white p-2 rounded-lg hover:bg-[#0747A6] transition-colors disabled:opacity-50 flex items-center justify-center"
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
