import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const PROJECT_API = "http://localhost:5000/api/project";
const TASK_API = "http://localhost:5000/api/task";

export const createTask = createAsyncThunk("task/create", async({ title, description, projectId, column, priority, dueDate }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${PROJECT_API}/task/${projectId}`, {
        title,
        description,
        column,
        priority,
        dueDate
    }, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
});

export const fetchprojectTask = createAsyncThunk("task/fetchproject", async(projectId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${TASK_API}/project/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
});

export const getTaskById = createAsyncThunk("task/getById", async(taskId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${TASK_API}/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
});

export const updateTask = createAsyncThunk("task/update", async({ taskId, ...fields }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${TASK_API}/${taskId}`, fields, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
});

export const deleteTask = createAsyncThunk("task/delete", async(taskId) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${TASK_API}/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return { taskId };
});

export const assigneeTaskMember = createAsyncThunk("task/assigneetaskmember", async({ taskId, memberId }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${TASK_API}/assignee/${taskId}`, {
        assigneeId: memberId
    }, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
}); 

export const moveTask = createAsyncThunk("task/move", async({ taskId, column }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${TASK_API}/move/${taskId}`, {
        column
    }, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
});

export const addTaskComment = createAsyncThunk("task/addComment", async({ taskId, text }) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${TASK_API}/comments/${taskId}`, {
        text
    }, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
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
        },
        clearSelectedTask: (state) => {
            state.task = null;
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

                state.loading = false;
                state.tasks = action.payload.task;
                state.error = null;
            })
            .addCase(fetchprojectTask.rejected,(state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(getTaskById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTaskById.fulfilled, (state, action) => {
                state.loading = false;
                state.task = action.payload.task;
                state.error = null;
            })
            .addCase(getTaskById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(updateTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const updated = action.payload.task;
                // Update in tasks list
                const idx = state.tasks.findIndex(t => t._id === updated._id);
                if (idx !== -1) state.tasks[idx] = updated;
                // Update selected task
                state.task = updated;
                state.error = null;
            })
            .addCase(updateTask.rejected, (state, action) => {
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
                const updated = action.payload.task;
                const idx = state.tasks.findIndex(t => t._id === updated._id);
                if (idx !== -1) state.tasks[idx] = updated;
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
            })

            .addCase(deleteTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.tasks = state.tasks.filter(t => t._id !== action.payload.taskId);
                state.task = null;
                state.error = null;
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(addTaskComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addTaskComment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const updated = action.payload.task;
                const idx = state.tasks.findIndex(t => t._id === updated._id);
                if (idx !== -1) state.tasks[idx] = updated;
                state.task = updated;
                state.error = null;
            })
            .addCase(addTaskComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export const { clearTasks, setTask, clearSelectedTask } = taskSlice.actions;
export default taskSlice.reducer;
