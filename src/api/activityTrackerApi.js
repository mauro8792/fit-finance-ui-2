import financeApi from './fitFinanceApi';

// Tipos de actividad Outdoor (con GPS)
export const OUTDOOR_ACTIVITIES = {
  walk: { label: 'Caminata', emoji: '🚶', met: 3.5, color: '#4cceac' },
  run: { label: 'Running', emoji: '🏃', met: 9.8, color: '#ff9800' },
  bike: { label: 'Bicicleta', emoji: '🚴', met: 7.5, color: '#6870fa' },
  hike: { label: 'Senderismo', emoji: '🥾', met: 6.0, color: '#a855f7' },
};

// Tipos de actividad Indoor (sin GPS)
export const INDOOR_ACTIVITIES = {
  treadmill: { label: 'Cinta', emoji: '🚶‍♂️', met: 8.0, color: '#4cceac', fields: ['time', 'distance', 'incline'] },
  stationary_bike: { label: 'Bici Fija', emoji: '🚲', met: 7.0, color: '#6870fa', fields: ['time', 'distance', 'resistance'] },
  swimming: { label: 'Natación', emoji: '🏊', met: 8.0, color: '#3b82f6', fields: ['time', 'distance', 'laps', 'style'] },
  elliptical: { label: 'Elíptica', emoji: '🏃‍♀️', met: 5.0, color: '#ec4899', fields: ['time', 'resistance'] },
  rowing: { label: 'Remo', emoji: '🚣', met: 7.0, color: '#14b8a6', fields: ['time', 'distance'] },
  hiit: { label: 'HIIT', emoji: '🏋️', met: 8.0, color: '#ef4444', fields: ['time'] },
  yoga: { label: 'Yoga', emoji: '🧘', met: 2.5, color: '#a855f7', fields: ['time'] },
  stretching: { label: 'Stretching', emoji: '🤸', met: 2.0, color: '#f59e0b', fields: ['time'] },
  dance: { label: 'Baile', emoji: '💃', met: 6.0, color: '#ec4899', fields: ['time'] },
  stairs: { label: 'Escaleras', emoji: '🪜', met: 9.0, color: '#ff9800', fields: ['time', 'floors'] },
  jump_rope: { label: 'Saltar Soga', emoji: '🪢', met: 11.0, color: '#ef4444', fields: ['time'] },
};

// Estilos de natación
export const SWIMMING_STYLES = {
  freestyle: 'Libre',
  backstroke: 'Espalda',
  breaststroke: 'Pecho',
  butterfly: 'Mariposa',
};

/**
 * Iniciar una actividad con GPS
 */
export const startActivity = async (studentId, data) => {
  const response = await financeApi.post(`/activity-tracker/${studentId}/start`, data);
  return response.data;
};

/**
 * Agregar un punto GPS
 */
export const addPoint = async (trackId, data) => {
  const response = await financeApi.post(`/activity-tracker/${trackId}/point`, data);
  return response.data;
};

/**
 * Agregar múltiples puntos GPS (batch)
 */
export const addPointsBatch = async (trackId, points) => {
  const response = await financeApi.post(`/activity-tracker/${trackId}/points`, { points });
  return response.data;
};

/**
 * Pausar actividad
 */
export const pauseActivity = async (trackId) => {
  const response = await financeApi.put(`/activity-tracker/${trackId}/pause`);
  return response.data;
};

/**
 * Reanudar actividad
 */
export const resumeActivity = async (trackId) => {
  const response = await financeApi.put(`/activity-tracker/${trackId}/resume`);
  return response.data;
};

/**
 * Finalizar actividad GPS
 */
export const finishActivity = async (trackId, data) => {
  const response = await financeApi.put(`/activity-tracker/${trackId}/finish`, data);
  return response.data;
};

/**
 * Cancelar actividad
 */
export const cancelActivity = async (trackId) => {
  const response = await financeApi.put(`/activity-tracker/${trackId}/cancel`);
  return response.data;
};

/**
 * Crear actividad manual (indoor)
 */
export const createManualActivity = async (studentId, data) => {
  const response = await financeApi.post(`/activity-tracker/${studentId}/manual`, data);
  return response.data;
};

/**
 * Obtener actividad en progreso
 */
export const getInProgress = async (studentId) => {
  const response = await financeApi.get(`/activity-tracker/${studentId}/in-progress`);
  return response.data;
};

/**
 * Listar actividades
 */
export const getActivities = async (studentId, limit = 20) => {
  const response = await financeApi.get(`/activity-tracker/${studentId}?limit=${limit}`);
  return response.data;
};

/**
 * Obtener resumen semanal
 */
export const getWeeklySummary = async (studentId) => {
  const response = await financeApi.get(`/activity-tracker/${studentId}/weekly`);
  return response.data;
};

/**
 * Obtener resumen para el coach (últimos N días)
 */
export const getCoachSummary = async (studentId, days = 7) => {
  const response = await financeApi.get(`/activity-tracker/${studentId}/coach-summary?days=${days}`);
  return response.data;
};

/**
 * Obtener detalle de una actividad
 */
export const getActivityDetail = async (trackId) => {
  const response = await financeApi.get(`/activity-tracker/detail/${trackId}`);
  return response.data;
};

/**
 * Eliminar actividad
 */
export const deleteActivity = async (trackId) => {
  const response = await financeApi.delete(`/activity-tracker/${trackId}`);
  return response.data;
};

// ============ UTILIDADES ============

/**
 * Calcular distancia entre dos puntos GPS (Haversine)
 */
export const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

/**
 * Estimar calorías quemadas
 */
export const estimateCalories = (activityType, durationMinutes, weightKg = 70) => {
  const activity = OUTDOOR_ACTIVITIES[activityType] || INDOOR_ACTIVITIES[activityType];
  const met = activity?.met || 5;
  return Math.round(met * weightKg * (durationMinutes / 60));
};

/**
 * Formatear duración en segundos a "HH:MM:SS"
 */
export const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calcular ritmo (pace) en min/km
 */
export const calculatePace = (distanceMeters, durationSeconds) => {
  if (!distanceMeters || distanceMeters === 0) return null;
  const distanceKm = distanceMeters / 1000;
  const durationMinutes = durationSeconds / 60;
  const paceMinutes = durationMinutes / distanceKm;
  const mins = Math.floor(paceMinutes);
  const secs = Math.round((paceMinutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Obtener info de una actividad
 */
export const getActivityInfo = (type) => {
  return OUTDOOR_ACTIVITIES[type] || INDOOR_ACTIVITIES[type] || { label: type, emoji: '🏃', color: '#888' };
};

/**
 * Verificar si es actividad outdoor (GPS)
 */
export const isOutdoorActivity = (type) => {
  return Object.keys(OUTDOOR_ACTIVITIES).includes(type);
};

