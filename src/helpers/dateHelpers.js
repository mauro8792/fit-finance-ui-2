/**
 * 🗓️ Helpers de fecha para Argentina (UTC-3)
 * Todas las fechas se guardan en UTC en la BD, pero se muestran en hora de Argentina
 */

const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Formatea una fecha UTC a formato legible en Argentina
 * @param {string|Date} date - Fecha en UTC
 * @param {object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export const formatDateAR = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    timeZone: ARGENTINA_TIMEZONE,
    ...options,
  };
  
  return new Date(date).toLocaleDateString('es-AR', defaultOptions);
};

/**
 * Formatea fecha con día de la semana corto
 * Ej: "jue, 11 dic"
 */
export const formatDateShort = (date) => {
  return formatDateAR(date, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

/**
 * Formatea fecha completa
 * Ej: "jueves, 11 de diciembre de 2025"
 */
export const formatDateLong = (date) => {
  return formatDateAR(date, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formatea fecha con hora
 * Ej: "11/12/2025, 14:30"
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleString('es-AR', {
    timeZone: ARGENTINA_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Formatea solo la hora
 * Ej: "14:30"
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleTimeString('es-AR', {
    timeZone: ARGENTINA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Obtiene la fecha actual en Argentina como string YYYY-MM-DD
 */
export const getTodayAR = () => {
  const now = new Date();
  const argentinaDate = new Date(now.toLocaleString('en-US', { timeZone: ARGENTINA_TIMEZONE }));
  return argentinaDate.toISOString().split('T')[0];
};

/**
 * Verifica si una fecha es "hoy" en Argentina
 */
export const isToday = (date) => {
  if (!date) return false;
  const dateStr = formatDateAR(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const todayStr = formatDateAR(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' });
  return dateStr === todayStr;
};

/**
 * Verifica si una fecha es "ayer" en Argentina
 */
export const isYesterday = (date) => {
  if (!date) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = formatDateAR(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const yesterdayStr = formatDateAR(yesterday, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return dateStr === yesterdayStr;
};

/**
 * Devuelve "Hoy", "Ayer" o la fecha formateada
 */
export const formatRelativeDate = (date) => {
  if (isToday(date)) return 'Hoy';
  if (isYesterday(date)) return 'Ayer';
  return formatDateShort(date);
};

export default {
  formatDateAR,
  formatDateShort,
  formatDateLong,
  formatDateTime,
  formatTime,
  getTodayAR,
  isToday,
  isYesterday,
  formatRelativeDate,
  ARGENTINA_TIMEZONE,
};

