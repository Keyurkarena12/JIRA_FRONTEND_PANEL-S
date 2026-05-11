import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const PROJECT_API = "http://localhost:5000/api/project";
const TASK_API = "http://localhost:5000/api/task";

export const createTask = createAsyncThunk("task/create", async({ title, description, projectId, column, priority, dueDate }) => {
    const token = localStorage.getItem('token');
    console.log("task slice token",token)
    // console.log("task data", { title, description, projectId, column, priority, dueDate });
    const response = await axios.post(`${PROJECT_API}/task/${projectId}`, {
        title,
        description,
        column,
        priority,
        dueDate
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log("slice createTask", response.data);
    return response.data;
});


export const fetchprojectTask = createAsyncThunk("task/fetchproject", async(projectId) => {
    const token = localStorage.getItem('token');
    console.log("Fetching tasks for projectId:", projectId);
    console.log("Token:", token ? "exists" : "missing");
    const response = await axios.get(`${TASK_API}/project/${projectId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log("slice fetchproject response:", response.data);
    return response.data;
});

export const assigneeTaskMember = createAsyncThunk("task/assigneetaskmember", async({ taskId, memberId }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${TASK_API}/assignee/${taskId}`, {
        assigneeId: memberId
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log("slice assigneeTaskMember", response.data);
    return response.data;
}); 


export const moveTask = createAsyncThunk("task/move", async({ taskId, column }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${TASK_API}/move/${taskId}`, {
        column
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log("moveTask response:", response.data);
    return response.data;
});

const taskSlice = createSlice({
    name: "task",
    initialState: {
        tasks: [],
        task: null,
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        clearTasks: (state) => {
            state.tasks = [];
            state.error = null;
        },
        setTask: (state, action) => {
            state.task = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.tasks.push(action.payload.task);
                state.error = null;
            })
            .addCase(createTask.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.error.message;
            })
            .addCase(fetchprojectTask.pending,(state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchprojectTask.fulfilled,(state, action) => {
                console.log("fetchprojectTask fulfilled, payload:", action.payload);
                state.loading = false;
                state.tasks = action.payload.task;
                state.error = null;
                console.log("Updated tasks state:", state.tasks);
            })
            .addCase(fetchprojectTask.rejected,(state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(assigneeTaskMember.pending,(state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assigneeTaskMember.fulfilled,(state, action) => {
                state.loading = false;
                state.success = true;
                state.error = null;
            })
            .addCase(assigneeTaskMember.rejected,(state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(moveTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(moveTask.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Update the task in the tasks array
                const updatedTask = action.payload.task;
                const index = state.tasks.findIndex(task => task._id === updatedTask._id);
                if (index !== -1) {
                    state.tasks[index] = updatedTask;
                }
                state.error = null;
            })
            .addCase(moveTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export const { clearTasks, setTask } = taskSlice.actions;
export default taskSlice.reducer;
