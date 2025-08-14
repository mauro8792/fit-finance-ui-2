import { createSlice } from "@reduxjs/toolkit";

export const coachSlice = createSlice({
  name: "coaches",
  initialState: {
    coaches: [],
    availableUsers: [],
    selectedCoach: null,
    loading: false,
    error: null,
  },
  reducers: {
    onLoadCoaches: (state, { payload }) => {
      console.log("Coach slice payload:", payload);
      if (Array.isArray(payload)) {
        state.coaches = [...payload];
      } else if (payload.data && Array.isArray(payload.data)) {
        state.coaches = [...payload.data];
      } else {
        console.warn("Unexpected coaches data structure:", payload);
        state.coaches = [];
      }
      state.loading = false;
      state.error = null;
    },
    onLoadAvailableUsers: (state, { payload }) => {
      if (Array.isArray(payload)) {
        state.availableUsers = [...payload];
      } else if (payload.data && Array.isArray(payload.data)) {
        state.availableUsers = [...payload.data];
      } else {
        state.availableUsers = [];
      }
      state.error = null;
    },
    onSelectCoach: (state, { payload }) => {
      state.selectedCoach = payload;
      state.loading = false;
      state.error = null;
    },
    onCreateCoach: (state, { payload }) => {
      state.coaches = [payload, ...state.coaches];
      state.loading = false;
      state.error = null;
    },
    onUpdateCoach: (state, { payload }) => {
      state.coaches = state.coaches.map((coach) =>
        coach.id === payload.id ? payload : coach
      );
      if (state.selectedCoach?.id === payload.id) {
        state.selectedCoach = payload;
      }
      state.loading = false;
      state.error = null;
    },
    onDeleteCoach: (state, { payload }) => {
      state.coaches = state.coaches.filter((coach) => coach.id !== payload);
      if (state.selectedCoach?.id === payload) {
        state.selectedCoach = null;
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
    clearSelectedCoach: (state) => {
      state.selectedCoach = null;
    },
  },
});

export const {
  onLoadCoaches,
  onLoadAvailableUsers,
  onSelectCoach,
  onCreateCoach,
  onUpdateCoach,
  onDeleteCoach,
  setLoading,
  setError,
  clearError,
  clearSelectedCoach,
} = coachSlice.actions;
