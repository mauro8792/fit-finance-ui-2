import { Box, Typography, Chip } from '@mui/material';
import { INDOOR_ACTIVITIES } from '../../../api/activityTrackerApi';

const COLORS = {
  card: '#16213e',
  border: 'rgba(255,255,255,0.1)',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.7)',
  green: '#4cceac',
  orange: '#ff9800',
};

// ==============================================
// GPS OUTDOOR DESHABILITADO
// Las PWAs no pueden trackear GPS con pantalla bloqueada
// Si en el futuro se quiere habilitar, descomentar:
// ==============================================
// const MANUAL_OUTDOOR = {
//   walk: { label: 'Caminata', emoji: '🚶', color: '#4cceac' },
//   run: { label: 'Running', emoji: '🏃', color: '#ef4444' },
//   bike: { label: 'Bicicleta', emoji: '🚴', color: '#6870fa' },
//   hike: { label: 'Senderismo', emoji: '🥾', color: '#14b8a6' },
// };

const ActivitySelector = ({ onSelectActivity }) => {
  return (
    <Box>
      {/* ================================================
          OUTDOOR CON GPS - DESHABILITADO
          Las PWAs no soportan GPS en background
          ================================================ */}
      {/* 
      <Box sx={{ mb: 3 }}>
        <Typography fontSize={12} color={COLORS.textMuted} fontWeight={600} mb={1.5}>
          🌳 OUTDOOR (con GPS)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(MANUAL_OUTDOOR).map(([key, { label, emoji, color }]) => (
            <Chip
              key={key}
              label={`${emoji} ${label}`}
              onClick={() => onSelectOutdoor(key)}
              sx={{...}}
            />
          ))}
        </Box>
        <Typography fontSize={11} color={COLORS.textMuted} mt={1}>
          📍 Trackea tu recorrido con GPS en tiempo real
        </Typography>
      </Box>
      */}

      {/* Actividades Indoor con Cronómetro */}
      <Box>
        <Typography fontSize={12} color={COLORS.textMuted} fontWeight={600} mb={1.5}>
          ⏱️ ACTIVIDADES CON CRONÓMETRO
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(INDOOR_ACTIVITIES).map(([key, { label, emoji, color }]) => (
            <Chip
              key={key}
              label={`${emoji} ${label}`}
              onClick={() => onSelectActivity(key)}
              sx={{
                backgroundColor: `${color}22`,
                color: color,
                border: `1px solid ${color}44`,
                fontWeight: 600,
                fontSize: 13,
                py: 2.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: `${color}44`,
                  transform: 'scale(1.05)',
                },
              }}
            />
          ))}
        </Box>
        <Typography fontSize={11} color={COLORS.textMuted} mt={1}>
          🎯 Usá el cronómetro integrado para medir tu sesión
        </Typography>
      </Box>
    </Box>
  );
};

export default ActivitySelector;
