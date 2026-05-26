import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export const loginUser = createAsyncThunk('auth/login', async (data) => {
  const response = await apiClient.post(ENDPOINTS.auth.login, data);
  localStorage.setItem('token', response.data.token);
  return response.data.user;
});

export const registerUser = createAsyncThunk('auth/register', async (data) => {
  const response = await apiClient.post(ENDPOINTS.auth.register, data);
  localStorage.setItem('token', response.data.token);
  return response.data.user;
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await apiClient.post(ENDPOINTS.auth.logout, {});
  localStorage.removeItem('token');
  localStorage.removeItem('user');
});

export const forgotpassword = createAsyncThunk('auth/forgotpassword', async (email) => {
  const response = await apiClient.post(ENDPOINTS.auth.forgotPassword, { email });
  return response.data;
});

export const resetpassword = createAsyncThunk('auth/resetpassword', async (data) => {
  const response = await apiClient.post(ENDPOINTS.auth.resetPassword, data);
  return response.data;
});

export const currentUser = createAsyncThunk('auth/currentUser', async () => {
  const response = await apiClient.get(ENDPOINTS.auth.currentUser);
  return response.data;
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.auth.updateProfile, data);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    loading: false,
    error: null,
    otpInfo: null,
    resetInfo: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(forgotpassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotpassword.fulfilled, (state, action) => {
        state.loading = false;
        state.otpInfo = action.payload;
      })
      .addCase(forgotpassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(resetpassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetpassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetInfo = action.payload;
      })
      .addCase(resetpassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(currentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(currentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(currentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
