import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getWorkspaces } from '../features/WorkspaceSlice';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';

const WorkspaceSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {[1, 2, 3].map((i) => (
      <div key={i} className="card-premium">
        <div className="skeleton w-12 h-12 rounded-xl mb-4" />
        <div className="skeleton h-6 w-2/3 rounded-lg mb-3" />
        <div className="skeleton h-4 w-full rounded mb-2" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    ))}
  </div>
);

const Workspaces = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workspaces, loading, error } = useSelector((state) => state.workspace);

  useEffect(() => {
    dispatch(getWorkspaces());
  }, [dispatch]);

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <span className="section-eyebrow mb-2">Dashboard</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              My Workspaces
            </h1>
            <p className="mt-2 text-[var(--text-secondary)]">
              Select a workspace or create a new one for your team.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/create-workspace')}
            className="btn-primary px-6 py-3 min-h-[48px] shrink-0 self-start sm:self-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create workspace
          </button>
        </div>

        {loading ? (
          <WorkspaceSkeleton />
        ) : error ? (
          <div className="card-premium text-center py-16">
            <p className="text-red-600 font-medium">{error}</p>
            <button type="button" onClick={() => dispatch(getWorkspaces())} className="btn-secondary mt-6">
              Try again
            </button>
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((ws, index) => (
              <motion.div
                key={ws._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/workspace/${ws._id}`}
                  className="card-premium block group h-full hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white rounded-2xl flex items-center justify-center text-lg font-bold uppercase shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                      {ws.name.substring(0, 2)}
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-[var(--text-secondary)]">
                      {ws.members?.length || 1} member{(ws.members?.length || 1) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand-primary)] transition-colors">
                    {ws.name}
                  </h3>
                  {ws.description ? (
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2 mb-4">
                      {ws.description}
                    </p>
                  ) : (
                    <p className="text-[var(--text-muted)] text-sm mb-4 italic">No description</p>
                  )}
                  <span className="inline-flex items-center text-sm font-semibold text-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Open workspace
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium text-center py-16 lg:py-20 max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">No workspaces yet</h3>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto leading-relaxed">
              Create your first workspace to start managing projects, tasks, and team collaboration.
            </p>
            <button
              type="button"
              onClick={() => navigate('/create-workspace')}
              className="btn-primary px-8 py-3.5 min-h-[52px]"
            >
              Create your first workspace
            </button>
          </motion.div>
        )}
      </Container>
    </div>
  );
};

export default Workspaces;
