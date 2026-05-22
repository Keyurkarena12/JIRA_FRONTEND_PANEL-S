import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {assigneeTaskMember,fetchprojectTask,moveTask } from '../features/TaskSlice';
import TaskDetailModal from './TaskDetailModal';

const KanbanBoard = ({ tasks, loading, selectedProject, workspaceMembers }) => {
  const dispatch = useDispatch();
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);



  // Group tasks by column
  const getTasksByColumn = (column) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    const columnVariations = {
      'to do': ['to do', 'To Do', 'todo', 'Todo', 'TODO'],
      'in progress': ['in progress', 'In Progress', 'inprogress', 'Inprogress', 'IN PROGRESS'],
      'complete': ['complete', 'Complete', 'completed', 'Completed', 'COMPLETE']
    };
    const validColumns = columnVariations[column] || [column];
    return tasks.filter(task => validColumns.includes(task.column));
  };

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    console.log('Dragging task:', task);
    setDraggedTask(task);
    // Add visual feedback
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
    // Make the dragged element semi-transparent
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    // Reset opacity
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDragLeave = (e) => {
    // Only remove highlight if leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Dropping task:', draggedTask, 'to column:', targetColumn);
    
    if (draggedTask && draggedTask.column !== targetColumn) {
      try {
        // Show loading state
        e.currentTarget.style.opacity = '0.7';
        
        await dispatch(moveTask({ 
          taskId: draggedTask._id, 
          column: targetColumn 
        })).unwrap();
        
        console.log('Task moved successfully');
        
        // Refresh tasks to ensure UI updates
        if (selectedProject && selectedProject._id) {
          dispatch(fetchprojectTask(selectedProject._id));
        }
        
      } catch (error) {
        console.error('Failed to move task:', error);
        // Show error feedback
        e.currentTarget.style.backgroundColor = '#fee';
        setTimeout(() => {
          e.currentTarget.style.backgroundColor = '';
        }, 1000);
      } finally {
        // Reset opacity
        e.currentTarget.style.opacity = '1';
      }
    }
    
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const TaskCard = ({ task }) => (
    <div
      key={task._id}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onDragEnd={handleDragEnd}
      className={`bg-white p-3 sm:p-4 rounded-lg shadow-sm cursor-move hover:shadow-md transition-all duration-200 touch-manipulation ${
        dragOverColumn === task.column ? 'ring-2 ring-blue-400 scale-105' : ''
      } ${
        draggedTask?._id === task._id ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <span className="text-[10px] sm:text-xs font-mono text-gray-400 truncate flex-1">{task.taskKey}</span>
        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium shrink-0 ${
          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {task.priority}
        </span>
      </div>
      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base line-clamp-2 min-h-[1.25rem] sm:min-h-[1.5rem]">{task.title}</h4>
      {task.description && (
        <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-2 gap-2">
        {task.assignees && task.assignees.length > 0 ? (
          <div className="flex items-center -space-x-1.5 sm:-space-x-2">
            {task.assignees.slice(0, 3).map((assignee, index) => (
              <img
                key={assignee._id || index}
                src={`https://ui-avatars.com/api/?name=${assignee.name || 'U'}&background=6366f1&color=fff&size=24`}
                alt={assignee.name || 'User'}
                title={assignee.name}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white"
              />
            ))}
            {task.assignees.length > 3 && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white bg-gray-100 flex items-center justify-center z-10 text-[9px] sm:text-[10px] font-medium text-gray-600">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs hidden sm:inline">Unassigned</span>
          </div>
        )}
        {task.dueDate && (
          <span className="text-[10px] sm:text-xs text-gray-400 truncate">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );

  const Column = ({ title, column, bgColor, headerColor, dotColor }) => (
    <div className="flex-shrink-0 w-full sm:w-72 md:w-80 sm:snap-start px-1 first:pl-0 last:pr-0">
      <div className={`${bgColor} rounded-lg p-2.5 sm:p-3 transition-all duration-200 ${
        dragOverColumn === column ? 'ring-2 ring-blue-400 bg-opacity-80' : ''
      }`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className={`font-medium text-sm sm:text-base ${headerColor} flex items-center gap-1.5 sm:gap-2`}>
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${dotColor} rounded-full ${dragOverColumn === column ? 'animate-pulse' : ''}`}></div>
            <span className="truncate">{title}</span>
          </h3>
          <span className={`text-xs sm:text-sm ${headerColor} bg-white/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0`}>
            {getTasksByColumn(column).length}
          </span>
        </div>
        <div 
          className={`min-h-[200px] sm:min-h-[240px] md:min-h-[320px] lg:min-h-[400px] space-y-2 sm:space-y-3 transition-all duration-200 ${
            dragOverColumn === column ? 'bg-blue-50 bg-opacity-50 rounded-lg' : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, column)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column)}
        >
          {loading ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : getTasksByColumn(column).length > 0 ? (
            getTasksByColumn(column).map(task => <TaskCard key={task._id} task={task} />)
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-400">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-xs sm:text-sm">No tasks in {title.toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 min-w-0">
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 min-w-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Kanban Board</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
          <span>{tasks?.length || 0} tasks</span>
          <span className="text-[10px] sm:text-xs text-gray-400 hidden xs:inline sm:inline">· Scroll down for more columns</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 overflow-y-auto overflow-x-hidden sm:overflow-x-auto sm:overflow-y-hidden pb-3 sm:pb-4 -mx-1 px-1 sm:snap-x sm:snap-center touch-pan-y sm:touch-pan-x" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}>
        <Column 
          title="To Do" 
          column="to do" 
          bgColor="bg-gray-100"
          headerColor="text-gray-700"
          dotColor="bg-gray-400"
        />
        <Column 
          title="In Progress" 
          column="in progress" 
          bgColor="bg-blue-50"
          headerColor="text-blue-700"
          dotColor="bg-blue-500"
        />
        <Column 
          title="Complete" 
          column="complete" 
          bgColor="bg-green-50"
          headerColor="text-green-700"
          dotColor="bg-green-500"
        />
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

export default KanbanBoard;
