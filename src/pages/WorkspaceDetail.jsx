import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getWorkspaceById } from "../features/WorkspaceSlice";
import { useNavigate,Link } from "react-router-dom";

const WorkspaceDetail = () => {
  const { workspaceId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const { workspace, loading } = useSelector((state) => state.workspace);

  console.log("workspacedetail page",workspace)

  useEffect(() => {
    dispatch(getWorkspaceById(workspaceId));
  }, [workspaceId, dispatch]);

  if (loading) return <p>Loading workspace...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white pt-16">
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 left-4 z-40 md:hidden bg-white rounded-lg p-2 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex">
        {/* LEFT SIDEBAR */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-transform duration-300`}>
          
          {/* Workspace Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{workspace?.name || 'Workspace'}</h2>
                <p className="text-sm text-gray-500">{workspace?.description || 'No description'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab === "overview"
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === "overview" ? "bg-blue-200" : "bg-gray-100"
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === "overview" ? "text-blue-600" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Overview</p>
                  <p className="text-xs opacity-70">Workspace details</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("members")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab === "members"
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === "members" ? "bg-blue-200" : "bg-gray-100"
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === "members" ? "text-blue-600" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Members</p>
                  <p className="text-xs opacity-70">{workspace?.members?.length || 0} members</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab === "projects"
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === "projects" ? "bg-blue-200" : "bg-gray-100"
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === "projects" ? "text-blue-600" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Projects</p>
                  <p className="text-xs opacity-70">View all projects</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("boards")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab === "boards"
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === "boards" ? "bg-blue-200" : "bg-gray-100"
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === "boards" ? "text-blue-600" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-10V4a2 2 0 00-2-2H8a2 2 0 00-2 2v3m3 10h6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Boards</p>
                  <p className="text-xs opacity-70">Kanban boards</p>
                </div>
              </button>
            </div>
          </nav>

          {/* Workspace Info */}
          <div className="p-4 mt-auto border-t border-gray-100">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Workspace Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Plan</span>
                  <span className="font-bold text-blue-600">{workspace?.plan || 'Free'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Members</span>
                  <span className="font-bold text-green-600">{workspace?.members?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="font-bold text-yellow-600">
                    {workspace?.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {activeTab === "overview" && "Workspace Overview"}
                    {activeTab === "members" && "Team Members"}
                    {activeTab === "projects" && "Projects"}
                    {activeTab === "boards" && "Kanban Boards"}
                  </h1>
                  <p className="text-blue-600">
                    {activeTab === "overview" && "Manage your workspace settings and overview"}
                    {activeTab === "members" && "Manage your team members and their permissions"}
                    {activeTab === "projects" && "View and manage all your active projects"}
                    {activeTab === "boards" && "Organize your tasks with kanban boards"}
                  </p>
                </div>
                
                {activeTab === "members" && (
                  
                  <button className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Member
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
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Projects</h2>
                  <p className="text-gray-500">Projects functionality coming soon...</p>
                </div>
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