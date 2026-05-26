import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.plan.all);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get plans');
    }
  }
);

export const fetchPlanByName = createAsyncThunk(
  'subscription/fetchPlanByName',
  async (name, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.plan.byName(name));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get plan');
    }
  }
);

export const createCheckoutSession = createAsyncThunk(
  'subscription/createCheckoutSession',
  async ({ planId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.subscription.checkout, { planId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create checkout session');
    }
  }
);

export const verifyCheckoutSession = createAsyncThunk(
  'subscription/verifyCheckoutSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.subscription.verifyCheckout, { sessionId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify checkout session');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    plans: [],           // ✅ all plans list
    selectedPlan: null,  // ✅ single plan detail
    loading: false,
    error: null,
    checkoutUrl: null
  },
  reducers: {
    // ✅ Clear checkout URL after redirect
    clearCheckoutUrl: (state) => {
      state.checkoutUrl = null;
    },
    // ✅ Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder

      // ================= FETCH ALL PLANS =================
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.plans || [];
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.plans = [];
      })

      // ================= FETCH SINGLE PLAN =================
      .addCase(fetchPlanByName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanByName.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPlan = action.payload.plan;
      })
      .addCase(fetchPlanByName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= CREATE CHECKOUT SESSION =================
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutUrl = action.payload.url;
        // ✅ Auto redirect to Stripe checkout
        if (action.payload.url) {
          window.location.href = action.payload.url;
        }
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCheckoutUrl, clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

export { cancelRecurringBilling } from './billingSlice';