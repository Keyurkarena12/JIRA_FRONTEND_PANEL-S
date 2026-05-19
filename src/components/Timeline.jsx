import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateTask, fetchprojectTask } from '../features/TaskSlice';
import TaskDetailModal from './TaskDetailModal';

// ─── helpers ────────────────────────────────────────────────────────────────

const parseDateLocal = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split('-');
        return new Date(+y, +m - 1, +d);
    }
    const d = new Date(raw);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const toDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const addDays = (date, n) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
};

const diffDays = (a, b) =>
    Math.round((b - a) / (1000 * 60 * 60 * 24));

const formatShort = (date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const formatFull = (date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// ─── style maps ───────────────────────────────────────────────────────

const PRIORITY_BAR = {
    urgent: { bar: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
    high: { bar: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
    medium: { bar: 'bg-yellow-400', light: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-400' },
    low: { bar: 'bg-blue-400', light: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-400' },
    none: { bar: 'bg-gray-400', light: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', dot: 'bg-gray-400' },
};

const COLUMN_BADGE = {
    'to do': 'bg-gray-100 text-gray-600',
    'in progress': 'bg-blue-100 text-blue-700',
    'complete': 'bg-green-100 text-green-700',
};

const COLUMN_GROUPS = ['to do', 'in progress', 'complete'];

const COLUMN_LABELS = {
    'to do': 'To Do',
    'in progress': 'In Progress',
    'complete': 'Complete',
};

const DAY_PX = 32; // pixel width per day column

// ─── component ──────────────────────────────────────────────────────────────

const Timeline = ({ tasks = [], taskLoading, selectedProject, workspaceMembers }) => {
    const dispatch = useDispatch();
    const scrollRef = useRef(null);
    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [filterPriority, setFilterPriority] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [tooltip, setTooltip] = useState(null); // { task, x, y }
    const [zoom, setZoom] = useState(1);    // 0.75 | 1 | 1.5

    // ── compute visible date range ──────────────────────────────────────────
    const validTasks = tasks.filter(t => t.dueDate);

    const allStarts = validTasks.map(t => parseDateLocal(t.createdAt) || todayMid);
    const allEnds = validTasks.map(t => parseDateLocal(t.dueDate));

    const rangeStart = allStarts.length
        ? addDays(new Date(Math.min(...allStarts)), -3)
        : addDays(todayMid, -7);

    const rangeEnd = allEnds.length
        ? addDays(new Date(Math.max(...allEnds)), 7)
        : addDays(todayMid, 30);

    const totalDays = diffDays(rangeStart, rangeEnd) + 1;
    const colWidth = Math.round(DAY_PX * zoom);
    const totalWidth = totalDays * colWidth;

    // ── scroll to today on mount ────────────────────────────────────────────
    useEffect(() => {
        if (scrollRef.current) {
            const todayOffset = diffDays(rangeStart, todayMid) * colWidth;
            scrollRef.current.scrollLeft = Math.max(0, todayOffset - 120);
        }
    }, [tasks]);

    // ── build day headers ───────────────────────────────────────────────────
    const days = [];
    for (let i = 0; i < totalDays; i++) {
        days.push(addDays(rangeStart, i));
    }

    // group days into months for the top header row
    const monthGroups = [];
    days.forEach((d, i) => {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!monthGroups.length || monthGroups[monthGroups.length - 1].key !== key) {
            monthGroups.push({ key, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, count: 1, startIdx: i });
        } else {
            monthGroups[monthGroups.length - 1].count++;
        }
    });

    // ── filter tasks ────────────────────────────────────────────────────────
    const filteredTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        if (filterPriority && t.priority !== filterPriority) return false;
        if (filterStatus && t.column !== filterStatus) return false;
        return true;
    });

    const tasksWithoutDue = tasks.filter(t => !t.dueDate);

    // ── bar position helpers ─────────────────────────────────────────────────
    const getBarStyle = (task) => {
        const start = parseDateLocal(task.createdAt) || todayMid;
        const end = parseDateLocal(task.dueDate);
        if (!end) return null;

        // clamp start to rangeStart
        const clampedStart = start < rangeStart ? rangeStart : start;
        const left = diffDays(rangeStart, clampedStart) * colWidth;
        const width = Math.max(colWidth, diffDays(clampedStart, end) * colWidth);
        return { left, width };
    };

    // ── drag-to-reschedule on bar ────────────────────────────────────────────
    const dragInfo = useRef(null); // { task, startX, origDueDate, origStartDate }
    const [dragTaskId, setDragTaskId] = useState(null);
    const [dragDelta, setDragDelta] = useState(0);  // px offset while dragging
    const [saving, setSaving] = useState(false);

    const handleBarMouseDown = (e, task) => {
        e.preventDefault();
        setTooltip(null);
        dragInfo.current = {
            task,
            startX: e.clientX,
            origDueDate: parseDateLocal(task.dueDate),
            origStartDate: parseDateLocal(task.createdAt) || todayMid,
        };
        setDragTaskId(task._id);
        setDragDelta(0);
    };

    useEffect(() => {
        const onMove = (e) => {
            if (!dragInfo.current) return;
            const dx = e.clientX - dragInfo.current.startX;
            setDragDelta(dx);
        };
        const onUp = async (e) => {
            if (!dragInfo.current) return;
            const dx = e.clientX - dragInfo.current.startX;
            const days = Math.round(dx / colWidth);
            const { task, origDueDate } = dragInfo.current;

            if (days !== 0) {
                const newDue = addDays(origDueDate, days);
                setSaving(true);
                try {
                    await dispatch(updateTask({
                        taskId: task._id,
                        title: task.title,
                        description: task.description,
                        column: task.column,
                        priority: task.priority,
                        dueDate: toDateKey(newDue),
                    })).unwrap();
                    if (selectedProject?._id) dispatch(fetchprojectTask(selectedProject._id));
                } catch (err) {
                    console.error('Failed to reschedule:', err);
                } finally {
                    setSaving(false);
                }
            }
            dragInfo.current = null;
            setDragTaskId(null);
            setDragDelta(0);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [colWidth, dispatch, selectedProject]);

    // ── tooltip ──────────────────────────────────────────────────────────────
    const showTooltip = (e, task) => {
        if (dragTaskId) return;
        setTooltip({ task, x: e.clientX + 12, y: e.clientY - 10 });
    };
    const hideTooltip = () => setTooltip(null);

    // ── today x position ─────────────────────────────────────────────────────
    const todayX = diffDays(rangeStart, todayMid) * colWidth;

    // ── stats ─────────────────────────────────────────────────────────────────
    const overdueCount = tasks.filter(t => {
        if (!t.dueDate || t.column === 'complete') return false;
        return parseDateLocal(t.dueDate) < todayMid;
    }).length;

    const LABEL_COL = 220; // px width of the left task-label column

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">

            {/* ── Top controls ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>
                    {saving && (
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Saving…
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Zoom */}
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                        {[{ label: '−', val: 0.75 }, { label: '1×', val: 1 }, { label: '+', val: 1.5 }].map(z => (
                            <button
                                key={z.val}
                                onClick={() => setZoom(z.val)}
                                className={`px-3 py-1.5 text-sm transition-colors ${zoom === z.val
                                        ? 'bg-[#0052CC] text-white font-medium'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {z.label}
                            </button>
                        ))}
                    </div>

                    {/* Scroll to today */}
                    <button
                        onClick={() => {
                            if (scrollRef.current) {
                                scrollRef.current.scrollLeft = Math.max(0, todayX - 120);
                            }
                        }}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                        Today
                    </button>

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

            {/* ── Summary pills ── */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    <span className="text-gray-500">Total tasks:</span>
                    <span className="font-semibold text-gray-800">{tasks.length}</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-blue-600">With due date:</span>
                    <span className="font-semibold text-blue-800">{validTasks.length}</span>
                </div>
                {overdueCount > 0 && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-red-600">Overdue:</span>
                        <span className="font-semibold text-red-800">{overdueCount}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-sm ml-auto">
                    <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 12h4m-4 5h8" />
                    </svg>
                    <span className="text-purple-600 text-xs">Drag bars left/right to reschedule</span>
                </div>
            </div>

            {/* ── Loading ── */}
            {taskLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading tasks…</span>
                </div>
            )}

            {/* ── Empty state ── */}
            {!taskLoading && tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-500">No tasks yet</p>
                    <p className="text-sm mt-1">Create tasks with due dates to see them on the timeline.</p>
                </div>
            )}

            {/* ── Timeline ── */}
            {!taskLoading && tasks.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">

                    {/* Fixed layout: label col (left) + scrollable chart (right) */}
                    <div className="flex">

                        {/* ── LEFT: label column (fixed, not scrollable) ── */}
                        <div
                            className="flex-shrink-0 border-r border-gray-200 bg-white z-10"
                            style={{ width: LABEL_COL }}
                        >
                            {/* Top-left corner header cells (match 2 header rows height) */}
                            <div className="border-b border-gray-200 bg-gray-50" style={{ height: 28 }}>
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 flex items-center h-full">Task</span>
                            </div>
                            <div className="border-b border-gray-200 bg-gray-50" style={{ height: 32 }}></div>

                            {/* Group rows */}
                            {COLUMN_GROUPS.map(group => {
                                const groupTasks = filteredTasks.filter(t => t.column === group);
                                if (groupTasks.length === 0 && filterStatus && filterStatus !== group) return null;

                                return (
                                    <div key={group}>
                                        {/* Group header */}
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${COLUMN_BADGE[group]}`}>
                                                {COLUMN_LABELS[group]}
                                            </span>
                                            <span className="text-xs text-gray-400">{groupTasks.length}</span>
                                        </div>

                                        {/* Task rows */}
                                        {groupTasks.map(task => {
                                            const ps = PRIORITY_BAR[task.priority] || PRIORITY_BAR.none;
                                            const isOverdue = parseDateLocal(task.dueDate) < todayMid && task.column !== 'complete';
                                            return (
                                                <div
                                                    key={task._id}
                                                    className="flex items-center gap-2 px-3 border-b border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors group"
                                                    style={{ height: 44 }}
                                                    onClick={() => setSelectedTaskId(task._id)}
                                                    title="Click to open task"
                                                >
                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ps.dot}`}></span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate group-hover:text-blue-700 transition-colors ${isOverdue ? 'text-red-600' : 'text-gray-800'
                                                            }`}>
                                                            {task.title}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 font-mono">{task.taskKey}</p>
                                                    </div>
                                                    {isOverdue && (
                                                        <span title="Overdue">
                                                            <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* Empty group placeholder */}
                                        {groupTasks.length === 0 && (
                                            <div className="flex items-center px-4 border-b border-gray-100 text-xs text-gray-300 italic" style={{ height: 44 }}>
                                                No tasks
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Tasks without due date section */}
                            {tasksWithoutDue.length > 0 && !filterPriority && !filterStatus && (
                                <div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">No Due Date</span>
                                        <span className="text-xs text-gray-400">{tasksWithoutDue.length}</span>
                                    </div>
                                    {tasksWithoutDue.map(task => (
                                        <div
                                            key={task._id}
                                            className="flex items-center gap-2 px-3 border-b border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors group"
                                            style={{ height: 44 }}
                                            onClick={() => setSelectedTaskId(task._id)}
                                        >
                                            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-300"></span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate text-gray-400 group-hover:text-blue-700 transition-colors">{task.title}</p>
                                                <p className="text-[11px] text-gray-300 font-mono">{task.taskKey}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT: scrollable chart area ── */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-x-auto overflow-y-visible"
                            style={{ cursor: dragTaskId ? 'ew-resize' : 'default' }}
                        >
                            <div style={{ width: totalWidth, position: 'relative', minWidth: totalWidth }}>

                                {/* Month header row */}
                                <div className="flex border-b border-gray-200 bg-gray-50" style={{ height: 28 }}>
                                    {monthGroups.map(mg => (
                                        <div
                                            key={mg.key}
                                            className="flex-shrink-0 border-r border-gray-200 flex items-center px-2"
                                            style={{ width: mg.count * colWidth }}
                                        >
                                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                                                {mg.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Day header row */}
                                <div className="flex border-b border-gray-200 bg-gray-50" style={{ height: 32 }}>
                                    {days.map((d, i) => {
                                        const isToday = d.toDateString() === todayMid.toDateString();
                                        const isSunSat = d.getDay() === 0 || d.getDay() === 6;
                                        return (
                                            <div
                                                key={i}
                                                className={`flex-shrink-0 border-r border-gray-100 flex flex-col items-center justify-center ${isToday ? 'bg-blue-50' : isSunSat ? 'bg-gray-50/80' : ''
                                                    }`}
                                                style={{ width: colWidth }}
                                            >
                                                <span className={`text-[10px] font-semibold ${isToday ? 'text-[#0052CC]' : 'text-gray-400'}`}>
                                                    {d.getDate()}
                                                </span>
                                                {colWidth >= 28 && (
                                                    <span className={`text-[9px] ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>
                                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()]}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Chart rows per group */}
                                {COLUMN_GROUPS.map(group => {
                                    const groupTasks = filteredTasks.filter(t => t.column === group);
                                    if (groupTasks.length === 0 && filterStatus && filterStatus !== group) return null;

                                    return (
                                        <div key={group}>
                                            {/* Group header row (matches left side height) */}
                                            <div
                                                className="border-b border-gray-200 bg-gray-50"
                                                style={{ height: 37 }}
                                            />

                                            {/* Task bar rows */}
                                            {groupTasks.map(task => {
                                                const barStyle = getBarStyle(task);
                                                const ps = PRIORITY_BAR[task.priority] || PRIORITY_BAR.none;
                                                const isOverdue = parseDateLocal(task.dueDate) < todayMid && task.column !== 'complete';
                                                const isDragging = dragTaskId === task._id;
                                                const dueDate = parseDateLocal(task.dueDate);

                                                // apply drag delta in px
                                                const draggedLeft = barStyle ? barStyle.left + (isDragging ? dragDelta : 0) : 0;
                                                const daysDelta = isDragging ? Math.round(dragDelta / colWidth) : 0;
                                                const newDueDate = isDragging ? addDays(dueDate, daysDelta) : dueDate;

                                                return (
                                                    <div
                                                        key={task._id}
                                                        className="relative border-b border-gray-100"
                                                        style={{ height: 44 }}
                                                    >
                                                        {/* Weekend tint columns */}
                                                        {days.map((d, i) => {
                                                            const isSunSat = d.getDay() === 0 || d.getDay() === 6;
                                                            return isSunSat ? (
                                                                <div
                                                                    key={i}
                                                                    className="absolute top-0 bottom-0 bg-gray-50/60"
                                                                    style={{ left: i * colWidth, width: colWidth }}
                                                                />
                                                            ) : null;
                                                        })}

                                                        {/* Today vertical line */}
                                                        <div
                                                            className="absolute top-0 bottom-0 w-px bg-blue-300 z-10 pointer-events-none"
                                                            style={{ left: todayX }}
                                                        />

                                                        {/* Task bar */}
                                                        {barStyle && (
                                                            <div
                                                                className={`
                                  absolute top-1/2 -translate-y-1/2 h-7 rounded-full
                                  flex items-center px-3 gap-2 z-20 select-none
                                  ${ps.light} ${ps.border} border
                                  ${isDragging
                                                                        ? 'opacity-90 shadow-lg cursor-ew-resize ring-2 ring-blue-400'
                                                                        : isOverdue
                                                                            ? 'cursor-ew-resize hover:shadow-md ring-1 ring-red-300'
                                                                            : 'cursor-ew-resize hover:shadow-md'
                                                                    }
                                  transition-shadow
                                `}
                                                                style={{
                                                                    left: draggedLeft,
                                                                    width: barStyle.width,
                                                                    minWidth: colWidth,
                                                                }}
                                                                onMouseDown={e => handleBarMouseDown(e, task)}
                                                                onMouseEnter={e => showTooltip(e, task)}
                                                                onMouseLeave={hideTooltip}
                                                                onClick={() => { if (!dragTaskId) setSelectedTaskId(task._id); }}
                                                            >
                                                                {/* Colored left accent */}
                                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ps.dot}`}></span>

                                                                {/* Title — only show if bar is wide enough */}
                                                                {barStyle.width > 60 && (
                                                                    <span className={`text-xs font-medium truncate ${ps.text}`}>
                                                                        {task.title}
                                                                    </span>
                                                                )}

                                                                {/* Drag preview date badge */}
                                                                {isDragging && daysDelta !== 0 && (
                                                                    <span className="ml-auto text-[10px] font-semibold text-blue-700 bg-white border border-blue-300 rounded px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap">
                                                                        → {formatShort(newDueDate)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Empty group row */}
                                            {groupTasks.length === 0 && (
                                                <div className="relative border-b border-gray-100" style={{ height: 44 }}>
                                                    {/* Today line */}
                                                    <div
                                                        className="absolute top-0 bottom-0 w-px bg-blue-300 z-10 pointer-events-none"
                                                        style={{ left: todayX }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* No-due-date rows (grey dots) */}
                                {tasksWithoutDue.length > 0 && !filterPriority && !filterStatus && (
                                    <div>
                                        <div className="border-b border-gray-200 bg-gray-50" style={{ height: 37 }} />
                                        {tasksWithoutDue.map(task => (
                                            <div
                                                key={task._id}
                                                className="relative border-b border-gray-100"
                                                style={{ height: 44 }}
                                            >
                                                {/* Today line */}
                                                <div
                                                    className="absolute top-0 bottom-0 w-px bg-blue-300 z-10 pointer-events-none"
                                                    style={{ left: todayX }}
                                                />
                                                {/* Dot at today position */}
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 cursor-pointer"
                                                    style={{ left: todayX }}
                                                    onClick={() => setSelectedTaskId(task._id)}
                                                    title="No due date — click to set one"
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-white shadow-sm hover:bg-gray-400 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Global today line overlay (top of chart, full height) */}
                                <div
                                    className="absolute top-0 bottom-0 pointer-events-none z-30"
                                    style={{ left: todayX, width: 0 }}
                                >
                                    <div className="absolute top-0 -translate-x-1/2 bg-[#0052CC] text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                                        TODAY
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Legend ── */}
            {!taskLoading && tasks.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 mt-4">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Priority:</span>
                    {Object.entries(PRIORITY_BAR).map(([p, s]) => (
                        <div key={p} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
                            <span className="text-xs text-gray-500 capitalize">{p}</span>
                        </div>
                    ))}
                    <span className="ml-4 text-xs text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Red name = overdue
                    </span>
                </div>
            )}

            {/* ── Tooltip ── */}
            {tooltip && !dragTaskId && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72 pointer-events-none"
                    style={{ top: tooltip.y, left: Math.min(tooltip.x, window.innerWidth - 300) }}
                >
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{tooltip.task.title}</p>
                        <span className="text-xs font-mono text-gray-400 flex-shrink-0">{tooltip.task.taskKey}</span>
                    </div>

                    {tooltip.task.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{tooltip.task.description}</p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${PRIORITY_BAR[tooltip.task.priority]?.light} ${PRIORITY_BAR[tooltip.task.priority]?.text} ${PRIORITY_BAR[tooltip.task.priority]?.border}`}>
                            {tooltip.task.priority}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLUMN_BADGE[tooltip.task.column] || 'bg-gray-100 text-gray-600'}`}>
                            {tooltip.task.column}
                        </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Start: {formatFull(parseDateLocal(tooltip.task.createdAt) || todayMid)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Due: {tooltip.task.dueDate ? formatFull(parseDateLocal(tooltip.task.dueDate)) : 'Not set'}</span>
                        </div>
                        {tooltip.task.dueDate && tooltip.task.createdAt && (
                            <div className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    Duration: {Math.max(1, diffDays(
                                        parseDateLocal(tooltip.task.createdAt) || todayMid,
                                        parseDateLocal(tooltip.task.dueDate)
                                    ))} days
                                </span>
                            </div>
                        )}
                    </div>

                    {tooltip.task.assignees?.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-400">Assignees:</span>
                            <div className="flex -space-x-1.5">
                                {tooltip.task.assignees.slice(0, 5).map(a => (
                                    <img
                                        key={a._id}
                                        src={`https://ui-avatars.com/api/?name=${a.name || 'U'}&background=6366f1&color=fff&size=20`}
                                        alt={a.name} title={a.name}
                                        className="w-5 h-5 rounded-full border border-white"
                                    />
                                ))}
                                {tooltip.task.assignees.length > 5 && (
                                    <div className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[9px] font-semibold text-gray-600">
                                        +{tooltip.task.assignees.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="mt-2 text-[11px] text-gray-300 italic">Drag bar to reschedule · Click to edit</div>
                </div>
            )}

            {/* ── Task Detail Modal ── */}
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

export default Timeline;