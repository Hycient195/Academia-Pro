import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: any;
}

export interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationItem[];
  loading: {
    global: boolean;
    components: Record<string, boolean>;
  };
  modal: ModalState;
  breadcrumbs: Array<{
    title: string;
    path?: string;
  }>;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: 'light',
  language: 'en',
  notifications: [],
  loading: {
    global: false,
    components: {},
  },
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  breadcrumbs: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },

    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    addNotification: (state, action: PayloadAction<Omit<NotificationItem, 'id' | 'timestamp'>>) => {
      const notification: NotificationItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },

    setComponentLoading: (state, action: PayloadAction<{ component: string; loading: boolean }>) => {
      state.loading.components[action.payload.component] = action.payload.loading;
    },

    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modal.isOpen = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data || null;
    },

    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.type = null;
      state.modal.data = null;
    },

    setBreadcrumbs: (state, action: PayloadAction<Array<{ title: string; path?: string }>>) => {
      state.breadcrumbs = action.payload;
    },

    addBreadcrumb: (state, action: PayloadAction<{ title: string; path?: string }>) => {
      state.breadcrumbs.push(action.payload);
    },

    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  setLanguage,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setComponentLoading,
  openModal,
  closeModal,
  setBreadcrumbs,
  addBreadcrumb,
  clearBreadcrumbs,
} = uiSlice.actions;

export default uiSlice.reducer;