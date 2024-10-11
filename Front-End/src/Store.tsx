import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slices/AuthSlice';
import { apiSlice } from './Slices/ApiSlice';
// import adminAuthSlice from './Slices/adminAuthSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // adminAuth: adminAuthSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production', // Enable dev tools only in non-production environments
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
