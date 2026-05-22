import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { assigneeTaskMember, fetchprojectTask } from '../features/TaskSlice';
import TaskDetailModal from './TaskDetailModal';

const List = ({
  tasks,
  taskLoading,
  selectedProject,
  showAssigneeDropdown,
  selectedAssignee,
  setShowAssigneeDropdown,
  setSelectedAssignee,
  workspaceMembers
}) => {
  const dispatch = useDispatch();
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6 min-w-0">
      {taskLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading tasks...</span>
        </div>
      )}

      {/* Task Filters and Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full lg:flex lg:flex-wrap lg:w-auto">
          <select className="w-full sm:w-auto min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Tasks</option>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Complete</option>
          </select>
          <select className="w-full sm:w-auto min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Priorities</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="w-full sm:w-auto min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Assignees</option>
            <option>Unassigned</option>
          </select>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Filter">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="View options">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile: task cards */}
      <div className="md:hidden space-y-3">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task._id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedTaskId(task._id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedTaskId(task._id)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-medium text-gray-900 text-sm break-words flex-1">{task.title}</p>
                <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.priority}
                </span>
              </div>
              {task.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${
                  task.column === 'complete' ? 'bg-green-100 text-green-700' :
                  task.column === 'in progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.column || 'no status'}
                </span>
                {task.dueDate && (
                  <span className="text-gray-500">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                <span className="text-gray-400 font-mono">{task.taskKey}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500 text-sm">
            No tasks found. Create your first task to get started.
          </div>
        )}
      </div>

      {/* Desktop: Task Table */}
      <div className="hidden md:block overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span>Task</span>
                </div>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Due Date</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Key</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <tr
                  key={task._id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors group"
                  onClick={() => setSelectedTaskId(task._id)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowAssigneeDropdown(showAssigneeDropdown === task._id ? null : task._id);
                        }}
                        className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded transition-colors"
                      >
                        {task.assignees && task.assignees.length > 0 ? (
                          <div className="flex items-center -space-x-2">
                            {task.assignees.slice(0, 3).map((assignee, index) => (
                              <img
                                key={assignee._id || index}
                                src={`https://ui-avatars.com/api/?name=${assignee.name || 'U'}&background=6366f1&color=fff&size=24`}
                                alt={assignee.name || 'User'}
                                title={assignee.name}
                                className="w-6 h-6 rounded-full border border-white relative z-0 hover:z-10"
                              />
                            ))}
                            {task.assignees.length > 3 && (
                              <div className="w-6 h-6 rounded-full border border-white bg-gray-100 flex items-center justify-center z-10 text-[10px] font-medium text-gray-600">
                                +{task.assignees.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-500 ml-1">Unassigned</span>
                          </>
                        )}
                        <svg className="w-3 h-3 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showAssigneeDropdown === task._id && (
                        <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="p-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Assign Task</h4>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {selectedProject?.members?.map((member) => {
                                const isAssigned = task.assignees?.some(a => a._id === member.user._id);
                                return (
                                  <button
                                    key={member.user._id}
                                    onClick={async () => {
                                      try {
                                        await dispatch(assigneeTaskMember({
                                          taskId: task._id,
                                          memberId: member.user._id
                                        })).unwrap();
                                        dispatch(fetchprojectTask(selectedProject._id));
                                      } catch (error) {
                                        console.error('Failed to assign task:', error);
                                      }
                                    }}
                                    className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-left"
                                  >
                                    <span>{member.user.name || member.user.email}</span>
                                    {isAssigned && (
                                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <button
                                onClick={() => setShowAssigneeDropdown(null)}
                                className="w-full px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded text-sm transition-colors text-center"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                      }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    {task.dueDate ? (
                      <span className="text-sm text-gray-700">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No due date</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.column === 'complete' ? 'bg-green-100 text-green-700' :
                        task.column === 'in progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {task.column || 'no status'}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <span className="text-sm font-mono text-gray-500">{task.taskKey}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No tasks found. Create your first task to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default List;

