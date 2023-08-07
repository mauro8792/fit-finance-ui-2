import { useDispatch, useSelector } from 'react-redux';
import { financeApi } from '../api';
import { onLoadSport, clearErrorMessage } from '../store';

export const useSportsStore = () => {
  const { sports, errorMessage } = useSelector((state) => state.sport);
  const dispatch = useDispatch();

  const findAllSports = async () => {
    try {
      const { data } = await financeApi.get('/sports');

      dispatch(onLoadSport({ data }));
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  

  return {
    //* Propiedades
    sports,
    errorMessage,
    //* Métodos
    findAllSports,
  };
};
