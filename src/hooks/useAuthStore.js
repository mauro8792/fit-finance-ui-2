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

export const useAuthStore = () => {
  const { status, user, student, userType, errorMessage, token } = useSelector(
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

  return {
    //* Properties
    status,
    user,
    student,
    userType,
    errorMessage,
    token,

    //* Methods
    startLogin,
    startCheckingAuthentication,
    startLogout: startLogoutAuth,
    clearErrorMessage: clearErrorMsg,
    getStudentData,
    getStudentFeesData,
  };
};
