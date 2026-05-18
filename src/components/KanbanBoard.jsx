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
      className={`bg-white p-4  rounded-lg shadow-sm cursor-move hover:shadow-md transition-all duration-200 ${
        dragOverColumn === task.column ? 'ring-2 ring-blue-400 scale-105' : ''
      } ${
        draggedTask?._id === task._id ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-gray-400">{task.taskKey}</span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {task.priority}
        </span>
      </div>
      <h4 className="font-medium text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        {task.assignees && task.assignees.length > 0 ? (
          <div className="flex items-center -space-x-2">
            {task.assignees.slice(0, 3).map((assignee, index) => (
              <img
                key={assignee._id || index}
                src={`https://ui-avatars.com/api/?name=${assignee.name || 'U'}&background=6366f1&color=fff&size=24`}
                alt={assignee.name || 'User'}
                title={assignee.name}
                className="w-6 h-6 rounded-full border border-white"
              />
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full border border-white bg-gray-100 flex items-center justify-center z-10 text-[10px] font-medium text-gray-600">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-400">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs">Unassigned</span>
          </div>
        )}
        {task.dueDate && (
          <span className="text-xs text-gray-400">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );

  const Column = ({ title, column, bgColor, headerColor, dotColor }) => (
    <div className="flex-shrink-0 w-80">
      <div className={`${bgColor} rounded-lg p-3 ml-2 mt-10 transition-all duration-200 ${
        dragOverColumn === column ? 'ring-2 ring-blue-400 bg-opacity-80' : ''
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-medium ${headerColor} flex items-center gap-2`}>
            <div className={`w-3 h-3 ${dotColor} rounded-full ${dragOverColumn === column ? 'animate-pulse' : ''}`}></div>
            {title}
          </h3>
          <span className={`text-sm ${headerColor} bg-white/50 px-2 py-1 rounded-full`}>
            {getTasksByColumn(column).length}
          </span>
        </div>
        <div 
          className={`min-h-[400px] space-y-3 transition-all duration-200 ${
            dragOverColumn === column ? 'bg-blue-50 bg-opacity-50 rounded-lg' : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, column)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column)}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : getTasksByColumn(column).length > 0 ? (
            getTasksByColumn(column).map(task => <TaskCard key={task._id} task={task} />)
          ) : (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">No tasks in {title.toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Kanban Board</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{tasks?.length || 0} tasks</span>
          <span className="text-xs text-gray-400">· Click a card to open</span>
        </div>
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-4">
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
