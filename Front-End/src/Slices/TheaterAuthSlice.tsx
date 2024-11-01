import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TheaterInfo, TheaterState } from "../Types/TheaterTypes";


const initialState: TheaterState = {
  theaterInfo: localStorage.getItem('theaterInfo') 
    ? JSON.parse(localStorage.getItem('theaterInfo') as string) 
    : null,
};

const theaterSlice = createSlice({
  name: 'theater',
  initialState,
  reducers: {
    setTheaterDetails: (state, action: PayloadAction<TheaterInfo>) => {
      state.theaterInfo = action.payload;
      localStorage.setItem('theaterInfo', JSON.stringify(action.payload));
    },
    clearTheater: (state) => {
      state.theaterInfo = null;
      localStorage.removeItem('theaterInfo');
    },
  },
});

export const { setTheaterDetails, clearTheater } = theaterSlice.actions;
export default theaterSlice.reducer;
