import { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Badge,
  Box,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EditIcon from '@mui/icons-material/Edit';
import ScaleIcon from '@mui/icons-material/Scale';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../api/notificationApi';

// Iconos según tipo de notificación
const getNotificationIcon = (type) => {
  switch (type) {
    case 'routine_assigned':
      return <FitnessCenterIcon style={{ color: '#4caf50', fontSize: 20 }} />;
    case 'routine_updated':
      return <EditIcon style={{ color: '#2196f3', fontSize: 20 }} />;
    case 'weight_logged':
      return <ScaleIcon style={{ color: '#ff9800', fontSize: 20 }} />;
    case 'new_student':
      return <PersonAddIcon style={{ color: '#9c27b0', fontSize: 20 }} />;
    default:
      return <InfoIcon style={{ color: '#607d8b', fontSize: 20 }} />;
  }
};

// Formato de tiempo relativo
const getTimeAgo = (date) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now - notifDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return notifDate.toLocaleDateString('es-AR');
};

const NotificationBell = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar contador de no leídas
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error cargando contador:', err);
    }
  }, []);

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications(30);
      setNotifications(data);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar contador al montar y cada 30 segundos
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  // Cargar notificaciones cuando se abre el panel
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  // Marcar como leída
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marcando como leída:', err);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    console.log('Marcando todas como leídas...');
    try {
      const result = await markAllAsRead();
      console.log('Resultado:', result);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marcando todas como leídas:', err);
    }
  };

  // Eliminar notificación
  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      const notif = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (notif && !notif.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error eliminando notificación:', err);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  // Estilos inline para evitar problemas con MUI en PWA
  const panelStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
    display: open ? 'flex' : 'none',
  };

  const backdropStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  };

  const contentStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 'calc(100% - 60px)',
    maxWidth: '380px',
    height: '100%',
    backgroundColor: '#141422',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
  };

  return (
    <>
      {/* Botón campanita */}
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          color: colors.grey[100],
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: 10,
              minWidth: 18,
              height: 18,
            },
          }}
        >
          {unreadCount > 0 ? (
            <NotificationsIcon />
          ) : (
            <NotificationsNoneIcon />
          )}
        </Badge>
      </IconButton>

      {/* Panel de notificaciones - CSS puro */}
      <div style={panelStyles}>
        {/* Backdrop */}
        <div 
          style={backdropStyles} 
          onClick={() => setOpen(false)}
        />
        
        {/* Contenido */}
        <div style={contentStyles}>
          {/* Header */}
          <div style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #2d2d44',
            backgroundColor: '#141422',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NotificationsIcon style={{ color: '#4caf50' }} />
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <span style={{
                  backgroundColor: '#f44336',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Botón marcar todas */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #2d2d44' }}>
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'transparent',
                  border: '1px solid #4caf50',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  color: '#4caf50',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '100%',
                  fontWeight: 500,
                }}
              >
                ✓ Marcar todas como leídas
              </button>
            </div>
          )}

          {/* Lista de notificaciones */}
          <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#141422' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                <CircularProgress style={{ color: '#4caf50' }} />
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ color: '#f44336' }}>{error}</p>
                <button 
                  onClick={loadNotifications}
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    background: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Reintentar
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                <NotificationsNoneIcon style={{ fontSize: 64, color: '#444', marginBottom: '16px' }} />
                <p style={{ color: '#888' }}>No tenés notificaciones</p>
              </div>
            ) : (
              <>
                {/* No leídas */}
                {unreadNotifications.length > 0 && (
                  <>
                    <p style={{ 
                      padding: '8px 16px', 
                      color: '#888', 
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      margin: 0,
                    }}>
                      Nuevas ({unreadNotifications.length})
                    </p>
                    {unreadNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px 16px',
                          backgroundColor: 'rgba(76, 175, 80, 0.15)',
                          borderLeft: '3px solid #4caf50',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ marginTop: '2px' }}>
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ 
                            margin: 0, 
                            fontWeight: 600, 
                            color: '#fff',
                            fontSize: '14px',
                          }}>
                            {notif.title}
                          </p>
                          <p style={{ 
                            margin: '4px 0', 
                            color: '#aaa',
                            fontSize: '12px',
                          }}>
                            {notif.message}
                          </p>
                          <p style={{ 
                            margin: 0, 
                            color: '#666',
                            fontSize: '11px',
                          }}>
                            {getTimeAgo(notif.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {/* Leídas */}
                {readNotifications.length > 0 && (
                  <>
                    <div style={{ 
                      borderTop: '1px solid #2d2d44', 
                      margin: '8px 0',
                    }} />
                    <p style={{ 
                      padding: '8px 16px', 
                      color: '#666', 
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      margin: 0,
                    }}>
                      Anteriores ({readNotifications.length})
                    </p>
                    {readNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px 16px',
                          opacity: 0.6,
                        }}
                      >
                        <div style={{ marginTop: '2px' }}>
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ 
                            margin: 0, 
                            color: '#aaa',
                            fontSize: '14px',
                          }}>
                            {notif.title}
                          </p>
                          <p style={{ 
                            margin: '4px 0', 
                            color: '#777',
                            fontSize: '12px',
                          }}>
                            {notif.message}
                          </p>
                          <p style={{ 
                            margin: 0, 
                            color: '#555',
                            fontSize: '11px',
                          }}>
                            {getTimeAgo(notif.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(notif.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#555',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationBell;
