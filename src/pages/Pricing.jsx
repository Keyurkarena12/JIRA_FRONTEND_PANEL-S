import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPlans, createCheckoutSession } from '../features/subscriptionSlice';
import { currentUser } from '../features/authSlice';
import { Link } from 'react-router-dom';

const PLAN_LEVEL = {
  free: 0,
  pro_monthly: 1,
  pro_yearly: 2,
  enterprise_monthly: 3,
  enterprise_yearly: 4
};

const getPlanLevel = (specificPlanName) => {
  return PLAN_LEVEL[specificPlanName] ?? 0;
};

const Pricing = () => {
  const dispatch = useDispatch();
  const { plans, loading, error } = useSelector((state) => state.subscription);
  const { user } = useSelector((state) => state.auth);

  const currentPlanName = user?.plan || 'free';
  const currentSpecificPlan = user?.specificPlan || 'free';

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  // Always refresh user data when component mounts
  useEffect(() => {
    if (user) {
      dispatch(currentUser());
    }
  }, []);

  // Check if a specific plan variant is the current one
  const isCurrentSpecificPlan = (specificPlanName) => {
    return specificPlanName === currentSpecificPlan;
  };

  const canUpgradeToPlan = (specificPlanName) => {
    if (!user) return specificPlanName !== 'free';
    return getPlanLevel(specificPlanName) > getPlanLevel(currentSpecificPlan);
  };

  // Check if a plan variant should be disabled (current or lower)
  const isSpecificPlanDisabled = (specificPlanName) => {
    if (!user) return specificPlanName === 'free';
    if (isCurrentSpecificPlan(specificPlanName)) return true;
    return !canUpgradeToPlan(specificPlanName);
  };
  
  const handleUpgrade = async (planId, planName) => {
    if (!user) {
      alert("Please login first to upgrade your plan.");
      return;
    }
    
    if (isSpecificPlanDisabled(planName)) {
      return;
    }
    
    try {
      await dispatch(createCheckoutSession({ planId })).unwrap();
    } catch (error) {
      alert(`Failed to create checkout session: ${error}`);
    }
  };

  // ✅ Button label logic for specific plan variants
  const getButtonLabel = (specificPlanName) => {
    if (isCurrentSpecificPlan(specificPlanName)) return '✓ Current Plan';
    if (isSpecificPlanDisabled(specificPlanName)) return 'Not Available';
    return 'Upgrade';
  };

  const hasAvailableUpgradeInGroup = (groupPlans) => {
    return groupPlans.some((plan) => !isSpecificPlanDisabled(plan.name));
  };

  // ✅ Button style logic for specific plan variants
  const getButtonStyle = (specificPlanName, color = 'blue') => {
    if (isSpecificPlanDisabled(specificPlanName)) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none';
    }
    return color === 'blue'
      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer pointer-events-auto'
      : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer pointer-events-auto';
  };

  const freePlan = plans.find(p => p.name === 'free');
  const proPlans = plans.filter(p => p.planGroup === 'pro');
  const enterprisePlans = plans.filter(p => p.planGroup === 'enterprise');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mt-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600">
            Simple, transparent pricing. No hidden fees.
          </p>
          {/* ✅ Current plan indicator */}
          {user && (
            <div className="mt-4 space-y-2">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Your Current Plan:
                <span className="ml-1 font-bold capitalize">
                  {currentPlanName.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => dispatch(currentUser())}
                className="px-4 py-2 ml-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              >
                Refresh User Data
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center text-red-500 py-4 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Plan Cards */}
        {!loading && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">

            {/* ====== FREE PLAN ====== */}
            {freePlan && (
              <div className={`bg-white rounded-2xl shadow p-8 border-2 transition-all ${currentPlanName === 'free'
                  ? 'border-blue-500'
                  : 'border-gray-200'
                }`}>
                {/* ✅ Current plan badge */}
                {currentPlanName === 'free' && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                      ✓ Current Plan
                    </span>
                  </div>
                )}

                <h2 className="text-2xl font-bold text-gray-900">
                  {freePlan.displayName}
                </h2>
                <p className="text-gray-500 mt-2">{freePlan.description}</p>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">₹0</span>
                  <span className="text-gray-500">/forever</span>
                </div>

                <ul className="mt-6 space-y-3">
                  {freePlan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>

                {/* ✅ Always disabled — free is lowest plan */}
                <button
                  disabled
                  className="w-full mt-8 py-3 rounded-xl bg-gray-100 text-gray-400 font-medium cursor-not-allowed"
                >
                  {currentPlanName === 'free' ? '✓ Current Plan' : 'Not Available'}
                </button>
              </div>
            )}

            {/* ====== PRO PLAN ====== */}
            <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 relative transition-all ${currentPlanName === 'pro'
                ? 'border-blue-500'
                : !hasAvailableUpgradeInGroup(proPlans)
                  ? 'border-gray-200 opacity-60'
                  : 'border-blue-400'
              }`}>

              {/* Most Popular badge — only show if user can upgrade to pro */}
              {hasAvailableUpgradeInGroup(proPlans) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              {/* ✅ Current plan badge */}
              {currentPlanName === 'pro' && (
                <div className="mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                    ✓ Current Plan Group
                  </span>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900">Pro</h2>
              <p className="text-gray-500 mt-2">Best for growing teams</p>

              {/* Monthly + Yearly */}
              <div className="mt-6 space-y-3">
                {proPlans.map((plan) => {
                  const disabled = isSpecificPlanDisabled(plan.name);
                  return (
                    <div
                      key={plan._id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${disabled
                          ? 'border-gray-100 bg-gray-50'
                          : 'border-blue-200 hover:border-blue-400'
                        }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {plan.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                          {isCurrentSpecificPlan(plan.name) && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{plan.price}
                          <span className="text-sm text-gray-500 font-normal">
                            /{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpgrade(plan._id, plan.name);
                        }}
                        disabled={disabled || loading}
                        className={`px-4 py-2 rounded-lg font-medium transition-all relative z-10 ${getButtonStyle(plan.name, 'blue')
                          }`}
                        type="button"
                      >
                        {loading ? '...' : getButtonLabel(plan.name)}
                      </button>
                    </div>
                  );
                })}
              </div>

              <ul className="mt-6 space-y-3">
                {proPlans[0]?.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* ====== ENTERPRISE PLAN ====== */}
            <div className={`bg-white rounded-2xl shadow p-8 border-2 transition-all ${currentPlanName === 'enterprise'
                ? 'border-purple-500'
                : 'border-gray-200'
              }`}>

              {/* ✅ Current plan badge */}
              {currentPlanName === 'enterprise' && (
                <div className="mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs rounded-full font-medium">
                    ✓ Current Plan Group
                  </span>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900">Enterprise</h2>
              <p className="text-gray-500 mt-2">For large organizations</p>

              {/* Monthly + Yearly */}
              <div className="mt-6 space-y-3">
                {enterprisePlans.map((plan) => {
                  const disabled = isSpecificPlanDisabled(plan.name);
                  return (
                    <div
                      key={plan._id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${disabled
                          ? 'border-gray-100 bg-gray-50'
                          : 'border-purple-200 hover:border-purple-400'
                        }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {plan.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                          {isCurrentSpecificPlan(plan.name) && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full font-medium">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          ₹{plan.price}
                          <span className="text-sm text-gray-500 font-normal">
                            /{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpgrade(plan._id, plan.name);
                        }}
                        disabled={disabled || loading}
                        className={`px-4 py-2 rounded-lg font-medium transition-all relative z-10 ${getButtonStyle(plan.name, 'purple')
                          }`}
                        type="button"
                      >
                        {loading ? '...' : getButtonLabel(plan.name)}
                      </button>
                    </div>
                  );
                })}
              </div>

              <ul className="mt-6 space-y-3">
                {enterprisePlans[0]?.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          {/* <p className="text-gray-600">
            All plans include 14-day money-back guarantee. Cancel anytime.
          </p> */}
          <div className="mt-8">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;