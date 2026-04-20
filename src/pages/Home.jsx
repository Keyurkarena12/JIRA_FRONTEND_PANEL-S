import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {

  const navigate = useNavigate()

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-70px)]">

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Manage Your Work Smarter 🚀
        </h1>

        <p className="text-gray-600 max-w-2xl mb-6">
          Create workspaces, manage projects, assign tasks, and collaborate with your team —
          all in one place like Jira.
        </p>

        <button
          onClick={() => navigate("/create-workspace")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
        >
          Create Your Workspace
        </button>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 px-10 pb-20">

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-2">Workspaces</h3>
          <p className="text-gray-500">
            Organize your teams and manage members with roles like owner, admin, and member.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-2">Projects</h3>
          <p className="text-gray-500">
            Break your work into projects and keep everything structured and scalable.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-2">Tasks & Boards</h3>
          <p className="text-gray-500">
            Track progress using boards like Todo, In Progress, and Done.
          </p>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="text-center pb-16">
        <h2 className="text-2xl font-semibold mb-4">
          Ready to manage your team better?
        </h2>

        <button
          onClick={() => navigate("/register")}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Get Started Now
        </button>
      </div>

    </div>
  )
}

export default Home