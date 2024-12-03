import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserInfo, AuthState } from "../Types/UserTypes";



const initialState: AuthState = {
  userInfo: localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo') as string) 
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;


// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface AuthState {
//   userInfo: {
//     accessToken: string;
//     refreshToken: string;
//   } | null;
// }

// const initialState: AuthState = {
//   userInfo: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setCredentials: (state, action: PayloadAction<AuthState['userInfo']>) => {
//       state.userInfo = action.payload;
//     },
//     logout: (state) => {
//       state.userInfo = null;
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;
