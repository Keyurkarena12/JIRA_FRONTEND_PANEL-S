import React, { useState } from 'react'
import "../styles/globals.css"

function Projects() {
  const [projects] = useState([
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design',
      status: 'active',
      progress: 75,
      team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      deadline: '2024-03-15',
      priority: 'high',
      color: 'primary'
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native iOS and Android app for customer engagement',
      status: 'active',
      progress: 45,
      team: ['Sarah Wilson', 'Tom Brown'],
      deadline: '2024-04-20',
      priority: 'medium',
      color: 'success'
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migrate legacy database to cloud infrastructure',
      status: 'planning',
      progress: 10,
      team: ['Alex Chen'],
      deadline: '2024-05-01',
      priority: 'low',
      color: 'warning'
    },
    {
      id: 4,
      name: 'API Integration',
      description: 'Integrate third-party payment and shipping APIs',
      status: 'completed',
      progress: 100,
      team: ['Emma Davis', 'Chris Lee'],
      deadline: '2024-02-28',
      priority: 'high',
      color: 'accent'
    }
  ])

  const [viewMode, setViewMode] = useState('grid')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-success-100 text-success-800'
      case 'planning': return 'bg-warning-100 text-warning-800'
      case 'completed': return 'bg-primary-100 text-primary-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-blue-100 text-sm font-medium">Total Projects</p>
            <p className="text-2xl font-bold mt-1">{projects.length}</p>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-green-100 text-sm font-medium">Active</p>
            <p className="text-2xl font-bold mt-1">{projects.filter(p => p.status === 'active').length}</p>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="text-center">
            <p className="text-yellow-100 text-sm font-medium">Planning</p>
            <p className="text-2xl font-bold mt-1">{projects.filter(p => p.status === 'planning').length}</p>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <p className="text-purple-100 text-sm font-medium">Completed</p>
            <p className="text-2xl font-bold mt-1">{projects.filter(p => p.status === 'completed').length}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card group hover:shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-3 h-3 rounded-full bg-${project.color}-500`}></div>
                <div className="flex gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {project.description}
              </p>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${project.color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex -space-x-2">
                  {project.team.slice(0, 3).map((member, index) => (
                    <img
                      key={index}
                      src={`https://ui-avatars.com/api/?name=${member.replace(' ', '+')}&background=6366f1&color=fff&size=32`}
                      alt={member}
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                  ))}
                  {project.team.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">+{project.team.length - 3}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <div className="flex gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Progress:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-${project.color}-500 h-2 rounded-full`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900">{project.progress}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Team:</span>
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member, index) => (
                          <img
                            key={index}
                            src={`https://ui-avatars.com/api/?name=${member.replace(' ', '+')}&background=6366f1&color=fff&size=24`}
                            alt={member}
                            className="w-6 h-6 rounded-full border-2 border-white"
                          />
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">+{project.team.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects