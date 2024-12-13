import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminInfo, AdminAuthState } from "../Types/AdminTypes";


const initialState: AdminAuthState = {
  adminInfo: localStorage.getItem('adminInfo') 
    ? JSON.parse(localStorage.getItem('adminInfo') as string) 
    : null,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AdminInfo>) => {
      state.adminInfo = action.payload;
      localStorage.setItem('adminInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.adminInfo = null;
      localStorage.removeItem('adminInfo');
    },
  },
});

export const { setCredentials, logout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
