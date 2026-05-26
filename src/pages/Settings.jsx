import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../features/authSlice';
import { fetchBillingHistory } from '../features/billingSlice';
import { fetchPlans, cancelRecurringBilling } from '../features/subscriptionSlice';
import Container from '../components/ui/Container';

/** Paid/active invoice rows can still renew in Stripe until canceled */
const canCancelRecurringForRow = (record, allRecords) => {
  const stripeId = record.stripeSubscriptionId;
  if (!stripeId) return false;
  if (record.status === 'cancelled' || record.status === 'expired') return false;
  if (!['paid', 'active'].includes(record.status)) return false;

  const alreadyEndedInHistory = allRecords.some(
    (r) =>
      r.stripeSubscriptionId === stripeId &&
      r.status === 'cancelled' &&
      r._id !== record._id
  );

  return !alreadyEndedInHistory;
};

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { plans } = useSelector((state) => state.subscription);
  const { billingHistory, loading: billingLoading, error: billingError, cancelLoading, cancelError } = useSelector((state) => state.billing);
  const [cancellingStripeId, setCancellingStripeId] = useState(null);
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // Fetch plans on component mount
  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  // Fetch billing history when billing tab is active
  useEffect(() => {
    if (activeTab === 'billing' && user) {
      dispatch(fetchBillingHistory());
    }
  }, [activeTab, dispatch, user]);
  const [error, setError] = useState('');

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => {
    setGeneralSettings({
      name: user?.name || '',
      email: user?.email || ''
    });
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Account settings state
  const [accountSettings, setAccountSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const currentAvatarUrl = removeAvatar ? '' : (avatarPreview || user?.avatar?.url || '');

  // Get current plan details
  const currentPlan = plans.find(p => p.name === user?.specificPlan);

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', generalSettings.name);

      if (selectedAvatar) {
        formData.append('photo', selectedAvatar);
      }

      if (removeAvatar && !selectedAvatar) {
        formData.append('removeAvatar', 'true');
      }

      await dispatch(updateProfile(formData)).unwrap();

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setSelectedAvatar(null);
      setAvatarPreview('');
      setRemoveAvatar(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  const handleAvatarRemove = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview('');
    setSelectedAvatar(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (accountSettings.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement password change API
      setMessage('Password change functionality coming soon!');
      setAccountSettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRecurringBilling = async (record) => {
    const stripeSubscriptionId = record.stripeSubscriptionId;
    const subscriptionId = record.subscriptionId?._id || record.subscriptionId;

    if (!stripeSubscriptionId && !subscriptionId) {
      setError('Missing subscription reference — refresh the page and try again.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (!window.confirm('Cancel recurring billing for this plan? You keep access until the end of the paid period. This stops future renewals for this subscription in Stripe.')) {
      return;
    }

    const rowKey = stripeSubscriptionId || String(subscriptionId);
    setCancellingStripeId(rowKey);

    try {
      const result = await dispatch(
        cancelRecurringBilling({
          stripeSubscriptionId,
          subscriptionId
        })
      ).unwrap();

      const end = result.cancelAt ? new Date(result.cancelAt) : null;
      setMessage(
        end
          ? `Renewals stopped. Access continues until ${end.toLocaleDateString()}.`
          : 'Renewals stopped for this subscription.'
      );

      dispatch(fetchBillingHistory());

      setTimeout(() => setMessage(''), 6000);
    } catch (err) {
      setError(err || 'Failed to cancel recurring billing');
      setTimeout(() => setError(''), 5000);
    } finally {
      setCancellingStripeId(null);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'account', label: 'Account' },
    { id: 'billing', label: 'Billing' },
  ];

  return (
    <div className="py-10 lg:py-14">
      <Container size="narrow">
        <div className="mb-8">
          <span className="section-eyebrow mb-2">Account</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Manage your profile, security, and billing.</p>
        </div>

        <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-slate-100/80 border border-[var(--surface-border)] mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-white text-[var(--brand-primary)] shadow-sm border border-[var(--surface-border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="card-premium">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">General</h2>

            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div>
                <label className="field-label">Name</label>
                <input
                  type="text"
                  value={generalSettings.name}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, name: e.target.value })}
                  className="field-input"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  value={generalSettings.email}
                  disabled
                  className="field-input bg-slate-50 text-[var(--text-muted)] cursor-not-allowed"
                  placeholder="Your email"
                />
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="field-label">Avatar</label>
                <div className="flex items-center space-x-4">
                  {currentAvatarUrl ? (
                    <img
                      src={currentAvatarUrl}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <>
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-xl">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Profile picture</p>
                    <p className="text-xs text-gray-500">Upload JPG, PNG, or WebP</p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary !min-h-0 !py-2 !px-3 text-xs"
                      >
                        Change
                      </button>
                      {(user?.avatar?.url || avatarPreview) && !removeAvatar && (
                        <button
                          type="button"
                          onClick={handleAvatarRemove}
                          className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="btn-primary min-h-[48px] px-6">
                  {loading ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="card-premium">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Password</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">Update your password to keep your account secure.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="field-label">Current password</label>
                <input
                  type="password"
                  value={accountSettings.currentPassword}
                  onChange={(e) => setAccountSettings({ ...accountSettings, currentPassword: e.target.value })}
                  className="field-input"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="field-label">New password</label>
                <input
                  type="password"
                  value={accountSettings.newPassword}
                  onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
                  className="field-input"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="field-label">Confirm new password</label>
                <input
                  type="password"
                  value={accountSettings.confirmPassword}
                  onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
                  className="field-input"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="btn-primary min-h-[48px] px-6">
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="card-premium">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Current plan</h2>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-[var(--surface-border)] bg-slate-50/50">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] capitalize">
                    {user?.specificPlan?.replace('_', ' ') || 'Free'}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {currentPlan?.description || 'Basic plan for individuals'}
                  </p>
                  {currentPlan && (
                    <p className="text-xl font-bold text-[var(--brand-primary)] mt-3">
                      ₹{currentPlan.price}
                      <span className="text-sm text-[var(--text-muted)] font-normal">
                        /{currentPlan.billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </p>
                  )}
                </div>
                <span className="self-start px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs rounded-full font-semibold">
                  Active
                </span>
              </div>
            </div>

            <div className="card-premium">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Cancel recurring billing</h2>
              
              <div className="space-y-4">
                {(() => {
                  // Find only the current active recurring plan (user's current plan)
                  const currentRecurringPlan = billingHistory
                    .filter(record => record.status === 'active' || record.status === 'paid')
                    .filter(record => canCancelRecurringForRow(record, billingHistory))
                    .find(record => record.planGroup === user?.plan);
                  
                  return currentRecurringPlan ? (
                    <div className="border border-[var(--surface-border)] rounded-xl p-5 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">
                            {currentRecurringPlan.planName?.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {currentRecurringPlan.billingCycle} • ₹{currentRecurringPlan.amount}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                            Current Plan
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>Next billing: {currentRecurringPlan.endDate ? new Date(currentRecurringPlan.endDate).toLocaleDateString() : 'Ongoing'}</p>
                          <p className="text-xs mt-1">Access continues until end of paid period</p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleCancelRecurringBilling(currentRecurringPlan)}
                          disabled={
                            cancelLoading ||
                            cancellingStripeId === (currentRecurringPlan.stripeSubscriptionId || String(currentRecurringPlan.subscriptionId?._id || currentRecurringPlan.subscriptionId || ''))
                          }
                          className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm font-semibold transition-colors"
                        >
                          {cancellingStripeId === (currentRecurringPlan.stripeSubscriptionId || String(currentRecurringPlan.subscriptionId?._id || currentRecurringPlan.subscriptionId || ''))
                            ? 'Cancelling...'
                            : 'Cancel Recurring Billing'
                          }
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-medium">No Active Recurring Plans</p>
                      <p className="text-sm">You don't have any active recurring subscriptions to cancel.</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="card-premium">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Plan limits</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Workspaces</span>
                  <span className="font-medium text-gray-900">
                    {currentPlan?.limits?.workspaces || user?.planLimits?.workspaces || '1'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Members per Workspace</span>
                  <span className="font-medium text-gray-900">
                    {currentPlan?.limits?.membersPerWorkspace || user?.planLimits?.membersPerWorkspace || '3'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Documents</span>
                  <span className="font-medium text-gray-900">
                    {currentPlan?.limits?.documents || user?.planLimits?.documents || '10'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Chat Feature</span>
                  <span className="font-medium text-gray-900">
                    {currentPlan?.limits?.chat !== undefined ? 
                      (currentPlan?.limits?.chat ? '✓ Enabled' : '✗ Disabled') : 
                      (user?.planLimits?.chat ? '✓ Enabled' : '✗ Disabled')
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="card-premium">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Upgrade plan</h2>
              <p className="text-[var(--text-secondary)] mb-5">
                Want more workspaces, members, or features? Compare plans on our pricing page.
              </p>
              <Link to="/pricing" className="btn-primary inline-flex min-h-[44px] px-6">
                View pricing
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="card-premium">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Billing history</h2>
              
              {billingLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
                </div>
              ) : billingError ? (
                <div className="text-center py-8 text-red-500">
                  <p>Error loading billing history: {billingError}</p>
                </div>
              ) : (
                <>
                  {cancelError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {cancelError}
                    </div>
                  )}
                  {(() => {
                  // Filter to only show paid plans (exclude cancelled)
                  const paidBillingHistory = billingHistory.filter(record => record.status === 'paid');
                  
                  return paidBillingHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No paid plans available</p>
                      <p className="text-sm text-gray-400 mt-2">Your paid subscription history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paidBillingHistory.map((record, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium text-gray-900 capitalize">
                                {record.planName?.replace('_', ' ')}
                              </h3>
                              <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700">
                                Paid
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                ₹{record.amount}
                              </p>
                              <p className="text-sm text-gray-500">
                                {record.billingCycle}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p className="font-medium">Start Date:</p>
                              <p>{new Date(record.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="font-medium">End Date:</p>
                              <p>{record.endDate ? new Date(record.endDate).toLocaleDateString() : 'Active'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                   </>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Settings;
