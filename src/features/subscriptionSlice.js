import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
  const PLAN_API = "http://localhost:5000/api/plan"
  const CHECKOUT_API = "http://localhost:5000/api/subscription"
// ✅ Fetch all plans — GET /api/plan/get-all-plans
export const fetchPlans = createAsyncThunk(
  'subscription/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${PLAN_API}/get-all-plans`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get plans');
    }
  }
);

// ✅ Fetch single plan by name — GET /api/plan/:name
export const fetchPlanByName = createAsyncThunk(
  'subscription/fetchPlanByName',
  async (name, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${PLAN_API}/${name}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get plan');
    }
  }
);

// ✅ Create checkout session — POST /api/subscription/create-checkout-session
export const createCheckoutSession = createAsyncThunk(
  'subscription/createCheckoutSession',
  async ({ planId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${CHECKOUT_API}/create-checkout-session`,
        { planId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create checkout session');
    }
  }
);

// ✅ After returning from Stripe — sync user + billing if webhook was not received
export const verifyCheckoutSession = createAsyncThunk(
  'subscription/verifyCheckoutSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${CHECKOUT_API}/verify-checkout-session`,
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to verify checkout session'
      );
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