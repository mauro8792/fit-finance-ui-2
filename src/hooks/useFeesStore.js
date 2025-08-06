import { useDispatch, useSelector } from "react-redux";
import { financeApi } from "../api";
import { clearErrorMessage, onLoadFee } from "../store";

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
  };
};
