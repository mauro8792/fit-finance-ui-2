import { useDispatch, useSelector } from "react-redux";
import { financeApi } from "../api";
import { clearErrorMessage, onLoadFee } from "../store/feeSlice";

const url = "/fee";

export const useFeesStore = () => {
  const { fees, errorMessage } = useSelector((state) => state.fee);
  const dispatch = useDispatch();

  const findAllFees = async ({ month, year }) => {
    try {
      let urlPayload = url;
      if (month) {
        urlPayload += `?month=${month}`;
        if (year) {
          urlPayload += `&year=${year}`;
        }
      } else if (year) {
        urlPayload += `?year=${year}`;
      }

      const { data } = await financeApi.get(urlPayload);

      // El backend devuelve { fees: [...], statistics: {...}, period: {...} }
      // Extraemos solo el array de fees para el slice
      const feesData = data.fees || data; // Fallback por si data es directamente el array

      dispatch(onLoadFee({ data: feesData }));
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const create = async (sport) => {
    try {
      await financeApi.post(url, {
        ...sport,
        monthlyFee: parseInt(sport.monthlyFee),
      });
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const update = async (payload) => {
    const { id, ...sport } = payload;
    try {
      await financeApi.patch(`${url}/${id}`, {
        ...sport,
        monthlyFee: parseInt(sport.monthlyFee),
      });
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const getUnpaidFeesByStudent = async (studentId) => {
    try {
      const { data } = await financeApi.get(
        `${url}/student/${studentId}/unpaid`
      );
      return data;
    } catch (error) {
      console.error("Error al obtener cuotas pendientes:", error);
      throw error;
    }
  };

  const validateSequentialPayment = async (studentId, feeId) => {
    try {
      const { data } = await financeApi.get(
        `${url}/student/${studentId}/validate-payment/${feeId}`
      );
      return data;
    } catch (error) {
      console.error("Error al validar pago secuencial:", error);
      throw error;
    }
  };

  const checkStudentUnpaidFees = async (studentId) => {
    try {
      const { data } = await financeApi.get(
        `${url}/student/${studentId}/unpaid`
      );
      return data.unpaidFeesCount > 0 ? data : null;
    } catch (error) {
      console.error("Error al verificar cuotas pendientes:", error);
      return null;
    }
  };

  // ========== MÉTODOS PARA COACHES ==========

  /**
   * Obtener cuotas de los alumnos del coach
   */
  const getMyStudentsFees = async ({ month, year } = {}) => {
    try {
      let urlPayload = `${url}/coach/my-students-fees`;
      const params = [];
      if (month) params.push(`month=${month}`);
      if (year) params.push(`year=${year}`);
      if (params.length > 0) {
        urlPayload += `?${params.join('&')}`;
      }

      const { data } = await financeApi.get(urlPayload);
      return data;
    } catch (error) {
      console.error("Error al obtener cuotas de mis alumnos:", error);
      throw error;
    }
  };

  /**
   * Marcar cuota como pagada (para coaches)
   */
  const markFeeAsPaid = async (feeId, paymentReference = '') => {
    try {
      const { data } = await financeApi.post(
        `${url}/${feeId}/mark-paid-by-coach`,
        { paymentReference }
      );
      return data;
    } catch (error) {
      console.error("Error al marcar cuota como pagada:", error);
      throw error;
    }
  };

  /**
   * Actualizar configuración de pago del coach
   */
  const updatePaymentConfig = async ({ paymentAlias, paymentNotes, defaultFeeAmount }) => {
    try {
      const { data } = await financeApi.put(`${url}/coach/payment-config`, {
        paymentAlias,
        paymentNotes,
        defaultFeeAmount,
      });
      return data;
    } catch (error) {
      console.error("Error al actualizar configuración de pago:", error);
      throw error;
    }
  };

  /**
   * Obtener info de pago del coach (para alumnos)
   */
  const getMyCoachPaymentInfo = async () => {
    try {
      const { data } = await financeApi.get(`${url}/my-coach-payment-info`);
      return data;
    } catch (error) {
      console.error("Error al obtener info de pago del coach:", error);
      throw error;
    }
  };

  // ========== HISTORIAL DE PAGOS ==========

  /**
   * Obtener mi historial de pagos (alumno)
   */
  const getMyPaymentHistory = async (limit = 50) => {
    try {
      const { data } = await financeApi.get(`/payments/my-history?limit=${limit}`);
      return data;
    } catch (error) {
      console.error("Error al obtener historial de pagos:", error);
      throw error;
    }
  };

  /**
   * Obtener historial de pagos de un alumno (para coach/admin)
   */
  const getStudentPaymentHistory = async (studentId, limit = 50) => {
    try {
      const { data } = await financeApi.get(`/payments/student/${studentId}/history?limit=${limit}`);
      return data;
    } catch (error) {
      console.error("Error al obtener historial de pagos del alumno:", error);
      throw error;
    }
  };

  // ========== AUMENTOS PROGRAMADOS ==========

  /**
   * Crear un aumento programado
   */
  const createPriceSchedule = async (scheduleData) => {
    try {
      const { data } = await financeApi.post(`${url}/price-schedule`, scheduleData);
      return data;
    } catch (error) {
      console.error("Error al crear aumento programado:", error);
      throw error;
    }
  };

  /**
   * Obtener aumentos programados
   */
  const getPriceSchedules = async () => {
    try {
      const { data } = await financeApi.get(`${url}/price-schedule`);
      return data;
    } catch (error) {
      console.error("Error al obtener aumentos programados:", error);
      throw error;
    }
  };

  /**
   * Cancelar un aumento programado
   */
  const cancelPriceSchedule = async (scheduleId) => {
    try {
      const { data } = await financeApi.delete(`${url}/price-schedule/${scheduleId}`);
      return data;
    } catch (error) {
      console.error("Error al cancelar aumento:", error);
      throw error;
    }
  };

  // ========== PRECIOS POR PLAN ==========

  /**
   * Obtener planes con precios del coach
   */
  const getCoachPlanPrices = async () => {
    try {
      const { data } = await financeApi.get(`${url}/coach/plan-prices`);
      return data;
    } catch (error) {
      console.error("Error al obtener precios por plan:", error);
      throw error;
    }
  };

  /**
   * Guardar precios por plan del coach
   */
  const saveCoachPlanPrices = async (prices) => {
    try {
      const { data } = await financeApi.put(`${url}/coach/plan-prices`, { prices });
      return data;
    } catch (error) {
      console.error("Error al guardar precios por plan:", error);
      throw error;
    }
  };

  /**
   * Aplicar aumentos programados a cuotas pendientes
   */
  const applyScheduledIncreases = async () => {
    try {
      const { data } = await financeApi.post(`${url}/coach/apply-increases`);
      return data;
    } catch (error) {
      console.error("Error al aplicar aumentos:", error);
      throw error;
    }
  };

  /**
   * Generar cuotas futuras para los alumnos del coach
   */
  const generateFutureFees = async () => {
    try {
      const { data } = await financeApi.post(`${url}/coach/generate-future-fees`);
      return data;
    } catch (error) {
      console.error("Error al generar cuotas:", error);
      throw error;
    }
  };

  return {
    //* Propiedades
    fees,
    errorMessage,
    //* Métodos
    findAllFees,
    update,
    create,
    getUnpaidFeesByStudent,
    validateSequentialPayment,
    checkStudentUnpaidFees,
    // Métodos para coaches
    getMyStudentsFees,
    markFeeAsPaid,
    updatePaymentConfig,
    // Aumentos programados
    createPriceSchedule,
    getPriceSchedules,
    cancelPriceSchedule,
    // Precios por plan
    getCoachPlanPrices,
    saveCoachPlanPrices,
    // Aplicar aumentos y generar cuotas
    applyScheduledIncreases,
    generateFutureFees,
    // Métodos para alumnos
    getMyCoachPaymentInfo,
    // Historial de pagos
    getMyPaymentHistory,
    getStudentPaymentHistory,
  };
};
