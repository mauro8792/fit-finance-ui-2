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
import ActivitySelector from './ActivitySelector';
import GpsTracker from './GpsTracker';
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
import {
  getActivities as getTrackedActivities,
  getActivityInfo as getTrackerActivityInfo,
  formatDuration as formatTrackerDuration,
  getActivityDetail,
  getWeeklySummary as getTrackedWeeklySummary,
  getInProgress,
  cancelActivity,
  finishActivity,
} from '../../../api/activityTrackerApi';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
  
  // Estados para el nuevo tracker
  const [view, setView] = useState('main'); // main, selector, gps, indoor, indoorChoice, indoorTracker
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Estado para ver detalle de actividad con mapa
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [activityDetail, setActivityDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Estado para actividad en progreso pendiente
  const [pendingActivity, setPendingActivity] = useState(null);
  
  // Función para ver detalle de actividad
  const handleViewDetail = async (trackId) => {
    setLoadingDetail(true);
    setShowActivityDetail(true);
    try {
      const detail = await getActivityDetail(trackId);
      setActivityDetail(detail);
    } catch (err) {
      console.error('Error cargando detalle:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Verificar si hay actividad en progreso
      const inProgress = await getInProgress(studentId).catch(() => null);
      setPendingActivity(inProgress);
      
      const [today, weekCardio, tracked, weekTracked] = await Promise.all([
        getTodayCardio(studentId).catch(() => []),
        getWeeklyCardio(studentId).catch(() => null),
        getTrackedActivities(studentId, 10).catch(() => []),
        getTrackedWeeklySummary(studentId).catch(() => null),
      ]);
      setTodayLogs(today || []);
      setTrackedActivities(tracked || []);
      
      // Combinar resúmenes semanales de cardio-log y activity-tracker
      const combinedWeek = combineWeeklySummaries(weekCardio, weekTracked);
      setWeekSummary(combinedWeek);
    } catch (err) {
      console.error('Error cargando datos de cardio:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para combinar resúmenes semanales
  const combineWeeklySummaries = (cardioLog, tracked) => {
    if (!cardioLog && !tracked) return null;
    
    const totalSessions = (cardioLog?.totalSessions || 0) + (tracked?.totalActivities || 0);
    const totalMinutes = (cardioLog?.totalMinutes || 0) + (tracked?.totalDurationMinutes || 0);
    const totalDistance = (cardioLog?.totalDistance || 0) + (tracked?.totalDistanceKm || 0);
    const totalCalories = (cardioLog?.totalCalories || 0) + (tracked?.totalCalories || 0);
    
    // Combinar por tipo de actividad
    const byActivity = {};
    
    // Del cardio-log
    if (cardioLog?.byActivity) {
      Object.entries(cardioLog.byActivity).forEach(([type, data]) => {
        byActivity[type] = { 
          count: data.count || 0, 
          minutes: data.minutes || 0,
          distance: data.distance || 0,
        };
      });
    }
    
    // Del activity-tracker
    if (tracked?.byType) {
      Object.entries(tracked.byType).forEach(([type, data]) => {
        if (byActivity[type]) {
          byActivity[type].count += data.count || 0;
          byActivity[type].minutes += Math.round((data.duration || 0) / 60);
          byActivity[type].distance += (data.distance || 0) / 1000;
        } else {
          byActivity[type] = {
            count: data.count || 0,
            minutes: Math.round((data.duration || 0) / 60),
            distance: (data.distance || 0) / 1000,
          };
        }
      });
    }
    
    if (totalSessions === 0) return null;
    
    return {
      totalSessions,
      totalMinutes,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalCalories,
      byActivity,
    };
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
    setView('indoorChoice'); // Mostrar opciones: cronómetro vs manual
  };
  
  // Handlers para la elección de cronómetro vs manual
  const handleChooseTimer = () => {
    setView('indoorTracker');
  };
  
  const handleChooseManual = () => {
    setView('indoor');
  };
  
  // Handlers para actividad pendiente
  const handleSavePending = async () => {
    if (!pendingActivity) return;
    try {
      const startTime = new Date(pendingActivity.startedAt);
      const now = new Date();
      const durationSeconds = Math.round((now.getTime() - startTime.getTime()) / 1000);
      
      await finishActivity(pendingActivity.id, {
        durationSeconds: Math.min(durationSeconds, 7200),
        distanceMeters: pendingActivity.distanceMeters || 0,
        avgSpeedKmh: pendingActivity.avgSpeedKmh || 0,
        maxSpeedKmh: pendingActivity.maxSpeedKmh || 0,
        caloriesBurned: pendingActivity.caloriesBurned || 0,
      });
      setPendingActivity(null);
      loadData();
    } catch (err) {
      console.error('Error guardando:', err);
    }
  };

  const handleCancelPending = async () => {
    if (!pendingActivity) return;
    try {
      await cancelActivity(pendingActivity.id);
      setPendingActivity(null);
    } catch (err) {
      console.error('Error cancelando:', err);
    }
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

  // Vista de elección: Cronómetro vs Manual - Pantalla completa
  if (view === 'indoorChoice') {
    const activityInfo = getTrackerActivityInfo(selectedActivity);
    return (
      <Box sx={{ 
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(180deg, ${COLORS.background} 0%, #0f0f1a 100%)`,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        p: 3,
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <Typography fontSize={28}>{activityInfo?.emoji}</Typography>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" color={COLORS.text}>
              {activityInfo?.name}
            </Typography>
            <Typography color={COLORS.textMuted}>
              ¿Cómo querés registrar la actividad?
            </Typography>
          </Box>
        </Box>

        {/* Opciones */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Opción Cronómetro */}
          <Button
            onClick={handleChooseTimer}
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(255,152,0,0.15) 0%, rgba(255,152,0,0.05) 100%)',
              border: '2px solid rgba(255,152,0,0.4)',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(255,152,0,0.25) 0%, rgba(255,152,0,0.1) 100%)',
                borderColor: '#ff9800',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography fontSize={32} mr={1.5}>⏱️</Typography>
              <Typography variant="h6" fontWeight="bold" color={COLORS.text}>
                Usar Cronómetro
              </Typography>
            </Box>
            <Typography color={COLORS.textMuted} fontSize={14}>
              Iniciá el cronómetro y registrá el tiempo exacto de tu actividad en tiempo real.
              Ideal para cuando estás por empezar.
            </Typography>
            <Chip 
              label="⭐ Recomendado" 
              size="small" 
              sx={{ 
                mt: 2, 
                backgroundColor: 'rgba(255,152,0,0.3)', 
                color: '#ff9800',
                fontWeight: 'bold',
              }} 
            />
          </Button>

          {/* Opción Manual */}
          <Button
            onClick={handleChooseManual}
            sx={{
              p: 3,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
              '&:hover': {
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography fontSize={32} mr={1.5}>✍️</Typography>
              <Typography variant="h6" fontWeight="bold" color={COLORS.text}>
                Registro Manual
              </Typography>
            </Box>
            <Typography color={COLORS.textMuted} fontSize={14}>
              Ingresá los datos manualmente: duración, distancia, calorías.
              Útil para registrar actividades pasadas.
            </Typography>
          </Button>
        </Box>

        {/* Botón cancelar */}
        <Button
          onClick={() => setView('selector')}
          sx={{
            mt: 2,
            color: COLORS.textMuted,
            '&:hover': { color: COLORS.text },
          }}
        >
          ← Volver a elegir actividad
        </Button>
      </Box>
    );
  }

  // Vista del Tracker Indoor (cronómetro) - Pantalla completa
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
          onComplete={handleTrackerFinish}
          onCancel={handleTrackerCancel}
        />
      </Box>
    );
  }

  // Vista de formulario Indoor (manual) - Pantalla completa
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

        {/* Alerta de actividad pendiente */}
        {pendingActivity && (
          <Box sx={{ 
            p: 2, 
            background: `linear-gradient(135deg, ${COLORS.orange}22 0%, transparent 100%)`,
            borderBottom: `2px solid ${COLORS.orange}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Typography fontSize={28}>
                {getTrackerActivityInfo(pendingActivity.activityType)?.emoji || '🏃'}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700} color={COLORS.orange}>
                  Actividad en Progreso
                </Typography>
                <Typography fontSize={12} color={COLORS.textMuted}>
                  {getTrackerActivityInfo(pendingActivity.activityType)?.label || pendingActivity.activityType}
                </Typography>
                <Typography fontSize={11} color={COLORS.textMuted}>
                  Iniciada: {new Date(pendingActivity.startedAt).toLocaleString('es-AR', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                  })}
                  {' · '}
                  <Typography component="span" color={COLORS.green} fontWeight={600}>
                    {(() => {
                      const elapsed = Math.floor((Date.now() - new Date(pendingActivity.startedAt).getTime()) / 1000);
                      const hrs = Math.floor(elapsed / 3600);
                      const mins = Math.floor((elapsed % 3600) / 60);
                      if (hrs > 0) return `${hrs}h ${mins}min transcurridos`;
                      return `${mins}min transcurridos`;
                    })()}
                  </Typography>
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Botón VER MAPA - Principal */}
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  setSelectedActivity(pendingActivity.activityType);
                  setView('gps');
                }}
                sx={{ 
                  bgcolor: COLORS.orange, 
                  flex: 2,
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#e68a00' }
                }}
              >
                🗺️ Ver Mapa
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSavePending}
                sx={{ 
                  bgcolor: COLORS.green, 
                  flex: 1,
                  '&:hover': { bgcolor: '#3db897' }
                }}
              >
                💾 Guardar
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleCancelPending}
                sx={{ 
                  bgcolor: COLORS.red, 
                  flex: 1,
                  '&:hover': { bgcolor: '#dc2626' }
                }}
              >
                🗑️ Descartar
              </Button>
            </Box>
          </Box>
        )}

        {/* Hoy */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}` }}>
          <Typography fontSize={12} color={COLORS.textMuted} mb={1.5} fontWeight={600}>
            📅 HOY
          </Typography>
          
          {/* Actividades trackeadas (GPS/Manual) */}
          {(() => {
            // Usar fecha local para comparación
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);
            
            const todayTracked = trackedActivities.filter(a => {
              const activityDate = new Date(a.startedAt);
              return activityDate >= todayStart && activityDate < todayEnd;
            });
            
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
                    onClick={() => setView('selector')}
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
                      {/* Botón ver detalle si es GPS */}
                      {track.trackingMode === 'gps' && (
                        <Button
                          size="small"
                          onClick={() => handleViewDetail(track.id)}
                          sx={{
                            minWidth: 'auto',
                            color: COLORS.green,
                            fontSize: 11,
                            '&:hover': { backgroundColor: `${COLORS.green}22` },
                          }}
                        >
                          🗺️ Ver
                        </Button>
                      )}
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

        {/* Historial de actividades GPS */}
        {trackedActivities.length > 0 && (
          <Box sx={{ p: 2 }}>
            <Typography fontSize={12} color={COLORS.textMuted} mb={1.5} fontWeight={600}>
              📜 HISTORIAL DE RECORRIDOS
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {trackedActivities.map((track) => {
                const activityInfo = getTrackerActivityInfo(track.activityType);
                const durationMin = Math.round((track.durationSeconds || 0) / 60);
                const distanceKm = (Number(track.distanceMeters) || 0) / 1000;
                // La fecha viene en UTC, toLocaleString la convierte a hora local
                const date = new Date(track.startedAt);
                
                return (
                  <Box
                    key={`history-${track.id}`}
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
                      <Typography fontSize={24}>{activityInfo.emoji}</Typography>
                      <Box>
                        <Typography fontWeight={600} color={COLORS.text} fontSize={13}>
                          {activityInfo.label}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography fontSize={11} color={COLORS.textMuted}>
                            {date.toLocaleString('es-AR', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </Typography>
                          <Typography fontSize={11} color={COLORS.green}>
                            {formatTrackerDuration(track.durationSeconds || 0)}
                          </Typography>
                          {distanceKm > 0 && (
                            <Typography fontSize={11} color={COLORS.blue}>
                              {distanceKm.toFixed(2)}km
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    {track.trackingMode === 'gps' && (
                      <Button
                        size="small"
                        onClick={() => handleViewDetail(track.id)}
                        sx={{
                          minWidth: 'auto',
                          color: COLORS.green,
                          fontSize: 11,
                          '&:hover': { backgroundColor: `${COLORS.green}22` },
                        }}
                      >
                        🗺️ Ver
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* Modal de Detalle con Mapa - Estilo App Real */}
      {showActivityDetail && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1400,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: COLORS.card,
          }}
        >
          {/* Header compacto */}
          <Box sx={{ 
            p: 1.5, 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.5)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography fontSize={24}>
                {activityDetail ? getTrackerActivityInfo(activityDetail.activityType).emoji : '🏃'}
              </Typography>
              <Box>
                <Typography fontWeight={700} color={COLORS.text} fontSize={14}>
                  {activityDetail ? getTrackerActivityInfo(activityDetail.activityType).label : 'Cargando...'}
                </Typography>
                {activityDetail && (
                  <Typography fontSize={11} color={COLORS.textMuted}>
                    {new Date(activityDetail.startedAt).toLocaleDateString('es-AR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton
              onClick={() => {
                setShowActivityDetail(false);
                setActivityDetail(null);
              }}
              sx={{ color: COLORS.text }}
            >
              ✕
            </IconButton>
          </Box>

          {/* Mapa (ocupa todo el fondo) */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            {loadingDetail ? (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(180deg, rgba(22,33,62,0.9) 0%, rgba(10,15,30,0.95) 100%)',
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={40} sx={{ color: COLORS.green, mb: 2 }} />
                  <Typography color={COLORS.textMuted}>Cargando recorrido...</Typography>
                </Box>
              </Box>
            ) : activityDetail?.points?.length > 0 ? (
              <>
                <MapContainer
                  center={[
                    parseFloat(activityDetail.points[Math.floor(activityDetail.points.length / 2)].latitude),
                    parseFloat(activityDetail.points[Math.floor(activityDetail.points.length / 2)].longitude)
                  ]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CartoDB'
                  />
                  {/* Recorrido con gradiente */}
                  <Polyline
                    positions={activityDetail.points.map(p => [
                      parseFloat(p.latitude),
                      parseFloat(p.longitude)
                    ])}
                    color={COLORS.green}
                    weight={5}
                    opacity={0.9}
                  />
                  {/* Marcador Inicio */}
                  <Marker position={[
                    parseFloat(activityDetail.points[0].latitude),
                    parseFloat(activityDetail.points[0].longitude)
                  ]} />
                  {/* Marcador Fin */}
                  <Marker position={[
                    parseFloat(activityDetail.points[activityDetail.points.length - 1].latitude),
                    parseFloat(activityDetail.points[activityDetail.points.length - 1].longitude)
                  ]} />
                </MapContainer>

                {/* Panel de stats superpuesto */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.95) 100%)',
                  p: 2,
                  pt: 4,
                  zIndex: 1000,
                }}>
                  {/* Stats principales */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 2,
                    mb: 2,
                  }}>
                    {/* Distancia - Grande */}
                    <Box sx={{ 
                      textAlign: 'center',
                      p: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${COLORS.green}22 0%, ${COLORS.green}11 100%)`,
                      border: `1px solid ${COLORS.green}44`,
                    }}>
                      <Typography fontSize={36} fontWeight={800} color={COLORS.green}>
                        {((Number(activityDetail.distanceMeters) || 0) / 1000).toFixed(2)}
                      </Typography>
                      <Typography fontSize={12} color={COLORS.textMuted} fontWeight={600}>
                        KILÓMETROS
                      </Typography>
                    </Box>
                    {/* Tiempo - Grande */}
                    <Box sx={{ 
                      textAlign: 'center',
                      p: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${COLORS.blue}22 0%, ${COLORS.blue}11 100%)`,
                      border: `1px solid ${COLORS.blue}44`,
                    }}>
                      <Typography fontSize={36} fontWeight={800} color={COLORS.blue}>
                        {formatTrackerDuration(activityDetail.durationSeconds || 0)}
                      </Typography>
                      <Typography fontSize={12} color={COLORS.textMuted} fontWeight={600}>
                        TIEMPO
                      </Typography>
                    </Box>
                  </Box>

                  {/* Stats secundarios */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: 1,
                  }}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography fontSize={18} fontWeight={700} color={COLORS.text}>
                        {(() => {
                          const dist = (Number(activityDetail.distanceMeters) || 0) / 1000;
                          const dur = (activityDetail.durationSeconds || 0) / 60;
                          if (dist === 0) return '--:--';
                          const pace = dur / dist;
                          const mins = Math.floor(pace);
                          const secs = Math.round((pace - mins) * 60);
                          return `${mins}:${secs.toString().padStart(2, '0')}`;
                        })()}
                      </Typography>
                      <Typography fontSize={9} color={COLORS.textMuted}>RITMO /km</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography fontSize={18} fontWeight={700} color={COLORS.text}>
                        {activityDetail.avgSpeedKmh || 0}
                      </Typography>
                      <Typography fontSize={9} color={COLORS.textMuted}>KM/H PROM</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography fontSize={18} fontWeight={700} color={COLORS.text}>
                        {activityDetail.maxSpeedKmh || 0}
                      </Typography>
                      <Typography fontSize={9} color={COLORS.textMuted}>KM/H MÁX</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography fontSize={18} fontWeight={700} color={COLORS.orange}>
                        {activityDetail.caloriesBurned || 0}
                      </Typography>
                      <Typography fontSize={9} color={COLORS.textMuted}>KCAL</Typography>
                    </Box>
                  </Box>

                  {/* Indicadores de inicio/fin */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 3, 
                    mt: 2,
                    pt: 2,
                    borderTop: `1px solid ${COLORS.border}`,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: COLORS.green,
                        boxShadow: `0 0 8px ${COLORS.green}`,
                      }} />
                      <Typography fontSize={11} color={COLORS.textMuted}>Inicio</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: COLORS.red,
                        boxShadow: `0 0 8px ${COLORS.red}`,
                      }} />
                      <Typography fontSize={11} color={COLORS.textMuted}>Fin</Typography>
                    </Box>
                    <Typography fontSize={11} color={COLORS.textMuted}>
                      📍 {activityDetail.points.length} puntos GPS
                    </Typography>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(180deg, rgba(22,33,62,0.9) 0%, rgba(10,15,30,0.95) 100%)',
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography fontSize={48} mb={2}>🗺️</Typography>
                  <Typography color={COLORS.textMuted} mb={1}>
                    No hay datos de recorrido GPS
                  </Typography>
                  <Typography fontSize={12} color={COLORS.textMuted}>
                    Esta actividad no tiene puntos registrados
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default CardioSection;

