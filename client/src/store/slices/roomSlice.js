import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roomService from '../../services/roomService';

// Async thunks
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

export const createRoom = createAsyncThunk(
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

export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ id, roomData }, { rejectWithValue }) => {
    try {
      const response = await roomService.updateRoom(id, roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update room');
    }
  }
);

export const deleteRoom = createAsyncThunk(
  'rooms/deleteRoom',
  async (id, { rejectWithValue }) => {
    try {
      const response = await roomService.deleteRoom(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete room');
    }
  }
);

// ✅ FIXED: joinRoom - password is optional
export const joinRoom = createAsyncThunk(
  'rooms/joinRoom',
  async ({ id, password }, { rejectWithValue }) => {
    try {
      // Only pass password if it exists
      const response = await roomService.joinRoom(id, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join room');
    }
  }
);

export const leaveRoom = createAsyncThunk(
  'rooms/leaveRoom',
  async (id, { rejectWithValue }) => {
    try {
      const response = await roomService.leaveRoom(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave room');
    }
  }
);

export const updateParticipantRole = createAsyncThunk(
  'rooms/updateParticipantRole',
  async ({ roomId, userId, role }, { rejectWithValue }) => {
    try {
      const response = await roomService.updateParticipantRole(roomId, userId, role);
      return { roomId, userId, role, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update role');
    }
  }
);

export const fetchActiveRooms = createAsyncThunk(
  'rooms/fetchActiveRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomService.getActiveRooms();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active rooms');
    }
  }
);

export const searchRooms = createAsyncThunk(
  'rooms/searchRooms',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      const response = await roomService.searchRooms(query, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search rooms');
    }
  }
);

export const fetchMyRooms = createAsyncThunk(
  'rooms/fetchMyRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomService.getMyRooms();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your rooms');
    }
  }
);

export const toggleRoomStatus = createAsyncThunk(
  'rooms/toggleRoomStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await roomService.toggleRoomStatus(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle room status');
    }
  }
);

// Initial state
const initialState = {
  rooms: [],
  currentRoom: null,
  activeRooms: [],
  myRooms: [],
  searchResults: [],
  isLoading: false,
  error: null,
  successMessage: null, // ✅ Added for better UX
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  filters: {
    language: '',
    topic: '',
    search: ''
  },
  socketEvents: {
    userJoined: null,
    userLeft: null,
    participantUpdated: null
  }
};

