import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { CHAT_API } from "../config/api";

const API_URL = CHAT_API;

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

export const getDirectChatThunk = createAsyncThunk(
  "chat/getDirectChat",
  async (payload, { rejectWithValue }) => {
    try {
      const userId = typeof payload === 'string' ? payload : payload?.userId;
      const workspaceId = typeof payload === 'string' ? null : payload?.workspaceId;
      const projectId = typeof payload === 'string' ? null : payload?.projectId;

      const params = {};
      if (workspaceId) params.workspaceId = workspaceId;
      if (projectId) params.projectId = projectId;

      const response = await axios.get(`${API_URL}/chat/direct/${userId}`, {
        params,
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

export const createDirectChatThunk = createAsyncThunk(
  "chat/createDirectChat",
  async ({ userId, workspaceId, projectId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/chat/direct`,
        { userId, workspaceId, projectId },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
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
      .addCase(getDirectChatThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDirectChatThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
      })
      .addCase(getDirectChatThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDirectChatThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDirectChatThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
      })
      .addCase(createDirectChatThunk.rejected, (state, action) => {
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
