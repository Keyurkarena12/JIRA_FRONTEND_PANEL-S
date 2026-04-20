import React, { useState } from "react";
import "../styles/globals.css";
import Members from "./Members";
import Projects from "./Project";
import Boards from "./Boards";
import { useSelector } from "react-redux";

function Dashbord() {
  const [activeTab, setActiveTab] = useState("projects");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {user} = useSelector((state) => state.auth);
  const {workspace,error,loading} = useSelector((state)=>state.workspace)

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-primary-50 to-white pt-16">
      
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
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-900">My Workspace</h2>
                <p className="text-sm text-gray-500">Project Management</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("members")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab === "members"
                    ? "bg-primary-100 text-primary-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === "members" ? "bg-primary-200" : "bg-gray-100"
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === "members" ? "text-primary-600" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Members</p>
                  <p className="text-xs opacity-70">Manage team members</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  activeTab === "projects"
                    ? "bg-primary-100 text-primary-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === "projects" ? "bg-primary-200" : "bg-gray-100"
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === "projects" ? "text-primary-600" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    ? "bg-primary-100 text-primary-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === "boards" ? "bg-primary-200" : "bg-gray-100"
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === "boards" ? "text-primary-600" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Quick Stats */}
          <div className="p-4 mt-auto">
            <div className="bg-gradient-secondary rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Projects</span>
                  <span className="font-bold text-primary-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Team Members</span>
                  <span className="font-bold text-success-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                  <span className="font-bold text-warning-600">47</span>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {activeTab === "members" && "Team Members"}
                {activeTab === "projects" && "Projects"}
                {activeTab === "boards" && "Kanban Boards"}
              </h1>
              <p className="text-gray-600">
                {activeTab === "members" && "Manage your team members and their permissions"}
                {activeTab === "projects" && "View and manage all your active projects"}
                {activeTab === "boards" && "Organize your tasks with kanban boards"}
              </p>
            </div>

            {/* Content Area */}
            <div className="animate-fade-in">
              {activeTab === "members" && <Members />}
              {activeTab === "projects" && <Projects />}
              {activeTab === "boards" && <Boards />}
            </div>
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
  );
}

export default Dashbord;