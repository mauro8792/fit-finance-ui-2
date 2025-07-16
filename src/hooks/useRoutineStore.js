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

  // Crear mesociclo
  const createMesocycle = useCallback(async (macrocycleId, mesoData) => {
    const response = await fitFinanceApi.post(`/mesocycle/${macrocycleId}`, {
      ...mesoData,
      name: mesoData.name || mesoData.objetivo,
    });
    return response.data;
  }, []);

  // Obtener todos los mesociclos de un macro
  const getMesocyclesByMacro = useCallback(async (macrocycleId) => {
    const response = await fitFinanceApi.get(
      `/mesocycle/macrocycle/${macrocycleId}`
    );
    return response.data;
  }, []);

  return {
    createMacroCycle,
    getAllMacroCycles,
    createMesocycle,
    getMesocyclesByMacro,
  };
};
