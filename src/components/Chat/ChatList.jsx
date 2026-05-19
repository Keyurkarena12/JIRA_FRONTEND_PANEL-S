import React from 'react';
import { useSelector } from 'react-redux';

const ChatList = ({ members, onSelectMember }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col h-full flex-shrink-0">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Project Members</h3>
        <p className="text-xs text-gray-500 mt-1">Direct Messages</p>
      </div>
      <div className="overflow-y-auto p-2 flex-1">
        {members?.filter(m => m.user && m.user._id !== user?._id).map((member) => (
          <div
            key={member.user._id}
            onClick={() => onSelectMember(member.user)}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
          >
            <div className="relative">
              <img
                src={member.user.avatar?.url || `https://ui-avatars.com/api/?name=${member.user.name || member.user.email}&background=random&size=32`}
                alt={member.user.name || member.user.email}
                className="w-8 h-8 rounded-full"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {member.user.name || member.user.email}
              </p>
            </div>
          </div>
        ))}
        {(!members || members.length <= 1) && (
          <p className="text-sm text-gray-500 text-center mt-4">No other members</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;