import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"

const API = "http://localhost:5000/api/workspace";

export const createWorkspace = createAsyncThunk("workspace/create", async(data)=>{
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API}/create`, data, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    console.log("slice createWorkspace", response.data)
    return response.data
})

export const inviteMember = createAsyncThunk("workspace/add-Member", async({workspaceId, email})=>{
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API}/add-member/${workspaceId}`, {email}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    console.log("slice inviteMember", response.data)
    return response.data
}) 

export const acceptinvite = createAsyncThunk("workspace/accept-invite", async({token})=>{
    const response = await axios.get(`${API}/accept-invite?token=${token}`)
    console.log("slice acceptinvite", response.data)
    return response.data
})

export const getWorkspaceById = createAsyncThunk("workspace/getWorkspaceById", async(workspaceId)=>{
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API}/get-workspaces/${workspaceId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    console.log("slice getWorkspaceById", response.data)
    return response.data
})  

export const getWorkspaces = createAsyncThunk("workspace/getWorkspaces", async()=>{
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API}/get-workspaces`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    console.log("slice getWorkspaces", response.data)

    return response.data
})

const workspaceSlice = createSlice({
    name: "workspace",
    initialState: {
        workspaces: [],
        workspace: null,
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(createWorkspace.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(createWorkspace.fulfilled,(state,action)=>{
            state.loading = false;
            state.success = true;
            state.workspaces.push(action.payload);
            state.error = null;
        })
        .addCase(createWorkspace.rejected,(state,action)=>{
            state.loading = false;
            state.success = false;
            state.error = action.error.message;
        })

            
        .addCase(inviteMember.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(inviteMember.fulfilled,(state,action)=>{
            state.loading = false;
            state.success = true;
            state.error = null;
        })
        .addCase(inviteMember.rejected,(state,action)=>{
            state.loading = false;
            state.success = false;
            state.error = action.error.message;
        })



        .addCase(getWorkspaceById.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(getWorkspaceById.fulfilled,(state,action)=>{
            state.loading = false;
            state.success = true;
            // Handle different response structures
            if (action.payload && typeof action.payload === 'object') {
              // Check if workspace data is nested
              if (action.payload.workspace) {
                state.workspace = action.payload.workspace;
              } else if (action.payload.data) {
                state.workspace = action.payload.data;
              } else {
                // Assume the payload itself is the workspace
                state.workspace = action.payload;
              }
            } else {
              state.workspace = null;
            }
            state.error = null;
        })
        .addCase(getWorkspaceById.rejected,(state,action)=>{
            state.loading = false;
            state.success = false;
            state.error = action.error.message;
        })



        .addCase(getWorkspaces.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(getWorkspaces.fulfilled,(state,action)=>{
            state.loading = false;
            state.success = true;
            // Handle different response structures
            if (Array.isArray(action.payload)) {
              state.workspaces = action.payload;
            } else if (action.payload?.workspaces && Array.isArray(action.payload.workspaces)) {
              state.workspaces = action.payload.workspaces;
            } else if (action.payload?.data && Array.isArray(action.payload.data)) {
              state.workspaces = action.payload.data;
            } else {
              state.workspaces = [];
            }
            state.error = null;
        })
        .addCase(getWorkspaces.rejected,(state,action)=>{
            state.loading = false;
            state.success = false;
            state.error = action.error.message;
        })

        .addCase(acceptinvite.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(acceptinvite.fulfilled,(state,action)=>{
            state.loading = false;
            state.success = true;
            state.error = null;
        })
        .addCase(acceptinvite.rejected,(state,action)=>{
            state.loading = false;
            state.success = false;
            state.error = action.error.message;
        })
    }
});

export const { setWorkspaces } = workspaceSlice.actions;
export default workspaceSlice.reducer;