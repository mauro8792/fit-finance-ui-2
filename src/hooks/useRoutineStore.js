import { useCallback } from "react";
import fitFinanceApi, { getMicrocyclesByMesocycle } from "../api/fitFinanceApi";

export const useRoutineStore = () => {
  // Crear microciclo para un mesociclo
  const createMicrocycle = useCallback(async (mesocycleId, microcycleData) => {
    const response = await fitFinanceApi.post(
      `/microcycle/${mesocycleId}/`,
      microcycleData
    );
    return response.data;
  }, []);

  // Obtener microciclos de un mesociclo
  const fetchMicrocyclesByMesocycle = useCallback(async (mesocycleId) => {
    return await getMicrocyclesByMesocycle(mesocycleId);
  }, []);
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

  // Obtener un microciclo por id
  const getMicrocycleById = useCallback(async (microcycleId) => {
    const response = await fitFinanceApi.get(`/microcycle/${microcycleId}`);
    return response.data;
  }, []);

  // Actualizar un microciclo existente
  const updateMicrocycle = useCallback(async (microcycleId, microcycleData) => {
    const response = await fitFinanceApi.put(
      `/microcycle/${microcycleId}`,
      microcycleData
    );
    return response.data;
  }, []);

  return {
    createMacroCycle,
    getAllMacroCycles,
    createMesocycle,
    getMesocyclesByMacro,
    createMicrocycle,
    fetchMicrocyclesByMesocycle,
    getMicrocycleById,
    updateMicrocycle,
  };
};
