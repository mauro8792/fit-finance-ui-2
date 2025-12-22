import { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Chip, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  createManualActivity,
  INDOOR_ACTIVITIES,
  SWIMMING_STYLES,
  estimateCalories,
  getActivityInfo,
} from '../../../api/activityTrackerApi';

const COLORS = {
  card: '#16213e',
  border: 'rgba(255,255,255,0.1)',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.7)',
  green: '#4cceac',
  orange: '#ff9800',
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

// Formatear fecha a YYYY-MM-DD para el API (sin UTC)
const formatDateForApi = (date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Obtener nombre del día corto
const getDayName = (date) => {
  const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  return days[date.getDay()];
};

const IndoorActivityForm = ({ studentId, activityType, onSave, onCancel }) => {
  const activityInfo = getActivityInfo(activityType);
  const activityConfig = INDOOR_ACTIVITIES[activityType];
  const today = getLocalDate();

  const [selectedDate, setSelectedDate] = useState(today);
  const [formData, setFormData] = useState({
    durationMinutes: 30,
    distanceMeters: '',
    caloriesBurned: '',
    laps: '',
    swimmingStyle: 'freestyle',
    resistanceLevel: '',
    inclinePercent: '',
    floorsClimbed: '',
    notes: '',
  });

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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Estimar calorías cuando cambia la duración
  const estimatedCalories = estimateCalories(activityType, formData.durationMinutes);

  const handleSave = async () => {
    if (!formData.durationMinutes || formData.durationMinutes < 1) {
      setError('Ingresá una duración válida');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const data = {
        activityType,
        date: formatDateForApi(selectedDate),
        durationMinutes: parseInt(formData.durationMinutes),
        ...(formData.distanceMeters && { distanceMeters: parseFloat(formData.distanceMeters) }),
        ...(formData.caloriesBurned && { caloriesBurned: parseInt(formData.caloriesBurned) }),
        ...(formData.laps && { laps: parseInt(formData.laps) }),
        ...(formData.swimmingStyle && activityType === 'swimming' && { swimmingStyle: formData.swimmingStyle }),
        ...(formData.resistanceLevel && { resistanceLevel: parseInt(formData.resistanceLevel) }),
        ...(formData.inclinePercent && { inclinePercent: parseFloat(formData.inclinePercent) }),
        ...(formData.floorsClimbed && { floorsClimbed: parseInt(formData.floorsClimbed) }),
        ...(formData.notes && { notes: formData.notes }),
      };

      // Si no puso calorías, usar las estimadas
      if (!data.caloriesBurned) {
        data.caloriesBurned = estimatedCalories;
      }

      await createManualActivity(studentId, data);
      onSave();
    } catch (err) {
      console.error('Error saving activity:', err);
      setError('Error al guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(0,0,0,0.3)',
      color: COLORS.text,
      '& fieldset': { borderColor: COLORS.border },
      '&:hover fieldset': { borderColor: COLORS.green },
      '&.Mui-focused fieldset': { borderColor: COLORS.green },
    },
    '& .MuiInputLabel-root': { color: COLORS.textMuted },
    '& .MuiInputLabel-root.Mui-focused': { color: COLORS.green },
    '& input': { color: COLORS.text },
  };

  // Campos específicos según la actividad
  const fields = activityConfig?.fields || ['time'];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: `linear-gradient(135deg, ${activityInfo.color}22 0%, transparent 100%)`,
      }}>
        <Typography fontSize={36}>{activityInfo.emoji}</Typography>
        <Box>
          <Typography variant="h6" fontWeight={700} color={COLORS.text}>
            {activityInfo.label}
          </Typography>
          <Typography fontSize={12} color={COLORS.textMuted}>
            Registro manual
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Selector de Fecha */}
        <Box>
          <Typography fontSize={12} color={COLORS.textMuted} mb={1}>
            Fecha
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 2,
            border: `1px solid ${COLORS.border}`,
            p: 0.5,
          }}>
            <IconButton 
              onClick={goToPreviousDay}
              size="small"
              sx={{ color: COLORS.text }}
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography fontSize={18} fontWeight={700} color={COLORS.text}>
                {formatDateDisplay(selectedDate)}
              </Typography>
              <Typography fontSize={11} color={COLORS.textMuted}>
                {getDayName(selectedDate)}, {selectedDate.getDate()} de {['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][selectedDate.getMonth()]}
              </Typography>
            </Box>
            
            <IconButton 
              onClick={goToNextDay}
              disabled={isSelectedToday}
              size="small"
              sx={{ 
                color: isSelectedToday ? COLORS.border : COLORS.text,
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Duración - siempre presente */}
        <TextField
          label="Duración (minutos) *"
          type="number"
          value={formData.durationMinutes}
          onChange={(e) => handleChange('durationMinutes', e.target.value)}
          fullWidth
          size="small"
          sx={inputStyle}
          inputProps={{ min: 1, inputMode: 'numeric' }}
        />

        {/* Distancia - si aplica */}
        {fields.includes('distance') && (
          <TextField
            label="Distancia (metros) - opcional"
            type="number"
            value={formData.distanceMeters}
            onChange={(e) => handleChange('distanceMeters', e.target.value)}
            fullWidth
            size="small"
            sx={inputStyle}
            inputProps={{ min: 0, inputMode: 'numeric' }}
          />
        )}

        {/* Largos - para natación */}
        {fields.includes('laps') && (
          <TextField
            label="Largos (pileta 25m) - opcional"
            type="number"
            value={formData.laps}
            onChange={(e) => handleChange('laps', e.target.value)}
            fullWidth
            size="small"
            sx={inputStyle}
            inputProps={{ min: 0, inputMode: 'numeric' }}
            helperText={formData.laps ? `≈ ${formData.laps * 25}m` : ''}
          />
        )}

        {/* Estilo natación */}
        {fields.includes('style') && (
          <Box>
            <Typography fontSize={12} color={COLORS.textMuted} mb={1}>
              Estilo principal
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(SWIMMING_STYLES).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  onClick={() => handleChange('swimmingStyle', key)}
                  sx={{
                    backgroundColor: formData.swimmingStyle === key 
                      ? 'rgba(59,130,246,0.3)' 
                      : 'rgba(255,255,255,0.1)',
                    color: formData.swimmingStyle === key ? '#3b82f6' : COLORS.text,
                    border: formData.swimmingStyle === key 
                      ? '1px solid #3b82f6' 
                      : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Resistencia */}
        {fields.includes('resistance') && (
          <TextField
            label="Nivel de resistencia (1-20) - opcional"
            type="number"
            value={formData.resistanceLevel}
            onChange={(e) => handleChange('resistanceLevel', e.target.value)}
            fullWidth
            size="small"
            sx={inputStyle}
            inputProps={{ min: 1, max: 20, inputMode: 'numeric' }}
          />
        )}

        {/* Inclinación */}
        {fields.includes('incline') && (
          <TextField
            label="Inclinación (%) - opcional"
            type="number"
            value={formData.inclinePercent}
            onChange={(e) => handleChange('inclinePercent', e.target.value)}
            fullWidth
            size="small"
            sx={inputStyle}
            inputProps={{ min: 0, max: 30, step: 0.5, inputMode: 'decimal' }}
          />
        )}

        {/* Pisos */}
        {fields.includes('floors') && (
          <TextField
            label="Pisos subidos - opcional"
            type="number"
            value={formData.floorsClimbed}
            onChange={(e) => handleChange('floorsClimbed', e.target.value)}
            fullWidth
            size="small"
            sx={inputStyle}
            inputProps={{ min: 0, inputMode: 'numeric' }}
          />
        )}

        {/* Calorías */}
        <Box>
          <TextField
            label="Calorías quemadas - opcional"
            type="number"
            value={formData.caloriesBurned}
            onChange={(e) => handleChange('caloriesBurned', e.target.value)}
            fullWidth
            size="small"
            sx={inputStyle}
            inputProps={{ min: 0, inputMode: 'numeric' }}
            placeholder={`Est: ${estimatedCalories}`}
          />
          <Typography fontSize={11} color={COLORS.textMuted} mt={0.5}>
            💡 Si no lo completás, estimamos ~{estimatedCalories} kcal
          </Typography>
        </Box>

        {/* Notas */}
        <TextField
          label="Notas - opcional"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          fullWidth
          size="small"
          multiline
          rows={2}
          sx={inputStyle}
        />

        {/* Error */}
        {error && (
          <Typography color="error" fontSize={13} textAlign="center">
            {error}
          </Typography>
        )}
      </Box>

      {/* Botones */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, borderTop: `1px solid ${COLORS.border}` }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          fullWidth
          sx={{
            borderColor: COLORS.border,
            color: COLORS.textMuted,
            '&:hover': { borderColor: COLORS.textMuted, backgroundColor: 'rgba(255,255,255,0.05)' },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          fullWidth
          sx={{
            backgroundColor: COLORS.green,
            color: '#000',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#3da88a' },
            '&:disabled': { backgroundColor: 'rgba(76,206,172,0.3)', color: COLORS.textMuted },
          }}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : '💾 Guardar'}
        </Button>
      </Box>
    </Box>
  );
};

export default IndoorActivityForm;

