import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const emptyChatState = () => ({
  currentRoom: null,
  messages: [],
  typingUsers: [],
});

export const getOrCreateChat = createAsyncThunk(
  'chat/getOrCreate',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.chat.workspace(workspaceId));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getOrCreateProjectChat = createAsyncThunk(
  'chat/getOrCreateProjectChat',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.chat.project(projectId));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getDirectChatThunk = createAsyncThunk(
  'chat/getDirectChat',
  async (payload, { rejectWithValue }) => {
    try {
      const userId = typeof payload === 'string' ? payload : payload?.userId;
      const workspaceId = typeof payload === 'string' ? null : payload?.workspaceId;
      const projectId = typeof payload === 'string' ? null : payload?.projectId;

      const params = {};
      if (workspaceId) params.workspaceId = workspaceId;
      if (projectId) params.projectId = projectId;

      const response = await apiClient.get(ENDPOINTS.chat.directByUser(userId), { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createDirectChatThunk = createAsyncThunk(
  'chat/createDirectChat',
  async ({ userId, workspaceId, projectId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.chat.directCreate, {
        userId,
        workspaceId,
        projectId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getDirectConversationsThunk = createAsyncThunk(
  'chat/getDirectConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.chat.directConversations);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchGroupMessages = createAsyncThunk(
  'chat/fetchGroupMessages',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.chat.messages(roomId));
      return { roomId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchDirectMessages = createAsyncThunk(
  'chat/fetchDirectMessages',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.chat.messages(roomId));
      return { roomId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const isGroupRoom = (room) => room && room.type !== 'private';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    groupChat: emptyChatState(),
    directChat: emptyChatState(),
    directConversations: [],
    loading: false,
    error: null,
  },
  reducers: {
    addGroupMessage: (state, action) => {
      const roomId = state.groupChat.currentRoom?._id;
      if (!roomId) return;
      const msgRoom = action.payload.chatRoomId || action.payload.chatRoom?._id || action.payload.chatRoom;
      if (String(msgRoom) === String(roomId)) {
        state.groupChat.messages.push(action.payload);
      }
    },
    addDirectMessage: (state, action) => {
      const roomId = state.directChat.currentRoom?._id;
      if (!roomId) return;
      const msgRoom = action.payload.chatRoomId || action.payload.chatRoom?._id || action.payload.chatRoom;
      if (String(msgRoom) === String(roomId)) {
        state.directChat.messages.push(action.payload);
      }
    },
    setGroupTyping: (state, action) => {
      const { userId, userName } = action.payload;
      if (!state.groupChat.typingUsers.find((u) => u.userId === userId)) {
        state.groupChat.typingUsers.push({ userId, userName });
      }
    },
    setDirectTyping: (state, action) => {
      const { userId, userName } = action.payload;
      if (!state.directChat.typingUsers.find((u) => u.userId === userId)) {
        state.directChat.typingUsers.push({ userId, userName });
      }
    },
    removeGroupTyping: (state, action) => {
      const { userId } = action.payload;
      state.groupChat.typingUsers = state.groupChat.typingUsers.filter((u) => u.userId !== userId);
    },
    removeDirectTyping: (state, action) => {
      const { userId } = action.payload;
      state.directChat.typingUsers = state.directChat.typingUsers.filter((u) => u.userId !== userId);
    },
    clearGroupChat: (state) => {
      state.groupChat = emptyChatState();
    },
    clearDirectChat: (state) => {
      state.directChat = emptyChatState();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrCreateChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrCreateChat.fulfilled, (state, action) => {
        state.loading = false;
        state.groupChat.currentRoom = action.payload;
        state.groupChat.messages = [];
        state.groupChat.typingUsers = [];
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
        state.groupChat.currentRoom = action.payload;
        state.groupChat.messages = [];
        state.groupChat.typingUsers = [];
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
        state.directChat.currentRoom = action.payload;
        state.directChat.messages = [];
        state.directChat.typingUsers = [];
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
        state.directChat.currentRoom = action.payload;
        state.directChat.messages = [];
        state.directChat.typingUsers = [];
      })
      .addCase(createDirectChatThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDirectConversationsThunk.fulfilled, (state, action) => {
        state.directConversations = action.payload;
      })
      .addCase(fetchGroupMessages.fulfilled, (state, action) => {
        const { roomId, messages } = action.payload;
        if (String(state.groupChat.currentRoom?._id) === String(roomId)) {
          state.groupChat.messages = messages;
        }
      })
      .addCase(fetchDirectMessages.fulfilled, (state, action) => {
        const { roomId, messages } = action.payload;
        if (String(state.directChat.currentRoom?._id) === String(roomId)) {
          state.directChat.messages = messages;
        }
      });
  },
});

export const {
  addGroupMessage,
  addDirectMessage,
  setGroupTyping,
  setDirectTyping,
  removeGroupTyping,
  removeDirectTyping,
  clearGroupChat,
  clearDirectChat,
} = chatSlice.actions;

export { isGroupRoom };
export default chatSlice.reducer;
