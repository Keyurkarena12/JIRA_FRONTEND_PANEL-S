import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchPlans, createCheckoutSession } from '../features/subscriptionSlice';
import { currentUser } from '../features/authSlice';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';

const PLAN_LEVEL = {
  free: 0,
  pro_daily: 1,
  pro_monthly: 2,
  pro_yearly: 3,
  enterprise_monthly: 4,
  enterprise_yearly: 5,
};

const getPlanLevel = (specificPlanName) => PLAN_LEVEL[specificPlanName] ?? 0;

const CheckIcon = () => (
  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PlanBadge = ({ children, variant = 'blue' }) => {
  const styles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-violet-50 text-violet-700 border-violet-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  );
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

  useEffect(() => {
    if (user) dispatch(currentUser());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCurrentSpecificPlan = (specificPlanName) => specificPlanName === currentSpecificPlan;

  const canUpgradeToPlan = (specificPlanName) => {
    if (!user) return specificPlanName !== 'free';
    return getPlanLevel(specificPlanName) > getPlanLevel(currentSpecificPlan);
  };

  const isSpecificPlanDisabled = (specificPlanName) => {
    if (!user) return specificPlanName === 'free';
    if (isCurrentSpecificPlan(specificPlanName)) return true;
    return !canUpgradeToPlan(specificPlanName);
  };

  const handleUpgrade = async (planId, planName) => {
    if (!user) {
      alert('Please login first to upgrade your plan.');
      return;
    }
    if (isSpecificPlanDisabled(planName)) return;
    try {
      await dispatch(createCheckoutSession({ planId })).unwrap();
    } catch (err) {
      alert(`Failed to create checkout session: ${err}`);
    }
  };

  const getButtonLabel = (specificPlanName) => {
    if (isCurrentSpecificPlan(specificPlanName)) return 'Current plan';
    if (isSpecificPlanDisabled(specificPlanName)) return 'Not available';
    return 'Upgrade';
  };

  const hasAvailableUpgradeInGroup = (groupPlans) =>
    groupPlans.some((plan) => !isSpecificPlanDisabled(plan.name));

  const getVariantButtonClass = (specificPlanName, accent = 'blue') => {
    if (isSpecificPlanDisabled(specificPlanName)) {
      return 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none';
    }
    return accent === 'purple'
      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/25'
      : 'btn-primary !py-2 !px-4 !min-h-0 text-sm';
  };

  const freePlan = plans.find((p) => p.name === 'free');
  const proPlans = plans.filter((p) => p.planGroup === 'pro');
  const enterprisePlans = plans.filter((p) => p.planGroup === 'enterprise');

  const cycleLabel = (cycle) =>
    cycle === 'monthly' ? 'mo' : cycle === 'daily' ? 'day' : 'yr';

  return (
    <div className="py-12 lg:py-20">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="section-eyebrow mb-4">Pricing</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Choose the plan that fits your team. Upgrade anytime via Stripe checkout.
          </p>

          {user && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <PlanBadge variant="blue">
                Current: {currentPlanName.replace('_', ' ')}
              </PlanBadge>
              <button
                type="button"
                onClick={() => dispatch(currentUser())}
                className="btn-ghost text-sm py-2 min-h-0"
              >
                Refresh plan
              </button>
            </div>
          )}

          {!user && (
            <p className="mt-6 text-sm text-[var(--text-muted)]">
              <Link to="/login" className="text-[var(--brand-primary)] font-semibold hover:underline">
                Sign in
              </Link>
              {' '}to upgrade your plan.
            </p>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-center text-sm">
            {error}
          </div>
        )}

        {!loading && plans.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Free */}
            {freePlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card-premium relative ${currentPlanName === 'free' ? 'ring-2 ring-[var(--brand-primary)] ring-offset-2' : ''}`}
              >
                {currentPlanName === 'free' && (
                  <div className="absolute -top-3 left-6">
                    <PlanBadge>Current plan</PlanBadge>
                  </div>
                )}
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{freePlan.displayName}</h2>
                <p className="text-[var(--text-secondary)] mt-2 text-sm">{freePlan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[var(--text-primary)]">₹0</span>
                  <span className="text-[var(--text-muted)]">/forever</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {freePlan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>
                <button type="button" disabled className="w-full mt-8 btn-secondary opacity-60 cursor-not-allowed">
                  {currentPlanName === 'free' ? 'Current plan' : 'Not available'}
                </button>
              </motion.div>
            )}

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className={`card-premium relative lg:scale-[1.02] lg:z-10 ${
                currentPlanName === 'pro'
                  ? 'ring-2 ring-[var(--brand-primary)] ring-offset-2'
                  : hasAvailableUpgradeInGroup(proPlans)
                    ? 'shadow-[var(--shadow-glow)] border-blue-200'
                    : ''
              }`}
            >
              {hasAvailableUpgradeInGroup(proPlans) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] shadow-lg">
                    Most popular
                  </span>
                </div>
              )}
              {currentPlanName === 'pro' && (
                <div className="mb-3">
                  <PlanBadge>Current plan group</PlanBadge>
                </div>
              )}
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Pro</h2>
              <p className="text-[var(--text-secondary)] mt-2 text-sm">Best for growing teams</p>

              <div className="mt-6 space-y-3">
                {proPlans.map((plan) => {
                  const disabled = isSpecificPlanDisabled(plan.name);
                  return (
                    <div
                      key={plan._id}
                      className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
                        disabled ? 'border-slate-100 bg-slate-50/80' : 'border-blue-100 bg-blue-50/30 hover:border-blue-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2 flex-wrap">
                          {plan.billingCycle === 'monthly' ? 'Monthly' : plan.billingCycle === 'daily' ? 'Daily' : 'Yearly'}
                          {isCurrentSpecificPlan(plan.name) && <PlanBadge variant="blue">Current</PlanBadge>}
                        </p>
                        <p className="text-2xl font-bold text-[var(--brand-primary)] mt-0.5">
                          ₹{plan.price}
                          <span className="text-sm font-normal text-[var(--text-muted)]">/{cycleLabel(plan.billingCycle)}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpgrade(plan._id, plan.name)}
                        disabled={disabled || loading}
                        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${getVariantButtonClass(plan.name, 'blue')}`}
                      >
                        {loading ? '…' : getButtonLabel(plan.name)}
                      </button>
                    </div>
                  );
                })}
              </div>

              <ul className="mt-6 space-y-3">
                {proPlans[0]?.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className={`card-premium relative ${
                currentPlanName === 'enterprise' ? 'ring-2 ring-violet-500 ring-offset-2' : ''
              }`}
            >
              {currentPlanName === 'enterprise' && (
                <div className="mb-3">
                  <PlanBadge variant="purple">Current plan group</PlanBadge>
                </div>
              )}
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Enterprise</h2>
              <p className="text-[var(--text-secondary)] mt-2 text-sm">For large organizations</p>

              <div className="mt-6 space-y-3">
                {enterprisePlans.map((plan) => {
                  const disabled = isSpecificPlanDisabled(plan.name);
                  return (
                    <div
                      key={plan._id}
                      className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
                        disabled ? 'border-slate-100 bg-slate-50/80' : 'border-violet-100 bg-violet-50/30 hover:border-violet-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2 flex-wrap">
                          {plan.billingCycle === 'monthly' ? 'Monthly' : plan.billingCycle === 'daily' ? 'Daily' : 'Yearly'}
                          {isCurrentSpecificPlan(plan.name) && <PlanBadge variant="purple">Current</PlanBadge>}
                        </p>
                        <p className="text-2xl font-bold text-violet-600 mt-0.5">
                          ₹{plan.price}
                          <span className="text-sm font-normal text-[var(--text-muted)]">/{cycleLabel(plan.billingCycle)}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpgrade(plan._id, plan.name)}
                        disabled={disabled || loading}
                        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${getVariantButtonClass(plan.name, 'purple')}`}
                      >
                        {loading ? '…' : getButtonLabel(plan.name)}
                      </button>
                    </div>
                  );
                })}
              </div>

              <ul className="mt-6 space-y-3">
                {enterprisePlans[0]?.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}

        <div className="text-center mt-14">
          <Link to="/workspaces" className="btn-secondary">
            Back to workspaces
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default Pricing;
