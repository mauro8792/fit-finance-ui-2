import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { financeApi } from "../api";
import { onLoad, clearErrorMessage } from "../store/studentSlice";

export const useStudentsStore = () => {
  const { students, errorMessage } = useSelector((state) => state.student);
  const dispatch = useDispatch();

  const findAll = useCallback(async () => {
    try {
      console.log("🔍 Fetching students..."); // Debug log
      const { data } = await financeApi.get("/students");

      dispatch(onLoad({ data }));
    } catch (error) {
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  }, [dispatch]);

  const update = useCallback(
    async (payload) => {
      const { id, ...student } = payload;
      delete student.sportName;
      try {
        await financeApi.patch(`/students/${id}`, student);
      } catch (error) {
        setTimeout(() => {
          dispatch(clearErrorMessage());
        }, 10);
      }
    },
    [dispatch]
  );

  const create = useCallback(
    async (payload) => {
      try {
        await financeApi.post("/students", payload);
      } catch (error) {
        setTimeout(() => {
          dispatch(clearErrorMessage());
        }, 10);
      }
    },
    [dispatch]
  );

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
