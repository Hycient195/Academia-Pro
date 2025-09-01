import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import API slices
import { authApi } from '@/store/api/authApi';
import { superAdminApi } from '@/store/api/superAdminApi';
import { schoolAdminApi } from '@/store/api/schoolAdminApi';

// Import reducers
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';


export const store = configureStore({
  reducer: {
    // API reducers
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [schoolAdminApi.reducerPath]: schoolAdminApi.reducer,

    // Feature reducers
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
    .concat(superAdminApi.middleware)
    .concat(authApi.middleware)
    .concat(schoolAdminApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store for use in components
export default store;