import { createSlice } from "@reduxjs/toolkit";

export const sportPlanSlice = createSlice({
  name: "sportPlan",
  initialState: {
    sportPlans: [],
    errorMessage: undefined,
  },
  reducers: {
    onLoadSportPlans: (state, { payload }) => {
      state.sportPlans = payload.data;
      state.errorMessage = undefined;
    },
    clearErrorMessage: (state) => {
      state.errorMessage = undefined;
    },
  },
});

export const { onLoadSportPlans, clearErrorMessage } = sportPlanSlice.actions;
