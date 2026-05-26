import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getWorkspaceById, getWorkspaceMembers } from "../features/WorkspaceSlice";
import { getAllProjects, updateProject, deleteProject, addProjectMember } from "../features/ProjectSlice";
import { fetchprojectTask, assigneeTaskMember, moveTask } from "../features/TaskSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import SubNavbar from "../components/SubNavbar";
import KanbanBoard from "../components/KanbanBoard";
import List from "../components/List";
import Chat from "../components/Chat/Chat";
import Calendar from "../components/Calendar";
import Timeline from "../components/Timeline";

import ChatList from "../components/Chat/ChatList";
import DirectChat from "../components/Chat/DirectChat";



const WorkspaceDetail = () => {
  const { workspaceId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => {
      if (e.matches) setSidebarOpen(true);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [projectView, setProjectView] = useState("list");
  const [showAddMemberDropdown, setShowAddMemberDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const [directChatUser, setDirectChatUser] = useState(null);
  const [showChatList, setShowChatList] = useState(false);


  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectFormData, setEditProjectFormData] = useState({ name: '', description: '' });

  const { workspace, loading } = useSelector((state) => state.workspace);
  const { projects } = useSelector((state) => state.project);
  const { tasks, loading: taskLoading } = useSelector((state) => state.task);

  console.log("workspacedetail page", workspace)
  console.log("tasks state:", tasks)

  useEffect(() => {
    dispatch(getWorkspaceById(workspaceId));
    dispatch(getWorkspaceMembers(workspaceId));
  }, [workspaceId, dispatch]);

  useEffect(() => {
    if (activeTab === "members") {
      dispatch(getWorkspaceMembers(workspaceId));
    }
  }, [activeTab, workspaceId, dispatch]);

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

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        setSelectedProject(null);
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleEditProjectClick = (project) => {
    setEditProjectFormData({ name: project.name, description: project.description || '' });
    setIsEditingProject(true);
  };

  const handleUpdateProjectSubmit = async (e) => {
    e.preventDefault();
    if (!editProjectFormData.name.trim()) return;
    try {
      await dispatch(updateProject({
        projectId: selectedProject._id,
        name: editProjectFormData.name,
        description: editProjectFormData.description
      })).unwrap();
      setIsEditingProject(false);
      // Let the selector update the selectedProject view on its own? Actually we might need to manually update it or rely on the state changing if it does
      setSelectedProject(prev => ({ ...prev, name: editProjectFormData.name, description: editProjectFormData.description }));
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project');
    }
  };

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

  const closeSidebarOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-var(--nav-height))] bg-[var(--surface-bg)]">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin mb-4" />
        <span className="text-[var(--text-secondary)] font-medium">Loading workspace…</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-var(--nav-height))] bg-[var(--surface-bg)]">
      {sidebarOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      <div className="flex">
        {/* ICON SIDEBAR - Dark (tablet+) */}
        <div className="hidden md:flex fixed z-30 w-16 h-[calc(100dvh-var(--nav-height))] workspace-rail transition-transform duration-300 overflow-y-auto flex-col border-r border-white/5">
          <div className="p-3 border-b border-white/10">
            <div
              className={`relative overflow-hidden transition-all duration-300 ${sidebarOpen ? "h-10" : "h-24"
                }`}
            >
              {/* Toggle takes top slot when collapsed */}
              <div
                className={`absolute left-0 right-0 flex justify-center transition-all duration-300 ${sidebarOpen ? "top-8 opacity-0 pointer-events-none" : "top-0 opacity-100"
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
                className={`absolute left-0 right-0 flex justify-center transition-all duration-300 ${sidebarOpen ? "top-0" : "top-12"
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
                onClick={() => { setActiveTab("overview"); closeSidebarOnMobile(); }}
                className={`workspace-rail-item ${activeTab === "overview"
                  ? "workspace-rail-item-active"
                  : "workspace-rail-item-idle"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              <button
                onClick={() => { setActiveTab("members"); closeSidebarOnMobile(); }}
                className={`workspace-rail-item ${activeTab === "members"
                  ? "workspace-rail-item-active"
                  : "workspace-rail-item-idle"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              <button
                onClick={() => { setActiveTab("projects"); closeSidebarOnMobile(); }}
                className={`workspace-rail-item ${activeTab === "projects"
                  ? "workspace-rail-item-active"
                  : "workspace-rail-item-idle"
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
        <div
          className={`fixed z-40 w-[min(100vw-3rem,16rem)] sm:w-64 h-[calc(100dvh-var(--nav-height))] bg-white border-r border-[var(--surface-border)] transition-transform duration-200 overflow-y-auto shadow-xl md:shadow-none left-0 ${
            sidebarOpen ? 'translate-x-0 md:translate-x-16' : '-translate-x-full'
          }`}
        >
          {/* Workspace Header */}
          <div className="p-4 border-b border-[var(--surface-border)]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-[var(--text-primary)] truncate">{workspace?.name || 'Workspace'}</h2>
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
                onClick={() => { setActiveTab("overview"); closeSidebarOnMobile(); }}
                className={`workspace-nav-item ${activeTab === "overview"
                  ? "workspace-nav-item-active"
                  : "workspace-nav-item-idle"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab("members"); closeSidebarOnMobile(); }}
                className={`workspace-nav-item ${activeTab === "members"
                  ? "workspace-nav-item-active"
                  : "workspace-nav-item-idle"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Members</span>
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{workspace?.members?.length || 0}</span>
              </button>

              <button
                onClick={() => { setActiveTab("projects"); closeSidebarOnMobile(); }}
                className={`workspace-nav-item ${activeTab === "projects"
                  ? "workspace-nav-item-active"
                  : "workspace-nav-item-idle"
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
        <div
          className={`flex-1 flex min-w-0 w-full transition-all duration-200 h-[calc(100dvh-var(--nav-height))] ml-0 ${
            sidebarOpen ? 'lg:ml-80' : 'md:ml-16'
          }`}
        >
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
            <div className="max-w-6xl mx-auto w-full min-w-0">
            {/* Mobile menu + Breadcrumb */}
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden shrink-0 p-2.5 rounded-xl border border-[var(--surface-border)] bg-white text-[var(--text-secondary)] hover:bg-slate-50 shadow-sm"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {selectedProject && (
                <nav className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600 min-w-0 flex-1">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1 shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Projects
                  </button>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-medium truncate">{selectedProject.name}</span>
                </nav>
              )}
            </div>

            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight truncate">
                    {activeTab === "overview" && "Workspace Overview"}
                    {activeTab === "members" && "Team Members"}
                    {activeTab === "projects" && !selectedProject && "Projects"}
                    {activeTab === "projects" && selectedProject && selectedProject.name}
                  </h1>
                </div>

                {activeTab === "members" && (
                  <Link
                    to={`/workspace/${workspaceId}/add-members`}
                    className="btn-primary text-sm px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
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
                    className="btn-primary text-sm px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
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
                <div className="card-premium">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Workspace details</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="field-label mb-1">Workspace name</label>
                      <p className="text-[var(--text-primary)] font-medium">{workspace?.name}</p>
                    </div>
                    <div>
                      <label className="field-label mb-1">Description</label>
                      <p className="text-[var(--text-secondary)]">{workspace?.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <label className="field-label mb-1">Workspace ID</label>
                      <p className="text-sm font-mono text-[var(--text-muted)] bg-slate-50 px-3 py-2 rounded-lg border border-[var(--surface-border)]">{workspace?._id}</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "members" && (
                <div className="card-premium">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Team members</h2>
                  {workspace?.members?.length > 0 ? (
                    <div className="space-y-3">
                      {workspace.members.map((member, index) => {
                        const user = typeof member.user === 'object' ? member.user : null;
                        const displayName = user?.name || user?.email || 'Team member';
                        const displayEmail = user?.email || '';
                        return (
                        <div
                          key={user?._id || member.user || index}
                          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-[var(--surface-border)] bg-slate-50/50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=40`}
                              alt={displayName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-[var(--text-primary)]">{displayName}</p>
                              {displayEmail && (
                                <p className="text-sm text-[var(--text-secondary)]">{displayEmail}</p>
                              )}
                            </div>
                          </div>
                          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-[var(--brand-primary)] border border-blue-100 rounded-full capitalize">
                            {(member.role || 'member').replace(/_/g, ' ')}
                          </span>
                        </div>
                        );
                      })}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          {projects.map((project) => (
                            <div
                              key={project._id}
                              onClick={() => setSelectedProject(project)}
                              className="bg-gray-50 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-[var(--surface-border)] hover:border-blue-200 card-premium !p-6 hover:-translate-y-0.5"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                  </svg>
                                </div>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${project.status === 'active'
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
                    <div className="space-y-4 sm:space-y-6 min-w-0">
                      {/* Project Header */}
                      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-4">
                          <div className="min-w-0 flex-1">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{selectedProject.name}</h2>
                            <p className="text-gray-600 text-sm sm:text-base mt-1">{selectedProject.description || 'No description'}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                              onClick={() => handleEditProjectClick(selectedProject)}
                              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                              title="Edit Project"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteProject(selectedProject._id)}
                              className="bg-red-50 text-red-600 px-3 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                              title="Delete Project"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <button
                              onClick={() => navigate(`/workspace/${workspaceId}/project/${selectedProject._id}/create-task`)}
                              className="bg-[#0052CC] text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-[#0747A6] transition-colors flex items-center gap-2 flex-1 sm:flex-none justify-center min-h-[40px]"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Create Task
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => setShowAddMemberDropdown(!showAddMemberDropdown)}
                                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 transition-colors flex items-center gap-2 flex-1 sm:flex-none justify-center min-h-[40px]"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Member
                              </button>

                              {showAddMemberDropdown && (
                                <div className="absolute right-0 left-0 sm:left-auto mt-2 w-full sm:w-64 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
                                              const result = await dispatch(addProjectMember({
                                                projectId: selectedProject._id,
                                                userId: selectedMember,
                                                role: 'member'
                                              })).unwrap();   

                                              setSelectedMember('');
                                              setShowAddMemberDropdown(false);
                                              setSelectedProject(result.project);
                                              // No need to call getAllProjects as the slice updates the state
                                              // But if we want to ensure everything is in sync:
                                              // dispatch(getAllProjects({ workspaceId }));
                                            } catch (error) {
                                              console.error('Failed to add member:', error);
                                              alert(error.message || 'Failed to add member');
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
                        <div className="min-w-0">
                          <KanbanBoard
                            tasks={tasks}
                            loading={taskLoading}
                            selectedProject={selectedProject}
                            workspaceMembers={workspace?.members}
                          />
                        </div>
                      )}
                      {projectView === "chat" && (
                        <Chat workspaceId={workspaceId} projectId={selectedProject?._id} />
                      )}
                      {projectView === "calendar" && (
                        <Calendar
                          tasks={tasks}
                          taskLoading={taskLoading}
                          selectedProject={selectedProject}
                          workspaceMembers={workspace?.members}
                        />
                      )}
                      {projectView === "timeline" && (
                        <Timeline
                          tasks={tasks}
                          taskLoading={taskLoading}
                          selectedProject={selectedProject}
                          workspaceMembers={workspace?.members}
                        />
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
          {/* Right Sidebar for Project Members / Direct Chat */}
          <div className={`
            fixed md:relative right-0 top-16 md:top-0 bottom-0 z-40 md:z-auto
            h-[calc(100vh-4rem)] md:h-auto bg-white border-l border-gray-200
            transition-all duration-300 ease-in-out flex-shrink-0
            ${showChatList && activeTab === "projects" && selectedProject 
              ? 'w-64 opacity-100 translate-x-0' 
              : 'w-0 md:w-0 opacity-0 pointer-events-none translate-x-full md:translate-x-0'
            }
          `}>
            <ChatList 
              members={workspace?.members} 
              onSelectMember={(u) => setDirectChatUser(u)} 
            />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Chat List Mobile Backdrop */}
        {showChatList && activeTab === "projects" && selectedProject && (
          <div 
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setShowChatList(false)}
          />
        )}

        {/* Direct Chat Popup */}
        {directChatUser && (
          <DirectChat 
            targetUser={directChatUser} 
            onClose={() => setDirectChatUser(null)} 
            chatListOpen={showChatList}
            workspaceId={workspaceId}
            projectId={selectedProject?._id}
          />
        )}

        {/* Floating Chat Icon (visible when a project is selected) */}
        {activeTab === "projects" && selectedProject && (
          <button
            onClick={() => setShowChatList(!showChatList)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-[#0052CC] text-white rounded-full shadow-xl hover:bg-[#0747A6] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center focus:outline-none hover:shadow-2xl"
            title="Toggle Chat List"
          >
            <div className={`transition-transform duration-300 transform ${showChatList ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
              {showChatList ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Edit Project Modal */}
      {isEditingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
              <button
                onClick={() => setIsEditingProject(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProjectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={editProjectFormData.name}
                  onChange={(e) => setEditProjectFormData({ ...editProjectFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editProjectFormData.description}
                  onChange={(e) => setEditProjectFormData({ ...editProjectFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-24"
                  placeholder="Enter project description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditingProject(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editProjectFormData.name.trim()}
                  className="flex-1 px-4 py-2 bg-[#0052CC] text-white rounded-lg font-medium hover:bg-[#0747A6] transition-colors disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDetail;


