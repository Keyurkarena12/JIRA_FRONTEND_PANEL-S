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
    <div className="bg-white rounded-xl shadow-sm p-6">
      {taskLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading tasks...</span>
        </div>
      )}

      {/* Task Filters and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Tasks</option>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Complete</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Priorities</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Assignees</option>
            <option>Unassigned</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
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
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
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
                          setSelectedAssignee(task.assignee?._id || '');
                        }}
                        className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded transition-colors"
                      >
                        {task.assignee ? (
                          <>
                            <img
                              src={`https://ui-avatars.com/api/?name=${task.assignee.name || task.assignee}&background=6366f1&color=fff&size=24`}
                              alt={task.assignee.name || task.assignee}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm text-gray-700">{task.assignee.name || task.assignee}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-500">Unassigned</span>
                          </>
                        )}
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showAssigneeDropdown === task._id && (
                        <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="p-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Assign Task</h4>
                            <select
                              value={selectedAssignee}
                              onChange={(e) => setSelectedAssignee(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                            >
                              <option value="">Unassigned</option>
                              {selectedProject?.members?.map((member) => (
                                <option key={member.user._id} value={member.user._id}>
                                  {member.user.name || member.user.email}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setShowAssigneeDropdown(null);
                                  setSelectedAssignee('');
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await dispatch(assigneeTaskMember({
                                      taskId: task._id,
                                      memberId: selectedAssignee || null
                                    })).unwrap();
                                    setShowAssigneeDropdown(null);
                                    setSelectedAssignee('');
                                    dispatch(fetchprojectTask(selectedProject._id));
                                  } catch (error) {
                                    console.error('Failed to assign task:', error);
                                  }
                                }}
                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                              >
                                Assign
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
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4">
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

