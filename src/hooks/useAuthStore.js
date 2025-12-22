import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startLoginWithEmailPassword,
  startLogout,
  checkingAuthentication,
  startClearErrorMessage,
  getStudentDashboard,
  getStudentFees,
} from "../store/auth/thunks";
import {
  selectProfile as selectProfileAction,
  switchProfile as switchProfileAction,
  clearActiveProfile as clearActiveProfileAction,
} from "../store/auth/authSlice";

export const useAuthStore = () => {
  const { 
    status, 
    user, 
    student, 
    userType, 
    errorMessage, 
    token,
    // Perfil dual
    profiles,
    hasMultipleProfiles,
    activeProfile,
  } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const startLogin = useCallback(
    ({ email, password }) => {
      dispatch(startLoginWithEmailPassword({ email, password }));
    },
    [dispatch]
  );

  const startCheckingAuthentication = useCallback(() => {
    dispatch(checkingAuthentication());
  }, [dispatch]);

  const startLogoutAuth = useCallback(() => {
    dispatch(startLogout());
  }, [dispatch]);

  const clearErrorMsg = useCallback(() => {
    dispatch(startClearErrorMessage());
  }, [dispatch]);

  const getStudentData = useCallback(async () => {
    try {
      return await dispatch(getStudentDashboard());
    } catch (error) {
      console.error("Error obteniendo datos del estudiante:", error);
      throw error;
    }
  }, [dispatch]);

  const getStudentFeesData = useCallback(async () => {
    try {
      return await dispatch(getStudentFees());
    } catch (error) {
      console.error("Error obteniendo cuotas del estudiante:", error);
      throw error;
    }
  }, [dispatch]);

  // Obtener alumnos del coach
  const getCoachStudentsData = useCallback(async (coachUserId, includeInactive = false) => {
    try {
      // Usar el método de la API directamente, ya que no hay thunk
      return await import("../api/fitFinanceApi").then((mod) =>
        mod.getCoachStudents(coachUserId, includeInactive)
      );
    } catch (error) {
      console.error("Error obteniendo alumnos del coach:", error);
      throw error;
    }
  }, []);

  // Obtener datos de un alumno por id
  const getStudentById = useCallback(async (studentId) => {
    try {
      return await import("../api/fitFinanceApi").then((mod) =>
        mod.getStudentById(studentId)
      );
    } catch (error) {
      console.error("Error obteniendo datos del alumno:", error);
      throw error;
    }
  }, []);

  // ========== PERFIL DUAL ==========
  
  // Seleccionar perfil (coach o student)
  const selectProfile = useCallback((profile, remember = false) => {
    dispatch(selectProfileAction({ profile, remember }));
  }, [dispatch]);

  // Cambiar entre perfiles
  const switchUserProfile = useCallback(() => {
    dispatch(switchProfileAction());
  }, [dispatch]);

  // Limpiar preferencia de perfil
  const clearProfilePreference = useCallback(() => {
    dispatch(clearActiveProfileAction());
  }, [dispatch]);

  return {
    //* Properties
    status,
    user,
    student,
    userType,
    errorMessage,
    token,
    // Perfil dual
    profiles,
    hasMultipleProfiles,
    activeProfile,

    //* Methods
    startLogin,
    startCheckingAuthentication,
    startLogout: startLogoutAuth,
    clearErrorMessage: clearErrorMsg,
    getStudentData,
    getStudentFeesData,
    getCoachStudentsData,
    getStudentById,
    // Perfil dual
    selectProfile,
    switchUserProfile,
    clearProfilePreference,
  };
};
