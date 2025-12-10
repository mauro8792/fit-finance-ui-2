import { useState, useEffect } from 'react';
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
  RadioGroup,
  Radio,
  FormControlLabel,
  Autocomplete,
  Chip,
  Switch,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { tokens } from '../../../theme';
import { assignTemplate, getCategoryInfo } from '../../../api/templateApi';
import { getCoachStudents, getMacrocyclesByStudent } from '../../../api/fitFinanceApi';
import { useAuthStore } from '../../../hooks';

const AssignTemplateModal = ({ open, onClose, template, onSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user } = useAuthStore();

  // Estados
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mode, setMode] = useState('new_macro');
  const [studentMacros, setStudentMacros] = useState([]);
  const [loadingMacros, setLoadingMacros] = useState(false);
  const [selectedMacroId, setSelectedMacroId] = useState(null);
  const [newMacroName, setNewMacroName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [keepSuggestedLoads, setKeepSuggestedLoads] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Cargar alumnos
  useEffect(() => {
    if (open) {
      loadStudents();
      // Set fecha de inicio por defecto a hoy
      const today = new Date();
      setStartDate(today.toISOString().split('T')[0]);
    }
  }, [open]);

  // Actualizar nombre del macro cuando cambia el alumno
  useEffect(() => {
    if (selectedStudent && template) {
      setNewMacroName(`${template.templateName} - ${selectedStudent.user?.fullName || 'Alumno'}`);
      
      // Cargar macrociclos del alumno
      const loadStudentMacros = async () => {
        try {
          setLoadingMacros(true);
          const macros = await getMacrocyclesByStudent(selectedStudent.id);
          setStudentMacros(macros || []);
        } catch (err) {
          console.error('Error cargando macrociclos:', err);
          setStudentMacros([]);
        } finally {
          setLoadingMacros(false);
        }
      };
      loadStudentMacros();
    }
  }, [selectedStudent, template]);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await getCoachStudents(user?.id);
      setStudents(data || []);
    } catch (err) {
      console.error('Error cargando alumnos:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async () => {
    // Validación
    if (!selectedStudent) {
      setError('Seleccioná un alumno');
      return;
    }
    if (!startDate) {
      setError('Seleccioná una fecha de inicio');
      return;
    }
    if (mode === 'new_macro' && !newMacroName.trim()) {
      setError('Ingresá un nombre para el macrociclo');
      return;
    }
    if (mode === 'existing_macro' && !selectedMacroId) {
      setError('Seleccioná un macrociclo existente');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await assignTemplate(template.id, {
        studentId: selectedStudent.id,
        mode,
        newMacroName: mode === 'new_macro' ? newMacroName.trim() : undefined,
        existingMacrocycleId: mode === 'existing_macro' ? selectedMacroId : undefined,
        startDate,
        keepSuggestedLoads,
      });

      setSuccess(true);
      
      // Esperar un momento para mostrar el éxito
      setTimeout(() => {
        resetForm();
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error('Error asignando plantilla:', err);
      setError(err.response?.data?.message || 'Error al asignar la plantilla');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setMode('new_macro');
    setNewMacroName('');
    setStartDate('');
    setKeepSuggestedLoads(false);
    setStudentMacros([]);
    setSelectedMacroId(null);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!template) return null;

  const categoryInfo = getCategoryInfo(template.templateCategory);

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
            background: `linear-gradient(135deg, ${categoryInfo.color}22 0%, transparent 100%)`,
          }}
        >
          <Typography variant="h5" fontWeight={700} color={colors.grey[100]}>
            📋 Asignar Plantilla
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>{categoryInfo.emoji}</span>
                  {template.templateName}
                </Box>
              }
              sx={{
                backgroundColor: `${categoryInfo.color}22`,
                color: categoryInfo.color,
                fontWeight: 600,
              }}
            />
            <Typography variant="body2" color={colors.grey[400]}>
              {template.microcyclesCount} semanas • {template.totalExercises} ejercicios
            </Typography>
          </Box>
        </Box>

        {/* Contenido */}
        {success ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography fontSize={64} mb={2}>🎉</Typography>
            <Typography variant="h5" color={colors.greenAccent[500]} fontWeight={700}>
              ¡Plantilla asignada!
            </Typography>
            <Typography color={colors.grey[400]} mt={1}>
              La rutina fue copiada correctamente al alumno
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Selector de alumno */}
            <Autocomplete
              options={students}
              getOptionLabel={(option) => option.user?.fullName || `Alumno #${option.id}`}
              value={selectedStudent}
              onChange={(_, value) => {
                setSelectedStudent(value);
                setError(null);
              }}
              loading={loadingStudents}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar Alumno *"
                  placeholder="Buscar alumno..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: colors.primary[500],
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingStudents ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography fontWeight={600}>
                      {option.user?.fullName || `Alumno #${option.id}`}
                    </Typography>
                    <Typography variant="caption" color={colors.grey[400]}>
                      {option.user?.email}
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {/* Modo de asignación */}
            <Box>
              <Typography variant="body2" color={colors.grey[300]} mb={1}>
                ¿Dónde agregar el mesociclo?
              </Typography>
              <RadioGroup
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <FormControlLabel
                  value="new_macro"
                  control={<Radio sx={{ color: colors.greenAccent[500] }} />}
                  label={
                    <Box>
                      <Typography color={colors.grey[100]}>
                        Crear nuevo macrociclo
                      </Typography>
                      <Typography variant="caption" color={colors.grey[400]}>
                        Se creará un programa nuevo con esta plantilla
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="existing_macro"
                  control={<Radio sx={{ color: colors.greenAccent[500] }} />}
                  disabled={!selectedStudent || studentMacros.length === 0}
                  label={
                    <Box>
                      <Typography color={!selectedStudent || studentMacros.length === 0 ? colors.grey[500] : colors.grey[100]}>
                        Agregar a macrociclo existente
                      </Typography>
                      <Typography variant="caption" color={colors.grey[400]}>
                        {!selectedStudent 
                          ? 'Seleccioná un alumno primero'
                          : studentMacros.length === 0 
                            ? 'El alumno no tiene macrociclos'
                            : `${studentMacros.length} macrociclo(s) disponible(s)`
                        }
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </Box>

            {/* Selector de macrociclo existente */}
            {mode === 'existing_macro' && studentMacros.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Macrociclo existente *</InputLabel>
                <Select
                  value={selectedMacroId || ''}
                  onChange={(e) => setSelectedMacroId(e.target.value)}
                  label="Macrociclo existente *"
                  sx={{ backgroundColor: colors.primary[500] }}
                >
                  {studentMacros.map((macro) => (
                    <MenuItem key={macro.id} value={macro.id}>
                      <Box>
                        <Typography>{macro.name || `Macrociclo #${macro.id}`}</Typography>
                        <Typography variant="caption" color={colors.grey[400]}>
                          {macro.mesocycles?.length || 0} mesociclo(s) • 
                          {macro.startDate ? ` Inicio: ${new Date(macro.startDate).toLocaleDateString()}` : ' Sin fecha'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Nombre del nuevo macro */}
            {mode === 'new_macro' && (
              <TextField
                label="Nombre del macrociclo *"
                value={newMacroName}
                onChange={(e) => {
                  setNewMacroName(e.target.value);
                  setError(null);
                }}
                placeholder="Ej: Programa Hipertrofia 2025"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.primary[500],
                  },
                }}
              />
            )}

            {/* Fecha de inicio */}
            <TextField
              label="Fecha de inicio *"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setError(null);
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: colors.primary[500],
                },
              }}
            />

            {/* Opción de mantener cargas */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 2,
                backgroundColor: colors.primary[500],
              }}
            >
              <Box>
                <Typography color={colors.grey[100]}>
                  Mantener cargas sugeridas
                </Typography>
                <Typography variant="caption" color={colors.grey[400]}>
                  Si está activado, se copiarán los pesos de la plantilla
                </Typography>
              </Box>
              <Switch
                checked={keepSuggestedLoads}
                onChange={(e) => setKeepSuggestedLoads(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: colors.greenAccent[500],
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: colors.greenAccent[500],
                  },
                }}
              />
            </Box>

            {/* Info */}
            <Alert 
              severity="info" 
              sx={{ 
                backgroundColor: colors.blueAccent[900],
                '& .MuiAlert-icon': { color: colors.blueAccent[400] },
              }}
            >
              <Typography variant="body2">
                Se copiará la estructura completa de la plantilla:
                <strong> {template.microcyclesCount} semanas</strong>,
                <strong> {template.totalDays || template.microcyclesCount * 4} días</strong>,
                <strong> {template.totalExercises} ejercicios</strong>.
              </Typography>
            </Alert>

            {/* Error */}
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
          </Box>
        )}

        {/* Actions */}
        {!success && (
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
              disabled={loading || !selectedStudent}
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
                '✓ Asignar Plantilla'
              )}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignTemplateModal;

