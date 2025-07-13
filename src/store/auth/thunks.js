import { clearErrorMessage, onChecking, onLogin, onLogout } from "./authSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

console.log("🌐 API_URL configurada en thunks:", API_URL);

// Login para administradores y estudiantes
export const startLoginWithEmailPassword = ({ email, password }) => {
  return async (dispatch) => {
    dispatch(onChecking());

    console.log("🚀 Iniciando login en thunks...");
    console.log("📧 Email:", email);
    console.log("🌐 URL de login:", `${API_URL}/auth/login`);

    try {
      console.log("📤 Haciendo fetch a:", `${API_URL}/auth/login`);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📥 Respuesta recibida:", response.status, response.ok);

      const data = await response.json();
      console.log("📄 Datos de respuesta:", data);

      if (!response.ok) {
        console.log("❌ Error en respuesta:", data.message);
        return dispatch(onLogout(data.message || "Error en la autenticación"));
      }

      // Guardar token en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", data.userType);

      // Si es estudiante, obtener datos completos del estudiante
      if (data.userType === "student") {
        localStorage.setItem("studentId", data.student.id);
        dispatch(
          onLogin({
            user: data.user,
            student: data.student,
            userType: "student",
            token: data.token,
          })
        );
      } else {
        dispatch(
          onLogin({
            user: data.user,
            userType: "admin",
            token: data.token,
          })
        );
      }
    } catch (error) {
      console.error("Error en login:", error);
      dispatch(onLogout("Error de conexión"));
    }
  };
};

// Verificar autenticación al cargar la app
export const checkingAuthentication = () => {
  return async (dispatch) => {
    dispatch(onChecking());

    try {
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");

      if (!token) {
        return dispatch(onLogout());
      }

      // Verificar si el token es válido
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("studentId");
        return dispatch(onLogout());
      }

      const data = await response.json();

      if (userType === "student") {
        const studentId = localStorage.getItem("studentId");
        dispatch(
          onLogin({
            user: data.user,
            student: { id: studentId, ...data.student },
            userType: "student",
            token,
          })
        );
      } else {
        dispatch(
          onLogin({
            user: data.user,
            userType: "admin",
            token,
          })
        );
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      localStorage.removeItem("studentId");
      dispatch(onLogout());
    }
  };
};

// Logout
export const startLogout = () => {
  return async (dispatch) => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("studentId");
    dispatch(onLogout());
  };
};

// Obtener datos del estudiante
export const getStudentDashboard = () => {
  return async (dispatch, getState) => {
    try {
      const { token } = getState().auth;

      const response = await fetch(`${API_URL}/auth/student-dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error obteniendo datos del estudiante");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error obteniendo dashboard del estudiante:", error);
      throw error;
    }
  };
};

// Obtener cuotas del estudiante
export const getStudentFees = () => {
  return async (dispatch, getState) => {
    try {
      const { token } = getState().auth;

      const response = await fetch(`${API_URL}/fee/my-fees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error obteniendo cuotas del estudiante");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error obteniendo cuotas del estudiante:", error);
      throw error;
    }
  };
};

export const startClearErrorMessage = () => {
  return async (dispatch) => {
    dispatch(clearErrorMessage());
  };
};
