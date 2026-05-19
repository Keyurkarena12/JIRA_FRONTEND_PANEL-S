import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_BASE_URL}/api` || "http://localhost:5000/api";

export const getOrCreateChat = createAsyncThunk(
  "chat/getOrCreate",
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/chat/workspace/${workspaceId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getOrCreateProjectChat = createAsyncThunk(
  "chat/getOrCreateProjectChat",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/chat/project/${projectId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getOrCreateDirectChatThunk = createAsyncThunk(
  "chat/getOrCreateDirectChat",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/chat/direct/${userId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getDirectConversationsThunk = createAsyncThunk(
  "chat/getDirectConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/chat/direct/conversations`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/chat/messages/${roomId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    currentRoom: null,
    messages: [],
    directConversations: [],
    loading: false,
    error: null,
    typingUsers: []
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action) => {
      const { userId, userName } = action.payload;
      if (!state.typingUsers.find(u => u.userId === userId)) {
        state.typingUsers.push({ userId, userName });
      }
    },
    removeTyping: (state, action) => {
      const { userId } = action.payload;
      state.typingUsers = state.typingUsers.filter(u => u.userId !== userId);
    },
    clearChat: (state) => {
      state.currentRoom = null;
      state.messages = [];
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrCreateChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrCreateChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
      })
      .addCase(getOrCreateChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrCreateProjectChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrCreateProjectChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
      })
      .addCase(getOrCreateProjectChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrCreateDirectChatThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrCreateDirectChatThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
      })
      .addCase(getOrCreateDirectChatThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDirectConversationsThunk.fulfilled, (state, action) => {
        state.directConversations = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      });
  }
});

export const { addMessage, setTyping, removeTyping, clearChat, setCurrentRoom } = chatSlice.actions;
export default chatSlice.reducer;
