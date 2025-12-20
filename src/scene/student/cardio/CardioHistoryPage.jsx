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
import { useAuthStore } from '../../../hooks';
import {
  getActivities as getTrackedActivities,
  getActivityInfo as getTrackerActivityInfo,
  formatDuration as formatTrackerDuration,
  getActivityDetail,
} from '../../../api/activityTrackerApi';
import {
  getActivityInfo,
  formatDuration,
} from '../../../api/cardioApi';
import { financeApi } from '../../../api';
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

const CardioHistoryPage = () => {
  const navigate = useNavigate();
  const { student } = useAuthStore();
  const studentId = student?.id;

  const [trackedActivities, setTrackedActivities] = useState([]);
  const [cardioLogs, setCardioLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [activityDetail, setActivityDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadHistory();
    }
  }, [studentId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const [tracked, weekData] = await Promise.all([
        getTrackedActivities(studentId, 50).catch(() => []),
        financeApi.get(`/cardio/${studentId}/week`).then(r => r.data).catch(() => null),
      ]);
      setTrackedActivities(tracked || []);
      // Los logs vienen en el resumen semanal
      setCardioLogs(weekData?.logs || []);
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (trackId) => {
    setLoadingDetail(true);
    setShowDetail(true);
    try {
      const detail = await getActivityDetail(trackId);
      setActivityDetail(detail);
    } catch (err) {
      console.error('Error cargando detalle:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBack = () => {
    navigate('/student/cardio');
  };

  // Combinar y ordenar todas las actividades por fecha
  const allActivities = [
    ...trackedActivities.map(t => ({
      ...t,
      type: 'tracked',
      sortDate: new Date(t.startedAt),
    })),
    ...cardioLogs.map(l => ({
      ...l,
      type: 'log',
      sortDate: new Date(l.date),
    })),
  ].sort((a, b) => b.sortDate - a.sortDate);

  if (!studentId) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: COLORS.textMuted }}>
        Cargando...
      </Box>
    );
  }

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
            📜 Historial de Actividades
          </Typography>
          <Typography fontSize={12} color={COLORS.textMuted}>
            Todas tus actividades registradas
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ color: COLORS.green }} />
          </Box>
        ) : allActivities.length === 0 ? (
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {allActivities.map((activity, index) => {
              if (activity.type === 'tracked') {
                const activityInfo = getTrackerActivityInfo(activity.activityType);
                const durationMin = Math.round((activity.durationSeconds || 0) / 60);
                const distanceKm = (Number(activity.distanceMeters) || 0) / 1000;
                const date = new Date(activity.startedAt);

                return (
                  <Box
                    key={`tracked-${activity.id}`}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: COLORS.card,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography fontSize={32}>{activityInfo.emoji}</Typography>
                      <Box>
                        <Typography fontWeight={700} color={COLORS.text}>
                          {activityInfo.label}
                        </Typography>
                        <Typography fontSize={12} color={COLORS.textMuted} mb={0.5}>
                          {date.toLocaleString('es-AR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Typography fontSize={13} color={COLORS.green} fontWeight={600}>
                            ⏱️ {formatTrackerDuration(activity.durationSeconds || 0)}
                          </Typography>
                          {distanceKm > 0 && (
                            <Typography fontSize={13} color={COLORS.blue} fontWeight={600}>
                              📍 {distanceKm.toFixed(2)} km
                            </Typography>
                          )}
                          {activity.avgSpeedKmh > 0 && (
                            <Typography fontSize={13} color={COLORS.orange} fontWeight={600}>
                              ⚡ {activity.avgSpeedKmh.toFixed(1)} km/h
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    {activity.trackingMode === 'gps' && (
                      <Button
                        size="small"
                        onClick={() => handleViewDetail(activity.id)}
                        sx={{
                          minWidth: 'auto',
                          color: COLORS.green,
                          fontWeight: 600,
                          '&:hover': { backgroundColor: `${COLORS.green}22` },
                        }}
                      >
                        🗺️ Mapa
                      </Button>
                    )}
                  </Box>
                );
              } else {
                // Cardio log (pasos manuales, etc)
                const activityInfo = getActivityInfo(activity.activityType);
                const date = new Date(activity.date);

                return (
                  <Box
                    key={`log-${activity.id}`}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: COLORS.card,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography fontSize={32}>{activityInfo.emoji}</Typography>
                    <Box>
                      <Typography fontWeight={700} color={COLORS.text}>
                        {activityInfo.label}
                      </Typography>
                      <Typography fontSize={12} color={COLORS.textMuted} mb={0.5}>
                        {date.toLocaleString('es-AR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long',
                        })}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {activity.durationMinutes > 0 && (
                          <Typography fontSize={13} color={COLORS.green} fontWeight={600}>
                            ⏱️ {formatDuration(activity.durationMinutes)}
                          </Typography>
                        )}
                        {activity.steps > 0 && (
                          <Typography fontSize={13} color={COLORS.green} fontWeight={600}>
                            👟 {activity.steps.toLocaleString()} pasos
                          </Typography>
                        )}
                        {activity.distanceKm > 0 && (
                          <Typography fontSize={13} color={COLORS.blue} fontWeight={600}>
                            📍 {activity.distanceKm} km
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              }
            })}
          </Box>
        )}
      </Box>

      {/* Modal de Detalle con Mapa */}
      {showDetail && (
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
          {/* Header */}
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
              onClick={() => { setShowDetail(false); setActivityDetail(null); }}
              sx={{ color: COLORS.text }}
            >
              ✕
            </IconButton>
          </Box>

          {/* Mapa */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            {loadingDetail ? (
              <Box sx={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: COLORS.background,
              }}>
                <CircularProgress sx={{ color: COLORS.green }} />
              </Box>
            ) : activityDetail?.points?.length > 0 ? (
              <MapContainer
                center={[
                  activityDetail.points[0].latitude,
                  activityDetail.points[0].longitude
                ]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Polyline
                  positions={activityDetail.points.map(p => [p.latitude, p.longitude])}
                  color={COLORS.green}
                  weight={4}
                />
                {/* Marcador inicio */}
                <Marker position={[
                  activityDetail.points[0].latitude,
                  activityDetail.points[0].longitude
                ]} />
                {/* Marcador fin */}
                <Marker position={[
                  activityDetail.points[activityDetail.points.length - 1].latitude,
                  activityDetail.points[activityDetail.points.length - 1].longitude
                ]} />
              </MapContainer>
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: COLORS.background,
              }}>
                <Typography color={COLORS.textMuted}>
                  Sin datos de ruta disponibles
                </Typography>
              </Box>
            )}
          </Box>

          {/* Stats footer */}
          {activityDetail && (
            <Box sx={{ 
              p: 2, 
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'space-around',
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={20} fontWeight={700} color={COLORS.green}>
                  {formatTrackerDuration(activityDetail.durationSeconds || 0)}
                </Typography>
                <Typography fontSize={10} color={COLORS.textMuted}>Duración</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={20} fontWeight={700} color={COLORS.blue}>
                  {((activityDetail.distanceMeters || 0) / 1000).toFixed(2)} km
                </Typography>
                <Typography fontSize={10} color={COLORS.textMuted}>Distancia</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={20} fontWeight={700} color={COLORS.orange}>
                  {(activityDetail.avgSpeedKmh || 0).toFixed(1)} km/h
                </Typography>
                <Typography fontSize={10} color={COLORS.textMuted}>Vel. media</Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CardioHistoryPage;

