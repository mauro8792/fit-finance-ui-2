import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Slider,
  Chip,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createTemplate, TEMPLATE_CATEGORIES } from '../../../api/templateApi';

const COLORS = {
  background: '#121212',
  surface: '#1e1e1e',
  surfaceLight: '#2a2a2a',
  text: '#fff',
  textMuted: '#999',
  orange: '#ff9800',
  green: '#4cceac',
  blue: '#6366f1',
  red: '#ef5350',
  border: '#333',
};

const CreateTemplatePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    templateName: '',
    templateDescription: '',
    templateCategory: 'hipertrofia',
    templateTags: '',
    objetivo: '',
    weeksCount: 4,
    daysPerWeek: 4,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSliderChange = (field) => (_, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validación
    if (!formData.templateName.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createTemplate({
        ...formData,
        templateName: formData.templateName.trim(),
        templateDescription: formData.templateDescription.trim(),
        templateTags: formData.templateTags.trim(),
        objetivo: formData.objetivo.trim(),
      });

      setSuccess(true);
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/coach/templates');
      }, 2000);
    } catch (err) {
      console.error('Error creando plantilla:', err);
      setError(err.response?.data?.message || 'Error al crear la plantilla');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = TEMPLATE_CATEGORIES.find((c) => c.value === formData.templateCategory);

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: COLORS.background,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Typography fontSize={64} mb={2}>
          ✅
        </Typography>
        <Typography variant="h5" color={COLORS.green} fontWeight={700} mb={1}>
          ¡Plantilla creada!
        </Typography>
        <Typography color={COLORS.textMuted}>Redirigiendo...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: COLORS.background,
        pb: 10,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderBottom: `1px solid ${COLORS.border}`,
          bgcolor: COLORS.surface,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={() => navigate('/coach/templates')} sx={{ color: COLORS.text }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h6" fontWeight={700} color={COLORS.text}>
            ✨ Nueva Plantilla
          </Typography>
          <Typography fontSize={12} color={COLORS.textMuted}>
            Creá una estructura reutilizable
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {error && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: `${COLORS.red}22`,
              border: `1px solid ${COLORS.red}`,
            }}
          >
            <Typography color={COLORS.red} fontSize={14}>
              {error}
            </Typography>
          </Box>
        )}

        <Card sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, mb: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
              📝 Información básica
            </Typography>

            {/* Nombre */}
            <TextField
              label="Nombre de la plantilla *"
              value={formData.templateName}
              onChange={handleChange('templateName')}
              placeholder="Ej: Hipertrofia Full Body"
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ style: { color: COLORS.textMuted } }}
            />

            {/* Descripción */}
            <TextField
              label="Descripción"
              value={formData.templateDescription}
              onChange={handleChange('templateDescription')}
              placeholder="Describe el objetivo y características..."
              multiline
              rows={2}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ style: { color: COLORS.textMuted } }}
            />

            {/* Categoría */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: COLORS.textMuted }}>Categoría</InputLabel>
              <Select
                value={formData.templateCategory}
                onChange={handleChange('templateCategory')}
                label="Categoría"
              >
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                          ml: 'auto',
                        }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Preview de categoría seleccionada */}
            {selectedCategory && (
              <Chip
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{selectedCategory.emoji}</span>
                    {selectedCategory.label}
                  </Box>
                }
                sx={{
                  backgroundColor: `${selectedCategory.color}22`,
                  color: selectedCategory.color,
                  fontWeight: 600,
                  mb: 2,
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, mb: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
              📅 Estructura
            </Typography>

            {/* Duración */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color={COLORS.text} mb={1}>
                Duración: <strong style={{ color: COLORS.green }}>{formData.weeksCount} semanas</strong>
              </Typography>
              <Slider
                value={formData.weeksCount}
                onChange={handleSliderChange('weeksCount')}
                min={1}
                max={16}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 4, label: '4' },
                  { value: 8, label: '8' },
                  { value: 12, label: '12' },
                  { value: 16, label: '16' },
                ]}
                sx={{
                  color: COLORS.green,
                  '& .MuiSlider-markLabel': {
                    color: COLORS.textMuted,
                    fontSize: 10,
                  },
                }}
              />
            </Box>

            {/* Días por semana */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color={COLORS.text} mb={1}>
                Días por semana: <strong style={{ color: COLORS.blue }}>{formData.daysPerWeek} días</strong>
              </Typography>
              <Slider
                value={formData.daysPerWeek}
                onChange={handleSliderChange('daysPerWeek')}
                min={1}
                max={7}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 3, label: '3' },
                  { value: 5, label: '5' },
                  { value: 7, label: '7' },
                ]}
                sx={{
                  color: COLORS.blue,
                  '& .MuiSlider-markLabel': {
                    color: COLORS.textMuted,
                    fontSize: 10,
                  },
                }}
              />
            </Box>

            {/* Resumen */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: COLORS.surfaceLight,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Typography variant="body2" color={COLORS.textMuted} mb={1}>
                📊 Estructura que se creará:
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} color={COLORS.green}>
                    {formData.weeksCount}
                  </Typography>
                  <Typography variant="caption" color={COLORS.textMuted}>
                    Semanas
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color={COLORS.blue}>
                    {formData.weeksCount * formData.daysPerWeek}
                  </Typography>
                  <Typography variant="caption" color={COLORS.textMuted}>
                    Días totales
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
              🏷️ Tags
            </Typography>

            {/* Tags */}
            <TextField
              label="Tags (separados por coma)"
              value={formData.templateTags}
              onChange={handleChange('templateTags')}
              placeholder="fullbody, gym, intermedio"
              fullWidth
              helperText="Ayudan a encontrar la plantilla más fácilmente"
              InputLabelProps={{ style: { color: COLORS.textMuted } }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Actions - Fixed at bottom */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: COLORS.surface,
          borderTop: `1px solid ${COLORS.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Button onClick={() => navigate('/coach/templates')} sx={{ color: COLORS.red }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.templateName.trim()}
          sx={{
            bgcolor: COLORS.green,
            color: '#000',
            fontWeight: 700,
            px: 4,
            '&:hover': { bgcolor: '#3db897' },
            '&:disabled': { bgcolor: COLORS.surfaceLight, color: COLORS.textMuted },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#000' }} /> : '✓ Crear Plantilla'}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateTemplatePage;

