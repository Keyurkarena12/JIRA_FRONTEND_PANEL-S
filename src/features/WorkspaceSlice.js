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

export const addMember = createAsyncThunk("workspace/addMember", async({workspaceId, email})=>{
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API}/add-member/${workspaceId}`, {email}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    console.log("slice addMember", response.data)
    return response.data
})

const workspaceSlice = createSlice({
    name: "workspace",
    initialState: {
        workspaces: [],
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
        .addCase(addMember.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(addMember.fulfilled,(state,action)=>{
            state.loading = false;
            state.success = true;
            state.error = null;
        })
        .addCase(addMember.rejected,(state,action)=>{
            state.loading = false;
            state.success = false;
            state.error = action.error.message;
        })
    }
});

export const { setWorkspaces } = workspaceSlice.actions;
export default workspaceSlice.reducer;