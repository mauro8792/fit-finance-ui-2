import { createSlice } from '@reduxjs/toolkit';

export const paymentSlice = createSlice({
  name: 'fee',
  initialState: {
    payments: [],
    errorMessage: undefined,
  },
  reducers: {
    onLoadPayment: (state, { payload }) => {
      
      state.fees = [...payload.data];
      state.errorMessage = undefined;
    },
  },
});

// Action creators are generated for each case reducer function
export const { onLoadPayment } = paymentSlice.actions;
