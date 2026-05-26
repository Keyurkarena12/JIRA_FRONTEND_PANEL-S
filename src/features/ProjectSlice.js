import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export const createProject = createAsyncThunk(
  'project/create',
  async ({ name, description, workspaceId }) => {
    const response = await apiClient.post(ENDPOINTS.project.create(workspaceId), {
      name,
      description,
    });
    return response.data;
  }
);

export const getAllProjects = createAsyncThunk(
  'project/getAll',
  async ({ workspaceId }) => {
    const response = await apiClient.get(ENDPOINTS.project.list(workspaceId));
    return response.data;
  }
);

export const updateProject = createAsyncThunk(
  'project/update',
  async ({ projectId, name, description }) => {
    const response = await apiClient.put(ENDPOINTS.project.update(projectId), {
      name,
      description,
    });
    return response.data;
  }
);

export const deleteProject = createAsyncThunk('project/delete', async (projectId) => {
  const response = await apiClient.delete(ENDPOINTS.project.delete(projectId));
  return response.data;
});

export const addProjectMember = createAsyncThunk(
  'project/addMember',
  async ({ projectId, userId, role }) => {
    const response = await apiClient.post(ENDPOINTS.project.addMember(projectId), {
      userId,
      role,
    });
    return response.data;
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projects: [],
    project: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearProjects: (state) => {
      state.projects = [];
      state.error = null;
    },
    setProject: (state, action) => {
      state.project = action.payload;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.projects.push(action.payload.project);
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error.message;
      })
      .addCase(getAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.projects = action.payload.projects || [];
        state.error = null;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error.message;
      })
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.projects.findIndex(
          (project) => project._id === action.payload.project._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload.project;
        }
        state.error = null;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error.message;
      })
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.projects = state.projects.filter(
          (project) => project._id !== action.payload.projectId
        );
        state.error = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error.message;
      })
      .addCase(addProjectMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.projects.findIndex(
          (project) => project._id === action.payload.project._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload.project;
        }
        state.error = null;
      })
      .addCase(addProjectMember.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error.message;
      });
  },
});

export const { clearProjects, setProject } = projectSlice.actions;
export default projectSlice.reducer;
