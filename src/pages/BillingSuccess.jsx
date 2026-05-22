import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPlans, verifyCheckoutSession } from '../features/subscriptionSlice';
import { fetchBillingHistory } from '../features/billingSlice';
import { currentUser } from '../features/authSlice';

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
    <div
      className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-stretch sm:items-center justify-start px-4 sm:px-6 pt-20 sm:pt-24 pb-12 sm:pb-14 lg:pb-16"
    >
      <div className="max-w-2xl w-full mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-1">
            Payment Successful! 🎉
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-prose mx-auto leading-relaxed">
            Your subscription has been successfully activated. You now have access to all the features of your new plan.
          </p>

          {/* Plan Information */}
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-center sm:text-left min-w-0 w-full sm:w-auto">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">Current Plan</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600 capitalize break-words">
                  {formatPlanLabel(user?.specificPlan, user?.plan)} plan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-gray-500 mb-1">Status</p>
                <p className="font-semibold text-green-600">Active</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-gray-500 mb-1">Next Billing</p>
                <p className="font-semibold text-gray-900 break-words">
                  {user?.planExpiresAt
                    ? new Date(user.planExpiresAt).toLocaleDateString()
                    : 'Monthly'
                  }
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center sm:col-span-2 md:col-span-1">
                <p className="text-gray-500 mb-1">Payment Method</p>
                <p className="font-semibold text-gray-900">Stripe</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto sm:mx-auto">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Dashboard
            </Link>
            
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Plans
            </Link>
          </div>

          {/* Additional Information */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 pb-1 sm:pb-2 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-left">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">What&apos;s Next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                    <span className="min-w-0">Explore your new features in the dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                    <span className="min-w-0">Invite team members to collaborate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                    <span className="min-w-0">Check your email for receipt and confirmation</span>
                  </li>
                </ul>
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">Need Help?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="min-w-0 break-all sm:break-normal">support@jiralite.com</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="min-w-0">View documentation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Information */}
        <div className="mt-4 sm:mt-6 text-center px-1 pb-1 sm:pb-2">
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
            A receipt has been sent to your email address.
            You can manage your subscription settings in your profile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingSuccess;
