import { useDispatch, useSelector } from 'react-redux';
import { financeApi } from '../api';
import { clearErrorMessage, onLoadFee } from '../store';

const url = '/fees';

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

      dispatch(onLoadFee({ data }));
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const create = async (sport) => {
    try {
      await financeApi.post(url, { ...sport, monthlyFee: parseInt(sport.monthlyFee) });
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const update = async (payload) => {
    const { id, ...sport } = payload;
    try {
      await financeApi.patch(`${url}/${id}`, { ...sport, monthlyFee: parseInt(sport.monthlyFee) });
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
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
  };
};
