import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material';
import fitFinanceApi from '../api/fitFinanceApi';

const COLORS = {
  background: '#1a1a2e',
  card: '#16213e',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.6)',
  green: '#4cceac',
  orange: '#ff9800',
  red: '#ef4444',
  border: 'rgba(255,255,255,0.1)',
};

const PERMISSIONS_CONFIG = [
  {
    key: 'canAccessRoutine',
    label: 'Rutina de entrenamiento',
    emoji: '📋',
    description: 'Ver y registrar ejercicios de la rutina',
  },
  {
    key: 'canAccessNutrition',
    label: 'Nutrición y macros',
    emoji: '🍎',
    description: 'Registrar alimentos y controlar macros',
  },
  {
    key: 'canAccessWeight',
    label: 'Mi Progreso (Peso)',
    emoji: '⚖️',
    description: 'Registrar peso corporal y antropometría',
  },
  {
    key: 'canAccessCardio',
    label: 'Cardio / Aeróbico',
    emoji: '🏃',
    description: 'Registrar actividades cardio y GPS',
  },
];

const StudentPermissions = ({ studentId, onUpdate }) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // key del permiso que se está guardando
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadPermissions();
  }, [studentId]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fitFinanceApi.get(`/students/${studentId}/permissions`);
      setPermissions(response.data);
    } catch (err) {
      console.error('Error cargando permisos:', err);
      setError('Error al cargar los permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const newValue = !permissions[key];
    
    // Actualizar UI inmediatamente (optimistic update)
    setPermissions(prev => ({ ...prev, [key]: newValue }));
    setSaving(key);
    setError(null);
    setSuccess(null);

    try {
      await fitFinanceApi.put(`/students/${studentId}/permissions`, {
        [key]: newValue,
      });
      
      setSuccess('Guardado ✓');
      setTimeout(() => setSuccess(null), 2000);
      
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error guardando permiso:', err);
      // Revertir cambio si falla
      setPermissions(prev => ({ ...prev, [key]: !newValue }));
      setError('Error al guardar');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} sx={{ color: COLORS.orange }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} color={COLORS.text} mb={0.5}>
          ⚙️ Configuración de Acceso
        </Typography>
        <Typography fontSize={13} color={COLORS.textMuted}>
          Habilita o deshabilita funcionalidades para este alumno
        </Typography>
      </Box>

      {/* Mensajes */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Lista de permisos */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {PERMISSIONS_CONFIG.map((perm) => {
          const isEnabled = permissions[perm.key] ?? true;
          const isSaving = saving === perm.key;

          return (
            <Box
              key={perm.key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 2,
                backgroundColor: isEnabled 
                  ? 'rgba(76, 206, 172, 0.08)' 
                  : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isEnabled ? 'rgba(76, 206, 172, 0.3)' : COLORS.border}`,
                transition: 'all 0.2s ease',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography fontSize={28}>{perm.emoji}</Typography>
                <Box>
                  <Typography 
                    fontWeight={600} 
                    color={isEnabled ? COLORS.text : COLORS.textMuted}
                  >
                    {perm.label}
                  </Typography>
                  <Typography fontSize={12} color={COLORS.textMuted}>
                    {perm.description}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isSaving && (
                  <CircularProgress size={16} sx={{ color: COLORS.orange }} />
                )}
                <Switch
                  checked={isEnabled}
                  onChange={() => handleToggle(perm.key)}
                  disabled={isSaving}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: COLORS.green,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: COLORS.green,
                    },
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Info */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,152,0,0.1)', borderRadius: 2 }}>
        <Typography fontSize={12} color={COLORS.orange}>
          💡 Los cambios se guardan automáticamente. Las funcionalidades deshabilitadas 
          no aparecerán en el menú del alumno.
        </Typography>
      </Box>
    </Box>
  );
};

export default StudentPermissions;

