import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
   id: string;
   email: string;
   firstName: string;
   lastName: string;
   name?: string; // Computed property for convenience
   roles: ('super-admin' | 'delegated-super-admin' | 'school-admin' | 'delegated-school-admin' | 'staff' | 'student' | 'parent')[];
   schoolId?: string;
   schoolName?: string;
   avatar?: string;
   permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  activeRole: User["roles"][number] | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  activeRole: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      state.activeRole = action.payload.user.roles?.[0] ?? null;
    },

    setActiveRole: (state, action: PayloadAction<User["roles"][number]>) => {
      state.activeRole = action.payload;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.activeRole = null;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  setActiveRole,
  updateUser,
  setLoading,
  setError,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;