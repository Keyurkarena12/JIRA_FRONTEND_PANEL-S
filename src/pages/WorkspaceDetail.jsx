import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getWorkspaceById } from "../features/WorkspaceSlice";
import { getAllProjects } from "../features/ProjectSlice";
import { fetchprojectTask, assigneeTaskMember } from "../features/TaskSlice";
import { useNavigate, Link } from "react-router-dom";

const WorkspaceDetail = () => {
  const { workspaceId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddMemberDropdown, setShowAddMemberDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const { workspace, loading } = useSelector((state) => state.workspace);
  const { projects } = useSelector((state) => state.project);
  const { tasks, loading: taskLoading } = useSelector((state) => state.task);

  console.log("workspacedetail page",workspace)
  console.log("tasks state:", tasks)

  useEffect(() => {
    dispatch(getWorkspaceById(workspaceId));
    if (activeTab === "projects") {
      dispatch(getAllProjects({ workspaceId }));
    }
    if (selectedProject) {
      console.log("fetching tasks for project", selectedProject);
      dispatch(fetchprojectTask(selectedProject._id));
    }
  }, [workspaceId, dispatch, activeTab, selectedProject]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#F4F5F7]"><span className="text-[#5E6C84]">Loading...</span></div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-16">
      <div className="flex">
        {/* ICON SIDEBAR - Dark */}
        <div className="fixed z-30 w-16 h-[calc(100vh-4rem)] bg-[#2E1A47] transition-transform duration-200 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          <nav className="p-3">
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 text-sm ${
                  activeTab === "overview"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 text-sm ${
                  activeTab === "members"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 text-sm ${
                  activeTab === "projects"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
              <button
                onClick={() => setActiveTab("boards")}
                className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 text-sm ${
                  activeTab === "boards"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-10V4a2 2 0 00-2-2H8a2 2 0 00-2 2v3m3 10h6" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
        {/* NAVIGATION SIDEBAR - Light */}
        <div className={`${sidebarOpen ? 'translate-x-16' : '-translate-x-full'} fixed z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-200 overflow-y-auto`}>
          {/* Workspace Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{workspace?.name || 'Workspace'}</h2>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3">
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 text-sm ${
                  activeTab === "overview"
                    ? "bg-[#F4F5F7] text-[#0052CC] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("members")}
                className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 text-sm ${
                  activeTab === "members"
                    ? "bg-[#F4F5F7] text-[#0052CC] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Members</span>
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{workspace?.members?.length || 0}</span>
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 text-sm ${
                  activeTab === "projects"
                    ? "bg-[#F4F5F7] text-[#0052CC] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Projects</span>
              </button>

              <button
                onClick={() => setActiveTab("boards")}
                className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-3 text-sm ${
                  activeTab === "boards"
                    ? "bg-[#F4F5F7] text-[#0052CC] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-10V4a2 2 0 00-2-2H8a2 2 0 00-2 2v3m3 10h6" />
                </svg>
                <span>Boards</span>
              </button>
            </div>
          </nav>

          {/* Favorites Section */}
          <div className="px-4 py-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Favorites</h3>
          </div>

          {/* Shared Section */}
          <div className="px-4 py-2 mt-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shared with Me</h3>
            <p className="text-xs text-gray-400 mt-1">Items shared by others will appear here.</p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={`flex-1 p-6 ${sidebarOpen ? 'ml-80' : 'ml-16'} transition-all duration-200`}>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-[#172B4D]">
                    {activeTab === "overview" && "Workspace Overview"}
                    {activeTab === "members" && "Team Members"}
                    {activeTab === "projects" && "Projects"}
                    {activeTab === "boards" && "Kanban Boards"}
                  </h1>
                </div>
                
                {activeTab === "members" && (
                  <Link 
                    to={`/workspace/${workspaceId}/add-members`}
                    className="bg-[#0052CC] text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-[#0747A6] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Member
                  </Link>
                )}
                
                {activeTab === "projects" && (
                  <button
                    onClick={() => navigate(`/workspace/${workspaceId}/create-project`)}
                    className="bg-[#0052CC] text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-[#0747A6] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Project
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="animate-pulse">
              {activeTab === "overview" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Workspace Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Workspace Name</label>
                      <p className="text-gray-900">{workspace?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="text-gray-900">{workspace?.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Workspace ID</label>
                      <p className="text-gray-900 text-sm font-mono">{workspace?._id}</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "members" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
                  {workspace?.members?.length > 0 ? (
                    <div className="space-y-3">
                      {workspace.members.map((member, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://ui-avatars.com/api/?name=${member.user?.name || member.user?.email || 'User'}&background=6366f1&color=fff&size=40`}
                              alt={member.user?.name || 'User'}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{member.user?.name || member.user?.email}</p>
                              <p className="text-sm text-gray-500">{member.user?.email}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {member.role || 'member'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No members found in this workspace.</p>
                  )}
                </div>
              )}
              {activeTab === "projects" && (
                <>
                  {!selectedProject ? (
                    <>
                      {projects && projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {projects.map((project) => (
                            <div
                              key={project._id}
                              onClick={() => setSelectedProject(project)}
                              className="bg-gray-50 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                  </svg>
                                </div>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  project.status === 'active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {project.status}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description || 'No description'}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{project.members?.length || 0} members</span>
                                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                          <p className="text-gray-600 mb-4">Create your first project to get started</p>
                          <button
                            onClick={() => navigate(`/workspace/${workspaceId}/create-project`)}
                            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                          >
                            Create Project
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-6">
                      {/* Project Header */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                            <p className="text-gray-600">{selectedProject.description || 'No description'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/workspace/${workspaceId}/project/${selectedProject._id}/create-task`)}
                              className="bg-[#0052CC] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0747A6] transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Create Task
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => setShowAddMemberDropdown(!showAddMemberDropdown)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Member
                              </button>
                              
                              {showAddMemberDropdown && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                  <div className="p-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Add Project Member</h3>
                                    <select
                                      value={selectedMember}
                                      onChange={(e) => setSelectedMember(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                                    >
                                      <option value="">Select a member</option>
                                      {workspace?.members?.map((member) => (
                                        <option key={member.user._id} value={member.user._id}>
                                          {member.user.name || member.user.email}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          setShowAddMemberDropdown(false);
                                          setSelectedMember('');
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (selectedMember) {
                                            try {
                                              const response = await fetch(`http://localhost:5000/api/project/add-projectmember/${selectedProject._id}`, {
                                                method: 'POST',
                                                headers: {
                                                  'Content-Type': 'application/json',
                                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                },
                                                body: JSON.stringify({
                                                  userId: selectedMember,
                                                  role: 'member'
                                                })
                                              });
                                              const result = await response.json();
                                              console.log('Member added:', result);
                                              setSelectedMember('');
                                              setShowAddMemberDropdown(false);
                                              // Refresh project data
                                              dispatch(getAllProjects({ workspaceId }));
                                            } catch (error) {
                                              console.error('Failed to add member:', error);
                                            }
                                          }
                                        }}
                                        disabled={!selectedMember}
                                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`http://localhost:5000/api/project/task/${selectedProject._id}`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    },
                                    body: JSON.stringify({
                                      title: 'Test Task',
                                      description: 'This is a test task',
                                      column: 'to do',
                                      priority: 'medium',
                                      dueDate: null
                                    })
                                  });
                                  const result = await response.json();
                                  console.log('Test task created:', result);
                                  // Refresh tasks
                                  dispatch(fetchprojectTask(selectedProject._id));
                                } catch (error) {
                                  console.error('Failed to create test task:', error);
                                }
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                              Create Test Task
                            </button>
                            <button
                              onClick={() => setSelectedProject(null)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Task Table */}
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
                                  <tr key={task._id} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                        <div>
                                          <div className="font-medium text-gray-900">{task.title}</div>
                                          {task.description && (
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      {/* com--------------- */}
                                      <div className="relative">
                                        <button
                                          onClick={() => {
                                            setShowAssigneeDropdown(showAssigneeDropdown === task._id ? null : task._id);
                                            setSelectedAssignee(task.assignee?._id || '');
                                          }}
                                          className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors"
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
                                                      console.log('Task assigned successfully');
                                                      setShowAssigneeDropdown(null);
                                                      setSelectedAssignee('');
                                                      // Refresh tasks
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

                                    {/* com--------------- */}
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
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
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        task.column === 'complete' ? 'bg-green-100 text-green-700' :
                                        task.column === 'in progress' ? 'bg-blue-100 text-blue-700' :
                                        task.column === 'to do' ? 'bg-gray-100 text-gray-700' :
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
                      </div>
                    </div>
                  )}
                </>
              )}
              {activeTab === "boards" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Kanban Boards</h2>
                  <p className="text-gray-500">Boards functionality coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default WorkspaceDetail;