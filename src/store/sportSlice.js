import { createSlice } from "@reduxjs/toolkit";

export const sportSlice = createSlice({
  name: "sports",
  initialState: {
    sports: [],
    errorMessage: undefined,
  },
  reducers: {
    onLoadSport: (state, { payload }) => {
      console.log("Sport slice payload:", payload); // Para debug
      // El backend devuelve { sports: [...] }
      if (payload.data && payload.data.sports) {
        state.sports = [...payload.data.sports];
      } else if (Array.isArray(payload.data)) {
        state.sports = [...payload.data];
      } else {
        console.warn("Unexpected sports data structure:", payload.data);
        state.sports = [];
      }
      state.errorMessage = undefined;
    },
    clearErrorMessage: (state) => {
      state.errorMessage = undefined;
    },
  },
});

// Action creators are generated for each case reducer function
export const { onLoadSport, clearErrorMessage } = sportSlice.actions;
