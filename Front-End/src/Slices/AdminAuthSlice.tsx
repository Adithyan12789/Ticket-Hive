import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminInfo, AdminAuthState } from "../Types";


const adminInfoString = localStorage.getItem('adminInfo');
let initialAdminInfo: AdminInfo | null = null;

if (adminInfoString) {
  try {
    const adminInfo = JSON.parse(adminInfoString);
    if (adminInfo.token) {
      initialAdminInfo = adminInfo;
    }
  } catch (error) {
    console.error('Failed to parse adminInfo from localStorage:', error);
  }
}

const initialState: AdminAuthState = {
  adminInfo: initialAdminInfo,
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
