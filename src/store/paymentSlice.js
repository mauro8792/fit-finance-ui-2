import { createSlice } from "@reduxjs/toolkit";

export const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    payments: [],
    errorMessage: undefined,
  },
  reducers: {
    onLoadPayment: (state, { payload }) => {
      state.payments = [...payload.data];
      state.errorMessage = undefined;
    },
    clearErrorMessage: (state) => {
      state.errorMessage = undefined;
    },
  },
});

// Action creators are generated for each case reducer function
export const { onLoadPayment, clearErrorMessage } = paymentSlice.actions;
