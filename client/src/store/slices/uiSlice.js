import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  
  // Sidebar
  sidebarOpen: false,
  sidebarWidth: 280,
  
  // Modals
  modal: {
    isOpen: false,
    type: null,
    props: {},
    data: null
  },
  
  // Drawer
  drawer: {
    isOpen: false,
    type: null,
    props: {},
    position: 'right' // 'left', 'right', 'bottom'
  },
  
  // Toast notifications
  toasts: [],
  
  // Loading states
  loading: {
    global: false,
    requests: {}
  },
  
  // Confirm dialog
  confirmDialog: {
    isOpen: false,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
    variant: 'danger' // 'danger', 'warning', 'info'
  },
  
  // Filters and sorting
  filters: {},
  sort: {
    field: 'createdAt',
    order: 'desc' // 'asc' or 'desc'
  },
  
  // View preferences
  viewMode: localStorage.getItem('viewMode') || 'grid', // 'grid' or 'list'
  itemsPerPage: 20,
  
  // Notifications
  notifications: [],
  unreadNotifications: 0,
  
  // Audio settings
  audio: {
    volume: 80,
    muted: false,
    microphoneEnabled: true,
    speakersEnabled: true
  },
  
  // Language
  language: localStorage.getItem('language') || 'en',
  
  // Breakpoints (for responsive design)
  breakpoint: 'lg', // 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
  
  // Scroll positions (for preserving scroll)
  scrollPositions: {},
  
  // Context menus
  contextMenu: {
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
    data: null
  },
  
  // Tooltips
  tooltip: {
    isVisible: false,
    content: '',
    x: 0,
    y: 0,
    target: null
  },
  
  // Announcements (for screen readers)
  announcement: '',
  
  // Keyboard shortcuts
  keyboardShortcuts: {
    enabled: true,
    modal: null
  },
  
  // Recent actions (for undo/redo)
  recentActions: [],
  maxRecentActions: 20
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setSidebarWidth: (state, action) => {
      state.sidebarWidth = action.payload;
    },

    // Modal
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        props: action.payload.props || {},
        data: action.payload.data || null
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        props: {},
        data: null
      };
    },
    updateModalProps: (state, action) => {
      state.modal.props = { ...state.modal.props, ...action.payload };
    },

    // Drawer
    openDrawer: (state, action) => {
      state.drawer = {
        isOpen: true,
        type: action.payload.type,
        props: action.payload.props || {},
        position: action.payload.position || 'right'
      };
    },
    closeDrawer: (state) => {
      state.drawer = {
        ...state.drawer,
        isOpen: false
      };
    },

    // Toast notifications
    addToast: (state, action) => {
      const toast = {
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        description: action.payload.description,
        duration: action.payload.duration || 5000,
        position: action.payload.position || 'top-right'
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },

    // Loading states
    startLoading: (state, action) => {
      const key = action.payload || 'global';
      if (key === 'global') {
        state.loading.global = true;
      } else {
        state.loading.requests[key] = true;
      }
    },
    stopLoading: (state, action) => {
      const key = action.payload || 'global';
      if (key === 'global') {
        state.loading.global = false;
      } else {
        delete state.loading.requests[key];
      }
    },
    clearLoading: (state) => {
      state.loading = {
        global: false,
        requests: {}
      };
    },

    // Confirm dialog
    openConfirmDialog: (state, action) => {
      state.confirmDialog = {
        isOpen: true,
        title: action.payload.title || 'Confirm Action',
        message: action.payload.message || 'Are you sure you want to proceed?',
        confirmText: action.payload.confirmText || 'Confirm',
        cancelText: action.payload.cancelText || 'Cancel',
        onConfirm: action.payload.onConfirm,
        onCancel: action.payload.onCancel,
        variant: action.payload.variant || 'danger'
      };
    },
    closeConfirmDialog: (state) => {
      state.confirmDialog.isOpen = false;
    },

    // Filters and sorting
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    removeFilter: (state, action) => {
      delete state.filters[action.payload];
    },
    setSort: (state, action) => {
      state.sort = { ...state.sort, ...action.payload };
    },
    toggleSortOrder: (state) => {
      state.sort.order = state.sort.order === 'asc' ? 'desc' : 'asc';
    },

    // View preferences
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
      localStorage.setItem('viewMode', action.payload);
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
    },

    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        read: false,
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.notifications.unshift(notification);
      state.unreadNotifications += 1;
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadNotifications -= 1;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadNotifications = 0;
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadNotifications -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = 0;
    },

    // Audio settings
    setVolume: (state, action) => {
      state.audio.volume = Math.max(0, Math.min(100, action.payload));
    },
    toggleMute: (state) => {
      state.audio.muted = !state.audio.muted;
    },
    setMicrophoneEnabled: (state, action) => {
      state.audio.microphoneEnabled = action.payload;
    },
    setSpeakersEnabled: (state, action) => {
      state.audio.speakersEnabled = action.payload;
    },

    // Language
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },

    // Breakpoint
    setBreakpoint: (state, action) => {
      state.breakpoint = action.payload;
    },

    // Scroll positions
    saveScrollPosition: (state, action) => {
      const { key, position } = action.payload;
      state.scrollPositions[key] = position;
    },
    getScrollPosition: (state, action) => {
      return state.scrollPositions[action.payload] || 0;
    },
    clearScrollPosition: (state, action) => {
      delete state.scrollPositions[action.payload];
    },

    // Context menu
    openContextMenu: (state, action) => {
      state.contextMenu = {
        isOpen: true,
        x: action.payload.x,
        y: action.payload.y,
        items: action.payload.items,
        data: action.payload.data || null
      };
    },
    closeContextMenu: (state) => {
      state.contextMenu.isOpen = false;
    },

    // Tooltip
    showTooltip: (state, action) => {
      state.tooltip = {
        isVisible: true,
        content: action.payload.content,
        x: action.payload.x,
        y: action.payload.y,
        target: action.payload.target || null
      };
    },
    hideTooltip: (state) => {
      state.tooltip.isVisible = false;
    },

    // Announcement (for screen readers)
    announce: (state, action) => {
      state.announcement = action.payload;
    },
    clearAnnouncement: (state) => {
      state.announcement = '';
    },

    // Keyboard shortcuts
    setKeyboardShortcutsEnabled: (state, action) => {
      state.keyboardShortcuts.enabled = action.payload;
    },
    openKeyboardShortcutsModal: (state) => {
      state.keyboardShortcuts.modal = 'shortcuts';
    },
    closeKeyboardShortcutsModal: (state) => {
      state.keyboardShortcuts.modal = null;
    },

    // Recent actions
    addRecentAction: (state, action) => {
      state.recentActions.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload
      });
      
      // Limit the number of recent actions
      if (state.recentActions.length > state.maxRecentActions) {
        state.recentActions.pop();
      }
    },
    removeRecentAction: (state, action) => {
      state.recentActions = state.recentActions.filter(a => a.id !== action.payload);
    },
    clearRecentActions: (state) => {
      state.recentActions = [];
    },

    // Reset UI state
    resetUI: () => initialState,
    
    // Partial update
    updateUI: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

