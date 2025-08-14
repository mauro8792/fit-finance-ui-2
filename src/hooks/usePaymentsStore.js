import { useDispatch, useSelector } from "react-redux";
import { financeApi } from "../api";
import { clearErrorMessage } from "../store/paymentSlice";

const url = "/payments";

export const usePaymentsStore = () => {
  const { payments, errorMessage } = useSelector((state) => state.payment);
  const dispatch = useDispatch();

  const create = async (payment) => {
    try {
      await financeApi.post(url, { ...payment });
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

  return {
    //* Propiedades
    payments,
    errorMessage,
    //* Métodos
    update,
    create,
  };
};
