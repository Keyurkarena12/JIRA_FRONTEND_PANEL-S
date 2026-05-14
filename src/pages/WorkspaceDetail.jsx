import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getWorkspaceById } from "../features/WorkspaceSlice";
import { getAllProjects } from "../features/ProjectSlice";
import { fetchprojectTask, assigneeTaskMember, moveTask } from "../features/TaskSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import SubNavbar from "../components/SubNavbar";
import KanbanBoard from "../components/KanbanBoard";
import List from "../components/List";

const WorkspaceDetail = () => {
  const { workspaceId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [projectView, setProjectView] = useState("list");
  const [showAddMemberDropdown, setShowAddMemberDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const { workspace, loading } = useSelector((state) => state.workspace);
  const { projects } = useSelector((state) => state.project);
  const { tasks, loading: taskLoading } = useSelector((state) => state.task);

  console.log("workspacedetail page",workspace)
  console.log("tasks state:", tasks)

  useEffect(() => {
    dispatch(getWorkspaceById(workspaceId));
  }, [workspaceId, dispatch]);

  useEffect(() => {
    if (activeTab === "projects") {
      dispatch(getAllProjects({ workspaceId }));
    }
  }, [activeTab, workspaceId, dispatch]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear activeTab from state
      navigate(location.pathname, { 
        replace: true, 
        state: { ...location.state, activeTab: undefined } 
      });
    }
  }, [location.state?.activeTab, navigate, location.pathname]);

  useEffect(() => {
    if (location.state?.projectId && projects?.length > 0) {
      const proj = projects.find(p => p._id === location.state.projectId);
      if (proj) {
        setSelectedProject(proj);
        // Clear the state so we don't get stuck if user clears the selection
        navigate(location.pathname, { 
          replace: true, 
          state: { ...location.state, projectId: undefined } 
        });
      }
    }
  }, [location.state, projects, navigate, location.pathname]);

  useEffect(() => {
    if (selectedProject) {
      console.log("fetching tasks for project", selectedProject);
      dispatch(fetchprojectTask(selectedProject._id));
    }
  }, [selectedProject, dispatch]);

  // Drag and drop handlers
  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (column) => {
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    if (draggedTask && draggedTask.column !== targetColumn) {
      // Update task column via API
      updateTaskColumn(draggedTask._id, targetColumn);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const updateTaskColumn = async (taskId, newColumn) => {
    try {
      await dispatch(moveTask({ taskId, column: newColumn })).unwrap();
      console.log('Task moved successfully');
    } catch (error) {
      console.error('Failed to update task column:', error);
    }
  };

  // Group tasks by column
  const getTasksByColumn = (column) => {
    return tasks?.filter(task => task.column === column) || [];
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#F4F5F7]"><span className="text-[#5E6C84]">Loading...</span></div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-16">
      <div className="flex">
        {/* ICON SIDEBAR - Dark */}
        <div className="fixed z-30 w-16 h-[calc(100vh-4rem)] bg-[#2E1A47] transition-transform duration-300 overflow-y-auto flex flex-col">
          <div className="p-3 border-b border-white/10">
            <div
              className={`relative overflow-hidden transition-all duration-300 ${
                sidebarOpen ? "h-10" : "h-24"
              }`}
            >
              {/* Toggle takes top slot when collapsed */}
              <div
                className={`absolute left-0 right-0 flex justify-center transition-all duration-300 ${
                  sidebarOpen ? "top-8 opacity-0 pointer-events-none" : "top-0 opacity-100"
                }`}
              >
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-10 h-10 bg-white/10 text-white rounded flex items-center justify-center shadow-sm hover:bg-white/20 transition-colors"
                  aria-label="Open sidebar"
                  title="Open sidebar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M4 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Logo shifts down when collapsed */}
              <div
                className={`absolute left-0 right-0 flex justify-center transition-all duration-300 ${
                  sidebarOpen ? "top-0" : "top-12"
                }`}
              >
                <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
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
                aria-label="Close sidebar"
                title="Close sidebar"
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
            {/* Breadcrumb */}
            {selectedProject && (
              <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Projects
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">{selectedProject.name}</span>
              </nav>
            )}
            
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-[#172B4D]">
                    {activeTab === "overview" && "Workspace Overview"}
                    {activeTab === "members" && "Team Members"}
                    {activeTab === "projects" && !selectedProject && "Projects"}
                    {activeTab === "projects" && selectedProject && selectedProject.name}
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

                {activeTab === "projects" && !selectedProject && (
                  <Link 
                    to={`/workspace/${workspaceId}/create-project`}
                    className="bg-[#0052CC] text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-[#0747A6] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Project
                  </Link>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div>
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

                      {/* Project Sub Navbar */}
                      <SubNavbar projectView={projectView} setProjectView={setProjectView} />

                      {/* Project Content Based on View */}
                      {projectView === "list" && (
                        <List 
                          tasks={tasks}
                          taskLoading={taskLoading}
                          selectedProject={selectedProject}
                          showAssigneeDropdown={showAssigneeDropdown}
                          selectedAssignee={selectedAssignee}
                          setShowAssigneeDropdown={setShowAssigneeDropdown}
                          setSelectedAssignee={setSelectedAssignee}
                          workspaceMembers={workspace?.members}
                        />
                      )}
                      {projectView === "board" && (
                        <KanbanBoard 
                          tasks={tasks} 
                          loading={taskLoading} 
                          selectedProject={selectedProject}
                          workspaceMembers={workspace?.members}
                        />
                      )}
                      {projectView === "chat" && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Chat</h2>
                          <p className="text-gray-600">Chat functionality coming soon...</p>
                        </div>
                      )}
                      {projectView === "calendar" && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">Calendar View</h2>
                          <p className="text-gray-600">Calendar functionality coming soon...</p>
                        </div>
                      )}
                      {projectView === "timeline" && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline View</h2>
                          <p className="text-gray-600">Timeline functionality coming soon...</p>
                        </div>
                      )}
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