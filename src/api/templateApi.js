import fitFinanceApi from './fitFinanceApi';

// ==================== TEMPLATES API ====================

/**
 * Obtener todas las plantillas del coach
 * @param {Object} filters - Filtros opcionales { category, search, tags }
 */
export const getTemplates = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);
  if (filters.tags) params.append('tags', filters.tags);
  
  const queryString = params.toString();
  const url = queryString ? `/templates/mesocycles?${queryString}` : '/templates/mesocycles';
  
  const response = await fitFinanceApi.get(url);
  return response.data;
};

/**
 * Obtener una plantilla con todo su contenido
 * @param {number} id - ID de la plantilla
 */
export const getTemplate = async (id) => {
  const response = await fitFinanceApi.get(`/templates/mesocycles/${id}`);
  return response.data;
};

/**
 * Crear una nueva plantilla
 * @param {Object} data - { templateName, templateDescription, templateCategory, templateTags, weeksCount, daysPerWeek }
 */
export const createTemplate = async (data) => {
  const response = await fitFinanceApi.post('/templates/mesocycles', data);
  return response.data;
};

/**
 * Actualizar metadatos de una plantilla
 * @param {number} id - ID de la plantilla
 * @param {Object} data - { templateName, templateDescription, templateCategory, templateTags }
 */
export const updateTemplate = async (id, data) => {
  const response = await fitFinanceApi.put(`/templates/mesocycles/${id}`, data);
  return response.data;
};

/**
 * Eliminar una plantilla
 * @param {number} id - ID de la plantilla
 */
export const deleteTemplate = async (id) => {
  const response = await fitFinanceApi.delete(`/templates/mesocycles/${id}`);
  return response.data;
};

/**
 * Duplicar una plantilla
 * @param {number} id - ID de la plantilla a duplicar
 * @param {string} newName - Nombre para la copia (opcional)
 */
export const duplicateTemplate = async (id, newName) => {
  const response = await fitFinanceApi.post(`/templates/mesocycles/${id}/duplicate`, { newName });
  return response.data;
};

/**
 * Asignar plantilla a un alumno (deep copy)
 * @param {number} id - ID de la plantilla
 * @param {Object} data - { studentId, mode, existingMacrocycleId, newMacroName, startDate, keepSuggestedLoads }
 */
export const assignTemplate = async (id, data) => {
  const response = await fitFinanceApi.post(`/templates/mesocycles/${id}/assign`, data);
  return response.data;
};

/**
 * Obtener categorías disponibles
 */
export const getTemplateCategories = async () => {
  const response = await fitFinanceApi.get('/templates/mesocycles/categories');
  return response.data;
};

// Constantes para categorías predefinidas
export const TEMPLATE_CATEGORIES = [
  { value: 'hipertrofia', label: 'Hipertrofia', emoji: '💪', color: '#e91e63' },
  { value: 'fuerza', label: 'Fuerza', emoji: '🏋️', color: '#f44336' },
  { value: 'definicion', label: 'Definición', emoji: '🔥', color: '#ff9800' },
  { value: 'resistencia', label: 'Resistencia', emoji: '🏃', color: '#4caf50' },
  { value: 'principiante', label: 'Principiante', emoji: '🌱', color: '#8bc34a' },
  { value: 'intermedio', label: 'Intermedio', emoji: '📈', color: '#2196f3' },
  { value: 'avanzado', label: 'Avanzado', emoji: '🚀', color: '#9c27b0' },
  { value: 'fullbody', label: 'Full Body', emoji: '🧍', color: '#00bcd4' },
  { value: 'upper_lower', label: 'Upper/Lower', emoji: '↕️', color: '#009688' },
  { value: 'ppl', label: 'Push/Pull/Legs', emoji: '🔄', color: '#673ab7' },
  { value: 'rehabilitacion', label: 'Rehabilitación', emoji: '🏥', color: '#607d8b' },
  { value: 'otro', label: 'Otro', emoji: '📋', color: '#9e9e9e' },
];

export const getCategoryInfo = (categoryValue) => {
  return TEMPLATE_CATEGORIES.find(c => c.value === categoryValue) || TEMPLATE_CATEGORIES[TEMPLATE_CATEGORIES.length - 1];
};

