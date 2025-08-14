import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { financeApi } from "../api";
import { onLoadSportPlans, clearErrorMessage } from "../store/sportPlanSlice";

export const useSportPlansStore = () => {
  const { sportPlans, errorMessage } = useSelector(
    (state) => state.sportPlan || { sportPlans: [], errorMessage: null }
  );
  const dispatch = useDispatch();

  const findAllSportPlans = useCallback(async () => {
    try {
      const timestamp = Date.now();
      const { data } = await financeApi.get(
        `/sports/plans?limit=100&_t=${timestamp}`
      );
      console.log("Sport plans response:", data); // Para debug
      dispatch(onLoadSportPlans({ data }));
    } catch (error) {
      console.error("Error fetching sport plans:", error);
      setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 10);
    }
  }, [dispatch]);

  const findSportPlansBySport = useCallback(async (sportId) => {
    try {
      const { data } = await financeApi.get(`/sports/${sportId}/plans`);
      return data.sportPlans || data;
    } catch (error) {
      console.error("Error fetching sport plans by sport:", error);
      return [];
    }
  }, []);

  const create = useCallback(
    async (sportPlan) => {
      try {
        // Validar que sportId sea un número válido
        const sportId = parseInt(sportPlan.sportId);
        if (isNaN(sportId)) {
          throw new Error(`sportId inválido: ${sportPlan.sportId}`);
        }

        // Validar que monthlyFee sea un número válido
        const monthlyFee = parseFloat(sportPlan.monthlyFee);
        if (isNaN(monthlyFee)) {
          throw new Error(`monthlyFee inválido: ${sportPlan.monthlyFee}`);
        }

        // Validar que weeklyFrequency sea un número válido
        const weeklyFrequency = parseInt(sportPlan.weeklyFrequency);
        if (isNaN(weeklyFrequency)) {
          throw new Error(
            `weeklyFrequency inválido: ${sportPlan.weeklyFrequency}`
          );
        }

        const payload = {
          ...sportPlan,
          sportId,
          monthlyFee,
          weeklyFrequency,
          isActive:
            sportPlan.isActive !== undefined ? sportPlan.isActive : true,
        };

        console.log("Creating sport plan with payload:", payload); // Para debug

        const { data } = await financeApi.post("/sports/plans", payload);
        return data.sportPlan; // Devolver el plan creado
      } catch (error) {
        console.error("Error creating sport plan:", error);
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
      const { id, ...sportPlan } = payload;
      try {
        // Validar que monthlyFee sea un número válido
        const monthlyFee = parseFloat(sportPlan.monthlyFee);
        if (isNaN(monthlyFee)) {
          throw new Error(`monthlyFee inválido: ${sportPlan.monthlyFee}`);
        }

        // Validar que weeklyFrequency sea un número válido
        const weeklyFrequency = parseInt(sportPlan.weeklyFrequency);
        if (isNaN(weeklyFrequency)) {
          throw new Error(
            `weeklyFrequency inválido: ${sportPlan.weeklyFrequency}`
          );
        }

        const updatePayload = {
          name: sportPlan.name,
          monthlyFee,
          weeklyFrequency,
          description: sportPlan.description || "",
          isActive:
            sportPlan.isActive !== undefined ? sportPlan.isActive : true,
          sportId: parseInt(sportPlan.sportId),
        };

        console.log("Updating sport plan with payload:", {
          id,
          ...updatePayload,
        }); // Para debug

        const { data } = await financeApi.patch(
          `/sports/plans/${id}`,
          updatePayload
        );
        return data.sportPlan; // Devolver el plan actualizado
      } catch (error) {
        console.error("Error updating sport plan:", error);
        setTimeout(() => {
          dispatch(clearErrorMessage());
        }, 10);
        throw error; // Re-lanzar el error para que el componente pueda manejarlo
      }
    },
    [dispatch]
  );

  const deleteSportPlan = useCallback(
    async (id) => {
      try {
        await financeApi.delete(`/sports/plans/${id}`);
      } catch (error) {
        console.error("Error deleting sport plan:", error);
        setTimeout(() => {
          dispatch(clearErrorMessage());
        }, 10);
      }
    },
    [dispatch]
  );

  return {
    //* Propiedades
    sportPlans,
    errorMessage,
    //* Métodos
    findAllSportPlans,
    findSportPlansBySport,
    create,
    update,
    deleteSportPlan,
  };
};
