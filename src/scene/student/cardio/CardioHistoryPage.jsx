import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthStore } from '../../../hooks';
import {
  getActivityInfo,
  formatDuration,
} from '../../../api/cardioApi';
import { financeApi } from '../../../api';

const COLORS = {
  background: '#1a1a2e',
  card: '#16213e',
  border: 'rgba(255,255,255,0.1)',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.7)',
  green: '#4cceac',
  orange: '#ff9800',
  blue: '#6870fa',
  red: '#ef4444',
};

const CardioHistoryPage = () => {
  const navigate = useNavigate();
  const { student } = useAuthStore();
  const studentId = student?.id;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId) {
      loadHistory();
    }
  }, [studentId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calcular fechas para últimos 30 días
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const formatDate = (d) => d.toISOString().split('T')[0];
      
      // Cargar logs de cardio
      const response = await financeApi.get(
        `/cardio/${studentId}?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`
      );
      
      // Ordenar por fecha descendente
      const sorted = (response.data || []).sort((a, b) => 
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      );
      
      setActivities(sorted);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError('No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    try {
      await financeApi.delete(`/cardio/${id}`);
      loadHistory();
    } catch (err) {
      console.error('Error eliminando:', err);
      alert('Error al eliminar');
    }
  };

  const handleBack = () => {
    navigate('/student/cardio');
  };

  // Agrupar por fecha
  const groupByDate = (logs) => {
    const groups = {};
    logs.forEach(log => {
      const date = new Date(log.date || log.createdAt).toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
    });
    return groups;
  };

  if (!studentId) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: COLORS.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CircularProgress sx={{ color: COLORS.green }} />
      </Box>
    );
  }

  const groupedActivities = groupByDate(activities);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      pb: 4,
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        p: 2,
        borderBottom: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.card,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <IconButton onClick={handleBack} sx={{ color: COLORS.text }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h6" fontWeight={700} color={COLORS.text}>
            📜 Historial de Cardio
          </Typography>
          <Typography fontSize={12} color={COLORS.textMuted}>
            Últimos 30 días
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: COLORS.green }} />
            <Typography color={COLORS.textMuted} mt={2}>
              Cargando historial...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography fontSize={48} mb={2}>😕</Typography>
            <Typography color={COLORS.textMuted}>{error}</Typography>
            <Button
              onClick={loadHistory}
              sx={{ mt: 2, color: COLORS.orange }}
            >
              Reintentar
            </Button>
          </Box>
        ) : activities.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            color: COLORS.textMuted,
          }}>
            <Typography fontSize={48} mb={2}>🏃‍♂️</Typography>
            <Typography>No hay actividades registradas</Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/student/cardio')}
              sx={{
                mt: 2,
                backgroundColor: COLORS.green,
                color: '#000',
                '&:hover': { backgroundColor: '#3da88a' },
              }}
            >
              Registrar primera actividad
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Object.entries(groupedActivities).map(([date, logs]) => (
              <Box key={date}>
                <Typography 
                  fontSize={13} 
                  color={COLORS.orange} 
                  fontWeight={600} 
                  mb={1.5}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {date}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {logs.map((log) => {
                    const info = getActivityInfo(log.activityType);
                    return (
                      <Box
                        key={log.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: COLORS.card,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography fontSize={28}>{info.emoji}</Typography>
                          <Box>
                            <Typography fontWeight={600} color={COLORS.text}>
                              {info.label}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Typography fontSize={13} color={COLORS.green}>
                                ⏱️ {formatDuration(log.durationMinutes)}
                              </Typography>
                              {log.distanceKm > 0 && (
                                <Typography fontSize={13} color={COLORS.blue}>
                                  📍 {log.distanceKm} km
                                </Typography>
                              )}
                              {log.caloriesBurned > 0 && (
                                <Typography fontSize={13} color={COLORS.orange}>
                                  🔥 {log.caloriesBurned} kcal
                                </Typography>
                              )}
                            </Box>
                            {log.notes && (
                              <Typography fontSize={11} color={COLORS.textMuted} mt={0.5}>
                                💬 {log.notes}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(log.id)}
                          sx={{ color: COLORS.red, opacity: 0.6 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CardioHistoryPage;
