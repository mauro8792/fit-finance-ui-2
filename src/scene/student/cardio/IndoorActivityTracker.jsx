import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Fade,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { getActivityInfo, INDOOR_ACTIVITIES, estimateSteps, saveManualSteps } from '../../../api/activityTrackerApi';
import { createCardio } from '../../../api/cardioApi';

const COLORS = {
  background: '#0a0a12',
  card: '#1a1a2e',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.6)',
  orange: '#ff9800',
  orangeGlow: 'rgba(255, 152, 0, 0.3)',
  green: '#4cceac',
  red: '#ef4444',
  blue: '#6870fa',
};

const IndoorActivityTracker = ({ studentId, activityType, onComplete, onCancel }) => {
  const activityInfo = getActivityInfo(activityType);
  const activityConfig = INDOOR_ACTIVITIES[activityType];
  
  // Estados del cronómetro
  const [status, setStatus] = useState('ready'); // ready, running, paused, finished
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);
  
  // Para calcular tiempo real (funciona en segundo plano)
  const startTimestampRef = useRef(null);
  const pausedTimeRef = useRef(0);
  
  // Estados para datos finales
  const [showFinishForm, setShowFinishForm] = useState(false);
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Formatear tiempo
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Timer basado en timestamps (funciona aunque la app esté en segundo plano)
  useEffect(() => {
    if (status === 'running') {
      const updateTimer = () => {
        if (startTimestampRef.current) {
          const now = Date.now();
          const elapsed = Math.floor((now - startTimestampRef.current) / 1000) + pausedTimeRef.current;
          setElapsedSeconds(elapsed);
        }
      };
      
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      
      // Actualizar cuando la app vuelve a primer plano
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
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Handlers
  const handleStart = () => {
    startTimestampRef.current = Date.now();
    pausedTimeRef.current = 0;
    setStatus('running');
    setStartTime(new Date());
  };

  const handlePause = () => {
    // Guardar tiempo acumulado antes de pausar
    if (startTimestampRef.current) {
      pausedTimeRef.current = elapsedSeconds;
    }
    setStatus('paused');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleResume = () => {
    // Reiniciar timestamp desde ahora
    startTimestampRef.current = Date.now();
    setStatus('running');
  };

  const handleStop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('finished');
    setShowFinishForm(true);
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onCancel();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Obtener fecha LOCAL
      const getLocalDateString = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      };

      const durationMinutes = Math.ceil(elapsedSeconds / 60);
      const todayDate = getLocalDateString();
      
      await createCardio(studentId, {
        date: todayDate,
        activityType: activityType,
        durationMinutes,
        intensity: durationMinutes > 30 ? 'high' : durationMinutes > 15 ? 'medium' : 'low',
        distanceKm: distance ? parseFloat(distance) : null,
        caloriesBurned: calories ? parseInt(calories) : null,
        notes: notes || `Cronómetro: ${formatTime(elapsedSeconds)}`,
      });
      
      // Si es cinta y hay distancia, estimar y guardar pasos
      if (activityType === 'treadmill' && distance && parseFloat(distance) > 0) {
        const distanceMeters = parseFloat(distance) * 1000;
        const estimatedSteps = estimateSteps('treadmill', distanceMeters);
        
        if (estimatedSteps > 0) {
          try {
            await saveManualSteps(
              studentId,
              todayDate,
              estimatedSteps,
              `Cinta - ${distance}km`
            );
            console.log(`✅ Pasos guardados desde cinta: ${estimatedSteps}`);
          } catch (stepErr) {
            console.error('Error guardando pasos:', stepErr);
          }
        }
      }
      
      onComplete();
    } catch (error) {
      console.error('Error guardando actividad:', error);
      alert('Error al guardar la actividad');
    } finally {
      setSaving(false);
    }
  };

  // Formulario de finalización
  if (showFinishForm) {
    return (
      <Box
        sx={{
          minHeight: '100%',
          background: `linear-gradient(180deg, ${COLORS.background} 0%, #0f0f1a 100%)`,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <Typography fontSize={24}>{activityInfo?.emoji}</Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" color={COLORS.text}>
              ¡Actividad Completada!
            </Typography>
            <Typography color={COLORS.textMuted}>
              {activityInfo?.name}
            </Typography>
          </Box>
        </Box>

        {/* Resumen */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(255,152,0,0.15) 0%, rgba(255,152,0,0.05) 100%)',
            borderRadius: 3,
            p: 3,
            mb: 3,
            textAlign: 'center',
            border: '1px solid rgba(255,152,0,0.3)',
          }}
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'monospace',
            }}
          >
            {formatTime(elapsedSeconds)}
          </Typography>
          <Typography color={COLORS.textMuted} mt={1}>
            Duración total
          </Typography>
        </Box>

        {/* Campos opcionales */}
        <Box sx={{ mb: 3 }}>
          <Typography color={COLORS.textMuted} mb={2} fontSize={14}>
            📝 Datos adicionales (opcional)
          </Typography>
          
          {activityConfig?.hasDistance && (
            <TextField
              fullWidth
              label="Distancia (km)"
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              inputProps={{ step: 0.1, min: 0 }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: COLORS.text,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                },
                '& .MuiInputLabel-root': { color: COLORS.textMuted },
              }}
            />
          )}
          
          <TextField
            fullWidth
            label="Calorías quemadas"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            inputProps={{ min: 0 }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: COLORS.text,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
              '& .MuiInputLabel-root': { color: COLORS.textMuted },
            }}
          />
          
          <TextField
            fullWidth
            label="Notas"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Cómo te sentiste?"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: COLORS.text,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
              '& .MuiInputLabel-root': { color: COLORS.textMuted },
            }}
          />
        </Box>

        {/* Botones */}
        <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleCancel}
            disabled={saving}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: COLORS.text,
              py: 1.5,
            }}
          >
            Descartar
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #4cceac 0%, #3da58a 100%)',
              py: 1.5,
              fontWeight: 'bold',
            }}
          >
            {saving ? 'Guardando...' : '✓ Guardar'}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100%',
        background: `linear-gradient(180deg, ${COLORS.background} 0%, #0f0f1a 100%)`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: status === 'running' 
                ? 'linear-gradient(135deg, #4cceac 0%, #3da58a 100%)'
                : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
          >
            <Typography fontSize={20}>{activityInfo?.emoji}</Typography>
          </Box>
          <Box>
            <Typography fontWeight="bold" color={COLORS.text}>
              {activityInfo?.name}
            </Typography>
            <Typography fontSize={12} color={COLORS.textMuted}>
              {status === 'ready' && 'Listo para comenzar'}
              {status === 'running' && '🔴 En progreso'}
              {status === 'paused' && '⏸️ En pausa'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleCancel} sx={{ color: COLORS.textMuted }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Timer central */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        {/* Timer central */}
        <Box
          sx={{
            position: 'relative',
            width: 280,
            height: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            borderRadius: '50%',
            background: status === 'running' 
              ? 'radial-gradient(circle, rgba(255,152,0,0.15) 0%, rgba(255,152,0,0.05) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 70%)',
            boxShadow: status === 'running' 
              ? '0 0 80px rgba(255,152,0,0.4), inset 0 0 80px rgba(255,152,0,0.15)'
              : 'inset 0 0 60px rgba(255,255,255,0.05)',
            border: status === 'running'
              ? '2px solid rgba(255,152,0,0.3)'
              : '2px solid rgba(255,255,255,0.1)',
            transition: 'all 0.5s ease',
          }}
        >
          {/* Timer */}
          <Typography
            sx={{
              fontSize: elapsedSeconds >= 3600 ? 52 : 72,
              fontWeight: 'bold',
              fontFamily: '"Courier New", monospace',
              color: COLORS.text,
              textShadow: status === 'running' 
                ? '0 0 30px rgba(255,152,0,0.6), 0 0 60px rgba(255,152,0,0.3)' 
                : 'none',
              letterSpacing: '4px',
            }}
          >
            {formatTime(elapsedSeconds)}
          </Typography>
        </Box>

        {/* Info adicional */}
        <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize={24} fontWeight="bold" color={COLORS.orange}>
              {Math.ceil(elapsedSeconds / 60)}
            </Typography>
            <Typography fontSize={12} color={COLORS.textMuted}>
              minutos
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize={24} fontWeight="bold" color={COLORS.blue}>
              {activityConfig?.estimatedCaloriesPerMinute 
                ? Math.round((elapsedSeconds / 60) * activityConfig.estimatedCaloriesPerMinute)
                : '~'}
            </Typography>
            <Typography fontSize={12} color={COLORS.textMuted}>
              kcal (est.)
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Controles */}
      <Box
        sx={{
          p: 3,
          background: 'rgba(0,0,0,0.3)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {status === 'ready' && (
          <Button
            fullWidth
            onClick={handleStart}
            sx={{
              py: 2,
              fontSize: 18,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              color: '#fff',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(255,152,0,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)',
              },
            }}
          >
            <PlayArrowIcon sx={{ mr: 1, fontSize: 28 }} />
            INICIAR
          </Button>
        )}

        {status === 'running' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              onClick={handlePause}
              sx={{
                py: 2,
                background: 'rgba(255,255,255,0.1)',
                color: COLORS.text,
                borderRadius: 3,
                '&:hover': {
                  background: 'rgba(255,255,255,0.15)',
                },
              }}
            >
              <PauseIcon sx={{ mr: 1 }} />
              Pausar
            </Button>
            <Button
              fullWidth
              onClick={handleStop}
              sx={{
                py: 2,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                borderRadius: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                },
              }}
            >
              <StopIcon sx={{ mr: 1 }} />
              Finalizar
            </Button>
          </Box>
        )}

        {status === 'paused' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              onClick={handleResume}
              sx={{
                py: 2,
                background: 'linear-gradient(135deg, #4cceac 0%, #3da58a 100%)',
                color: '#fff',
                borderRadius: 3,
              }}
            >
              <PlayArrowIcon sx={{ mr: 1 }} />
              Reanudar
            </Button>
            <Button
              fullWidth
              onClick={handleStop}
              sx={{
                py: 2,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                borderRadius: 3,
              }}
            >
              <StopIcon sx={{ mr: 1 }} />
              Finalizar
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default IndoorActivityTracker;

