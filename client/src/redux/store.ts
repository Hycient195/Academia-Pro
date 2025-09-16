import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import { baseApi } from './api/userBaseApi';
import { superAdminBaseApi } from './api/super-admin/superAdminBaseApi';

// All API endpoints are now injected into the baseApi

export const store = configureStore({
  reducer: {
    [ baseApi.reducerPath ]: baseApi.reducer,
    [ superAdminBaseApi.reducerPath ]: superAdminBaseApi.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
    .concat(baseApi.middleware)
    .concat(superAdminBaseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store for use in components
export default store;