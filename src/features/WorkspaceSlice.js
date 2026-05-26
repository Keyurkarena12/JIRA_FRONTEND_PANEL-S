import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export const createWorkspace = createAsyncThunk('workspace/create', async (data) => {
  const response = await apiClient.post(ENDPOINTS.workspace.create, data);
  return response.data;
});

export const inviteMember = createAsyncThunk(
  'workspace/inviteMember',
  async ({ workspaceId, email }) => {
    const response = await apiClient.post(ENDPOINTS.workspace.addMember(workspaceId), { email });
    return response.data;
  }
);

export const acceptinvite = createAsyncThunk(
  'workspace/acceptinvite',
  async (payload, { rejectWithValue }) => {
    try {
      const token = typeof payload === 'string' ? payload : payload?.token;
      if (!token) {
        return rejectWithValue('Invite token is required');
      }
      const response = await apiClient.get(ENDPOINTS.workspace.acceptInvite(token));
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to accept invite'
      );
    }
  }
);

export const getWorkspaceMembers = createAsyncThunk(
  'workspace/getMembers',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.workspace.members(workspaceId));
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to load members'
      );
    }
  }
);

export const getWorkspaceById = createAsyncThunk('workspace/getById', async (workspaceId) => {
  const response = await apiClient.get(ENDPOINTS.workspace.byId(workspaceId));
  return response.data;
});

export const getWorkspaces = createAsyncThunk('workspace/getWorkspaces', async () => {
  const response = await apiClient.get(ENDPOINTS.workspace.list);
  return response.data;
});

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    workspace: null,
    workspaces: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearWorkspace: (state) => {
      state.workspace = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload?.workspace) {
          state.workspaces.push(action.payload.workspace);
        }
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(inviteMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteMember.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(acceptinvite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptinvite.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const ws = action.payload?.workspace;
        if (ws) {
          const id = ws._id || ws.id;
          state.workspace = { ...ws, _id: id };
          if (id && !state.workspaces.some((w) => String(w._id) === String(id))) {
            state.workspaces.push({ ...ws, _id: id });
          }
        }
      })
      .addCase(acceptinvite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(getWorkspaceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWorkspaceById.fulfilled, (state, action) => {
        state.loading = false;
        const ws = action.payload?.workspace ?? action.payload;
        state.workspace = ws;
      })
      .addCase(getWorkspaceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = action.payload?.workspaces || [];
      })
      .addCase(getWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getWorkspaceMembers.fulfilled, (state, action) => {
        if (action.payload?.members && state.workspace) {
          state.workspace = {
            ...state.workspace,
            members: action.payload.members,
          };
        }
      });
  },
});

export const { clearWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
