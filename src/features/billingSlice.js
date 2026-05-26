import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export const fetchBillingHistory = createAsyncThunk(
  'billing/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.subscription.billingHistory);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing history');
    }
  }
);

export const cancelRecurringBilling = createAsyncThunk(
  'billing/cancelRecurring',
  async (payload, { rejectWithValue }) => {
    try {
      const body =
        typeof payload === 'string'
          ? { subscriptionId: payload }
          : {
            ...(payload.subscriptionId && { subscriptionId: payload.subscriptionId }),
            ...(payload.stripeSubscriptionId && {
              stripeSubscriptionId: payload.stripeSubscriptionId
            })
          };

      const response = await apiClient.post(ENDPOINTS.subscription.cancelRecurring, body);
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
