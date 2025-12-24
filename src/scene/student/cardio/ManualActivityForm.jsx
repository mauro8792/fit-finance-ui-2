import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createCardio } from '../../../api/cardioApi';

const COLORS = {
  background: '#0a0a12',
  card: '#1a1a2e',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.6)',
  orange: '#ff9800',
  green: '#4cceac',
};

const ACTIVITY_INFO = {
  walk: { label: 'Caminata', emoji: '🚶', color: '#4cceac' },
  run: { label: 'Running', emoji: '🏃', color: '#ef4444' },
  bike: { label: 'Bicicleta', emoji: '🚴', color: '#6870fa' },
  hike: { label: 'Senderismo', emoji: '🥾', color: '#14b8a6' },
};

const ManualActivityForm = ({ studentId, activityType, onComplete, onCancel }) => {
  const activityInfo = ACTIVITY_INFO[activityType] || { label: activityType, emoji: '🏃', color: '#888' };
  
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!duration || parseInt(duration) <= 0) {
      alert('Ingresá la duración');
      return;
    }

    setSaving(true);
    try {
      const getLocalDateString = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      };

      await createCardio(studentId, {
        date: getLocalDateString(),
        activityType: activityType,
        durationMinutes: parseInt(duration),
        intensity: parseInt(duration) > 45 ? 'high' : parseInt(duration) > 20 ? 'medium' : 'low',
        distanceKm: distance ? parseFloat(distance) : null,
        caloriesBurned: calories ? parseInt(calories) : null,
        notes: notes || null,
      });

      onComplete();
    } catch (error) {
      console.error('Error guardando actividad:', error);
      alert('Error al guardar la actividad');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100%', background: COLORS.background, p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={onCancel} sx={{ color: COLORS.text }}>
          <ArrowBackIcon />
        </IconButton>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${activityInfo.color} 0%, ${activityInfo.color}88 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography fontSize={24}>{activityInfo.emoji}</Typography>
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold" color={COLORS.text}>
            {activityInfo.label}
          </Typography>
          <Typography color={COLORS.textMuted} fontSize={12}>
            Carga manual de datos
          </Typography>
        </Box>
      </Box>

      {/* Tip */}
      <Box
        sx={{
          background: 'rgba(255,152,0,0.1)',
          border: '1px solid rgba(255,152,0,0.3)',
          borderRadius: 2,
          p: 2,
          mb: 3,
        }}
      >
        <Typography fontSize={13} color={COLORS.orange}>
          💡 Usá los datos de tu app de tracking (Strava, Garmin, Nike Run, etc.)
        </Typography>
      </Box>

      {/* Formulario */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Duración (minutos) *"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          inputProps={{ min: 1 }}
          sx={{
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
          label="Distancia (km)"
          type="number"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          inputProps={{ step: 0.1, min: 0 }}
          sx={{
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
          label="Calorías quemadas"
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          inputProps={{ min: 0 }}
          helperText="Si tu app te da este dato"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: COLORS.text,
              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
            },
            '& .MuiInputLabel-root': { color: COLORS.textMuted },
            '& .MuiFormHelperText-root': { color: COLORS.textMuted },
          }}
        />

        <TextField
          fullWidth
          label="Notas"
          multiline
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="¿Cómo te sentiste? ¿Dónde corriste?"
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
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onCancel}
          disabled={saving}
          sx={{
            borderColor: 'rgba(255,255,255,0.3)',
            color: COLORS.text,
            py: 1.5,
          }}
        >
          Cancelar
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={saving || !duration}
          sx={{
            background: `linear-gradient(135deg, ${COLORS.green} 0%, #3da58a 100%)`,
            py: 1.5,
            fontWeight: 'bold',
          }}
        >
          {saving ? 'Guardando...' : '✓ Guardar'}
        </Button>
      </Box>
    </Box>
  );
};

export default ManualActivityForm;

