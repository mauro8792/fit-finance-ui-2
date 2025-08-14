import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Alert,
  Autocomplete,
} from '@mui/material';
import { useCoachesStore, useSportsStore } from '../../hooks';

const steps = ['Seleccionar Usuario', 'Información del Coach', 'Asignar Deportes'];

const CoachWizard = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    userId: '',
    specialization: '',
    experience: '',
    certification: '',
    bio: '',
    salary: '',
    sportIds: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const {
    availableUsers,
    fetchAvailableUsers,
    createCoach,
    loading,
  } = useCoachesStore();

  const { sports, findAllSports } = useSportsStore();

  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
      findAllSports();
    }
  }, [open, fetchAvailableUsers, findAllSports]);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      userId: '',
      specialization: '',
      experience: '',
      certification: '',
      bio: '',
      salary: '',
      sportIds: [],
    });
    setFormErrors({});
    setSubmitError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 0:
        if (!formData.userId) {
          errors.userId = 'Debe seleccionar un usuario';
        }
        break;
      case 1:
        // Los campos de información son opcionales
        if (formData.salary && isNaN(parseFloat(formData.salary))) {
          errors.salary = 'El salario debe ser un número válido';
        }
        break;
      case 2:
        // Los deportes son opcionales
        break;
      default:
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    try {
      setSubmitError('');
      const coachData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      };

      await createCoach(coachData);
      handleClose();
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Error al crear el coach');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Selecciona un usuario con rol de coach para crear su perfil de coach.
            </Typography>
            <FormControl fullWidth error={!!formErrors.userId}>
              <InputLabel>Usuario</InputLabel>
              <Select
                value={formData.userId}
                label="Usuario"
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box>
                      <Typography variant="body1">{user.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.userId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.userId}
                </Typography>
              )}
            </FormControl>
            {availableUsers.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No hay usuarios disponibles. Asegúrate de que existan usuarios con rol de coach 
                que no tengan un perfil de coach asignado.
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Completa la información profesional del coach (todos los campos son opcionales).
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Especialización"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Ej: Fuerza, Hipertrofia, Funcional..."
                fullWidth
              />
              <TextField
                label="Experiencia"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Ej: 5 años, Principiante, Experto..."
                fullWidth
              />
              <TextField
                label="Certificaciones"
                value={formData.certification}
                onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                placeholder="Ej: NSCA, ACSM, Entrenador Personal..."
                fullWidth
              />
              <TextField
                label="Salario"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="Salario mensual"
                error={!!formErrors.salary}
                helperText={formErrors.salary}
                fullWidth
              />
              <TextField
                label="Biografía"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Descripción personal del coach..."
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Selecciona los deportes que este coach puede entrenar (opcional).
            </Typography>
            <Autocomplete
              multiple
              options={sports}
              getOptionLabel={(option) => option.name}
              value={sports.filter(sport => formData.sportIds.includes(sport.id))}
              onChange={(event, newValue) => {
                setFormData({ 
                  ...formData, 
                  sportIds: newValue.map(sport => sport.id) 
                });
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Deportes"
                  placeholder="Selecciona deportes..."
                />
              )}
            />
            {formData.sportIds.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Puedes asignar deportes más tarde desde la edición del coach.
              </Alert>
            )}
          </Box>
        );

      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Crear Nuevo Coach
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep !== 0 && (
          <Button onClick={handleBack}>
            Atrás
          </Button>
        )}
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Coach'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 0 && availableUsers.length === 0}
          >
            Siguiente
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

CoachWizard.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CoachWizard;