// Selectors
export const selectTheme = (state) => state.ui.theme;
export const selectIsDarkMode = (state) => state.ui.theme === 'dark';
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarWidth = (state) => state.ui.sidebarWidth;
export const selectModal = (state) => state.ui.modal;
export const selectIsModalOpen = (state) => state.ui.modal.isOpen;
export const selectModalType = (state) => state.ui.modal.type;
export const selectDrawer = (state) => state.ui.drawer;
export const selectIsDrawerOpen = (state) => state.ui.drawer.isOpen;
export const selectToasts = (state) => state.ui.toasts;
export const selectLoading = (state) => state.ui.loading;
export const selectIsGlobalLoading = (state) => state.ui.loading.global;
export const selectIsRequestLoading = (state, key) => state.ui.loading.requests[key] || false;
export const selectConfirmDialog = (state) => state.ui.confirmDialog;
export const selectIsConfirmDialogOpen = (state) => state.ui.confirmDialog.isOpen;
export const selectFilters = (state) => state.ui.filters;
export const selectSort = (state) => state.ui.sort;
export const selectViewMode = (state) => state.ui.viewMode;
export const selectItemsPerPage = (state) => state.ui.itemsPerPage;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) => state.ui.unreadNotifications;
export const selectAudioSettings = (state) => state.ui.audio;
export const selectVolume = (state) => state.ui.audio.volume;
export const selectIsMuted = (state) => state.ui.audio.muted;
export const selectMicrophoneEnabled = (state) => state.ui.audio.microphoneEnabled;
export const selectSpeakersEnabled = (state) => state.ui.audio.speakersEnabled;
export const selectLanguage = (state) => state.ui.language;
export const selectBreakpoint = (state) => state.ui.breakpoint;
export const selectScrollPosition = (state, key) => state.ui.scrollPositions[key] || 0;
export const selectContextMenu = (state) => state.ui.contextMenu;
export const selectTooltip = (state) => state.ui.tooltip;
export const selectAnnouncement = (state) => state.ui.announcement;
export const selectKeyboardShortcuts = (state) => state.ui.keyboardShortcuts;
export const selectRecentActions = (state) => state.ui.recentActions;

