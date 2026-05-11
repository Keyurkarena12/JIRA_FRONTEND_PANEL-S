import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BILLING_API="http://localhost:5000/api/subscription"

// ✅ Async thunk for fetching billing history
export const fetchBillingHistory = createAsyncThunk(
  'billing/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BILLING_API}/billing-history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing history');
    }
  }
);

// ✅ Cancel recurring billing — pass Mongo subscriptionId and/or stripeSubscriptionId (needed for older plans)
export const cancelRecurringBilling = createAsyncThunk(
  'billing/cancelRecurring',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const body =
        typeof payload === 'string'
          ? { subscriptionId: payload }
          : {
              ...(payload.subscriptionId && { subscriptionId: payload.subscriptionId }),
              ...(payload.stripeSubscriptionId && {
                stripeSubscriptionId: payload.stripeSubscriptionId
              })
            };

      const response = await axios.post(
        `${BILLING_API}/cancel-recurring-billing`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel recurring billing');
    }
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState: {
    billingHistory: [],
    loading: false,
    error: null,
    cancelLoading: false,
    cancelError: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.cancelError = null;
    },
    clearCancelError: (state) => {
      state.cancelError = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch billing history
    builder
      .addCase(fetchBillingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.billingHistory = action.payload.data || [];
      })
      .addCase(fetchBillingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Cancel recurring billing
    builder
      .addCase(cancelRecurringBilling.pending, (state) => {
        state.cancelLoading = true;
        state.cancelError = null;
      })
      .addCase(cancelRecurringBilling.fulfilled, (state) => {
        state.cancelLoading = false;
      })
      .addCase(cancelRecurringBilling.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelError = action.payload;
      });
  }
});

export const { clearError, clearCancelError } = billingSlice.actions;
export default billingSlice.reducer;
