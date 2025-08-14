import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { financeApi } from "../api";
import { onLoadSport, clearErrorMessage } from "../store/sportSlice";

export const useSportsStore = () => {
  const { sports, errorMessage } = useSelector((state) => state.sport);
  const dispatch = useDispatch();

  const findAllSports = useCallback(async () => {
    try {
      const timestamp = Date.now();
      const { data } = await financeApi.get(
        `/sports?limit=100&_t=${timestamp}`
      );
      console.log("Sports response:", data); // Para debug
      dispatch(onLoadSport({ data }));
    } catch (error) {
      console.error("Error fetching sports:", error);
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  }, [dispatch]);

  const create = useCallback(
    async (sport) => {
      try {
        const payload = {
          name: sport.name,
          description: sport.description,
        };

        // Solo incluir monthlyFee si existe (para compatibilidad)
        if (sport.monthlyFee && sport.monthlyFee !== "") {
          payload.monthlyFee = parseFloat(sport.monthlyFee);
        }

        const { data } = await financeApi.post("/sports", payload);
        return data.sport; // Devolver el deporte creado con su ID
      } catch (error) {
        console.error("Error creating sport:", error);
        setTimeout(() => {
          dispatch(clearErrorMessage());
        }, 10);
        throw error; // Re-lanzar el error para que el componente pueda manejarlo
      }
    },
    [dispatch]
  );

  const update = useCallback(
    async (payload) => {
      const { id, ...sport } = payload;
      try {
        const updatePayload = {
          name: sport.name,
          description: sport.description,
        };

        // Solo incluir monthlyFee si existe (para compatibilidad)
        if (sport.monthlyFee && sport.monthlyFee !== "") {
          updatePayload.monthlyFee = parseFloat(sport.monthlyFee);
        }

        await financeApi.patch(`/sports/${id}`, updatePayload);
      } catch (error) {
        console.error("Error updating sport:", error);
        setTimeout(() => {
          dispatch(clearErrorMessage());
        }, 10);
      }
    },
    [dispatch]
  );

  return {
    //* Propiedades
    sports,
    errorMessage,
    //* Métodos
    findAllSports,
    update,
    create,
  };
};
