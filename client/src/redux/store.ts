import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import apis from './api';

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    // API reducers
    [apis.superAdmin.reducerPath]: apis.superAdmin.reducer,
    [apis.auth.reducerPath]: apis.auth.reducer,
    [apis.schoolAdmin.reducerPath]: apis.schoolAdmin.reducer,
    [apis.schools.reducerPath]: apis.schools.reducer,

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
    .concat(apis.superAdmin.middleware)
    .concat(apis.auth.middleware)
    .concat(apis.schoolAdmin.middleware)
    .concat(apis.schools.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store for use in components
export default store;