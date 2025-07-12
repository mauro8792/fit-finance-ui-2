import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    status: "checking", // 'authenticated','not-authenticated','checking'
    user: {},
    student: null, // Información específica del estudiante si es tipo 'student'
    userType: null, // 'admin' o 'student'
    errorMessage: undefined,
    token: null,
  },
  reducers: {
    onChecking: (state) => {
      state.status = "checking";
      state.user = {};
      state.student = null;
      state.userType = null;
      state.errorMessage = undefined;
    },
    onLogin: (state, { payload }) => {
      state.status = "authenticated";
      state.user = payload.user || payload;
      state.student = payload.student || null;
      state.userType = payload.userType || "admin";
      state.token = payload.token;
      state.errorMessage = undefined;
    },
    onLogout: (state, { payload }) => {
      state.status = "not-authenticated";
      state.user = {};
      state.student = null;
      state.userType = null;
      state.token = null;
      state.errorMessage = payload;
    },
    clearErrorMessage: (state) => {
      state.errorMessage = undefined;
    },
    updateStudentInfo: (state, { payload }) => {
      state.student = payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  onChecking,
  onLogin,
  onLogout,
  clearErrorMessage,
  updateStudentInfo,
} = authSlice.actions;
