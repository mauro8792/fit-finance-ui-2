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
  Autocomplete,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useStudentsStore, useSportsStore, useCoachesStore } from '../../hooks';

const steps = ['Seleccionar Usuario', 'Información del Estudiante', 'Asignaciones'];

const StudentWizard = ({ open, onClose }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    document: '',
    startDate: '',
    sportId: '',
    sportPlanId: '',
    coachId: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const {
    availableUsers,
    createStudent,
    fetchAvailableUsers,
    loading,
  } = useStudentsStore();

  const { sports, sportPlans, findAllSports, findSportPlansBySport } = useSportsStore();
  const { coaches, fetchCoaches } = useCoachesStore();

  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
      findAllSports();
      fetchCoaches();
    }
  }, [open, fetchAvailableUsers, findAllSports, fetchCoaches]);

  // Load sport plans when sport changes
  useEffect(() => {
    if (formData.sportId) {
      findSportPlansBySport(formData.sportId);
    }
  }, [formData.sportId, findSportPlansBySport]);

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
      firstName: '',
      lastName: '',
      birthDate: '',
      phone: '',
      document: '',
      startDate: '',
      sportId: '',
      sportPlanId: '',
      coachId: '',
      isActive: true,
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
        if (!formData.firstName) errors.firstName = 'El nombre es requerido';
        if (!formData.lastName) errors.lastName = 'El apellido es requerido';
        if (!formData.document) errors.document = 'El documento es requerido';
        if (!formData.birthDate) errors.birthDate = 'La fecha de nacimiento es requerida';
        if (!formData.startDate) errors.startDate = 'La fecha de inicio es requerida';
        break;
      case 2:
        if (!formData.sportId) errors.sportId = 'Debe seleccionar un deporte';
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setSubmitError('');
      await createStudent(formData);
      handleClose();
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Error al crear el estudiante');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Seleccionar Usuario Existente
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Selecciona un usuario que tenga rol de estudiante para asignarle información de estudiante.
            </Typography>
            
            <Autocomplete
              options={availableUsers}
              getOptionLabel={(option) => `${option.fullName} (${option.email})`}
              value={availableUsers.find(user => user.id === formData.userId) || null}
              onChange={(event, value) => handleInputChange('userId', value?.id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Usuario"
                  error={!!formErrors.userId}
                  helperText={formErrors.userId}
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
            
            {availableUsers.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No hay usuarios disponibles con rol de estudiante que no tengan ya un perfil de estudiante asignado.
              </Alert>
            )}
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
                  label="Nombre"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Documento"
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
                  label="Fecha de Nacimiento"
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
                  label="Fecha de Inicio"
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
        const selectedSport = sports.find(sport => sport.id === formData.sportId);
        const availablePlans = sportPlans.filter(plan => plan.sport?.id === formData.sportId);
        const selectedCoach = coaches.find(coach => coach.id === formData.coachId);
        
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Asignaciones de Deporte y Coach
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={sports}
                  getOptionLabel={(option) => option.name}
                  value={selectedSport || null}
                  onChange={(event, value) => {
                    handleInputChange('sportId', value?.id || '');
                    handleInputChange('sportPlanId', ''); // Reset plan when sport changes
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Deporte"
                      error={!!formErrors.sportId}
                      helperText={formErrors.sportId}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              
              {selectedSport && availablePlans.length > 0 && (
                <Grid item xs={12}>
                  <Autocomplete
                    options={availablePlans}
                    getOptionLabel={(option) => `${option.name} - $${option.monthlyFee}`}
                    value={availablePlans.find(plan => plan.id === formData.sportPlanId) || null}
                    onChange={(event, value) => handleInputChange('sportPlanId', value?.id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Plan de Precio (Opcional)"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Autocomplete
                  options={coaches.filter(coach => coach.isActive)}
                  getOptionLabel={(option) => option.user?.fullName || 'Sin nombre'}
                  value={selectedCoach || null}
                  onChange={(event, value) => handleInputChange('coachId', value?.id || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Coach (Opcional)"
                      fullWidth
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">
                          {option.user?.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.specialization || 'Sin especialización'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>

            {/* Summary Card */}
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
                      <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Usuario:</span> {availableUsers.find(u => u.id === formData.userId)?.fullName}
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Asignar Usuario como Estudiante
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Convierte un usuario existente en estudiante del gimnasio
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
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
        <Button onClick={handleClose}>
          Cancelar
        </Button>
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
            {loading ? 'Creando...' : 'Crear Estudiante'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={formData.userId === '' && activeStep === 0}
          >
            Siguiente
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

StudentWizard.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default StudentWizard;
