import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roomService from '../../services/roomService';

export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (params, { rejectWithValue }) => {
    try {
      const response = await roomService.getRooms(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rooms');
    }
  }
);

export const fetchRoom = createAsyncThunk(
  'rooms/fetchRoom',
  async (id, { rejectWithValue }) => {
    try {
      const response = await roomService.getRoom(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch room');
    }
  }
);

export const createNewRoom = createAsyncThunk(
  'rooms/createRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await roomService.createRoom(roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create room');
    }
  }
);

export const joinExistingRoom = createAsyncThunk(
  'rooms/joinRoom',
  async ({ id, password }, { rejectWithValue }) => {
    try {
      const response = await roomService.joinRoom(id, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join room');
    }
  }
);

export const leaveCurrentRoom = createAsyncThunk(
  'rooms/leaveRoom',
  async (id, { rejectWithValue }) => {
    try {
      const response = await roomService.leaveRoom(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave room');
    }
  }
);

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    rooms: [],
    currentRoom: null,
    activeRooms: [],
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  },
  reducers: {
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    updateRoomParticipants: (state, action) => {
      if (state.currentRoom && state.currentRoom._id === action.payload.roomId) {
        state.currentRoom.participants = action.payload.participants;
      }
    },
    addParticipant: (state, action) => {
      if (state.currentRoom) {
        state.currentRoom.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action) => {
      if (state.currentRoom) {
        state.currentRoom.participants = state.currentRoom.participants.filter(
          p => p.user._id !== action.payload
        );
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rooms
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload;
        state.pagination = action.meta.arg?.pagination || state.pagination;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Room
      .addCase(fetchRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoom = action.payload;
      })
      .addCase(fetchRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Room
      .addCase(createNewRoom.fulfilled, (state, action) => {
        state.rooms.unshift(action.payload);
        state.currentRoom = action.payload;
      })
      
      // Join Room
      .addCase(joinExistingRoom.fulfilled, (state, action) => {
        state.currentRoom = action.payload;
      })
      
      // Leave Room
      .addCase(leaveCurrentRoom.fulfilled, (state) => {
        state.currentRoom = null;
      });
  }
});

export const {
  clearCurrentRoom,
  updateRoomParticipants,
  addParticipant,
  removeParticipant,
  clearError
} = roomSlice.actions;

export default roomSlice.reducer;