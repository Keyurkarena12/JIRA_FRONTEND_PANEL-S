import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/authSlice';
import AuthCard, { AuthDivider } from '../components/auth/AuthCard';
import OAuthButtons from '../components/auth/OAuthButtons';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData))
      .unwrap()
      .then(() => {
        setFormData({ name: '', email: '', password: '' });
        navigate('/login');
      })
      .catch((err) => console.log(err));
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start organizing your team in minutes."
      footer={
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--brand-primary)] hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
          Registration failed. Please try again with different details.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="field-label">Full name</label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Alex Johnson"
            className="field-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="field-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Create a strong password"
            className="field-input"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full min-h-[52px] text-base">
          {loading ? 'Creating account…' : 'Create account'}
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

export default Register;
