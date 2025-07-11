import axios from "axios";
import { getEnvVariables } from "../helpers";

const { VITE_API_URL } = getEnvVariables();

const financeApi = axios.create({
  baseURL: VITE_API_URL,
});

// Todo: configurar interceptores
financeApi.interceptors.request.use((config) => {
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

export default financeApi;