// Slice
const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => { // ✅ New reducer
      state.successMessage = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    // Socket event reducers
    userJoined: (state, action) => {
      if (state.currentRoom && state.currentRoom._id === action.payload.roomId) {
        // Add participant if not already in list
        const exists = state.currentRoom.participants?.some(
          p => p.user?._id === action.payload.user._id
        );
        if (!exists) {
          if (!state.currentRoom.participants) {
            state.currentRoom.participants = [];
          }
          state.currentRoom.participants.push({
            user: action.payload.user,
            role: 'listener',
            joinedAt: new Date().toISOString()
          });
        }
        state.socketEvents.userJoined = action.payload;
      }
    },
    userLeft: (state, action) => {
      if (state.currentRoom && state.currentRoom._id === action.payload.roomId) {
        state.currentRoom.participants = state.currentRoom.participants?.filter(
          p => p.user?._id !== action.payload.userId
        ) || [];
        state.socketEvents.userLeft = action.payload;
      }
    },
    participantRoleUpdated: (state, action) => {
      if (state.currentRoom && state.currentRoom._id === action.payload.roomId) {
        const participant = state.currentRoom.participants?.find(
          p => p.user?._id === action.payload.userId
        );
        if (participant) {
          participant.role = action.payload.role;
        }
        state.socketEvents.participantUpdated = action.payload;
      }
    },
    roomUpdated: (state, action) => {
      if (state.currentRoom && state.currentRoom._id === action.payload._id) {
        state.currentRoom = { ...state.currentRoom, ...action.payload };
      }
      // Update in rooms list
      const index = state.rooms.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.rooms[index] = { ...state.rooms[index], ...action.payload };
      }
    },
    clearSocketEvents: (state) => {
      state.socketEvents = initialState.socketEvents;
    },
    resetRoomState: () => initialState // ✅ New: reset everything
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
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
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
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms.unshift(action.payload);
        state.currentRoom = action.payload;
        state.successMessage = 'Room created successfully!';
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Room
      .addCase(updateRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentRoom?._id === action.payload._id) {
          state.currentRoom = action.payload;
        }
        const index = state.rooms.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        state.successMessage = 'Room updated successfully!';
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Room
      .addCase(deleteRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = state.rooms.filter(r => r._id !== action.payload.id);
        if (state.currentRoom?._id === action.payload.id) {
          state.currentRoom = null;
        }
        state.successMessage = 'Room deleted successfully!';
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ✅ FIXED: Join Room - properly handle response
      .addCase(joinRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoom = action.payload;
        state.successMessage = 'Successfully joined room!';
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Leave Room
      .addCase(leaveRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(leaveRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentRoom?._id === action.payload.id) {
          state.currentRoom = null;
        }
        state.successMessage = 'Left room successfully!';
      })
      .addCase(leaveRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Participant Role
      .addCase(updateParticipantRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateParticipantRole.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentRoom && state.currentRoom._id === action.payload.roomId) {
          const participant = state.currentRoom.participants?.find(
            p => p.user?._id === action.payload.userId
          );
          if (participant) {
            participant.role = action.payload.role;
          }
        }
        state.successMessage = `User role updated to ${action.payload.role}`;
      })
      .addCase(updateParticipantRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Active Rooms
      .addCase(fetchActiveRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeRooms = action.payload;
      })
      .addCase(fetchActiveRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Search Rooms
      .addCase(searchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch My Rooms
      .addCase(fetchMyRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRooms = action.payload;
      })
      .addCase(fetchMyRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Toggle Room Status
      .addCase(toggleRoomStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleRoomStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentRoom?._id === action.payload._id) {
          state.currentRoom.isActive = action.payload.isActive;
        }
        const index = state.rooms.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.rooms[index].isActive = action.payload.isActive;
        }
        state.successMessage = `Room ${action.payload.isActive ? 'activated' : 'deactivated'}`;
      })
      .addCase(toggleRoomStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectAllRooms = (state) => state.rooms.rooms;
export const selectCurrentRoom = (state) => state.rooms.currentRoom;
export const selectActiveRooms = (state) => state.rooms.activeRooms;
export const selectMyRooms = (state) => state.rooms.myRooms;
export const selectSearchResults = (state) => state.rooms.searchResults;
export const selectRoomsLoading = (state) => state.rooms.isLoading;
export const selectRoomsError = (state) => state.rooms.error;
export const selectRoomsSuccess = (state) => state.rooms.successMessage;
export const selectRoomsPagination = (state) => state.rooms.pagination;
export const selectRoomFilters = (state) => state.rooms.filters;
export const selectRoomByLanguage = (state, language) => 
  state.rooms.rooms?.filter(room => room.language === language) || [];
export const selectRoomByTopic = (state, topic) => 
  state.rooms.rooms?.filter(room => room.topic === topic) || [];
export const selectRoomsByHost = (state, hostId) => 
  state.rooms.rooms?.filter(room => room.host?._id === hostId) || [];
export const selectParticipantCount = (state, roomId) => {
  const room = state.rooms.rooms?.find(r => r._id === roomId);
  return room?.participants?.length || 0;
};
export const selectIsParticipant = (state, userId) => {
  if (!state.rooms.currentRoom || !state.rooms.currentRoom.participants) return false;
  return state.rooms.currentRoom.participants.some(p => p.user?._id === userId);
};
export const selectUserRole = (state, userId) => {
  if (!state.rooms.currentRoom || !state.rooms.currentRoom.participants) return null;
  const participant = state.rooms.currentRoom.participants.find(p => p.user?._id === userId);
  return participant?.role || null;
};
export const selectIsHost = (state) => {
  if (!state.rooms.currentRoom || !state.auth.user) return false;
  return state.rooms.currentRoom.host?._id === state.auth.user._id;
};
export const selectIsModerator = (state) => {
  if (!state.rooms.currentRoom || !state.auth.user) return false;
  return state.rooms.currentRoom.moderators?.includes(state.auth.user._id) || 
         state.rooms.currentRoom.host?._id === state.auth.user._id;
};

// Actions
export const { 
  clearCurrentRoom, 
  clearError,
  clearSuccessMessage,
  setFilters, 
  resetFilters,
  userJoined,
  userLeft,
  participantRoleUpdated,
  roomUpdated,
  clearSocketEvents,
  resetRoomState
} = roomSlice.actions;

export default roomSlice.reducer;