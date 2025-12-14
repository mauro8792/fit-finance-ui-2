import { useState, useEffect } from 'react';
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
  Autocomplete,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useStudentsStore, useSportsStore, useCoachesStore } from '../../hooks';

const steps = ['Crear Usuario', 'Información del Estudiante', 'Asignaciones'];

const NewStudentWizard = ({ open, onClose }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Usuario
    email: '',
    password: '',
    fullName: '',
    // Estudiante
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    document: '',
    startDate: '',
    sportId: '',
    coachId: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const { createCompleteStudent, loading } = useStudentsStore();
  const { sports, findAllSports } = useSportsStore();
  const { coaches, fetchCoaches } = useCoachesStore();

  useEffect(() => {
    if (open) {
      findAllSports();
      fetchCoaches();
    }
  }, [open, findAllSports, fetchCoaches]);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      phone: '',
      document: '',
      startDate: '',
      sportId: '',
      coachId: '',
      isActive: true,
    });
    setFormErrors({});
    setSubmitError('');
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!formData.email) errors.email = 'Email requerido';
      if (!formData.password) errors.password = 'Contraseña requerida';
      if (formData.password && formData.password.length < 8) errors.password = 'Mínimo 8 caracteres';
      if (!formData.fullName) errors.fullName = 'Nombre completo requerido';
    }

    if (step === 1) {
      if (!formData.firstName) errors.firstName = 'Nombre requerido';
      if (!formData.lastName) errors.lastName = 'Apellido requerido';
      if (!formData.birthDate) errors.birthDate = 'Fecha de nacimiento requerida';
      if (!formData.document) errors.document = 'Documento requerido';
      if (!formData.startDate) errors.startDate = 'Fecha de inicio requerida';
    }

    if (step === 2) {
      if (!formData.sportId) errors.sportId = 'Deporte requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Traducir errores del backend a mensajes amigables
  const parseErrorMessage = (error) => {
    const message = error?.response?.data?.message || error?.message || '';
    
    // Errores de duplicados
    if (message.includes('document') && message.includes('already exists')) {
      return '⚠️ Ya existe un estudiante con este número de documento';
    }
    if (message.includes('email') && message.includes('already exists')) {
      return '⚠️ Ya existe un usuario con este email';
    }
    if (message.includes('Ya existe un usuario con este email')) {
      return '⚠️ Ya existe un usuario con este email';
    }
    
    // Errores de validación
    if (message.includes('must be a valid date')) {
      return '⚠️ El formato de fecha es inválido (usar AAAA-MM-DD)';
    }
    
    // Error genérico
    return message || 'Error al crear el estudiante';
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setSubmitError('');
      await createCompleteStudent(formData);
      handleReset();
      onClose();
    } catch (error) {
      setSubmitError(parseErrorMessage(error));
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Datos del Usuario
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre Completo *"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Contraseña *"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={!!formErrors.password}
                  helperText={formErrors.password || 'Mínimo 8 caracteres'}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Información del Estudiante
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre *"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido *"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Documento *"
                  value={formData.document}
                  onChange={(e) => handleInputChange('document', e.target.value)}
                  error={!!formErrors.document}
                  helperText={formErrors.document}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Teléfono"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de Nacimiento *"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  error={!!formErrors.birthDate}
                  helperText={formErrors.birthDate}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de Inicio *"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  error={!!formErrors.startDate}
                  helperText={formErrors.startDate}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2: {
        const selectedSport = (sports || []).find((s) => s.id === formData.sportId);
        const selectedCoach = (coaches || []).find((c) => c.id === formData.coachId);

        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Asignaciones de Deporte y Coach
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={sports || []}
                  getOptionLabel={(option) => option.name}
                  value={selectedSport || null}
                  onChange={(_, value) => {
                    handleInputChange('sportId', value?.id || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Deporte *"
                      error={!!formErrors.sportId}
                      helperText={formErrors.sportId}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={(coaches || []).filter((c) => c.isActive)}
                  getOptionLabel={(option) => option.user?.fullName || 'Sin nombre'}
                  value={selectedCoach || null}
                  onChange={(_, value) => handleInputChange('coachId', value?.id || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Coach (Opcional)" />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">{option.user?.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.specialization || 'Sin especialización'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>

            <Card sx={{ 
              mt: 3, 
              bgcolor: 'rgba(255, 152, 0, 0.1)', 
              border: '1px solid rgba(255, 152, 0, 0.3)',
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#ff9800' }}>
                  📋 Resumen
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                      <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Email:</span> {formData.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                      <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Nombre:</span> {formData.firstName} {formData.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                      <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Documento:</span> {formData.document}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                      <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Deporte:</span> {selectedSport?.name || 'No seleccionado'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                      <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Coach:</span> {selectedCoach?.user?.fullName || 'No asignado'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Crear Nuevo Estudiante
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Se creará el usuario y el perfil de estudiante automáticamente
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 4 }}>
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

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="error">
          Cancelar
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : 'Crear Estudiante'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Siguiente
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NewStudentWizard;

