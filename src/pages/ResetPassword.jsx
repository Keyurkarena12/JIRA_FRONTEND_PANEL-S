import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { resetpassword } from '../features/authSlice';
import AuthCard from '../components/auth/AuthCard';

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    resetpasswordcode: '',
    newpassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetpassword(formData))
      .unwrap()
      .then(() => navigate('/login'))
      .catch((err) => console.log(err));
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email, the reset code we sent, and your new password."
      footer={
        <p className="text-center text-sm text-[var(--text-secondary)]">
          Back to{' '}
          <Link to="/login" className="font-semibold text-[var(--brand-primary)] hover:underline">
            sign in
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
          Reset failed. Please verify your code and try again.
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
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="code" className="field-label">Reset code</label>
          <input
            id="code"
            type="text"
            required
            placeholder="Enter code from email"
            value={formData.resetpasswordcode}
            onChange={(e) => setFormData({ ...formData, resetpasswordcode: e.target.value })}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="newpassword" className="field-label">New password</label>
          <input
            id="newpassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Enter new password"
            value={formData.newpassword}
            onChange={(e) => setFormData({ ...formData, newpassword: e.target.value })}
            className="field-input"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full min-h-[52px] text-base">
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
