import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createWorkspace } from '../features/WorkspaceSlice';
import Container from '../components/ui/Container';

function CreateWorkspace() {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { loading, error } = useSelector((state) => state.workspace);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createWorkspace(formData))
      .unwrap()
      .then(() => navigate('/workspaces'))
      .catch((err) => console.log(err));
  };

  return (
    <div className="py-10 lg:py-16">
      <Container size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium max-w-lg mx-auto"
        >
          <Link
            to="/workspaces"
            className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to workspaces
          </Link>

          <span className="section-eyebrow mb-3">New workspace</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
            Create a workspace
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            A workspace is where your team collaborates on projects and tasks.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="field-label">Workspace name</label>
              <input
                id="name"
                type="text"
                name="name"
                required
                placeholder="e.g. Design Team"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="field-input"
              />
            </div>

            <div>
              <label htmlFor="description" className="field-label">
                Description <span className="font-normal text-[var(--text-muted)]">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="What will this workspace be used for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="field-input min-h-[120px] resize-none py-3"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full min-h-[52px] text-base">
              {loading ? 'Creating…' : 'Create workspace'}
            </button>
          </form>
        </motion.div>
      </Container>
    </div>
  );
}

export default CreateWorkspace;
