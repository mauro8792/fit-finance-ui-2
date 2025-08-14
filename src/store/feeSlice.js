import { createSlice } from "@reduxjs/toolkit";

export const feeSlice = createSlice({
  name: "fee",
  initialState: {
    fees: [],
    errorMessage: undefined,
  },
  reducers: {
    onLoadFee: (state, { payload }) => {
      const arraysFees = payload.data.map((f) => {
        return {
          ...f,
          nameStudent: `${f.student.firstName} ${f.student.lastName}`,
        };
      });
      state.fees = [...arraysFees];
      state.errorMessage = undefined;
    },
    clearErrorMessage: (state) => {
      state.errorMessage = undefined;
    },
  },
});

// Action creators are generated for each case reducer function
export const { onLoadFee, clearErrorMessage } = feeSlice.actions;
