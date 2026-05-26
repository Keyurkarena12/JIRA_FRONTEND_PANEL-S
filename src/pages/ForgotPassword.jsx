import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { forgotpassword } from '../features/authSlice';
import AuthCard from '../components/auth/AuthCard';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const { loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotpassword(email))
      .unwrap()
      .then(() => navigate('/reset-password'))
      .catch((err) => console.log(err));
  };

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset code."
      footer={
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-[var(--brand-primary)] hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
          Could not send reset code. Please check your email and try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="field-label">Email address</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full min-h-[52px] text-base">
          {loading ? 'Sending…' : 'Send reset code'}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;
