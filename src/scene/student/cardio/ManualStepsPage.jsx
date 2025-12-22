import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuthStore } from '../../../hooks';
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

// Obtener fecha LOCAL actual (sin problemas de UTC)
const getLocalDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Formatear fecha a DD/MM/AAAA
const formatDateDisplay = (date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

// Formatear fecha a YYYY-MM-DD para el API (sin UTC, usando fecha local)
const formatDateForApi = (date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Obtener nombre del día
const getDayName = (date) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

// Obtener nombre del mes
const getMonthName = (date) => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[date.getMonth()];
};

const QUICK_OPTIONS = [
  { label: '5,000', value: 5000 },
  { label: '7,500', value: 7500 },
  { label: '10,000', value: 10000 },
  { label: '12,500', value: 12500 },
];

const ManualStepsPage = () => {
  const navigate = useNavigate();
  const { student } = useAuthStore();
  const studentId = student?.id;

  const [steps, setSteps] = useState('');
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const today = getLocalDate();
  
  // Verificar si la fecha seleccionada es hoy
  const isSelectedToday = selectedDate.getDate() === today.getDate() && 
                          selectedDate.getMonth() === today.getMonth() && 
                          selectedDate.getFullYear() === today.getFullYear();

  // Navegar fecha
  const goToPreviousDay = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1));
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
    if (nextDay <= today) {
      setSelectedDate(nextDay);
    }
  };

  const handleSubmit = async () => {
    if (!steps || parseInt(steps) <= 0) {
      setError('Ingresá la cantidad de pasos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Enviar fecha en formato YYYY-MM-DD usando hora LOCAL (no UTC)
      await financeApi.post(`/cardio/${studentId}/manual-steps`, {
        date: formatDateForApi(selectedDate),
        steps: parseInt(steps),
        notes: notes || undefined,
      });

      setSuccess(true);
      
      // Volver después de 1.5 segundos
      setTimeout(() => {
        navigate('/student/cardio');
      }, 1500);
    } catch (err) {
      console.error('Error guardando pasos:', err);
      setError(err.response?.data?.message || 'Error al guardar los pasos');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/student/cardio');
  };

  if (!studentId) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: COLORS.textMuted }}>
        Cargando información del estudiante...
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
            🚶 Cargar Pasos
          </Typography>
          <Typography fontSize={12} color={COLORS.textMuted}>
            Registrá tus pasos del día
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, maxWidth: 500, mx: 'auto' }}>
        {/* Success Message */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              backgroundColor: 'rgba(76, 206, 172, 0.1)',
              color: COLORS.green,
              '& .MuiAlert-icon': { color: COLORS.green },
            }}
          >
            ✅ ¡Pasos guardados correctamente!
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: COLORS.red,
              '& .MuiAlert-icon': { color: COLORS.red },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Selector de Fecha estilo React Native */}
        <Paper sx={{ 
          p: 2, 
          mb: 2, 
          backgroundColor: COLORS.card,
          borderRadius: 3,
        }}>
          <Typography fontSize={12} color={COLORS.textMuted} mb={2} fontWeight={600}>
            📅 FECHA
          </Typography>

          {/* Navegador de fecha con flechas */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 3,
            p: 1,
          }}>
            <IconButton 
              onClick={goToPreviousDay}
              sx={{ color: COLORS.text }}
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography fontSize={24} fontWeight={800} color={COLORS.text}>
                {formatDateDisplay(selectedDate)}
              </Typography>
              <Typography fontSize={12} color={COLORS.textMuted}>
                {getDayName(selectedDate)}, {selectedDate.getDate()} de {getMonthName(selectedDate)}
              </Typography>
            </Box>
            
            <IconButton 
              onClick={goToNextDay}
              disabled={isSelectedToday}
              sx={{ 
                color: isSelectedToday ? COLORS.border : COLORS.text,
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* Cantidad de pasos */}
        <Paper sx={{ 
          p: 2, 
          mb: 2, 
          backgroundColor: COLORS.card,
          borderRadius: 3,
        }}>
          <Typography fontSize={12} color={COLORS.textMuted} mb={1} fontWeight={600}>
            👟 CANTIDAD DE PASOS
          </Typography>
          <TextField
            fullWidth
            type="number"
            placeholder="Ej: 8500"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            inputProps={{ 
              min: 0, 
              max: 100000,
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: COLORS.text,
                borderRadius: 3,
                fontSize: '24px',
                fontWeight: 700,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.border,
              },
              '& .MuiInputBase-input': {
                textAlign: 'center',
                padding: '16px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: COLORS.textMuted,
                opacity: 0.6,
              },
            }}
          />

          {/* Atajos rápidos */}
          <Typography fontSize={11} color={COLORS.textMuted} mt={2} mb={1}>
            Atajos rápidos:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {QUICK_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant="outlined"
                size="small"
                onClick={() => setSteps(opt.value.toString())}
                sx={{
                  borderColor: steps === opt.value.toString() ? COLORS.green : COLORS.border,
                  color: steps === opt.value.toString() ? COLORS.green : COLORS.textMuted,
                  backgroundColor: steps === opt.value.toString() ? 'rgba(76, 206, 172, 0.1)' : 'transparent',
                  borderRadius: 2,
                  fontSize: 13,
                  fontWeight: 600,
                  flex: 1,
                  minWidth: 70,
                  '&:hover': {
                    borderColor: COLORS.green,
                    backgroundColor: 'rgba(76, 206, 172, 0.1)',
                  },
                }}
              >
                {opt.label}
              </Button>
            ))}
          </Box>
        </Paper>

        {/* Notas */}
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          backgroundColor: COLORS.card,
          borderRadius: 3,
        }}>
          <Typography fontSize={12} color={COLORS.textMuted} mb={1} fontWeight={600}>
            📝 NOTAS (opcional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Ej: Caminata al trabajo, paseo por el parque..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: COLORS.text,
                borderRadius: 2,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.border,
              },
              '& .MuiInputBase-input::placeholder': {
                color: COLORS.textMuted,
                opacity: 0.6,
              },
            }}
          />
        </Paper>

        {/* Tip */}
        <Box sx={{ 
          p: 2, 
          mb: 3,
          backgroundColor: 'rgba(104, 112, 250, 0.1)',
          borderRadius: 2,
          border: `1px solid ${COLORS.blue}30`,
        }}>
          <Typography fontSize={12} color={COLORS.blue}>
            💡 <strong>Tip:</strong> Los pasos también se calculan automáticamente cuando hacés una caminata o running con GPS.
          </Typography>
        </Box>

        {/* Botones */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleBack}
            disabled={loading}
            sx={{
              borderColor: COLORS.border,
              color: COLORS.textMuted,
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                borderColor: COLORS.text,
                color: COLORS.text,
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading || !steps || parseInt(steps) <= 0 || success}
            sx={{
              backgroundColor: COLORS.green,
              color: '#000',
              fontWeight: 700,
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                backgroundColor: '#3da88a',
              },
              '&:disabled': {
                backgroundColor: 'rgba(76, 206, 172, 0.3)',
                color: 'rgba(0,0,0,0.5)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#000' }} />
            ) : success ? (
              '✓ Guardado'
            ) : (
              '✓ Guardar Pasos'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ManualStepsPage;
