import { createSlice } from "@reduxjs/toolkit";

export const studentSlice = createSlice({
  name: "student",
  initialState: {
    students: [],
    availableUsers: [],
    selectedStudent: null,
    loading: false,
    error: null,
    errorMessage: undefined,
  },
  reducers: {
    onLoad: (state, { payload }) => {
      const studentsArray = payload.data.map((s) => {
        return {
          ...s,
          sportName: s.sport.name,
          sportId: s.sport.id,
        };
      });
      state.students = [...studentsArray];
      state.loading = false;
      state.error = null;
      state.errorMessage = undefined;
    },
    onLoadStudents: (state, { payload }) => {
      state.students = payload;
      state.loading = false;
      state.error = null;
    },
    onLoadAvailableUsers: (state, { payload }) => {
      state.availableUsers = payload;
      state.loading = false;
      state.error = null;
    },
    onSelectStudent: (state, { payload }) => {
      state.selectedStudent = payload;
      state.loading = false;
      state.error = null;
    },
    onCreateStudent: (state, { payload }) => {
      state.students = [payload, ...state.students];
      state.loading = false;
      state.error = null;
    },
    onUpdateStudent: (state, { payload }) => {
      state.students = state.students.map((student) =>
        student.id === payload.id ? payload : student
      );
      if (state.selectedStudent?.id === payload.id) {
        state.selectedStudent = payload;
      }
      state.loading = false;
      state.error = null;
    },
    onDeleteStudent: (state, { payload }) => {
      state.students = state.students.filter(
        (student) => student.id !== payload
      );
      if (state.selectedStudent?.id === payload) {
        state.selectedStudent = null;
      }
      state.error = null;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },
    clearErrorMessage: (state) => {
      state.errorMessage = undefined;
    },
  },
});

export const {
  onLoad,
  onLoadStudents,
  onLoadAvailableUsers,
  onSelectStudent,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  setLoading,
  setError,
  clearError,
  clearSelectedStudent,
  clearErrorMessage,
} = studentSlice.actions;
