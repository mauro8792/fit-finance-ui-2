import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './auth';
import { studentSlice } from './studentSlice';
import { sportSlice } from './sportSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    student: studentSlice.reducer,
    sport: sportSlice.reducer
  },
});
