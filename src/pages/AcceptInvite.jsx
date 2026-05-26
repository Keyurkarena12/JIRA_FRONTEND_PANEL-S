import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { acceptinvite, getWorkspaces } from '../features/WorkspaceSlice';
import { loginUser } from '../features/authSlice';
import AuthCard from '../components/auth/AuthCard';

const AcceptInvite = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const inviteToken = new URLSearchParams(location.search).get('token');
  const { loading: acceptLoading } = useSelector((state) => state.workspace);
  const acceptStartedRef = useRef(false);

  const redirectAfterAccept = useCallback(
    async (workspaceId) => {
      if (localStorage.getItem('token')) {
        await dispatch(getWorkspaces()).unwrap().catch(() => {});
        navigate(workspaceId ? `/workspace/${workspaceId}` : '/workspaces', { replace: true });
      } else {
        setPendingWorkspaceId(workspaceId);
        setSuccess(true);
        setShowLogin(true);
        setLoading(false);
      }
    },
    [dispatch, navigate]
  );

  const handleAcceptInvite = useCallback(async () => {
    if (!inviteToken) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const result = await dispatch(acceptinvite(inviteToken)).unwrap();
      const workspaceId = result?.workspace?._id || result?.workspace?.id;

      if (localStorage.getItem('token')) {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => redirectAfterAccept(workspaceId), 1500);
      } else {
        await redirectAfterAccept(workspaceId);
      }
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Failed to accept invitation';
      setError(message);

      if (
        message.toLowerCase().includes('user not found') ||
        message.toLowerCase().includes('register')
      ) {
        setShowLogin(true);
      }
      setLoading(false);
    }
  }, [dispatch, inviteToken, redirectAfterAccept]);

  useEffect(() => {
    if (!inviteToken) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }
    if (acceptStartedRef.current) return;
    acceptStartedRef.current = true;

    handleAcceptInvite();
  }, [inviteToken, handleAcceptInvite]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError(null);
      await dispatch(loginUser({ email, password })).unwrap();

      if (inviteToken) {
        const result = await dispatch(acceptinvite(inviteToken)).unwrap().catch(() => null);
        const workspaceId =
          result?.workspace?._id ||
          result?.workspace?.id ||
          pendingWorkspaceId;

        await dispatch(getWorkspaces()).unwrap().catch(() => {});
        navigate(workspaceId ? `/workspace/${workspaceId}` : '/workspaces', { replace: true });
      } else {
        navigate('/workspaces', { replace: true });
      }
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Login failed';
      setError(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-var(--nav-height))] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Accepting invitation…</p>
        </div>
      </div>
    );
  }

  if (success && !showLogin) {
    return (
      <div className="min-h-[calc(100dvh-var(--nav-height))] flex items-center justify-center px-4">
        <AuthCard title="Invitation accepted!" subtitle="Redirecting you to your workspace…">
          <div className="flex justify-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-[calc(100dvh-var(--nav-height))] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <AuthCard
            title={success ? 'Invitation accepted!' : 'Login required'}
            subtitle={
              success
                ? 'Sign in with the invited email to access your workspace.'
                : 'Please sign in to accept this workspace invitation.'
            }
          >
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="field-label">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="field-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="field-label">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="field-input"
                  required
                />
              </div>

              <button type="submit" disabled={acceptLoading} className="btn-primary w-full min-h-[52px]">
                {acceptLoading ? 'Processing…' : 'Sign in & open workspace'}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-semibold text-[var(--brand-primary)] hover:underline"
              >
                Sign up
              </button>
            </p>
          </AuthCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-var(--nav-height))] flex items-center justify-center px-4">
      <AuthCard title="Invalid invitation" subtitle={error || 'This invitation link is invalid or has expired.'}>
        <button type="button" onClick={() => navigate('/login')} className="btn-primary w-full min-h-[48px]">
          Go to sign in
        </button>
      </AuthCard>
    </div>
  );
};

export default AcceptInvite;
