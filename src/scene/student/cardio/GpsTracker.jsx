import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Chip } from '@mui/material';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  startActivity,
  addPointsBatch,
  finishActivity,
  cancelActivity,
  getInProgress,
  getDistanceMeters,
  formatDuration,
  calculatePace,
  estimateCalories,
  getActivityInfo,
} from '../../../api/activityTrackerApi';

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const COLORS = {
  card: '#16213e',
  border: 'rgba(255,255,255,0.1)',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.7)',
  green: '#4cceac',
  orange: '#ff9800',
  red: '#ef4444',
  blue: '#6870fa',
};

// Componente para actualizar el centro del mapa
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const GpsTracker = ({ studentId, activityType, onFinish, onCancel }) => {
  const activityInfo = getActivityInfo(activityType);
  
  // Estados
  const [status, setStatus] = useState('waiting'); // waiting, tracking, paused, finishing, starting
  const [gpsStatus, setGpsStatus] = useState('searching'); // searching, ready, error
  const [error, setError] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [trackId, setTrackId] = useState(null);
  const [points, setPoints] = useState([]);
  const [pendingPoints, setPendingPoints] = useState([]);
  
  // Estado para actividad en progreso existente
  const [existingActivity, setExistingActivity] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  
  // Stats
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  
  // Refs
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const syncIntervalRef = useRef(null);
  
  // Timestamp de inicio para calcular tiempo real (funciona en segundo plano)
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0); // Tiempo acumulado antes de pausar

  // Verificar si hay actividad en progreso al cargar
  useEffect(() => {
    const checkExistingActivity = async () => {
      try {
        setCheckingExisting(true);
        const activity = await getInProgress(studentId);
        if (activity) {
          setExistingActivity(activity);
        }
      } catch (err) {
        // No hay actividad en progreso (404) - esto es normal
        console.log('No hay actividad en progreso');
      } finally {
        setCheckingExisting(false);
      }
    };
    
    checkExistingActivity();
  }, [studentId]);

  // Cancelar actividad existente
  const handleCancelExisting = async () => {
    if (!existingActivity) return;
    
    try {
      await cancelActivity(existingActivity.id);
      setExistingActivity(null);
    } catch (err) {
      console.error('Error cancelando actividad:', err);
      setError('Error al cancelar la actividad existente');
    }
  };

  // Guardar y finalizar actividad existente
  const handleSaveExisting = async () => {
    if (!existingActivity) return;
    
    try {
      // Calcular duración aproximada
      const startTime = new Date(existingActivity.startedAt);
      const now = new Date();
      const durationSeconds = Math.round((now.getTime() - startTime.getTime()) / 1000);
      
      // Usar datos que tenga la actividad
      await finishActivity(existingActivity.id, {
        durationSeconds: Math.min(durationSeconds, 7200), // Máximo 2 horas
        distanceMeters: existingActivity.distanceMeters || 0,
        avgSpeedKmh: existingActivity.avgSpeedKmh || 0,
        maxSpeedKmh: existingActivity.maxSpeedKmh || 0,
        caloriesBurned: existingActivity.caloriesBurned || 0,
      });
      
      setExistingActivity(null);
      // Notificar que se guardó
      if (onFinish) {
        onFinish({ saved: true, fromExisting: true });
      }
    } catch (err) {
      console.error('Error guardando actividad:', err);
      setError('Error al guardar la actividad');
    }
  };

  // Obtener posición inicial
  useEffect(() => {
    if (navigator.geolocation) {
      setGpsStatus('searching');
      
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy: acc, speed } = position.coords;
          setCurrentPosition([latitude, longitude]);
          setAccuracy(Math.round(acc));
          if (speed) setCurrentSpeed(speed * 3.6); // m/s a km/h
          setGpsStatus('ready');
        },
        (error) => {
          console.error('GPS Error:', error);
          setGpsStatus('error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setGpsStatus('error');
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  // Agregar punto cuando cambia la posición durante tracking
  useEffect(() => {
    if (status === 'tracking' && currentPosition) {
      const newPoint = {
        latitude: currentPosition[0],
        longitude: currentPosition[1],
        timestamp: new Date().toISOString(),
        speed: currentSpeed / 3.6, // km/h a m/s
        accuracy,
      };
      
      setPoints(prev => [...prev, newPoint]);
      setPendingPoints(prev => [...prev, newPoint]);
      
      // Calcular distancia
      if (points.length > 0) {
        const lastPoint = points[points.length - 1];
        const dist = getDistanceMeters(
          lastPoint.latitude, lastPoint.longitude,
          currentPosition[0], currentPosition[1]
        );
        // Solo agregar si es > 2m (filtrar ruido)
        if (dist > 2) {
          setDistanceMeters(prev => prev + dist);
        }
      }
      
      // Actualizar max speed
      if (currentSpeed > maxSpeed) {
        setMaxSpeed(currentSpeed);
      }
    }
  }, [currentPosition, status]);

  // Timer basado en timestamps (funciona aunque la app esté en segundo plano)
  useEffect(() => {
    if (status === 'tracking') {
      // Calcular tiempo real basado en timestamps
      const updateTimer = () => {
        if (startTimeRef.current) {
          const now = Date.now();
          const elapsed = Math.floor((now - startTimeRef.current) / 1000) + pausedTimeRef.current;
          setElapsedSeconds(elapsed);
        }
      };
      
      // Actualizar inmediatamente y luego cada segundo
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      
      // También actualizar cuando la app vuelve a primer plano
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          updateTimer();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(timerRef.current);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  // Sync puntos al backend cada 10 segundos
  useEffect(() => {
    if (status === 'tracking' && trackId) {
      syncIntervalRef.current = setInterval(async () => {
        if (pendingPoints.length > 0) {
          try {
            await addPointsBatch(trackId, pendingPoints);
            setPendingPoints([]);
          } catch (err) {
            console.error('Error syncing points:', err);
          }
        }
      }, 10000);
    }
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [status, trackId, pendingPoints]);

  // Iniciar actividad
  const handleStart = async () => {
    try {
      setError(null);
      setStatus('starting');
      console.log('Iniciando actividad...', { studentId, activityType, currentPosition });
      
      const result = await startActivity(studentId, {
        activityType,
        trackingMode: 'gps',
        latitude: currentPosition?.[0],
        longitude: currentPosition?.[1],
      });
      
      console.log('Actividad iniciada:', result);
      setTrackId(result.id);
      
      // Guardar timestamp de inicio para calcular tiempo real
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      
      setStatus('tracking');
    } catch (err) {
      console.error('Error starting activity:', err);
      setError(err.message || 'Error al iniciar actividad');
      setStatus('waiting');
    }
  };

  // Finalizar actividad
  const handleFinish = async () => {
    setStatus('finishing');
    
    // Sync puntos pendientes
    if (pendingPoints.length > 0 && trackId) {
      try {
        await addPointsBatch(trackId, pendingPoints);
      } catch (err) {
        console.error('Error syncing final points:', err);
      }
    }
    
    // Calcular stats finales
    const avgSpeedKmh = elapsedSeconds > 0 
      ? (distanceMeters / 1000) / (elapsedSeconds / 3600)
      : 0;
    
    const calories = estimateCalories(activityType, elapsedSeconds / 60);
    
    try {
      await finishActivity(trackId, {
        durationSeconds: elapsedSeconds,
        distanceMeters: Math.round(distanceMeters),
        avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
        maxSpeedKmh: Math.round(maxSpeed * 10) / 10,
        caloriesBurned: calories,
      });
      
      onFinish({
        duration: elapsedSeconds,
        distance: distanceMeters,
        calories,
        points,
      });
    } catch (err) {
      console.error('Error finishing activity:', err);
      setStatus('tracking');
    }
  };

  // Cancelar
  const handleCancel = async () => {
    if (trackId) {
      try {
        await cancelActivity(trackId);
      } catch (err) {
        console.error('Error canceling:', err);
      }
    }
    onCancel();
  };

  // Calcular stats para mostrar
  const pace = calculatePace(distanceMeters, elapsedSeconds);
  const calories = estimateCalories(activityType, elapsedSeconds / 60);

  // Determinar color de GPS
  const gpsColor = gpsStatus === 'ready' 
    ? (accuracy <= 30 ? COLORS.green : accuracy <= 100 ? COLORS.orange : COLORS.red)
    : (gpsStatus === 'error' ? COLORS.red : COLORS.orange);

  // Mostrar pantalla de verificación
  if (checkingExisting) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}>
        <CircularProgress sx={{ color: COLORS.orange, mb: 2 }} />
        <Typography color={COLORS.text}>Verificando actividades...</Typography>
      </Box>
    );
  }

  // Mostrar pantalla de actividad existente
  if (existingActivity) {
    const existingInfo = getActivityInfo(existingActivity.activityType);
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        p: 3,
      }}>
        <Box sx={{
          background: `linear-gradient(135deg, ${COLORS.orange}22 0%, transparent 100%)`,
          border: `2px solid ${COLORS.orange}`,
          borderRadius: 3,
          p: 3,
          mb: 3,
        }}>
          <Typography fontSize={40} textAlign="center" mb={2}>⚠️</Typography>
          <Typography 
            variant="h6" 
            color={COLORS.orange} 
            textAlign="center" 
            fontWeight={700}
            mb={2}
          >
            Actividad en Progreso
          </Typography>
          <Typography color={COLORS.textMuted} textAlign="center" mb={3}>
            Ya tenés una actividad sin finalizar. ¿Qué querés hacer?
          </Typography>
          
          {/* Info de la actividad existente */}
          <Box sx={{
            background: COLORS.card,
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography fontSize={32}>{existingInfo.emoji}</Typography>
              <Box>
                <Typography color={COLORS.text} fontWeight={600}>
                  {existingInfo.label}
                </Typography>
                <Typography color={COLORS.textMuted} fontSize={12}>
                  Iniciada: {new Date(existingActivity.startedAt).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Box>
            {existingActivity.distanceMeters > 0 && (
              <Typography color={COLORS.textMuted} fontSize={13}>
                Distancia: {(existingActivity.distanceMeters / 1000).toFixed(2)} km
              </Typography>
            )}
          </Box>
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Guardar lo que hay */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSaveExisting}
            sx={{
              py: 1.5,
              background: COLORS.green,
              '&:hover': { background: '#3db897' },
              fontWeight: 700,
            }}
          >
            💾 Guardar y Finalizar
          </Button>
          
          {/* Cancelar y empezar nueva */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleCancelExisting}
            sx={{
              py: 1.5,
              background: COLORS.red,
              '&:hover': { background: '#dc2626' },
              fontWeight: 700,
            }}
          >
            🗑️ Descartar y Empezar Nueva
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            onClick={onCancel}
            sx={{
              py: 1.5,
              borderColor: COLORS.textMuted,
              color: COLORS.text,
            }}
          >
            ← Volver
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: status === 'tracking' 
        ? `linear-gradient(180deg, ${activityInfo.color}15 0%, transparent 30%)`
        : 'transparent',
    }}>
      {/* Header compacto */}
      <Box sx={{ 
        p: 1.5, 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Info actividad */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${activityInfo.color}33 0%, ${activityInfo.color}11 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${activityInfo.color}44`,
          }}>
            <Typography fontSize={22}>{activityInfo.emoji}</Typography>
          </Box>
          <Box>
            <Typography fontWeight={700} color={COLORS.text} fontSize={15}>
              {activityInfo.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: status === 'tracking' ? COLORS.green : status === 'starting' ? COLORS.orange : COLORS.textMuted,
                animation: (status === 'tracking' || status === 'starting') ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                },
              }} />
              <Typography 
                fontSize={11} 
                color={status === 'tracking' ? COLORS.green : status === 'starting' ? COLORS.orange : COLORS.textMuted} 
                fontWeight={600}
              >
                {status === 'tracking' ? 'EN CURSO' : status === 'starting' ? 'INICIANDO...' : status === 'paused' ? 'PAUSADO' : 'LISTO'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* GPS Status */}
        <Box sx={{ 
          textAlign: 'center',
          p: 1,
          borderRadius: 2,
          backgroundColor: `${gpsColor}11`,
          border: `1px solid ${gpsColor}33`,
          minWidth: 70,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.3 }}>
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: gpsColor,
            }} />
            <Typography fontSize={9} color={COLORS.textMuted} fontWeight={600}>GPS</Typography>
          </Box>
          {gpsStatus === 'ready' && (
            <Typography fontSize={12} fontWeight={700} color={gpsColor}>
              {accuracy}m
            </Typography>
          )}
          {gpsStatus === 'searching' && (
            <Typography fontSize={10} color={COLORS.orange}>Buscando...</Typography>
          )}
          {gpsStatus === 'error' && (
            <Typography fontSize={10} color={COLORS.red}>Sin señal</Typography>
          )}
        </Box>
      </Box>

      {/* Timer grande - más prominente */}
      <Box sx={{ 
        textAlign: 'center', 
        py: 1.5,
        background: status === 'tracking' 
          ? `linear-gradient(180deg, rgba(76,206,172,0.08) 0%, transparent 100%)`
          : 'rgba(0,0,0,0.2)',
      }}>
        <Typography 
          sx={{ 
            fontSize: 48, 
            fontWeight: 800, 
            fontFamily: '"SF Mono", "Roboto Mono", monospace',
            color: status === 'tracking' ? COLORS.green : COLORS.text,
            letterSpacing: 4,
            textShadow: status === 'tracking' ? `0 0 30px ${COLORS.green}44` : 'none',
          }}
        >
          {formatDuration(elapsedSeconds)}
        </Typography>
        {status === 'waiting' && accuracy > 100 && (
          <Typography fontSize={11} color={COLORS.orange} mt={1}>
            📍 Precisión baja - Salí al aire libre
          </Typography>
        )}
      </Box>

      {/* Mapa */}
      <Box sx={{ flex: 1, minHeight: 150, position: 'relative' }}>
        {currentPosition ? (
          <MapContainer
            center={currentPosition}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <MapUpdater center={currentPosition} />
            
            {/* Recorrido */}
            {points.length > 1 && (
              <Polyline
                positions={points.map(p => [p.latitude, p.longitude])}
                color={activityInfo.color}
                weight={4}
              />
            )}
            
            {/* Posición actual */}
            <Marker position={currentPosition} />
          </MapContainer>
        ) : (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: `
              radial-gradient(circle at 50% 50%, rgba(104,112,250,0.1) 0%, transparent 70%),
              linear-gradient(180deg, rgba(22,33,62,0.8) 0%, rgba(10,15,30,0.9) 100%)
            `,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decoración de fondo */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: '2px dashed rgba(255,255,255,0.1)',
              animation: 'rotate 20s linear infinite',
              '@keyframes rotate': {
                '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
              },
            }} />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 140,
              height: 140,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.08)',
            }} />

            <Box sx={{ textAlign: 'center', p: 3, zIndex: 1 }}>
              {gpsStatus === 'error' ? (
                <>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: `${COLORS.red}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: `2px solid ${COLORS.red}44`,
                  }}>
                    <Typography fontSize={36}>📍</Typography>
                  </Box>
                  <Typography color={COLORS.red} fontWeight={700} mb={0.5}>
                    Sin acceso GPS
                  </Typography>
                  <Typography fontSize={12} color={COLORS.textMuted}>
                    Verificá los permisos de ubicación
                  </Typography>
                </>
              ) : (
                <>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: `${COLORS.green}11`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: `2px solid ${COLORS.green}33`,
                    animation: 'ping 2s infinite',
                    '@keyframes ping': {
                      '0%': { boxShadow: `0 0 0 0 ${COLORS.green}44` },
                      '70%': { boxShadow: `0 0 0 20px ${COLORS.green}00` },
                      '100%': { boxShadow: `0 0 0 0 ${COLORS.green}00` },
                    },
                  }}>
                    <Typography fontSize={36}>🛰️</Typography>
                  </Box>
                  <Typography color={COLORS.text} fontWeight={700} mb={0.5}>
                    Buscando satélites...
                  </Typography>
                  <Typography fontSize={12} color={COLORS.textMuted}>
                    Esto puede tardar unos segundos
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <CircularProgress size={20} sx={{ color: COLORS.green }} />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Stats */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: 0.5, 
        p: 1,
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
      }}>
        <Box sx={{ 
          textAlign: 'center',
          p: 0.5,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}>
          <Typography fontSize={18} fontWeight={800} color={COLORS.blue}>
            {(distanceMeters / 1000).toFixed(2)}
          </Typography>
          <Typography fontSize={8} color={COLORS.textMuted} fontWeight={600}>KM</Typography>
        </Box>
        <Box sx={{ 
          textAlign: 'center',
          p: 0.5,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}>
          <Typography fontSize={18} fontWeight={800} color={COLORS.text}>
            {pace || '--:--'}
          </Typography>
          <Typography fontSize={8} color={COLORS.textMuted} fontWeight={600}>RITMO</Typography>
        </Box>
        <Box sx={{ 
          textAlign: 'center',
          p: 0.5,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}>
          <Typography fontSize={18} fontWeight={800} color={COLORS.green}>
            {currentSpeed.toFixed(1)}
          </Typography>
          <Typography fontSize={8} color={COLORS.textMuted} fontWeight={600}>KM/H</Typography>
        </Box>
        <Box sx={{ 
          textAlign: 'center',
          p: 0.5,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}>
          <Typography fontSize={18} fontWeight={800} color={COLORS.orange}>
            {calories}
          </Typography>
          <Typography fontSize={8} color={COLORS.textMuted} fontWeight={600}>KCAL</Typography>
        </Box>
      </Box>

      {/* Error message */}
      {error && (
        <Box sx={{ 
          mx: 2, 
          mb: 1, 
          p: 1.5, 
          borderRadius: 2, 
          backgroundColor: `${COLORS.red}22`,
          border: `1px solid ${COLORS.red}44`,
        }}>
          <Typography fontSize={12} color={COLORS.red}>
            ⚠️ {error}
          </Typography>
        </Box>
      )}

      {/* Botones */}
      <Box sx={{ p: 1.5, display: 'flex', gap: 1.5, background: 'rgba(0,0,0,0.2)' }}>
        {(status === 'waiting' || status === 'starting') && (
          <>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={status === 'starting'}
              sx={{
                flex: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                color: COLORS.textMuted,
                borderRadius: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { 
                  borderColor: 'rgba(255,255,255,0.4)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              CANCELAR
            </Button>
            <Button
              variant="contained"
              onClick={handleStart}
              disabled={gpsStatus !== 'ready' || status === 'starting'}
              sx={{
                flex: 2,
                background: status === 'starting' 
                  ? 'rgba(76,206,172,0.3)'
                  : `linear-gradient(135deg, ${COLORS.green} 0%, #3da88a 100%)`,
                color: '#000',
                fontWeight: 700,
                fontSize: 16,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: status === 'starting' ? 'none' : `0 4px 20px ${COLORS.green}44`,
                '&:hover': { 
                  background: `linear-gradient(135deg, #3da88a 0%, ${COLORS.green} 100%)`,
                  boxShadow: `0 6px 25px ${COLORS.green}66`,
                },
                '&:disabled': { 
                  background: 'rgba(76,206,172,0.2)',
                  color: 'rgba(0,0,0,0.4)',
                  boxShadow: 'none',
                },
              }}
            >
              {status === 'starting' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} sx={{ color: '#000' }} />
                  <span>INICIANDO...</span>
                </Box>
              ) : (
                '▶ INICIAR'
              )}
            </Button>
          </>
        )}
        
        {status === 'tracking' && (
          <>
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{
                minWidth: 56,
                borderColor: COLORS.red,
                color: COLORS.red,
                borderRadius: 3,
                '&:hover': { backgroundColor: `${COLORS.red}22` },
              }}
            >
              ✕
            </Button>
            <Button
              variant="contained"
              onClick={handleFinish}
              sx={{
                flex: 1,
                background: `linear-gradient(135deg, ${COLORS.red} 0%, #dc2626 100%)`,
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: `0 4px 20px ${COLORS.red}44`,
                '&:hover': { 
                  background: `linear-gradient(135deg, #dc2626 0%, ${COLORS.red} 100%)`,
                  boxShadow: `0 6px 25px ${COLORS.red}66`,
                },
              }}
            >
              ■ FINALIZAR
            </Button>
          </>
        )}
        
        {status === 'finishing' && (
          <Box sx={{ flex: 1, textAlign: 'center', py: 2 }}>
            <CircularProgress size={30} sx={{ color: COLORS.green }} />
            <Typography color={COLORS.textMuted} mt={1} fontSize={13}>Guardando actividad...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GpsTracker;


