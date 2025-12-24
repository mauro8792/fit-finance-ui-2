import financeApi from './fitFinanceApi';

/**
 * Obtener todas mis notificaciones
 */
export const getNotifications = async (limit = 50) => {
  const { data } = await financeApi.get(`/notifications?limit=${limit}`);
  return data;
};

/**
 * Obtener notificaciones no leídas
 */
export const getUnreadNotifications = async () => {
  const { data } = await financeApi.get('/notifications/unread');
  return data;
};

/**
 * Obtener cantidad de notificaciones no leídas
 */
export const getUnreadCount = async () => {
  const { data } = await financeApi.get('/notifications/unread-count');
  return data.count;
};

/**
 * Marcar una notificación como leída
 */
export const markAsRead = async (notificationId) => {
  const { data } = await financeApi.patch(`/notifications/${notificationId}/read`);
  return data;
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllAsRead = async () => {
  const { data } = await financeApi.patch('/notifications/read-all');
  return data;
};

/**
 * Eliminar una notificación
 */
export const deleteNotification = async (notificationId) => {
  const { data } = await financeApi.delete(`/notifications/${notificationId}`);
  return data;
};

