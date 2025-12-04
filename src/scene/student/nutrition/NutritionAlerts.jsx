import { Box, Typography, IconButton, Collapse } from '@mui/material';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

const NutritionAlerts = ({ consumed, targets, entriesCount }) => {
  const [dismissed, setDismissed] = useState([]);

  if (!targets) return null;

  const alerts = [];
  const now = new Date();
  const hour = now.getHours();

  // Calcular porcentajes
  const caloriesPercent = targets.calories ? (consumed.calories / targets.calories) * 100 : 0;
  const proteinPercent = targets.protein ? (consumed.protein / targets.protein) * 100 : 0;

  // Alerta: No ha registrado nada y es después del mediodía
  if (entriesCount === 0 && hour >= 12) {
    alerts.push({
      id: 'no-entries',
      type: 'warning',
      icon: <WarningAmberIcon />,
      title: '¡No olvidés registrar tus comidas!',
      message: 'Todavía no registraste ninguna comida hoy.',
      color: '#f59e0b',
    });
  }

  // Alerta: Se pasó de calorías
  if (caloriesPercent > 110) {
    alerts.push({
      id: 'over-calories',
      type: 'warning',
      icon: <WarningAmberIcon />,
      title: 'Superaste tu objetivo de calorías',
      message: `Llevas ${Math.round(consumed.calories)} kcal (${Math.round(caloriesPercent)}% del objetivo)`,
      color: '#ef4444',
    });
  }

  // Alerta: Proteína baja después de las 6pm
  if (hour >= 18 && proteinPercent < 60) {
    alerts.push({
      id: 'low-protein',
      type: 'info',
      icon: <InfoIcon />,
      title: 'Proteína baja',
      message: `Solo llevas ${Math.round(consumed.protein)}g de proteína (${Math.round(proteinPercent)}%). ¡No te olvides de incluir proteína en la cena!`,
      color: '#3b82f6',
    });
  }

  // Alerta positiva: Cumplió el objetivo
  if (caloriesPercent >= 90 && caloriesPercent <= 105 && proteinPercent >= 85) {
    alerts.push({
      id: 'on-track',
      type: 'success',
      icon: <CheckCircleIcon />,
      title: '¡Excelente! Vas muy bien hoy',
      message: 'Estás cumpliendo con tus objetivos de calorías y proteína.',
      color: '#22c55e',
    });
  }

  // Filtrar alertas descartadas
  const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {visibleAlerts.map((alert, index) => (
        <Collapse key={alert.id} in={!dismissed.includes(alert.id)}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              p: 1.5,
              mb: 1,
              borderRadius: 2,
              backgroundColor: alert.color + '15',
              border: `1px solid ${alert.color}40`,
            }}
          >
            <Box sx={{ color: alert.color, mt: 0.3 }}>
              {alert.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="subtitle2" 
                fontWeight="bold" 
                sx={{ color: alert.color }}
              >
                {alert.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa', fontSize: 12 }}>
                {alert.message}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setDismissed([...dismissed, alert.id])}
              sx={{ color: '#666' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Collapse>
      ))}
    </Box>
  );
};

export default NutritionAlerts;

