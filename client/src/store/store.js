import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import roomReducer from './slices/roomSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'ui/openConfirmDialog',
          'ui/updateUI',
          'rooms/fetchRoom/fulfilled',
          'rooms/joinRoom/fulfilled'
        ],
        // Ignore these field paths in the state
        ignoredPaths: [
          'ui.confirmDialog.onConfirm',
          'ui.confirmDialog.onCancel',
          'ui.recentActions',
          'rooms.currentRoom.participants'
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Helper to dispatch actions from outside React components
export const dispatchOutsideReact = (action) => store.dispatch(action);

// Helper to get current state
export const getState = () => store.getState();