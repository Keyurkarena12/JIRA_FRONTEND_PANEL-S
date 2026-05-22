import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateTask, fetchprojectTask } from '../features/TaskSlice';
import TaskDetailModal from './TaskDetailModal';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const priorityStyles = {
  urgent: { chip: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-500'    },
  high:   { chip: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  medium: { chip: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  low:    { chip: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-400'   },
  none:   { chip: 'bg-gray-100 text-gray-600 border-gray-200',       dot: 'bg-gray-400'   },
};

const columnStyles = {
  'to do':       'bg-gray-100 text-gray-700',
  'in progress': 'bg-blue-100 text-blue-700',
  'complete':    'bg-green-100 text-green-700',
};

// Parse dueDate from MongoDB ISO string → 'yyyy-mm-dd' in LOCAL time (no UTC shift)
const parseDueDate = (dueDate) => {
  if (!dueDate) return '';
  if (typeof dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return dueDate;
  const d = new Date(dueDate);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDisplayDate = (dueDateStr) => {
  if (!dueDateStr) return '';
  const [y, m, d] = dueDateStr.split('-');
  return new Date(+y, +m - 1, +d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const Calendar = ({ tasks = [], taskLoading, selectedProject, workspaceMembers }) => {
  const dispatch = useDispatch();
  const today    = new Date();

  const [currentDate,    setCurrentDate]    = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [hoveredTask,    setHoveredTask]    = useState(null);

  // Drag state
  const [draggedTask,  setDraggedTask]  = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [dropping,     setDropping]     = useState(false);

  const year        = currentDate.getFullYear();
  const month       = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goToPrev  = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNext  = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  // Filter
  const filteredTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterStatus   && t.column   !== filterStatus)   return false;
    return true;
  });

  // Group by date key
  const tasksByDate = {};
  filteredTasks.forEach(t => {
    const key = parseDueDate(t.dueDate);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  });

  // Build cells
  const firstDay   = new Date(year, month, 1).getDay();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum         = i - firstDay + 1;
    const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const cellDate       = new Date(year, month, dayNum);
    const yyyy = cellDate.getFullYear();
    const mm   = String(cellDate.getMonth() + 1).padStart(2, '0');
    const dd   = String(cellDate.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const isToday = isCurrentMonth && cellDate.toDateString() === today.toDateString();
    cells.push({ dayNum, isCurrentMonth, dateKey, isToday, cellDate });
  }

  // Stats
  const totalWithDueDate = tasks.filter(t => t.dueDate).length;
  const thisMonthTasks   = filteredTasks.filter(t => {
    const d = new Date(t.dueDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const todayMidnight  = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const overdueCount   = tasks.filter(t => {
    if (!t.dueDate) return false;
    const key = parseDueDate(t.dueDate);
    const [y, m, d] = key.split('-');
    return new Date(+y, +m - 1, +d) < todayMidnight && t.column !== 'complete';
  }).length;

  // Tooltip
  const handleMouseEnter = (e, task) => {
    if (draggedTask) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTask({ task, x: rect.left, y: rect.bottom + 6 });
  };
  const handleMouseLeave = () => setHoveredTask(null);

  // Drag handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    setHoveredTask(null);
    e.dataTransfer.setData('taskId', task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e, dateKey, isCurrentMonth) => {
    if (!isCurrentMonth) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(dateKey);
  };

  const handleDragLeave = (e) => {
    // Only clear if truly leaving the cell (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverDate(null);
    }
  };

  const handleDrop = async (e, dateKey, isCurrentMonth) => {
    e.preventDefault();
    setDragOverDate(null);

    if (!draggedTask || !isCurrentMonth) return;

    const currentDueDate = parseDueDate(draggedTask.dueDate);
    if (currentDueDate === dateKey) return; // same date — no-op

    setDropping(true);
    try {
      await dispatch(updateTask({
        taskId:      draggedTask._id,
        title:       draggedTask.title,
        description: draggedTask.description,
        column:      draggedTask.column,
        priority:    draggedTask.priority,
        dueDate:     dateKey,
      })).unwrap();

      if (selectedProject?._id) {
        dispatch(fetchprojectTask(selectedProject._id));
      }
    } catch (err) {
      console.error('Failed to reschedule task:', err);
    } finally {
      setDropping(false);
      setDraggedTask(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 min-w-0">

      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-4 sm:mb-5">
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap">
          <button onClick={goToPrev} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Previous month">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base sm:text-xl font-semibold text-gray-900 min-w-[140px] sm:min-w-[180px] text-center">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={goToNext} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Next month">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button onClick={goToToday} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
            Today
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">None</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="to do">To Do</option>
            <option value="in progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          <span className="text-gray-500">Tasks with due date:</span>
          <span className="font-semibold text-gray-800">{totalWithDueDate}</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-blue-600">This month:</span>
          <span className="font-semibold text-blue-800">{thisMonthTasks.length}</span>
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-red-600">Overdue:</span>
            <span className="font-semibold text-red-800">{overdueCount}</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto sm:ml-auto">
          <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="text-purple-600 text-xs">Drag tasks to reschedule</span>
        </div>
      </div>

      {/* Loading */}
      {taskLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading tasks...</span>
        </div>
      )}

      {/* Calendar grid */}
      {!taskLoading && (
        <div className="border border-gray-200 rounded-xl overflow-x-auto">

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 min-w-[280px] sm:min-w-0">
            {DAYS.map((d) => (
              <div key={d} className="py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 min-w-[280px] sm:min-w-0">
            {cells.map((cell, idx) => {
              const tasksForDay      = cell.isCurrentMonth ? (tasksByDate[cell.dateKey] || []) : [];
              const isDragOver       = dragOverDate === cell.dateKey && cell.isCurrentMonth;
              const isOverdueDay     = cell.isCurrentMonth &&
                cell.cellDate < todayMidnight &&
                !cell.isToday &&
                tasksForDay.some(t => t.column !== 'complete');

              return (
                <div
                  key={idx}
                  onDragOver={e  => handleDragOver(e, cell.dateKey, cell.isCurrentMonth)}
                  onDragLeave={handleDragLeave}
                  onDrop={e      => handleDrop(e, cell.dateKey, cell.isCurrentMonth)}
                  className={[
                    'min-h-[72px] sm:min-h-[90px] md:min-h-[110px] p-1 sm:p-2 border-b border-r border-gray-200 transition-all duration-100',
                    !cell.isCurrentMonth                                    ? 'bg-gray-50'              : 'bg-white',
                    cell.isToday && !isDragOver                             ? 'bg-blue-50'              : '',
                    isOverdueDay && tasksForDay.length > 0 && !isDragOver  ? 'bg-red-50/30'            : '',
                    isDragOver                                              ? 'bg-blue-100 ring-2 ring-inset ring-blue-400' : '',
                    draggedTask && cell.isCurrentMonth && !isDragOver       ? 'hover:bg-blue-50/50'     : '',
                  ].filter(Boolean).join(' ')}
                >
                  {/* Date number row */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={[
                      'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                      cell.isToday       ? 'bg-[#0052CC] text-white'
                        : cell.isCurrentMonth ? 'text-gray-800'
                        : 'text-gray-300',
                    ].join(' ')}>
                      {cell.dayNum > 0 && cell.dayNum <= daysInMonth ? cell.dayNum : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      {isDragOver && (
                        <span className="text-[10px] text-blue-600 font-semibold animate-pulse">Drop here</span>
                      )}
                      {tasksForDay.length > 0 && !isDragOver && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {tasksForDay.length} task{tasksForDay.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task chips */}
                  <div className="space-y-1">
                    {tasksForDay.slice(0, 3).map(task => {
                      const ps             = priorityStyles[task.priority] || priorityStyles.none;
                      const isBeingDragged = draggedTask?._id === task._id;
                      const isSaving       = dropping && isBeingDragged;

                      return (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={e => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          onClick={() => { if (!draggedTask) setSelectedTaskId(task._id); }}
                          onMouseEnter={e => handleMouseEnter(e, task)}
                          onMouseLeave={handleMouseLeave}
                          title="Drag to reschedule · Click to open"
                          className={[
                            'flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium truncate transition-all select-none',
                            ps.chip,
                            isBeingDragged
                              ? 'opacity-40 scale-95 cursor-grabbing'
                              : 'cursor-grab hover:opacity-80 hover:shadow-sm active:cursor-grabbing',
                          ].join(' ')}
                        >
                          {/* 6-dot drag handle */}
                          <svg className="w-2.5 h-2.5 flex-shrink-0 opacity-40" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="7"  cy="4"  r="1.4" />
                            <circle cx="13" cy="4"  r="1.4" />
                            <circle cx="7"  cy="10" r="1.4" />
                            <circle cx="13" cy="10" r="1.4" />
                            <circle cx="7"  cy="16" r="1.4" />
                            <circle cx="13" cy="16" r="1.4" />
                          </svg>

                          {isSaving ? (
                            <svg className="w-3 h-3 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ps.dot}`}></span>
                          )}

                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}

                    {tasksForDay.length > 3 && (
                      <button
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium pl-1 transition-colors"
                        onClick={() => setSelectedTaskId(tasksForDay[3]._id)}
                      >
                        +{tasksForDay.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Priority:</span>
        {Object.entries(priorityStyles).map(([p, s]) => (
          <div key={p} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
            <span className="text-xs text-gray-500 capitalize">{p}</span>
          </div>
        ))}
        <span className="ml-4 text-xs text-gray-400">Only tasks with a due date appear on the calendar.</span>
      </div>

      {/* Hover Tooltip — hidden while dragging */}
      {hoveredTask && !draggedTask && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-64 pointer-events-none"
          style={{ top: hoveredTask.y, left: Math.min(hoveredTask.x, window.innerWidth - 280) }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{hoveredTask.task.title}</p>
            <span className="text-xs font-mono text-gray-400 flex-shrink-0">{hoveredTask.task.taskKey}</span>
          </div>

          {hoveredTask.task.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{hoveredTask.task.description}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[hoveredTask.task.priority]?.chip || priorityStyles.none.chip}`}>
              {hoveredTask.task.priority}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${columnStyles[hoveredTask.task.column] || 'bg-gray-100 text-gray-600'}`}>
              {hoveredTask.task.column}
            </span>
          </div>

          {hoveredTask.task.assignees?.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-xs text-gray-400">Assignees:</span>
              <div className="flex -space-x-1.5">
                {hoveredTask.task.assignees.slice(0, 4).map(a => (
                  <img
                    key={a._id}
                    src={`https://ui-avatars.com/api/?name=${a.name || 'U'}&background=6366f1&color=fff&size=20`}
                    alt={a.name} title={a.name}
                    className="w-5 h-5 rounded-full border border-white"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 text-xs text-gray-400">
            Due: {formatDisplayDate(parseDueDate(hoveredTask.task.dueDate))}
          </div>
          <div className="mt-1 text-[11px] text-gray-300 italic">Drag to reschedule · Click to edit</div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          selectedProject={selectedProject}
          workspaceMembers={workspaceMembers}
        />
      )}
    </div>
  );
};

export default Calendar;