import { Box, Typography, Chip } from '@mui/material';
import { OUTDOOR_ACTIVITIES, INDOOR_ACTIVITIES } from '../../../api/activityTrackerApi';

const COLORS = {
  card: '#16213e',
  border: 'rgba(255,255,255,0.1)',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.7)',
  green: '#4cceac',
};

const ActivitySelector = ({ onSelectOutdoor, onSelectIndoor }) => {
  return (
    <Box>
      {/* Outdoor Activities */}
      <Box sx={{ mb: 3 }}>
        <Typography fontSize={12} color={COLORS.textMuted} fontWeight={600} mb={1.5}>
          🌳 OUTDOOR (con GPS)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(OUTDOOR_ACTIVITIES).map(([key, { label, emoji, color }]) => (
            <Chip
              key={key}
              label={`${emoji} ${label}`}
              onClick={() => onSelectOutdoor(key)}
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
          📍 Trackea tu recorrido con GPS en tiempo real
        </Typography>
      </Box>

      {/* Indoor Activities */}
      <Box>
        <Typography fontSize={12} color={COLORS.textMuted} fontWeight={600} mb={1.5}>
          🏠 INDOOR (sin GPS)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(INDOOR_ACTIVITIES).map(([key, { label, emoji, color }]) => (
            <Chip
              key={key}
              label={`${emoji} ${label}`}
              onClick={() => onSelectIndoor(key)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                fontSize: 12,
                py: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: `${color}22`,
                  borderColor: color,
                  color: color,
                },
              }}
            />
          ))}
        </Box>
        <Typography fontSize={11} color={COLORS.textMuted} mt={1}>
          📝 Registra manualmente tiempo, distancia y más
        </Typography>
      </Box>
    </Box>
  );
};

export default ActivitySelector;

