import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './auth';
import { studentSlice } from './studentSlice';
import { sportSlice } from './sportSlice';
import { feeSlice } from './feeSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    student: studentSlice.reducer,
    sport: sportSlice.reducer,
    fee: feeSlice.reducer
  },
});
