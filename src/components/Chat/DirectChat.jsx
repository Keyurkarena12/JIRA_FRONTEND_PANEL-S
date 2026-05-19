import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../../utils/socket';
import { addMessage, fetchMessages, getOrCreateDirectChatThunk, setTyping, removeTyping } from '../../features/ChatSlice';

const DirectChat = ({ targetUser, onClose }) => {
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const { currentRoom, messages, typingUsers } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (targetUser) {
      dispatch(getOrCreateDirectChatThunk(targetUser._id));
    }
  }, [targetUser, dispatch]);

  useEffect(() => {
    if (currentRoom && currentRoom.type === 'private') {
      dispatch(fetchMessages(currentRoom._id));

      socket.connect();
      socket.emit('join_room', { roomId: currentRoom._id, userId: user._id });

      const receiveHandler = (newMessage) => {
        dispatch(addMessage(newMessage));
      };
      const typingHandler = (data) => {
        dispatch(setTyping(data));
      };
      const stopTypingHandler = (data) => {
        dispatch(removeTyping(data));
      };

      socket.on('receive_message', receiveHandler);
      socket.on('user_typing', typingHandler);
      socket.on('user_stop_typing', stopTypingHandler);

      return () => {
        socket.off('receive_message', receiveHandler);
        socket.off('user_typing', typingHandler);
        socket.off('user_stop_typing', stopTypingHandler);
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
    <div className="fixed bottom-0 right-[260px] w-80 bg-white rounded-t-xl shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden flex flex-col z-40" style={{ height: '400px' }}>
      <div className="px-4 py-3 bg-[#0052CC] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
           <img
              src={targetUser.avatar?.url || `https://ui-avatars.com/api/?name=${targetUser.name || targetUser.email}&background=random&size=32`}
              alt={targetUser.name || targetUser.email}
              className="w-8 h-8 rounded-full bg-white border border-[#0052CC]"
            />
          <h3 className="font-semibold text-sm">{targetUser.name || targetUser.email}</h3>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB]">
        {messages.map((msg, index) => {
          const isMe = msg.sender?._id === user._id || msg.sender === user._id;
          return (
             <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm shadow-sm ${isMe
                  ? 'bg-[#0052CC] text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}>
                {msg.content}
                <span className={`text-[10px] opacity-70 mt-1 block ${isMe ? 'text-right text-blue-100' : 'text-left text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-[10px] text-gray-400 italic bg-white">
          {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Message..."
          className="flex-1 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] transition-all"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-[#0052CC] text-white p-1.5 rounded-lg hover:bg-[#0747A6] transition-colors disabled:opacity-50"
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