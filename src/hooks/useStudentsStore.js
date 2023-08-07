import { useDispatch, useSelector } from 'react-redux';
import { financeApi } from '../api';
import { onLoad, clearErrorMessage } from '../store';

export const useStudentsStore = () => {
  const { students, errorMessage } = useSelector((state) => state.student);
  const dispatch = useDispatch();

  const findAll = async () => {
    try {
      const { data } = await financeApi.get('/students');

      dispatch(onLoad({ data }));
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const update = async (payload) => {
    const { id, ...student } = payload;
    delete student.sportName;
    try {
      await financeApi.patch(`/students/${id}`, student);
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  const create = async (payload) => {
    try {
      await financeApi.post('/students', payload);
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  };

  return {
    //* Propiedades
    students,
    errorMessage,
    //* Métodos
    findAll,
    update,
    create,
  };
};
