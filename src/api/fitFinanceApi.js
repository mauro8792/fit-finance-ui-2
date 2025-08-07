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
export const getCoachStudents = async (coachUserId) => {
  try {
    const response = await financeApi.get(`/students/coach/${coachUserId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener alumnos del coach:", error);
    throw error;
  }
};

export default financeApi;
