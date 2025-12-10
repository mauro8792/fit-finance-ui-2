import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  CircularProgress,
  Slider,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { tokens } from '../../../theme';
import { createTemplate, TEMPLATE_CATEGORIES } from '../../../api/templateApi';

const CreateTemplateModal = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSliderChange = (field) => (_, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      
      const result = await createTemplate({
        ...formData,
        templateName: formData.templateName.trim(),
        templateDescription: formData.templateDescription.trim(),
        templateTags: formData.templateTags.trim(),
        objetivo: formData.objetivo.trim(),
      });

      // Resetear form
      setFormData({
        templateName: '',
        templateDescription: '',
        templateCategory: 'hipertrofia',
        templateTags: '',
        objetivo: '',
        weeksCount: 4,
        daysPerWeek: 4,
      });

      onSuccess?.(result);
    } catch (err) {
      console.error('Error creando plantilla:', err);
      setError(err.response?.data?.message || 'Error al crear la plantilla');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  const selectedCategory = TEMPLATE_CATEGORIES.find(c => c.value === formData.templateCategory);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.primary[400],
          borderRadius: 3,
          border: `1px solid ${colors.primary[300]}`,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${colors.primary[300]}`,
            background: `linear-gradient(135deg, ${colors.greenAccent[700]}22 0%, transparent 100%)`,
          }}
        >
          <Typography variant="h5" fontWeight={700} color={colors.grey[100]}>
            ✨ Nueva Plantilla
          </Typography>
          <Typography variant="body2" color={colors.grey[400]} mt={0.5}>
            Creá una estructura que podrás reutilizar con múltiples alumnos
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Nombre */}
          <TextField
            label="Nombre de la plantilla *"
            value={formData.templateName}
            onChange={handleChange('templateName')}
            placeholder="Ej: Hipertrofia Full Body"
            fullWidth
            error={!!error && !formData.templateName.trim()}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.primary[500],
              },
            }}
          />

          {/* Descripción */}
          <TextField
            label="Descripción"
            value={formData.templateDescription}
            onChange={handleChange('templateDescription')}
            placeholder="Describe el objetivo y características de esta rutina..."
            multiline
            rows={2}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.primary[500],
              },
            }}
          />

          {/* Categoría */}
          <FormControl fullWidth>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={formData.templateCategory}
              onChange={handleChange('templateCategory')}
              label="Categoría"
              sx={{ backgroundColor: colors.primary[500] }}
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
                alignSelf: 'flex-start',
                backgroundColor: `${selectedCategory.color}22`,
                color: selectedCategory.color,
                fontWeight: 600,
              }}
            />
          )}

          {/* Duración */}
          <Box>
            <Typography variant="body2" color={colors.grey[300]} mb={1}>
              Duración: <strong>{formData.weeksCount} semanas</strong>
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
                color: colors.greenAccent[500],
                '& .MuiSlider-markLabel': {
                  color: colors.grey[500],
                  fontSize: 10,
                },
              }}
            />
          </Box>

          {/* Días por semana */}
          <Box>
            <Typography variant="body2" color={colors.grey[300]} mb={1}>
              Días por semana: <strong>{formData.daysPerWeek} días</strong>
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
                color: colors.blueAccent[500],
                '& .MuiSlider-markLabel': {
                  color: colors.grey[500],
                  fontSize: 10,
                },
              }}
            />
          </Box>

          {/* Tags */}
          <TextField
            label="Tags (separados por coma)"
            value={formData.templateTags}
            onChange={handleChange('templateTags')}
            placeholder="fullbody, gym, intermedio"
            fullWidth
            helperText="Ayudan a encontrar la plantilla más fácilmente"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.primary[500],
              },
            }}
          />

          {/* Resumen */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: colors.primary[500],
              border: `1px solid ${colors.primary[300]}`,
            }}
          >
            <Typography variant="body2" color={colors.grey[400]} mb={1}>
              📊 Estructura que se creará:
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={700} color={colors.greenAccent[500]}>
                  {formData.weeksCount}
                </Typography>
                <Typography variant="caption" color={colors.grey[400]}>
                  Semanas
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color={colors.blueAccent[400]}>
                  {formData.weeksCount * formData.daysPerWeek}
                </Typography>
                <Typography variant="caption" color={colors.grey[400]}>
                  Días totales
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Error */}
          {error && (
            <Typography color="error" fontSize={13}>
              {error}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        <Box
          sx={{
            p: 3,
            pt: 0,
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ color: colors.grey[400] }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.templateName.trim()}
            sx={{
              background: `linear-gradient(135deg, ${colors.greenAccent[600]} 0%, ${colors.greenAccent[700]} 100%)`,
              fontWeight: 600,
              px: 4,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.greenAccent[500]} 0%, ${colors.greenAccent[600]} 100%)`,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Crear Plantilla'
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateModal;

