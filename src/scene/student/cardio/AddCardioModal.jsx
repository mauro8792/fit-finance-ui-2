import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import { createCardio, ACTIVITY_TYPES, INTENSITY_LEVELS } from '../../../api/cardioApi';

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

const AddCardioModal = ({ studentId, onClose, onSave, initialDate = null }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    date: initialDate || today,
    activityType: 'run',
    durationMinutes: 30,
    distanceKm: '',
    caloriesBurned: '',
    intensity: 'medium',
    steps: '',
    notes: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.durationMinutes || formData.durationMinutes < 1) {
      setError('Ingresá una duración válida');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const dataToSend = {
        date: formData.date,
        activityType: formData.activityType,
        durationMinutes: parseInt(formData.durationMinutes),
        intensity: formData.intensity,
        ...(formData.distanceKm && { distanceKm: parseFloat(formData.distanceKm) }),
        ...(formData.caloriesBurned && { caloriesBurned: parseInt(formData.caloriesBurned) }),
        ...(formData.steps && { steps: parseInt(formData.steps) }),
        ...(formData.notes && { notes: formData.notes }),
      };

      console.log('Guardando cardio:', { studentId, dataToSend });
      const result = await createCardio(studentId, dataToSend);
      console.log('Cardio guardado:', result);
      onSave(result);
      onClose();
    } catch (err) {
      console.error('Error guardando cardio:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error al guardar';
      setError(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
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

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Box
        sx={{
          backgroundColor: COLORS.card,
          borderRadius: 3,
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflow: 'auto',
          border: `1px solid ${COLORS.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2.5, 
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography variant="h6" fontWeight={700} color={COLORS.text}>
            🏃 Registrar Cardio
          </Typography>
          <Button 
            onClick={onClose}
            sx={{ minWidth: 'auto', color: COLORS.textMuted, fontSize: 20 }}
          >
            ✕
          </Button>
        </Box>

        {/* Body */}
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Fecha */}
          <TextField
            label="Fecha"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            fullWidth
            size="small"
            sx={inputStyle}
            InputLabelProps={{ shrink: true }}
          />

          {/* Tipo de actividad */}
          <Box>
            <Typography fontSize={12} color={COLORS.textMuted} mb={1}>
              Tipo de actividad
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(ACTIVITY_TYPES).map(([key, { label, emoji }]) => (
                <Chip
                  key={key}
                  label={`${emoji} ${label}`}
                  onClick={() => handleChange('activityType', key)}
                  sx={{
                    backgroundColor: formData.activityType === key 
                      ? 'rgba(76,206,172,0.3)' 
                      : 'rgba(255,255,255,0.1)',
                    color: formData.activityType === key ? COLORS.green : COLORS.text,
                    border: formData.activityType === key 
                      ? `1px solid ${COLORS.green}` 
                      : '1px solid transparent',
                    fontWeight: formData.activityType === key ? 600 : 400,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(76,206,172,0.2)' },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Duración */}
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

          {/* Distancia (opcional) */}
          <TextField
            label="Distancia (km) - opcional"
            type="number"
            value={formData.distanceKm}
            onChange={(e) => handleChange('distanceKm', e.target.value)}
            fullWidth
            size="small"
            sx={inputStyle}
            inputProps={{ min: 0, step: 0.1, inputMode: 'decimal' }}
          />

          {/* Intensidad */}
          <Box>
            <Typography fontSize={12} color={COLORS.textMuted} mb={1}>
              Intensidad
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {Object.entries(INTENSITY_LEVELS).map(([key, { label, color, description }]) => (
                <Box
                  key={key}
                  onClick={() => handleChange('intensity', key)}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: formData.intensity === key 
                      ? `${color}22` 
                      : 'rgba(255,255,255,0.05)',
                    border: formData.intensity === key 
                      ? `2px solid ${color}` 
                      : '2px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    '&:hover': { backgroundColor: `${color}15` },
                  }}
                >
                  <Typography 
                    fontWeight={600} 
                    color={formData.intensity === key ? color : COLORS.text}
                    fontSize={14}
                  >
                    {label}
                  </Typography>
                  <Typography fontSize={10} color={COLORS.textMuted}>
                    {description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Calorías (opcional) */}
          <TextField
            label="Calorías quemadas - opcional"
            type="number"
            value={formData.caloriesBurned}
            onChange={(e) => handleChange('caloriesBurned', e.target.value)}
            fullWidth
            size="small"
            sx={inputStyle}
            inputProps={{ min: 0, inputMode: 'numeric' }}
          />

          {/* Pasos (solo para walk) */}
          {formData.activityType === 'walk' && (
            <TextField
              label="Pasos - opcional"
              type="number"
              value={formData.steps}
              onChange={(e) => handleChange('steps', e.target.value)}
              fullWidth
              size="small"
              sx={inputStyle}
              inputProps={{ min: 0, inputMode: 'numeric' }}
            />
          )}

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
            placeholder="Ej: Ruta por el parque, sentí cansancio..."
          />

          {/* Error */}
          {error && (
            <Typography color="error" fontSize={13} textAlign="center">
              {error}
            </Typography>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${COLORS.border}`,
          display: 'flex',
          gap: 2,
        }}>
          <Button
            variant="outlined"
            onClick={onClose}
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
    </Box>
  );
};

export default AddCardioModal;

