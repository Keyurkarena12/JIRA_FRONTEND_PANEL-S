import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:5000/api/project";

export const createProject = createAsyncThunk("project/create", async({ name, description, workspaceId }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API}/create-project/${workspaceId}`, {
        name,
        description
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log("slice createProject", response.data);
    return response.data;
});

export const getAllProjects = createAsyncThunk("project/getAll", async({ workspaceId }) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API}/get-all-projects/${workspaceId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log("slice getAllProjects", response.data);
    return response.data;
});

export const updateProject = createAsyncThunk("project/update", async({ projectId, name, description }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API}/update-project/${projectId}`, {
        name,
        description
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log("slice updateProject", response.data);
    return response.data;
});

const projectSlice = createSlice({
    name: "project",
    initialState: {
        projects: [],
        project: null,
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        clearProjects: (state) => {
            state.projects = [];
            state.error = null;
        },
        setProject: (state, action) => {
            state.project = action.payload;
        }
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
                const index = state.projects.findIndex(project => project._id === action.payload.project._id);
                if (index !== -1) {
                    state.projects[index] = action.payload.project;
                }
                state.error = null;
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.error.message;
            });
    }
});

export const { clearProjects, setProject } = projectSlice.actions;
export default projectSlice.reducer;
