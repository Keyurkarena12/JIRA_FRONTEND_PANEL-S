import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkspaces } from '../features/WorkspaceSlice';
import { Link, useNavigate } from 'react-router-dom';

const Workspaces = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workspaces, loading, error } = useSelector((state) => state.workspace);

  useEffect(() => {
    dispatch(getWorkspaces());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Workspaces</h1>
          <button
            onClick={() => navigate('/create-workspace')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
          >
            + Create Workspace
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center mt-20">
            <span className="text-gray-500 font-medium">Loading workspaces...</span>
          </div>
        ) : error ? (
          <div className="text-center mt-20 text-red-500 font-medium">{error}</div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <Link
                key={ws._id}
                to={`/workspace/${ws._id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer block group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mb-4 uppercase group-hover:scale-105 transition-transform shadow-md">
                  {ws.name.substring(0, 2)}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{ws.name}</h3>
                {ws.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{ws.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <span className="bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                    {ws.members?.length || 1} Member{ws.members?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center mt-20 bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Workspaces Found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">You don't belong to any workspaces yet. Create one to start managing your projects and team.</p>
            <button
              onClick={() => navigate('/create-workspace')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg"
            >
              Create Your First Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspaces;