// Helper selectors
export const selectIsMobile = (state) => {
  const breakpoints = {
    xs: 640,
    sm: 768,
    md: 1024,
    lg: 1280,
    xl: 1536
  };
  const currentWidth = breakpoints[state.ui.breakpoint] || 1024;
  return currentWidth < 768;
};

export const selectIsTablet = (state) => {
  const breakpoints = {
    xs: 640,
    sm: 768,
    md: 1024,
    lg: 1280,
    xl: 1536
  };
  const currentWidth = breakpoints[state.ui.breakpoint] || 1024;
  return currentWidth >= 768 && currentWidth < 1024;
};

export const selectIsDesktop = (state) => {
  const breakpoints = {
    xs: 640,
    sm: 768,
    md: 1024,
    lg: 1280,
    xl: 1536
  };
  const currentWidth = breakpoints[state.ui.breakpoint] || 1024;
  return currentWidth >= 1024;
};

// Actions
export const {
  // Theme
  toggleTheme,
  setTheme,
  
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  setSidebarWidth,
  
  // Modal
  openModal,
  closeModal,
  updateModalProps,
  
  // Drawer
  openDrawer,
  closeDrawer,
  
  // Toast
  addToast,
  removeToast,
  clearToasts,
  
  // Loading
  startLoading,
  stopLoading,
  clearLoading,
  
  // Confirm dialog
  openConfirmDialog,
  closeConfirmDialog,
  
  // Filters and sorting
  setFilters,
  clearFilters,
  removeFilter,
  setSort,
  toggleSortOrder,
  
  // View preferences
  setViewMode,
  setItemsPerPage,
  
  // Notifications
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  
  // Audio
  setVolume,
  toggleMute,
  setMicrophoneEnabled,
  setSpeakersEnabled,
  
  // Language
  setLanguage,
  
  // Breakpoint
  setBreakpoint,
  
  // Scroll positions
  saveScrollPosition,
  clearScrollPosition,
  
  // Context menu
  openContextMenu,
  closeContextMenu,
  
  // Tooltip
  showTooltip,
  hideTooltip,
  
  // Announcement
  announce,
  clearAnnouncement,
  
  // Keyboard shortcuts
  setKeyboardShortcutsEnabled,
  openKeyboardShortcutsModal,
  closeKeyboardShortcutsModal,
  
  // Recent actions
  addRecentAction,
  removeRecentAction,
  clearRecentActions,
  
  // Reset
  resetUI,
  updateUI
} = uiSlice.actions;

export default uiSlice.reducer;