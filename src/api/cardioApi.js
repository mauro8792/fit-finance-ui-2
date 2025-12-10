import financeApi from './fitFinanceApi';

// Tipos de actividad con emoji
export const ACTIVITY_TYPES = {
  // Outdoor / GPS
  bike: { label: 'Bicicleta', emoji: '🚴' },
  walk: { label: 'Caminata', emoji: '🚶' },
  run: { label: 'Running', emoji: '🏃' },
  hike: { label: 'Senderismo', emoji: '🥾' },
  // Indoor
  treadmill: { label: 'Cinta', emoji: '🏃‍♂️' },
  stationary_bike: { label: 'Bici Fija', emoji: '🚲' },
  swimming: { label: 'Natación', emoji: '🏊' },
  swim: { label: 'Natación', emoji: '🏊' },
  elliptical: { label: 'Elíptica', emoji: '🏃‍♀️' },
  rowing: { label: 'Remo', emoji: '🚣' },
  hiit: { label: 'HIIT', emoji: '🏋️' },
  yoga: { label: 'Yoga', emoji: '🧘' },
  stretching: { label: 'Stretching', emoji: '🤸' },
  dance: { label: 'Baile', emoji: '💃' },
  stairs: { label: 'Escaleras', emoji: '🪜' },
  jump_rope: { label: 'Saltar Soga', emoji: '🪢' },
  // Otros
  sport: { label: 'Deporte', emoji: '⚽' },
  other: { label: 'Otro', emoji: '➕' },
};

// Niveles de intensidad
export const INTENSITY_LEVELS = {
  low: { label: 'Baja', color: '#4cceac', description: 'Recuperación activa' },
  medium: { label: 'Media', color: '#ff9800', description: 'Zona aeróbica' },
  high: { label: 'Alta', color: '#ef4444', description: 'Intervalos / sprints' },
};

/**
 * Crear un nuevo registro de cardio
 */
export const createCardio = async (studentId, data) => {
  try {
    const response = await financeApi.post(`/cardio/${studentId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear registro de cardio:', error);
    throw error;
  }
};

/**
 * Obtener todos los registros de cardio de un estudiante
 */
export const getCardioLogs = async (studentId, startDate, endDate) => {
  try {
    let url = `/cardio/${studentId}`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await financeApi.get(url);
    return response.data;
  } catch (error) {
    console.error('Error al obtener registros de cardio:', error);
    throw error;
  }
};

/**
 * Obtener registros de cardio de hoy
 */
export const getTodayCardio = async (studentId) => {
  try {
    const response = await financeApi.get(`/cardio/${studentId}/today`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener cardio de hoy:', error);
    throw error;
  }
};

/**
 * Obtener resumen semanal
 */
export const getWeeklyCardio = async (studentId) => {
  try {
    const response = await financeApi.get(`/cardio/${studentId}/week`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen semanal de cardio:', error);
    throw error;
  }
};

/**
 * Obtener resumen para el coach
 */
export const getCardioSummary = async (studentId, days = 7) => {
  try {
    const response = await financeApi.get(`/cardio/${studentId}/summary?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen de cardio:', error);
    throw error;
  }
};

/**
 * Actualizar registro de cardio
 */
export const updateCardio = async (id, data) => {
  try {
    const response = await financeApi.put(`/cardio/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar registro de cardio:', error);
    throw error;
  }
};

/**
 * Eliminar registro de cardio
 */
export const deleteCardio = async (id) => {
  try {
    const response = await financeApi.delete(`/cardio/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar registro de cardio:', error);
    throw error;
  }
};

/**
 * Formatear duración en minutos a texto legible
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

/**
 * Obtener emoji y label de un tipo de actividad
 */
export const getActivityInfo = (type) => {
  return ACTIVITY_TYPES[type] || ACTIVITY_TYPES.other;
};

/**
 * Obtener info de intensidad
 */
export const getIntensityInfo = (intensity) => {
  return INTENSITY_LEVELS[intensity] || INTENSITY_LEVELS.medium;
};

