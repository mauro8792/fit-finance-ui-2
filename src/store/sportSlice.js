import { createSlice } from '@reduxjs/toolkit';

export const sportSlice = createSlice({
  name: 'sports',
  initialState: {
    sports: [],
    errorMessage: undefined,
  },
  reducers: {
    onLoadSport: (state, { payload }) => {
      state.sports =[ ...payload.data.sports];
      state.errorMessage = undefined;
    },
  },
});

// Action creators are generated for each case reducer function
export const { onLoadSport } = sportSlice.actions;
