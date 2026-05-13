import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../features/authSlice';
import { fetchBillingHistory } from '../features/billingSlice';
import { fetchPlans, cancelRecurringBilling } from '../features/subscriptionSlice';

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
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'billing', label: 'Billing', icon: '💳' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mt-10">Settings</h1>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
            
            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={generalSettings.name}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={generalSettings.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  placeholder="Your email"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar
                </label>
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
                        className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Change
                      </button>
                      {(user?.avatar?.url || avatarPreview) && !removeAvatar && (
                        <button
                          type="button"
                          onClick={handleAvatarRemove}
                          className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={accountSettings.currentPassword}
                  onChange={(e) => setAccountSettings({ ...accountSettings, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={accountSettings.newPassword}
                  onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={accountSettings.confirmPassword}
                  onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Plan</h2>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {user?.specificPlan?.replace('_', ' ') || 'Free'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentPlan?.description || 'Basic plan for individuals'}
                  </p>
                  {currentPlan && (
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      ₹{currentPlan.price}
                      <span className="text-sm text-gray-500 font-normal">
                        /{currentPlan.billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Cancel Recurring Billing */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Cancel Recurring Billing</h2>
              
              <div className="space-y-4">
                {(() => {
                  // Find only the current active recurring plan (user's current plan)
                  const currentRecurringPlan = billingHistory
                    .filter(record => record.status === 'active' || record.status === 'paid')
                    .filter(record => canCancelRecurringForRow(record, billingHistory))
                    .find(record => record.planGroup === user?.plan);
                  
                  return currentRecurringPlan ? (
                    <div className="border border-gray-200 rounded-lg p-4">
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
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
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

            {/* Plan Limits */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Plan Limits</h2>
              
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

            {/* Upgrade Plan */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upgrade Plan</h2>
              
              <p className="text-gray-600 mb-4">
                Want to upgrade your plan? Check out our pricing page to see available options.
              </p>
              
              <a
                href="/pricing"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Pricing Plans
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>
              
              {billingLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
      </div>
    </div>
  );
};

export default Settings;
