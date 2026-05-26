import React from 'react';
import { useSelector } from 'react-redux';

const avatarUrl = (user, size = 40) =>
  user?.avatar?.url ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'User')}&background=6366f1&color=fff&size=${size}`;

const ChatList = ({ members, onSelectMember }) => {
  const { user } = useSelector((state) => state.auth);

  const otherMembers = members?.filter((m) => m.user && m.user._id !== user?._id) || [];

  return (
    <div className="w-full h-full flex flex-col bg-white border-l border-[var(--surface-border)]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--surface-border)] bg-gradient-to-b from-slate-50 to-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm">Direct messages</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {otherMembers.length} teammate{otherMembers.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </div>

      {/* Member list */}
      <div className="overflow-y-auto flex-1 p-2 sm:p-3">
        {otherMembers.length > 0 ? (
          <ul className="space-y-1">
            {otherMembers.map((member) => {
              const displayName = member.user.name || member.user.email;
              return (
                <li key={member.user._id}>
                  <button
                    type="button"
                    onClick={() => onSelectMember(member.user)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/80 hover:border-blue-100 border border-transparent transition-all duration-200 text-left group"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={avatarUrl(member.user)}
                        alt={displayName}
                        className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm object-cover group-hover:ring-blue-100 transition-all"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--brand-primary)] transition-colors">
                        {displayName}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate capitalize">
                        {(member.role || 'member').replace(/_/g, ' ')}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--brand-primary)] transition-all shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">No teammates yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              Invite members to the workspace to start direct conversations.
            </p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      {otherMembers.length > 0 && (
        <div className="p-3 border-t border-[var(--surface-border)] bg-slate-50/50 shrink-0">
          <p className="text-[10px] text-center text-[var(--text-muted)] uppercase tracking-wider font-medium">
            Tap a member to chat
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
