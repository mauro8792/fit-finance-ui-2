import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  Autocomplete,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTheme } from '@mui/material/styles';
import { useStudentsStore, useSportsStore, useCoachesStore } from '../../hooks';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

// Registrar locale español
registerLocale('es', es);

// Estilos para DatePicker con tema oscuro
const datePickerStyles = `
  .react-datepicker {
    background-color: #1e1e1e !important;
    border: 1px solid #333 !important;
    font-family: inherit !important;
  }
  .react-datepicker__header {
    background-color: #2a2a2a !important;
    border-bottom: 1px solid #333 !important;
  }
  .react-datepicker__current-month,
  .react-datepicker__day-name,
  .react-datepicker__day {
    color: #fff !important;
  }
  .react-datepicker__day:hover {
    background-color: #ff9800 !important;
    color: #000 !important;
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: #ff9800 !important;
    color: #000 !important;
  }
  .react-datepicker__day--disabled {
    color: #666 !important;
  }
  .react-datepicker__navigation-icon::before {
    border-color: #fff !important;
  }
  .react-datepicker__year-dropdown,
  .react-datepicker__month-dropdown {
    background-color: #1e1e1e !important;
    border: 1px solid #333 !important;
  }
  .react-datepicker__year-option,
  .react-datepicker__month-option {
    color: #fff !important;
  }
  .react-datepicker__year-option:hover,
  .react-datepicker__month-option:hover {
    background-color: #ff9800 !important;
    color: #000 !important;
  }
  .react-datepicker__triangle {
    display: none !important;
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = datePickerStyles;
  styleSheet.id = 'newstudent-datepicker-styles';
  if (!document.getElementById('newstudent-datepicker-styles')) {
    document.head.appendChild(styleSheet);
  }
}

const steps = ['Crear Usuario', 'Información del Estudiante', 'Asignaciones'];

const COLORS = {
  background: '#121212',
  surface: '#1e1e1e',
  surfaceLight: '#2a2a2a',
  text: '#fff',
  textMuted: '#999',
  orange: '#ff9800',
  green: '#4cceac',
  red: '#ef5350',
  border: '#333',
};

const NewStudentPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Usuario
    email: '',
    password: '',
    confirmPassword: '',
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
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { createCompleteStudent, loading } = useStudentsStore();
  const { sports, findAllSports } = useSportsStore();
  const { coaches, fetchCoaches } = useCoachesStore();

  useEffect(() => {
    findAllSports();
    fetchCoaches();
  }, [findAllSports, fetchCoaches]);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!formData.fullName) errors.fullName = 'Nombre completo requerido';
      if (!formData.email) errors.email = 'Email requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email inválido';
      if (!formData.password) errors.password = 'Contraseña requerida';
      else if (formData.password.length < 8) errors.password = 'Mínimo 8 caracteres';
      if (!formData.confirmPassword) errors.confirmPassword = 'Confirmar contraseña';
      else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
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
    
    if (message.includes('document') && message.includes('already exists')) {
      return '⚠️ Ya existe un estudiante con este número de documento';
    }
    if (message.includes('email') && message.includes('already exists')) {
      return '⚠️ Ya existe un usuario con este email';
    }
    if (message.includes('Ya existe un usuario con este email')) {
      return '⚠️ Ya existe un usuario con este email';
    }
    if (message.includes('must be a valid date')) {
      return '⚠️ El formato de fecha es inválido (usar AAAA-MM-DD)';
    }
    
    return message || 'Error al crear el estudiante';
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setSubmitError('');
      // Quitar confirmPassword antes de enviar
      const { confirmPassword, ...dataToSend } = formData;
      await createCompleteStudent(dataToSend);
      setSuccess(true);
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/admin-students');
      }, 2000);
    } catch (error) {
      setSubmitError(parseErrorMessage(error));
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
              👤 Datos del Usuario
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
                  InputLabelProps={{ style: { color: COLORS.textMuted } }}
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
                  InputLabelProps={{ style: { color: COLORS.textMuted } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contraseña *"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={!!formErrors.password}
                  helperText={formErrors.password || 'Mínimo 8 caracteres'}
                  fullWidth
                  InputLabelProps={{ style: { color: COLORS.textMuted } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: COLORS.textMuted }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirmar Contraseña *"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  fullWidth
                  InputLabelProps={{ style: { color: COLORS.textMuted } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: COLORS.textMuted }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
              📋 Información del Estudiante
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
                  InputLabelProps={{ style: { color: COLORS.textMuted } }}
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
                  InputLabelProps={{ style: { color: COLORS.textMuted } }}
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
                  InputLabelProps={{ style: { color: COLORS.textMuted } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Teléfono"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  fullWidth
                  InputLabelProps={{ style: { color: COLORS.textMuted } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography 
                    variant="caption" 
                    sx={{ color: formErrors.birthDate ? COLORS.red : COLORS.textMuted, mb: 0.5, display: 'block' }}
                  >
                    Fecha de Nacimiento *
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: COLORS.surfaceLight,
                    borderRadius: 1,
                    border: `1px solid ${formErrors.birthDate ? COLORS.red : COLORS.border}`,
                    p: 1,
                  }}>
                    <CalendarTodayIcon sx={{ color: COLORS.orange, fontSize: 20 }} />
                    <DatePicker
                      selected={formData.birthDate ? new Date(formData.birthDate) : null}
                      onChange={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          handleInputChange('birthDate', `${year}-${month}-${day}`);
                        } else {
                          handleInputChange('birthDate', '');
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      locale="es"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={100}
                      scrollableYearDropdown
                      maxDate={new Date()}
                      placeholderText="dd/mm/aaaa"
                      customInput={
                        <input
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: COLORS.text,
                            fontSize: '16px',
                            width: '100%',
                            outline: 'none',
                          }}
                        />
                      }
                    />
                  </Box>
                  {formErrors.birthDate && (
                    <Typography variant="caption" sx={{ color: COLORS.red, mt: 0.5, display: 'block' }}>
                      {formErrors.birthDate}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography 
                    variant="caption" 
                    sx={{ color: formErrors.startDate ? COLORS.red : COLORS.textMuted, mb: 0.5, display: 'block' }}
                  >
                    Fecha de Inicio *
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: COLORS.surfaceLight,
                    borderRadius: 1,
                    border: `1px solid ${formErrors.startDate ? COLORS.red : COLORS.border}`,
                    p: 1,
                  }}>
                    <CalendarTodayIcon sx={{ color: COLORS.orange, fontSize: 20 }} />
                    <DatePicker
                      selected={formData.startDate ? new Date(formData.startDate) : null}
                      onChange={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          handleInputChange('startDate', `${year}-${month}-${day}`);
                        } else {
                          handleInputChange('startDate', '');
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      locale="es"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      placeholderText="dd/mm/aaaa"
                      customInput={
                        <input
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: COLORS.text,
                            fontSize: '16px',
                            width: '100%',
                            outline: 'none',
                          }}
                        />
                      }
                    />
                  </Box>
                  {formErrors.startDate && (
                    <Typography variant="caption" sx={{ color: COLORS.red, mt: 0.5, display: 'block' }}>
                      {formErrors.startDate}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 2: {
        const selectedSport = (sports || []).find((s) => s.id === formData.sportId);
        const selectedCoach = (coaches || []).find((c) => c.id === formData.coachId);

        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
              🏋️ Asignaciones de Deporte y Coach
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
              border: `1px solid ${COLORS.orange}44`,
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
                  📋 Resumen
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: COLORS.text, mb: 1 }}>
                      <span style={{ color: COLORS.orange, fontWeight: 'bold' }}>Email:</span> {formData.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.text, mb: 1 }}>
                      <span style={{ color: COLORS.orange, fontWeight: 'bold' }}>Nombre:</span> {formData.firstName} {formData.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.text, mb: 1 }}>
                      <span style={{ color: COLORS.orange, fontWeight: 'bold' }}>Documento:</span> {formData.document}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: COLORS.text, mb: 1 }}>
                      <span style={{ color: COLORS.orange, fontWeight: 'bold' }}>Deporte:</span> {selectedSport?.name || 'No seleccionado'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.text, mb: 1 }}>
                      <span style={{ color: COLORS.orange, fontWeight: 'bold' }}>Coach:</span> {selectedCoach?.user?.fullName || 'No asignado'}
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

  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}>
        <Typography fontSize={64} mb={2}>✅</Typography>
        <Typography variant="h5" color={COLORS.green} fontWeight={700} mb={1}>
          ¡Estudiante creado exitosamente!
        </Typography>
        <Typography color={COLORS.textMuted}>
          Redirigiendo...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: COLORS.background,
      pb: 3,
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        p: 2,
        borderBottom: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.surface,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <IconButton onClick={() => navigate('/admin-students')} sx={{ color: COLORS.text }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h6" fontWeight={700} color={COLORS.text}>
            ➕ Nuevo Estudiante
          </Typography>
          <Typography fontSize={12} color={COLORS.textMuted}>
            Se creará usuario y perfil automáticamente
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Box sx={{ p: 2, bgcolor: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                sx={{
                  '& .MuiStepLabel-label': {
                    color: activeStep >= index ? COLORS.orange : COLORS.textMuted,
                    fontSize: { xs: '10px', sm: '14px' },
                  },
                  '& .MuiStepIcon-root': {
                    color: activeStep >= index ? COLORS.orange : COLORS.textMuted,
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: COLORS.orange,
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: COLORS.green,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Card sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {renderStepContent(activeStep)}
          </CardContent>
        </Card>
      </Box>

      {/* Actions - Fixed at bottom */}
      <Box sx={{ 
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
      }}>
        <Button 
          onClick={() => navigate('/admin-students')} 
          sx={{ color: COLORS.red }}
        >
          Cancelar
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            disabled={activeStep === 0} 
            onClick={handleBack}
            sx={{ color: COLORS.text }}
          >
            Atrás
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={handleSubmit} 
              disabled={loading}
              sx={{
                bgcolor: COLORS.green,
                color: '#000',
                fontWeight: 700,
                '&:hover': { bgcolor: '#3db897' },
              }}
            >
              {loading ? 'Creando...' : '✓ Crear'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              sx={{
                bgcolor: COLORS.orange,
                color: '#000',
                fontWeight: 700,
                '&:hover': { bgcolor: '#e68a00' },
              }}
            >
              Siguiente →
            </Button>
          )}
        </Box>
      </Box>

      {/* Spacer for fixed bottom bar */}
      <Box sx={{ height: 80 }} />
    </Box>
  );
};

export default NewStudentPage;

