import { createSlice } from '@reduxjs/toolkit';

export const studentSlice = createSlice({
  name: 'student',
  initialState: {
    students: [],
    errorMessage: undefined,
  },
  reducers: {
    onLoad: (state, { payload }) => {
      const studentsArray = payload.data.map((s) => {
        return {
          ...s,
          sportName: s.sport.name,
          sportId: s.sport.id
        };
      });
      state.students = [...studentsArray];
      state.errorMessage = undefined;
    },
  },
});

// Action creators are generated for each case reducer function
export const { onLoad } = studentSlice.actions;
