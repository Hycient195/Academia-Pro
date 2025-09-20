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

const loadFromStorage = (): AuthState => {
  // Skip cookie access during SSR
  if (typeof document === 'undefined') {
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      activeRole: null,
    };
  }

  try {
    // Helper function to get cookie value
    const getCookieValue = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };

    // Try to get tokens from cookies (prioritize regular tokens, fallback to super admin)
    const token = getCookieValue('accessToken') || getCookieValue('superAdminAccessToken');
    const refreshToken = getCookieValue('refreshToken') || getCookieValue('superAdminRefreshToken');

    // For user data, we still use localStorage as cookies can't store complex objects easily
    const userStr = localStorage.getItem('authUser');
    const user = userStr ? JSON.parse(userStr) : null;

    return {
      user,
      token,
      refreshToken,
      isAuthenticated: !!token,
      isLoading: false,
      error: null,
      activeRole: user?.roles?.[0] ?? null,
    };
  } catch (error) {
    console.error('Error loading auth state from cookies:', error);
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      activeRole: null,
    };
  }
};

const initialState: AuthState = loadFromStorage();

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
      // Persist to localStorage
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
    },

    setActiveRole: (state, action: PayloadAction<User["roles"][number]>) => {
      state.activeRole = action.payload;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage
        localStorage.setItem('authUser', JSON.stringify(state.user));
      }
    },

    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      // Update localStorage
      localStorage.setItem('authToken', action.payload);
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
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
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
  updateToken,
  setLoading,
  setError,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;