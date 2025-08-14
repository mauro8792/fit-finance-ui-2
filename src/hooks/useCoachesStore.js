import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import financeApi from "../api/fitFinanceApi";
import {
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
} from "../store/coachSlice";

export const useCoachesStore = () => {
  const { coaches, availableUsers, selectedCoach, loading, error } =
    useSelector((state) => state.coaches);
  const dispatch = useDispatch();

  const fetchCoaches = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data } = await financeApi.get("/coaches");
      dispatch(onLoadCoaches(data));
    } catch (error) {
      console.error("Error fetching coaches:", error);
      dispatch(setError(error.response?.data?.message || error.message));
    }
  }, [dispatch]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const { data } = await financeApi.get("/coaches/available-users");
      dispatch(onLoadAvailableUsers(data));
    } catch (error) {
      console.error("Error fetching available users:", error);
      dispatch(setError(error.response?.data?.message || error.message));
    }
  }, [dispatch]);

  const fetchCoach = useCallback(
    async (id) => {
      try {
        dispatch(setLoading(true));
        const { data } = await financeApi.get(`/coaches/${id}`);
        dispatch(onSelectCoach(data));
        return data;
      } catch (error) {
        console.error("Error fetching coach:", error);
        dispatch(setError(error.response?.data?.message || error.message));
        throw error;
      }
    },
    [dispatch]
  );

  const createCoach = useCallback(
    async (coachData) => {
      try {
        dispatch(setLoading(true));
        const { data } = await financeApi.post("/coaches", coachData);
        dispatch(onCreateCoach(data));
        return data;
      } catch (error) {
        console.error("Error creating coach:", error);
        dispatch(setError(error.response?.data?.message || error.message));
        throw error;
      }
    },
    [dispatch]
  );

  const createCompleteCoach = useCallback(
    async (coachData) => {
      try {
        dispatch(setLoading(true));
        const { data } = await financeApi.post("/coaches/complete", coachData);
        dispatch(onCreateCoach(data));
        return data;
      } catch (error) {
        console.error("Error creating complete coach:", error);
        dispatch(setError(error.response?.data?.message || error.message));
        throw error;
      }
    },
    [dispatch]
  );

  const updateCoach = useCallback(
    async (id, coachData) => {
      try {
        dispatch(setLoading(true));
        const { data } = await financeApi.patch(`/coaches/${id}`, coachData);
        dispatch(onUpdateCoach(data));
        return data;
      } catch (error) {
        console.error("Error updating coach:", error);
        dispatch(setError(error.response?.data?.message || error.message));
        throw error;
      }
    },
    [dispatch]
  );

  const toggleCoachActive = useCallback(
    async (id) => {
      try {
        const { data } = await financeApi.patch(`/coaches/${id}/toggle-active`);
        dispatch(onUpdateCoach(data));
        return data;
      } catch (error) {
        console.error("Error toggling coach status:", error);
        dispatch(setError(error.response?.data?.message || error.message));
        throw error;
      }
    },
    [dispatch]
  );

  const deleteCoach = useCallback(
    async (id) => {
      try {
        await financeApi.delete(`/coaches/${id}`);
        dispatch(onDeleteCoach(id));
      } catch (error) {
        console.error("Error deleting coach:", error);
        dispatch(setError(error.response?.data?.message || error.message));
        throw error;
      }
    },
    [dispatch]
  );

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSelectedCoachData = useCallback(() => {
    dispatch(clearSelectedCoach());
  }, [dispatch]);

  return {
    // Properties
    coaches,
    availableUsers,
    selectedCoach,
    loading,
    error,

    // Methods
    fetchCoaches,
    fetchAvailableUsers,
    fetchCoach,
    createCoach,
    createCompleteCoach,
    updateCoach,
    toggleCoachActive,
    deleteCoach,
    clearError: clearErrorMessage,
    clearSelectedCoach: clearSelectedCoachData,
  };
};
