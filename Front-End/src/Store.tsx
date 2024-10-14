import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slices/AuthSlice';
import { apiSlice } from './Slices/ApiSlice';
import AdminAuthSlice from "./Slices/AdminAuthSlice";
import TheaterAuthSlice from "./Slices/TheaterAuthSlice";


const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAuth: AdminAuthSlice,
    theaterAuth: TheaterAuthSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
