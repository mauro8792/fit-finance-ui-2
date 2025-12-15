import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { financeApi } from "../api";
import {
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
  clearErrorMessage as clearErrorMessageAction,
} from "../store/studentSlice";

export const useStudentsStore = () => {
  const {
    students,
    availableUsers,
    selectedStudent,
    loading,
    error,
    errorMessage,
  } = useSelector((state) => state.student);
  const dispatch = useDispatch();

  const findAll = useCallback(async () => {
    try {
      console.log("🔍 Fetching students..."); // Debug log
      const { data } = await financeApi.get("/students");

      dispatch(onLoad({ data }));
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessageAction());
      }, 10);
    }
  }, [dispatch]);

  const fetchStudents = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data } = await financeApi.get("/students");
      dispatch(onLoadStudents(data));
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Error al cargar estudiantes")
      );
    }
  }, [dispatch]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data } = await financeApi.get("/students/available/users");
      dispatch(onLoadAvailableUsers(data));
    } catch (error) {
      dispatch(
        setError(
          error.response?.data?.message ||
            "Error al cargar usuarios disponibles"
        )
      );
    }
  }, [dispatch]);

  const fetchStudent = useCallback(
    async (studentId) => {
      try {
        dispatch(setLoading(true));
        const { data } = await financeApi.get(`/students/${studentId}`);
        dispatch(onSelectStudent(data));
      } catch (error) {
        dispatch(
          setError(
            error.response?.data?.message || "Error al cargar estudiante"
          )
        );
      }
    },
    [dispatch]
  );

  const getStudentById = useCallback(
    async (studentId) => {
      const { data } = await financeApi.get(`/students/${studentId}`);
      return data;
    },
    []
  );

  const createStudent = useCallback(
    async (studentData) => {
      try {
        dispatch(setLoading(true));
        const { data } = await financeApi.post("/students", studentData);
        dispatch(onCreateStudent(data.student));
        return data.student;
      } catch (error) {
        dispatch(
          setError(error.response?.data?.message || "Error al crear estudiante")
        );
        throw error;
      }
    },
    [dispatch]
  );

  const createCompleteStudent = useCallback(
    async (studentData) => {
      try {
        dispatch(setLoading(true));
        const { data } = await financeApi.post(
          "/students/complete",
          studentData
        );
        dispatch(onCreateStudent(data.student));
        return data.student;
      } catch (error) {
        dispatch(
          setError(
            error.response?.data?.message ||
              "Error al crear estudiante completo"
          )
        );
        throw error;
      }
    },
    [dispatch]
  );

  const updateStudent = useCallback(
    async (studentId, studentData) => {
      try {
        dispatch(setLoading(true));
        const { data } = await financeApi.patch(
          `/students/${studentId}`,
          studentData
        );
        dispatch(onUpdateStudent(data.student));
        return data.student;
      } catch (error) {
        dispatch(
          setError(
            error.response?.data?.message || "Error al actualizar estudiante"
          )
        );
        throw error;
      }
    },
    [dispatch]
  );

  const deleteStudent = useCallback(
    async (studentId) => {
      try {
        dispatch(setLoading(true));
        await financeApi.delete(`/students/${studentId}`);
        dispatch(onDeleteStudent(studentId));
      } catch (error) {
        dispatch(
          setError(
            error.response?.data?.message || "Error al eliminar estudiante"
          )
        );
        throw error;
      }
    },
    [dispatch]
  );

  const toggleStudentActive = useCallback(
    async (studentId) => {
      try {
        dispatch(setLoading(true));
        const { data } = await financeApi.patch(
          `/students/${studentId}/toggle-active`
        );
        dispatch(onUpdateStudent(data));
      } catch (error) {
        dispatch(
          setError(
            error.response?.data?.message ||
              "Error al cambiar estado del estudiante"
          )
        );
        throw error;
      }
    },
    [dispatch]
  );

  const update = useCallback(
    async (payload) => {
      const { id, ...student } = payload;
      delete student.sportName;
      try {
        await financeApi.patch(`/students/${id}`, student);
      } catch (error) {
        setTimeout(() => {
          dispatch(clearErrorMessageAction());
        }, 10);
      }
    },
    [dispatch]
  );

  const create = useCallback(
    async (payload) => {
      try {
        await financeApi.post("/students", payload);
      } catch (error) {
        setTimeout(() => {
          dispatch(clearErrorMessageAction());
        }, 10);
      }
    },
    [dispatch]
  );

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSelectedStudentData = useCallback(() => {
    dispatch(clearSelectedStudent());
  }, [dispatch]);

  /**
   * Cambiar el plan de un alumno (para coaches)
   * También actualiza automáticamente las cuotas pendientes
   */
  const changeStudentPlan = useCallback(
    async (studentId, sportPlanId) => {
      try {
        const { data } = await financeApi.put(`/students/${studentId}/change-plan`, {
          sportPlanId,
        });
        return data;
      } catch (error) {
        console.error('Error al cambiar plan:', error);
        throw error;
      }
    },
    []
  );

  return {
    //* Propiedades
    students,
    availableUsers,
    selectedStudent,
    loading,
    error,
    errorMessage,

    //* Métodos
    findAll,
    fetchStudents,
    fetchAvailableUsers,
    fetchStudent,
    getStudentById,
    createStudent,
    createCompleteStudent,
    updateStudent,
    deleteStudent,
    toggleStudentActive,
    update,
    create,
    clearError: clearErrorMessage,
    clearSelectedStudent: clearSelectedStudentData,
    changeStudentPlan,
  };
};
