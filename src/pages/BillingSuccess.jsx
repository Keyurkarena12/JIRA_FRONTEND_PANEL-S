import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchPlans, verifyCheckoutSession } from '../features/subscriptionSlice';
import { fetchBillingHistory } from '../features/billingSlice';
import { currentUser } from '../features/authSlice';
import Container from '../components/ui/Container';

const formatPlanLabel = (specificPlan, planGroup) => {
  const raw = specificPlan || planGroup || 'free';
  return String(raw).replace(/_/g, ' ');
};

const BillingSuccess = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    const sync = async () => {
      if (sessionId) {
        await dispatch(verifyCheckoutSession(sessionId)).unwrap().catch(() => {});
      }
      await dispatch(currentUser()).unwrap().catch(() => {});
      dispatch(fetchPlans());
      dispatch(fetchBillingHistory());
    };

    sync();
  }, [dispatch, searchParams]);

  return (
    <div className="py-10 lg:py-16 min-h-[calc(100dvh-var(--nav-height))]">
      <Container size="narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium text-center overflow-hidden relative"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-[var(--brand-primary)] to-violet-500" />

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mx-auto mb-6 mt-2">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3">
            Payment successful
          </h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Your subscription is active. You now have access to all features on your new plan.
          </p>

          <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-[var(--surface-border)] text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 pb-6 border-b border-[var(--surface-border)]">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-[var(--text-muted)]">Current plan</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] capitalize">
                  {formatPlanLabel(user?.specificPlan, user?.plan)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Status', value: 'Active', accent: 'text-emerald-600' },
                {
                  label: 'Next billing',
                  value: user?.planExpiresAt
                    ? new Date(user.planExpiresAt).toLocaleDateString()
                    : 'Monthly',
                },
                { label: 'Payment', value: 'Stripe' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white p-4 border border-[var(--surface-border)] text-center">
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">{item.label}</p>
                  <p className={`font-semibold text-[var(--text-primary)] ${item.accent || ''}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/workspaces" className="btn-primary min-h-[48px] px-8">
              Go to workspaces
            </Link>
            <Link to="/settings" className="btn-secondary min-h-[48px]">
              Manage subscription
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-[var(--surface-border)] grid md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">What&apos;s next?</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                {[
                  'Explore new features in your workspace',
                  'Invite team members to collaborate',
                  'Check your email for the receipt',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Need help?</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Manage billing anytime from{' '}
                <Link to="/settings" className="text-[var(--brand-primary)] font-medium hover:underline">
                  Settings
                </Link>
                .
              </p>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          A receipt has been sent to your email address.
        </p>
      </Container>
    </div>
  );
};

export default BillingSuccess;
