import React, { useState } from 'react'
import "../styles/globals.css"

function Boards() {
  const [boards] = useState([
    {
      id: 1,
      name: 'Development Board',
      description: 'Track development tasks and progress',
      columns: [
        {
          id: 'todo',
          name: 'To Do',
          color: 'gray',
          tasks: [
            { id: 1, title: 'Set up project repository', priority: 'high', assignee: 'John Doe', tags: ['setup', 'git'] },
            { id: 2, title: 'Design database schema', priority: 'medium', assignee: 'Jane Smith', tags: ['database', 'design'] },
            { id: 3, title: 'Create API documentation', priority: 'low', assignee: 'Mike Johnson', tags: ['docs', 'api'] }
          ]
        },
        {
          id: 'inprogress',
          name: 'In Progress',
          color: 'blue',
          tasks: [
            { id: 4, title: 'Implement user authentication', priority: 'high', assignee: 'Sarah Wilson', tags: ['auth', 'backend'] },
            { id: 5, title: 'Build responsive layout', priority: 'medium', assignee: 'Tom Brown', tags: ['frontend', 'css'] }
          ]
        },
        {
          id: 'review',
          name: 'Review',
          color: 'yellow',
          tasks: [
            { id: 6, title: 'Code review for payment module', priority: 'high', assignee: 'Emma Davis', tags: ['review', 'payment'] }
          ]
        },
        {
          id: 'done',
          name: 'Done',
          color: 'green',
          tasks: [
            { id: 7, title: 'Project kickoff meeting', priority: 'medium', assignee: 'Chris Lee', tags: ['meeting', 'planning'] },
            { id: 8, title: 'Environment setup', priority: 'high', assignee: 'Alex Chen', tags: ['devops', 'setup'] }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Marketing Board',
      description: 'Marketing campaigns and content creation',
      columns: [
        {
          id: 'ideas',
          name: 'Ideas',
          color: 'purple',
          tasks: [
            { id: 9, title: 'Social media campaign', priority: 'medium', assignee: 'Lisa Wang', tags: ['marketing', 'social'] }
          ]
        },
        {
          id: 'content',
          name: 'Content Creation',
          color: 'pink',
          tasks: []
        },
        {
          id: 'published',
          name: 'Published',
          color: 'green',
          tasks: []
        }
      ]
    }
  ])

  const [selectedBoard, setSelectedBoard] = useState(boards[0])
  const [searchTerm, setSearchTerm] = useState('')

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getColumnColor = (color) => {
    switch(color) {
      case 'gray': return 'bg-gray-50 border-gray-200'
      case 'blue': return 'bg-blue-50 border-blue-200'
      case 'yellow': return 'bg-yellow-50 border-yellow-200'
      case 'green': return 'bg-green-50 border-green-200'
      case 'purple': return 'bg-purple-50 border-purple-200'
      case 'pink': return 'bg-pink-50 border-pink-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kanban Boards</h1>
            <p className="text-gray-600">Manage tasks and workflows with visual boards</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-64"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Board
            </button>
          </div>
        </div>
      </div>

      {/* Board Selection */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => setSelectedBoard(board)}
            className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all ${
              selectedBoard.id === board.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900">{board.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{board.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>{board.columns.length} columns</span>
              <span>{board.columns.reduce((acc, col) => acc + col.tasks.length, 0)} tasks</span>
            </div>
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {selectedBoard.columns.map((column) => (
          <div key={column.id} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${column.color}-500`}></div>
                <h3 className="font-semibold text-gray-900">{column.name}</h3>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                  {column.tasks.length}
                </span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
            
            <div className={`flex-1 ${getColumnColor(column.color)} border-2 rounded-xl p-4 min-h-[400px]`}>
              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <div key={task.id} className="card bg-white p-4 hover:shadow-md transition-shadow cursor-move">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-3">{task.title}</h4>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${task.assignee.replace(' ', '+')}&background=6366f1&color=fff&size=24`}
                          alt={task.assignee}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs text-gray-600">{task.assignee}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Board Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedBoard.columns.reduce((acc, col) => acc + col.tasks.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedBoard.columns.find(col => col.id === 'inprogress')?.tasks.length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedBoard.columns.find(col => col.id === 'done')?.tasks.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Boards