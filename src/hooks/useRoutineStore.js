import { useCallback } from "react";
import fitFinanceApi from "../api/fitFinanceApi";

export const useRoutineStore = () => {
  // Crear macro-ciclo
  const createMacroCycle = useCallback(async (studentId, macroData) => {
    const response = await fitFinanceApi.post(`/macrocycle`, {
      studentId,
      ...macroData,
      name: macroData.objetivo, // Mapear objetivo a name
      startDate: macroData.fechaInicio, // Mapear fechaInicio a startDate
      endDate: macroData.fechaFin, // Mapear fechaFin a endDate
    });
    return response.data;
  }, []);

  // Obtener todos los macro-ciclos
  const getAllMacroCycles = useCallback(async () => {
    const response = await fitFinanceApi.get(`/macrocycle`);
    return response.data;
  }, []);

  return {
    createMacroCycle,
    getAllMacroCycles,
  };
};
