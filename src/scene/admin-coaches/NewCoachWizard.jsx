import { useState, useEffect } from 'react';
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
  TextField,
  Chip,
  Alert,
  Autocomplete,
} from '@mui/material';
import { useCoachesStore, useSportsStore } from '../../hooks';

const steps = ['Datos del Usuario', 'Información del Coach', 'Asignar Deportes'];

const NewCoachWizard = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Datos del usuario
    email: '',
    password: '',
    fullName: '',
    // Datos del coach
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
    createCompleteCoach,
    loading,
  } = useCoachesStore();

  const { sports, findAllSports } = useSportsStore();

  useEffect(() => {
    if (open) {
      findAllSports();
    }
  }, [open, findAllSports]);

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
      email: '',
      password: '',
      fullName: '',
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
        if (!formData.email) {
          errors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'El email no tiene un formato válido';
        }
        
        if (!formData.password) {
          errors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
          errors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else if (!/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(formData.password)) {
          errors.password = 'La contraseña debe tener al menos una mayúscula, una minúscula y un número';
        }
        
        if (!formData.fullName) {
          errors.fullName = 'El nombre completo es requerido';
        } else if (formData.fullName.length < 3) {
          errors.fullName = 'El nombre debe tener al menos 3 caracteres';
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

      await createCompleteCoach(coachData);
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
              Ingresa los datos para crear el usuario que será el coach.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ejemplo@correo.com"
                error={!!formErrors.email}
                helperText={formErrors.email}
                fullWidth
                required
              />
              <TextField
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                error={!!formErrors.password}
                helperText={formErrors.password}
                fullWidth
                required
              />
              <TextField
                label="Nombre Completo"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nombre y apellido"
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                fullWidth
                required
              />
            </Box>
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
        <Typography variant="body2" color="text.secondary">
          Se creará el usuario y el perfil de coach automáticamente
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
          >
            Siguiente
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

NewCoachWizard.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NewCoachWizard;
