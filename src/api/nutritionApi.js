import financeApi from './fitFinanceApi';

// ========== FOOD ITEMS ==========

export const getCategories = async () => {
  const response = await financeApi.get('/nutrition/categories');
  return response.data;
};

export const getFoodItems = async (studentId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);
  
  const response = await financeApi.get(
    `/nutrition/foods/${studentId}?${params.toString()}`
  );
  return response.data;
};

export const createFoodItem = async (studentId, foodData) => {
  const response = await financeApi.post(
    `/nutrition/foods/${studentId}`,
    foodData
  );
  return response.data;
};

export const updateFoodItem = async (foodId, foodData) => {
  const response = await financeApi.put(`/nutrition/foods/${foodId}`, foodData);
  return response.data;
};

export const deleteFoodItem = async (foodId) => {
  const response = await financeApi.delete(`/nutrition/foods/${foodId}`);
  return response.data;
};

export const initializeFoodLibrary = async (studentId) => {
  const response = await financeApi.post(
    `/nutrition/foods/${studentId}/initialize`
  );
  return response.data;
};

// ========== MEAL TYPES ==========

export const getMealTypes = async (studentId) => {
  const response = await financeApi.get(`/nutrition/meal-types/${studentId}`);
  return response.data;
};

export const createMealType = async (studentId, data) => {
  const response = await financeApi.post(
    `/nutrition/meal-types/${studentId}`,
    data
  );
  return response.data;
};

export const updateMealType = async (mealTypeId, data) => {
  const response = await financeApi.put(
    `/nutrition/meal-types/${mealTypeId}`,
    data
  );
  return response.data;
};

export const deleteMealType = async (mealTypeId) => {
  const response = await financeApi.delete(
    `/nutrition/meal-types/${mealTypeId}`
  );
  return response.data;
};

export const initializeMealTypes = async (studentId) => {
  const response = await financeApi.post(
    `/nutrition/meal-types/${studentId}/initialize`
  );
  return response.data;
};

// ========== NUTRITION PROFILE ==========

export const getNutritionProfile = async (studentId) => {
  const response = await financeApi.get(`/nutrition/profile/${studentId}`);
  return response.data;
};

export const getActivityFactors = async () => {
  const response = await financeApi.get('/nutrition/profile/activity-factors');
  return response.data;
};

// ========== FOOD LOG ==========

export const addFoodLogEntry = async (studentId, entryData) => {
  const response = await financeApi.post(
    `/nutrition/log/${studentId}`,
    entryData
  );
  return response.data;
};

export const getDailyLog = async (studentId, date) => {
  const params = date ? `?date=${date}` : '';
  const response = await financeApi.get(`/nutrition/log/${studentId}${params}`);
  return response.data;
};

export const getFoodLogRange = async (studentId, startDate, endDate) => {
  const response = await financeApi.get(
    `/nutrition/log/${studentId}/range?startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
};

export const updateFoodLogEntry = async (entryId, data) => {
  const response = await financeApi.put(`/nutrition/log/entry/${entryId}`, data);
  return response.data;
};

export const deleteFoodLogEntry = async (entryId) => {
  const response = await financeApi.delete(`/nutrition/log/entry/${entryId}`);
  return response.data;
};

// ========== DASHBOARD & STATS ==========

export const getNutritionDashboard = async (studentId, date) => {
  const params = date ? `?date=${date}` : '';
  const response = await financeApi.get(
    `/nutrition/dashboard/${studentId}${params}`
  );
  return response.data;
};

export const getWeeklySummary = async (studentId, weekStart) => {
  const params = weekStart ? `?weekStart=${weekStart}` : '';
  const response = await financeApi.get(
    `/nutrition/weekly/${studentId}${params}`
  );
  return response.data;
};

export const getTopFoods = async (studentId, limit = 10) => {
  const response = await financeApi.get(
    `/nutrition/stats/${studentId}/top-foods?limit=${limit}`
  );
  return response.data;
};

