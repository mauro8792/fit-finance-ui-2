import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ActivitySelector from './ActivitySelector';
import IndoorActivityForm from './IndoorActivityForm';
import IndoorActivityTracker from './IndoorActivityTracker';
import {
  getTodayCardio,
  getWeeklyCardio,
  deleteCardio,
  getActivityInfo,
  getIntensityInfo,
  formatDuration,
} from '../../../api/cardioApi';
import { INDOOR_ACTIVITIES, getActivityInfo as getTrackerActivityInfo } from '../../../api/activityTrackerApi';

// ==============================================
// GPS TRACKER - DESHABILITADO
// Las PWAs no pueden trackear GPS con pantalla bloqueada
// ==============================================
// import GpsTracker from './GpsTracker';

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

const CardioSection = ({ studentId }) => {
  const navigate = useNavigate();
  const [todayLogs, setTodayLogs] = useState([]);
  const [weekSummary, setWeekSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el flujo
  const [view, setView] = useState('main'); // main, selector, indoorChoice, indoorTracker, indoor
  const [selectedActivity, setSelectedActivity] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [today, weekCardio] = await Promise.all([
        getTodayCardio(studentId).catch(() => []),
        getWeeklyCardio(studentId).catch(() => null),
      ]);
      setTodayLogs(today || []);
      setWeekSummary(weekCardio);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadData();
    }
  }, [studentId]);

  // Handlers
  const handleSelectActivity = (activityType) => {
    setSelectedActivity(activityType);
    setView('indoorChoice');
  };

  const handleChooseTimer = () => {
    setView('indoorTracker');
  };

  const handleChooseManual = () => {
    setView('indoor');
  };

  const handleActivityComplete = () => {
    setView('main');
    setSelectedActivity(null);
    loadData();
  };

  const handleCancel = () => {
    setView('main');
    setSelectedActivity(null);
  };

  const handleBackToSelector = () => {
    setView('selector');
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    try {
      await deleteCardio(id);
      loadData();
    } catch (err) {
      console.error('Error eliminando:', err);
    }
  };

  // Vista: Cronómetro indoor - Pantalla completa
  if (view === 'indoorTracker') {
    return (
      <Box sx={{ 
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.background,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}>
        <IndoorActivityTracker
          studentId={studentId}
          activityType={selectedActivity}
          onComplete={handleActivityComplete}
          onCancel={handleCancel}
        />
      </Box>
    );
  }

  // Vista: Formulario manual - Pantalla completa
  if (view === 'indoor') {
    return (
      <Box sx={{ 
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.card,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}>
        <IndoorActivityForm
          studentId={studentId}
          activityType={selectedActivity}
          onSave={handleActivityComplete}
          onCancel={handleCancel}
        />
      </Box>
    );
  }

  // Vista: Elegir entre cronómetro o manual
  if (view === 'indoorChoice' && selectedActivity) {
    const activityInfo = INDOOR_ACTIVITIES[selectedActivity] || { label: selectedActivity, emoji: '🏃', color: '#888' };
    return (
      <Box sx={{ 
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.card,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}>
        <Box sx={{ p: 2 }}>
          {/* Header con actividad seleccionada */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            p: 2,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${activityInfo.color}22 0%, transparent 100%)`,
            border: `1px solid ${activityInfo.color}33`,
          }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${activityInfo.color} 0%, ${activityInfo.color}88 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography fontSize={26}>{activityInfo.emoji}</Typography>
            </Box>
            <Typography variant="h6" fontWeight={700} color={COLORS.text}>
              ¿Cómo querés registrar la actividad?
            </Typography>
          </Box>

          {/* Opción 1: Cronómetro */}
          <Box
            onClick={handleChooseTimer}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: `1px solid ${COLORS.border}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: COLORS.orange,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Typography fontSize={32}>⏱️</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700} color={COLORS.text} fontSize={18}>
                  USAR CRONÓMETRO
                </Typography>
                <Typography color={COLORS.textMuted} fontSize={13} mt={0.5} sx={{ textTransform: 'uppercase' }}>
                  Iniciá el cronómetro y registrá el tiempo exacto de tu actividad en tiempo real. Ideal para cuando estás por empezar.
                </Typography>
                <Chip
                  label="⭐ RECOMENDADO"
                  size="small"
                  sx={{
                    mt: 1.5,
                    backgroundColor: 'rgba(255,152,0,0.2)',
                    color: COLORS.orange,
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Opción 2: Manual */}
          <Box
            onClick={handleChooseManual}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: `1px solid ${COLORS.border}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: COLORS.green,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Typography fontSize={32}>📝</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700} color={COLORS.text} fontSize={18}>
                  REGISTRO MANUAL
                </Typography>
                <Typography color={COLORS.textMuted} fontSize={13} mt={0.5} sx={{ textTransform: 'uppercase' }}>
                  Ingresá los datos manualmente: duración, distancia, calorías. Útil para registrar actividades pasadas.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Volver */}
          <Button
            fullWidth
            onClick={handleBackToSelector}
            sx={{
              color: COLORS.textMuted,
              fontSize: 13,
              '&:hover': { color: COLORS.text },
            }}
          >
            ← VOLVER A ELEGIR ACTIVIDAD
          </Button>
        </Box>
      </Box>
    );
  }

  // Vista: Selector de actividades - Pantalla completa
  if (view === 'selector') {
    return (
      <Box sx={{ 
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.card,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography variant="h6" fontWeight={700} color={COLORS.text}>
            🏃 Nueva Actividad
          </Typography>
          <Button
            size="small"
            onClick={handleCancel}
            sx={{ color: COLORS.textMuted }}
          >
            ✕ Cerrar
          </Button>
        </Box>
        <Box sx={{ p: 2 }}>
          <ActivitySelector onSelectActivity={handleSelectActivity} />
        </Box>
      </Box>
    );
  }

  // Vista principal - Pantalla completa debajo del header
  return (
    <Box sx={{ 
      position: 'fixed',
      top: 64,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: COLORS.card,
      zIndex: 1200,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(76,206,172,0.1) 0%, transparent 100%)',
      }}>
        <Typography variant="h6" fontWeight={700} color={COLORS.text}>
          🏃 Mi Cardio
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/student/cardio/steps')}
            sx={{
              backgroundColor: COLORS.green,
              color: '#000',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#3da88a' },
            }}
          >
            👟 Pasos
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => setView('selector')}
            sx={{
              backgroundColor: COLORS.orange,
              color: '#000',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e68a00' },
            }}
          >
            ▶ Iniciar
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: COLORS.green }} />
        </Box>
      ) : (
        <>
          {/* Hoy */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}` }}>
            <Typography fontSize={12} color={COLORS.textMuted} mb={1.5} fontWeight={600}>
              📅 HOY
            </Typography>
            
            {todayLogs.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 3, 
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 2,
              }}>
                <Typography fontSize={32} mb={1}>🏃‍♂️</Typography>
                <Typography fontSize={13} color={COLORS.textMuted}>
                  No registraste cardio hoy
                </Typography>
                <Button
                  size="small"
                  onClick={() => setView('selector')}
                  sx={{ mt: 1, color: COLORS.green }}
                >
                  + Agregar actividad
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {todayLogs.map((log) => {
                  const activity = getActivityInfo(log.activityType);
                  const intensity = getIntensityInfo(log.intensity);
                  return (
                    <Box
                      key={log.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography fontSize={28}>{activity.emoji}</Typography>
                        <Box>
                          <Typography fontWeight={600} color={COLORS.text}>
                            {activity.label}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                            {log.durationMinutes > 0 && (
                              <Typography fontSize={12} color={COLORS.textMuted}>
                                {formatDuration(log.durationMinutes)}
                              </Typography>
                            )}
                            {log.steps > 0 && (
                              <Typography fontSize={12} color={COLORS.green} fontWeight={600}>
                                👟 {log.steps.toLocaleString()} pasos
                              </Typography>
                            )}
                            {log.distanceKm > 0 && (
                              <Typography fontSize={12} color={COLORS.textMuted}>
                                • {log.distanceKm}km
                              </Typography>
                            )}
                            {intensity && (
                              <Chip
                                label={intensity.label}
                                size="small"
                                sx={{
                                  backgroundColor: `${intensity.color}22`,
                                  color: intensity.color,
                                  fontSize: 10,
                                  height: 20,
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(log.id)}
                        sx={{ color: COLORS.textMuted, '&:hover': { color: COLORS.red } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Esta semana */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}` }}>
            <Typography fontSize={12} color={COLORS.textMuted} mb={1.5} fontWeight={600}>
              📊 ESTA SEMANA
            </Typography>
            
            {weekSummary && (weekSummary.totalSessions > 0 || weekSummary.totalSteps > 0) ? (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    flex: 1, 
                    p: 1.5, 
                    backgroundColor: 'rgba(76,206,172,0.1)', 
                    borderRadius: 2,
                    textAlign: 'center',
                  }}>
                    <Typography variant="h5" fontWeight={700} color={COLORS.green}>
                      {weekSummary.totalSessions}
                    </Typography>
                    <Typography fontSize={10} color={COLORS.textMuted}>
                      sesiones
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    flex: 1, 
                    p: 1.5, 
                    backgroundColor: 'rgba(104,112,250,0.1)', 
                    borderRadius: 2,
                    textAlign: 'center',
                  }}>
                    <Typography variant="h5" fontWeight={700} color={COLORS.blue}>
                      {formatDuration(weekSummary.totalMinutes)}
                    </Typography>
                    <Typography fontSize={10} color={COLORS.textMuted}>
                      tiempo total
                    </Typography>
                  </Box>
                  {weekSummary.totalDistance > 0 && (
                    <Box sx={{ 
                      flex: 1, 
                      p: 1.5, 
                      backgroundColor: 'rgba(255,152,0,0.1)', 
                      borderRadius: 2,
                      textAlign: 'center',
                    }}>
                      <Typography variant="h5" fontWeight={700} color={COLORS.orange}>
                        {weekSummary.totalDistance}
                      </Typography>
                      <Typography fontSize={10} color={COLORS.textMuted}>
                        km
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Pasos totales de la semana */}
                {weekSummary.totalSteps > 0 && (
                  <Box sx={{ 
                    mt: 2,
                    p: 2, 
                    backgroundColor: 'rgba(76, 206, 172, 0.1)', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}>
                    <Typography fontSize={24}>👟</Typography>
                    <Box>
                      <Typography variant="h5" fontWeight={700} color={COLORS.green}>
                        {weekSummary.totalSteps.toLocaleString()}
                      </Typography>
                      <Typography fontSize={10} color={COLORS.textMuted}>
                        pasos esta semana
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Desglose por actividad */}
                {Object.keys(weekSummary.byActivity || {}).length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {Object.entries(weekSummary.byActivity).map(([type, data]) => {
                      const activity = getActivityInfo(type);
                      return (
                        <Chip
                          key={type}
                          label={`${activity.emoji} ${data.count}x (${formatDuration(data.minutes)})`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: COLORS.text,
                            fontSize: 11,
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 2, 
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 2,
              }}>
                <Typography fontSize={13} color={COLORS.textMuted}>
                  Sin actividades esta semana
                </Typography>
              </Box>
            )}
          </Box>

          {/* Botón ver historial */}
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/student/cardio/history')}
              sx={{
                borderColor: COLORS.border,
                color: COLORS.textMuted,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  borderColor: COLORS.green,
                  color: COLORS.green,
                  backgroundColor: 'rgba(76, 206, 172, 0.1)',
                },
              }}
            >
              📜 Ver historial completo →
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CardioSection;
