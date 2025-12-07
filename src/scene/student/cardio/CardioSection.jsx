import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCardioModal from './AddCardioModal';
import ActivitySelector from './ActivitySelector';
import GpsTracker from './GpsTracker';
import IndoorActivityForm from './IndoorActivityForm';
import {
  getTodayCardio,
  getWeeklyCardio,
  deleteCardio,
  getActivityInfo,
  getIntensityInfo,
  formatDuration,
} from '../../../api/cardioApi';
import {
  getActivities as getTrackedActivities,
  getActivityInfo as getTrackerActivityInfo,
  formatDuration as formatTrackerDuration,
} from '../../../api/activityTrackerApi';

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
  const [todayLogs, setTodayLogs] = useState([]);
  const [weekSummary, setWeekSummary] = useState(null);
  const [trackedActivities, setTrackedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Estados para el nuevo tracker
  const [view, setView] = useState('main'); // main, selector, gps, indoor
  const [selectedActivity, setSelectedActivity] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [today, week, tracked] = await Promise.all([
        getTodayCardio(studentId).catch(() => []),
        getWeeklyCardio(studentId).catch(() => null),
        getTrackedActivities(studentId, 5).catch(() => []),
      ]);
      setTodayLogs(today || []);
      setWeekSummary(week);
      setTrackedActivities(tracked || []);
    } catch (err) {
      console.error('Error cargando datos de cardio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) loadData();
  }, [studentId]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await deleteCardio(id);
      loadData();
    } catch (err) {
      console.error('Error eliminando:', err);
    }
  };

  const handleSave = () => {
    loadData();
  };
  
  // Handlers para el tracker
  const handleSelectOutdoor = (activityType) => {
    setSelectedActivity(activityType);
    setView('gps');
  };
  
  const handleSelectIndoor = (activityType) => {
    setSelectedActivity(activityType);
    setView('indoor');
  };
  
  const handleTrackerFinish = () => {
    setView('main');
    setSelectedActivity(null);
    loadData();
  };
  
  const handleTrackerCancel = () => {
    setView('main');
    setSelectedActivity(null);
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        backgroundColor: COLORS.card, 
        borderRadius: 3,
        textAlign: 'center',
      }}>
        <CircularProgress size={30} sx={{ color: COLORS.green }} />
      </Box>
    );
  }

  // Vista de GPS Tracker - Pantalla completa debajo del header
  if (view === 'gps') {
    return (
      <Box sx={{ 
        position: 'fixed',
        top: 64, // Altura del header
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.card,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <GpsTracker
          studentId={studentId}
          activityType={selectedActivity}
          onFinish={handleTrackerFinish}
          onCancel={handleTrackerCancel}
        />
      </Box>
    );
  }

  // Vista de formulario Indoor - Pantalla completa
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
          onSave={handleTrackerFinish}
          onCancel={handleTrackerCancel}
        />
      </Box>
    );
  }

  // Vista de selector de actividad - Pantalla completa
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
            onClick={() => setView('main')}
            sx={{ color: COLORS.textMuted }}
          >
            ✕ Cerrar
          </Button>
        </Box>
        <Box sx={{ p: 2 }}>
          <ActivitySelector
            onSelectOutdoor={handleSelectOutdoor}
            onSelectIndoor={handleSelectIndoor}
          />
        </Box>
      </Box>
    );
  }

  // Vista principal - Pantalla completa debajo del header
  return (
    <>
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
              variant="outlined"
              size="small"
              onClick={() => setShowModal(true)}
              sx={{
                borderColor: COLORS.border,
                color: COLORS.textMuted,
                fontSize: 11,
                '&:hover': { borderColor: COLORS.green, color: COLORS.green },
              }}
            >
              + Rápido
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setView('selector')}
              sx={{
                backgroundColor: COLORS.green,
                color: '#000',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#3da88a' },
              }}
            >
              🟢 Iniciar
            </Button>
          </Box>
        </Box>

        {/* Hoy */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}` }}>
          <Typography fontSize={12} color={COLORS.textMuted} mb={1.5} fontWeight={600}>
            📅 HOY
          </Typography>
          
          {/* Actividades trackeadas (GPS/Manual) */}
          {(() => {
            const today = new Date().toDateString();
            const todayTracked = trackedActivities.filter(a => 
              new Date(a.startedAt).toDateString() === today
            );
            
            const hasActivities = todayLogs.length > 0 || todayTracked.length > 0;
            
            if (!hasActivities) {
              return (
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
                    onClick={() => setShowModal(true)}
                    sx={{ mt: 1, color: COLORS.green }}
                  >
                    + Agregar actividad
                  </Button>
                </Box>
              );
            }
            
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Actividades trackeadas (GPS) */}
                {todayTracked.map((track) => {
                  const activityInfo = getTrackerActivityInfo(track.activityType);
                  const durationMin = Math.round((track.durationSeconds || 0) / 60);
                  const distanceKm = (Number(track.distanceMeters) || 0) / 1000;
                  
                  return (
                    <Box
                      key={`track-${track.id}`}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: `1px solid ${COLORS.green}33`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography fontSize={28}>{activityInfo.emoji}</Typography>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={600} color={COLORS.text}>
                              {activityInfo.label}
                            </Typography>
                            <Chip
                              label={track.trackingMode === 'gps' ? '📍 GPS' : '✋ Manual'}
                              size="small"
                              sx={{
                                backgroundColor: `${COLORS.green}22`,
                                color: COLORS.green,
                                fontSize: 9,
                                height: 18,
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                            <Typography fontSize={12} color={COLORS.textMuted}>
                              {formatTrackerDuration(track.durationSeconds || 0)}
                            </Typography>
                            {distanceKm > 0 && (
                              <Typography fontSize={12} color={COLORS.textMuted}>
                                • {distanceKm.toFixed(2)}km
                              </Typography>
                            )}
                            {track.caloriesBurned > 0 && (
                              <Typography fontSize={12} color={COLORS.orange}>
                                • {track.caloriesBurned} kcal
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
                
                {/* Actividades del cardio-log antiguo */}
                {todayLogs.map((log) => {
                  const activity = getActivityInfo(log.activityType);
                  const intensity = getIntensityInfo(log.intensity);
                  return (
                    <Box
                      key={`log-${log.id}`}
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
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                            <Typography fontSize={12} color={COLORS.textMuted}>
                              {formatDuration(log.durationMinutes)}
                            </Typography>
                            {log.distanceKm && (
                              <Typography fontSize={12} color={COLORS.textMuted}>
                                • {log.distanceKm}km
                              </Typography>
                            )}
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
            );
          })()}
        </Box>

        {/* Resumen semanal */}
        <Box sx={{ p: 2 }}>
          <Typography fontSize={12} color={COLORS.textMuted} mb={1.5} fontWeight={600}>
            📊 ESTA SEMANA
          </Typography>
          
          {weekSummary && weekSummary.totalSessions > 0 ? (
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

              {/* Desglose por actividad */}
              {Object.keys(weekSummary.byActivity || {}).length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
      </Box>

      {/* Modal */}
      {showModal && (
        <AddCardioModal
          studentId={studentId}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default CardioSection;

