import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTaskById, updateTask, deleteTask, assigneeTaskMember, fetchprojectTask, clearSelectedTask } from '../features/TaskSlice';

const PRIORITY_OPTIONS = ['urgent', 'high', 'medium', 'low', 'none'];
const COLUMN_OPTIONS = ['to do', 'in progress', 'complete'];

const priorityColor = (p) => {
  if (p === 'urgent') return 'bg-red-100 text-red-700';
  if (p === 'high') return 'bg-orange-100 text-orange-700';
  if (p === 'medium') return 'bg-yellow-100 text-yellow-700';
  if (p === 'low') return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-600';
};

const columnColor = (c) => {
  if (c === 'complete') return 'bg-green-100 text-green-700';
  if (c === 'in progress') return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-700';
};

const TaskDetailModal = ({ taskId, onClose, selectedProject, workspaceMembers }) => {
  const dispatch = useDispatch();
  const { task, loading } = useSelector((state) => state.task);

  // edit state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editColumn, setEditColumn] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAssignee, setEditAssignee] = useState('');

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch task on mount
  useEffect(() => {
    if (taskId) dispatch(getTaskById(taskId));
    return () => dispatch(clearSelectedTask());
  }, [taskId, dispatch]);

  // Populate form when task loads
  useEffect(() => {
    if (task) {
      setEditTitle(task.title || '');
      setEditDesc(task.description || '');
      setEditPriority(task.priority || 'medium');
      setEditColumn(task.column || 'to do');
      setEditDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
      setEditAssignee(task.assignee?._id || '');
    }
  }, [task]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await dispatch(updateTask({
        taskId: task._id,
        title: editTitle,
        description: editDesc,
        priority: editPriority,
        column: editColumn,
        dueDate: editDueDate || null,
      })).unwrap();
      if (editAssignee && editAssignee !== (task.assignee?._id || '')) {
        await dispatch(assigneeTaskMember({ taskId: task._id, memberId: editAssignee })).unwrap();
      }
      if (selectedProject?._id) dispatch(fetchprojectTask(selectedProject._id));
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError('Failed to save. Please try again.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteTask(task._id)).unwrap();
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // members list (from workspace or project)
  const members = workspaceMembers || selectedProject?.members || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">
              {task?.taskKey || '...'}
            </span>
            {saveError && (
              <span className="text-xs text-red-500 font-medium">{saveError}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Delete button */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                <span className="text-xs text-red-600 font-medium">Delete task?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        {loading && !task ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : task ? (
          <div className="flex flex-1 overflow-hidden">

            {/* Left — main content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Title */}
              <div>
                {editingTitle ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                    className="w-full text-2xl font-bold text-gray-900 border-b-2 border-blue-400 focus:outline-none pb-1 bg-transparent"
                  />
                ) : (
                  <h2
                    className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors group flex items-center gap-2"
                    onClick={() => setEditingTitle(true)}
                  >
                    {editTitle || 'Untitled Task'}
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m-6 6H6v-3l9-9 3 3-9 9z" />
                    </svg>
                  </h2>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </label>
                {editingDesc ? (
                  <textarea
                    autoFocus
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    onBlur={() => setEditingDesc(false)}
                    rows={5}
                    className="w-full text-sm text-gray-700 border border-blue-400 rounded-lg p-3 focus:outline-none resize-none"
                  />
                ) : (
                  <div
                    onClick={() => setEditingDesc(true)}
                    className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3 min-h-[80px] cursor-pointer hover:bg-blue-50 hover:text-gray-800 transition-colors border border-transparent hover:border-blue-200"
                  >
                    {editDesc || (
                      <span className="text-gray-400 italic">Click to add a description…</span>
                    )}
                  </div>
                )}
              </div>

              {/* Activity / Reporter */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Reporter
                </label>
                <div className="flex items-center gap-2">
                  <img
                    src={`https://ui-avatars.com/api/?name=${task.reporter?.name || 'U'}&background=6366f1&color=fff&size=28`}
                    alt={task.reporter?.name}
                    className="w-7 h-7 rounded-full"
                  />
                  <span className="text-sm text-gray-700 font-medium">{task.reporter?.name || 'Unknown'}</span>
                  <span className="text-xs text-gray-400">{task.reporter?.email}</span>
                </div>
              </div>

              {/* Created at */}
              <div className="text-xs text-gray-400">
                Created: {task.createdAt ? new Date(task.createdAt).toLocaleString() : '—'}
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <span className="ml-3">Updated: {new Date(task.updatedAt).toLocaleString()}</span>
                )}
              </div>
            </div>

            {/* Right — metadata sidebar */}
            <div className="w-64 flex-shrink-0 border-l border-gray-100 bg-gray-50 overflow-y-auto px-5 py-5 space-y-5">

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={editColumn}
                  onChange={(e) => setEditColumn(e.target.value)}
                  className={`w-full px-3 py-2 text-sm font-medium rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer ${columnColor(editColumn)}`}
                >
                  {COLUMN_OPTIONS.map(c => (
                    <option key={c} value={c} className="bg-white text-gray-700 capitalize">{c}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className={`w-full px-3 py-2 text-sm font-medium rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer ${priorityColor(editPriority)}`}
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p} value={p} className="bg-white text-gray-700 capitalize">{p}</option>
                  ))}
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assignee</label>
                {task.assignee && (
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={`https://ui-avatars.com/api/?name=${task.assignee.name || 'U'}&background=6366f1&color=fff&size=24`}
                      alt={task.assignee.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-xs text-gray-600 font-medium">{task.assignee.name}</span>
                  </div>
                )}
                <select
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => {
                    const u = m.user || m;
                    return (
                      <option key={u._id} value={u._id}>{u.name || u.email}</option>
                    );
                  })}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Due Date</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {editDueDate && (
                  <button
                    onClick={() => setEditDueDate('')}
                    className="text-xs text-gray-400 hover:text-red-500 mt-1 transition-colors"
                  >
                    Clear date
                  </button>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">Task not found.</div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
