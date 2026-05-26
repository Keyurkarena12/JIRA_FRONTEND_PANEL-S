import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/authSlice';
import AuthCard, { AuthDivider } from '../components/auth/AuthCard';
import OAuthButtons from '../components/auth/OAuthButtons';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(form)).unwrap();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue managing your workspaces."
      footer={
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-[var(--brand-primary)] hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
          Login failed. Please check your email and password.
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            className="field-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="field-label mb-0">Password</label>
            <Link to="/forgot-password" className="text-sm font-medium text-[var(--brand-primary)] hover:underline">
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className="field-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full min-h-[52px] text-base">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <AuthDivider />

      <OAuthButtons
        googleLoading={googleLoading}
        githubLoading={githubLoading}
        onGoogle={() => setGoogleLoading(true)}
        onGithub={() => setGithubLoading(true)}
      />
    </AuthCard>
  );
};

export default Login;
