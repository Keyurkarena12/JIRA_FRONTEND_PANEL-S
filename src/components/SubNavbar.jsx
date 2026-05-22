import React from 'react';

const views = [
  { id: 'list', label: 'List', icon: 'M4 6h16M4 12h16M4 18h16' },
  { id: 'board', label: 'Board', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
  { id: 'chat', label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { id: 'calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'timeline', label: 'Timeline', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const SubNavbar = ({ projectView, setProjectView }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg sm:rounded-none sm:border-x-0 sm:border-t-0 sm:border-b sm:border-gray-200 mb-4 sm:mb-6 -mx-0 sm:mx-0 overflow-hidden">
      <div
        className="flex items-center gap-1 sm:gap-2 px-1 sm:px-4 md:px-6 overflow-x-auto overscroll-x-contain scrollbar-thin pb-px touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}
      >
        {views.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setProjectView(id)}
            className={`shrink-0 py-2 sm:py-3 px-1.5 sm:px-3 border-b-2 font-medium text-[10px] sm:text-xs md:text-sm transition-colors whitespace-nowrap min-w-fit ${
              projectView === id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              <span className="hidden xs:inline sm:inline">{label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubNavbar;
