// Obtener microciclos de un mesociclo
export const getMicrocyclesByMesocycle = async (mesocycleId) => {
  try {
    const response = await financeApi.get(
      `/microcycle/mesocycle/${mesocycleId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener microciclos:", error);
    throw error;
  }
};
// Obtener datos de un alumno por id
export const getStudentById = async (studentId) => {
  try {
    const response = await financeApi.get(`/students/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener datos del alumno:", error);
    throw error;
  }
};

// 🚀 NUEVA API: Crear rutina completa desde wizard
export const createCompleteRoutine = async (wizardData) => {
  try {
    console.log("📤 Enviando datos del wizard al backend:", wizardData);
    const response = await financeApi.post(
      "/routine/create-complete",
      wizardData
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear rutina completa:", error);
    throw error;
  }
};

// 🏁 Finalizar macrociclo (establecer fecha de fin como hoy)
export const finalizeMacrocycle = async (macrocycleId) => {
  try {
    const response = await financeApi.post(`/routine/macrocycle/${macrocycleId}/finalize`);
    return response.data;
  } catch (error) {
    console.error("Error al finalizar macrociclo:", error);
    throw error;
  }
};

// 🏁 Finalizar mesociclo (establecer fecha de fin como hoy)
export const finalizeMesocycle = async (mesocycleId) => {
  try {
    const response = await financeApi.post(`/routine/mesocycle/${mesocycleId}/finalize`);
    return response.data;
  } catch (error) {
    console.error("Error al finalizar mesociclo:", error);
    throw error;
  }
};

import axios from "axios";
import { getEnvVariables } from "../helpers";

const { VITE_API_URL } = getEnvVariables();

console.log("🌐 API URL en fitFinanceApi:", VITE_API_URL);

const financeApi = axios.create({
  baseURL: VITE_API_URL,
});

// Todo: configurar interceptores
financeApi.interceptors.request.use((config) => {
  console.log("📤 Request interceptor - URL:", config.baseURL + config.url);

  const token = localStorage.getItem("token");

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

// Interceptor de respuesta para manejar errores
financeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo log de errores importantes
    if (error.response?.status >= 400) {
      console.error("API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
      });
    }
    return Promise.reject(error);
  }
);

// Obtener alumnos por coach userId
export const getCoachStudents = async (coachUserId, includeInactive = false) => {
  try {
    const url = includeInactive 
      ? `/students/coach/${coachUserId}?includeInactive=true`
      : `/students/coach/${coachUserId}`;
    const response = await financeApi.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener alumnos del coach:", error);
    throw error;
  }
};

/**
 * 📦 Obtener macrociclos de un estudiante
 * @param {number} studentId - ID del estudiante
 */
export const getMacrocyclesByStudent = async (studentId) => {
  try {
    const response = await financeApi.get(`/macrocycle/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener macrociclos del estudiante:", error);
    throw error;
  }
};

/**
 * 📋 Obtener historial de entrenamientos de un estudiante (por sesión)
 * @param {number} studentId - ID del estudiante
 * @param {number} limit - Límite de sesiones a traer (default 20)
 */
export const getTrainingHistory = async (studentId, limit = 20) => {
  try {
    const response = await financeApi.get(`/macrocycle/history/${studentId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener historial de entrenamientos:", error);
    throw error;
  }
};

/**
 * 📊 Obtener historial por EJERCICIO de un estudiante (progresión)
 * @param {number} studentId - ID del estudiante
 * @param {number} limit - Límite de sesiones por ejercicio (default 10)
 */
export const getExerciseHistory = async (studentId, limit = 10) => {
  try {
    const response = await financeApi.get(`/macrocycle/exercises/${studentId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener historial de ejercicios:", error);
    throw error;
  }
};

/**
 * ⚖️ Obtener historial de peso de un estudiante
 * @param {number} studentId - ID del estudiante
 * @param {number} limit - Límite de registros (default 30)
 */
export const getWeightHistory = async (studentId, limit = 30) => {
  try {
    const response = await financeApi.get(`/health/weight/${studentId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener historial de peso:", error);
    throw error;
  }
};

/**
 * 💬 Obtener notas de sets de un estudiante (para vista del coach)
 * @param {number} studentId - ID del estudiante
 * @param {number} limit - Límite de notas (default 10)
 */
export const getStudentSetNotes = async (studentId, limit = 10) => {
  try {
    const response = await financeApi.get(`/set/student/${studentId}/notes?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener notas del estudiante:", error);
    throw error;
  }
};

export default financeApi;
