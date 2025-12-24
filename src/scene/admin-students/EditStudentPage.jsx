import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Autocomplete,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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
  styleSheet.id = 'editstudent-datepicker-styles';
  if (!document.getElementById('editstudent-datepicker-styles')) {
    document.head.appendChild(styleSheet);
  }
}

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

const EditStudentPage = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { getStudentById, updateStudent, loading } = useStudentsStore();
  const { sports, findAllSports } = useSportsStore();
  const { coaches, fetchCoaches } = useCoachesStore();

  const [formData, setFormData] = useState({
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

  // Campos para cambio de contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    findAllSports();
    fetchCoaches();
  }, [findAllSports, fetchCoaches]);

  useEffect(() => {
    const loadStudent = async () => {
      if (studentId) {
        setLoadingData(true);
        try {
          const student = await getStudentById(parseInt(studentId));
          setStudentName(student.user?.fullName || `${student.firstName} ${student.lastName}`);
          setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            birthDate: student.birthDate || '',
            phone: student.phone || '',
            document: student.document || '',
            startDate: student.startDate || '',
            sportId: student.sport?.id || student.sportId || '',
            coachId: student.coach?.id || student.coachId || '',
            isActive: student.isActive ?? true,
          });
        } catch (err) {
          setError('Error cargando datos del estudiante');
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadStudent();
  }, [studentId, getStudentById]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
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
    if (message.includes('must be a valid date')) {
      return '⚠️ El formato de fecha es inválido';
    }

    return message || 'Error actualizando estudiante';
  };

  const handleSubmit = async () => {
    try {
      setError('');

      // Validar contraseñas si se quiere cambiar
      if (showPasswordSection && newPassword) {
        if (newPassword.length < 8) {
          setError('La contraseña debe tener al menos 8 caracteres');
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }
      }

      // Preparar datos para enviar
      const dataToSend = { ...formData };
      if (showPasswordSection && newPassword) {
        dataToSend.newPassword = newPassword;
      }

      await updateStudent(parseInt(studentId), dataToSend);

      setSuccess(true);
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/admin-students');
      }, 2000);
    } catch (err) {
      setError(parseErrorMessage(err));
    }
  };

  const selectedSport = (sports || []).find((s) => s.id === formData.sportId);
  const selectedCoach = (coaches || []).find((c) => c.id === formData.coachId);

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
          ¡Cambios guardados!
        </Typography>
        <Typography color={COLORS.textMuted}>Redirigiendo...</Typography>
      </Box>
    );
  }

  if (loadingData) {
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
        <CircularProgress sx={{ color: COLORS.orange }} />
        <Typography color={COLORS.textMuted} mt={2}>
          Cargando datos...
        </Typography>
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
        <IconButton onClick={() => navigate('/admin-students')} sx={{ color: COLORS.text }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h6" fontWeight={700} color={COLORS.text}>
            ✏️ Editar Estudiante
          </Typography>
          <Typography fontSize={12} color={COLORS.textMuted}>
            {studentName}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, mb: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
              👤 Datos Personales
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  fullWidth
                  InputLabelProps={{ style: { color: COLORS.textMuted } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  fullWidth
                  InputLabelProps={{ style: { color: COLORS.textMuted } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Documento"
                  value={formData.document}
                  onChange={(e) => handleInputChange('document', e.target.value)}
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
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 0.5, display: 'block' }}>
                    Fecha de Nacimiento
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: COLORS.surfaceLight,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.border}`,
                      p: 1.5,
                    }}
                  >
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
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, mb: 0.5, display: 'block' }}>
                    Fecha de Inicio
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: COLORS.surfaceLight,
                      borderRadius: 1,
                      border: `1px solid ${COLORS.border}`,
                      p: 1.5,
                    }}
                  >
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
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, mb: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.orange }}>
              🏋️ Asignaciones
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
                  renderInput={(params) => <TextField {...params} label="Deporte" />}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={(coaches || []).filter((c) => c.isActive)}
                  getOptionLabel={(option) => option.user?.fullName || 'Sin nombre'}
                  value={selectedCoach || null}
                  onChange={(_, value) => handleInputChange('coachId', value?.id || '')}
                  renderInput={(params) => <TextField {...params} label="Coach" />}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography>{option.user?.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.specialization || 'Sin especialización'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Sección de Cambio de Contraseña */}
        <Card sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Button
              variant="text"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              sx={{ color: COLORS.orange, mb: showPasswordSection ? 2 : 0 }}
            >
              🔐 {showPasswordSection ? 'Ocultar cambio de contraseña' : 'Cambiar contraseña'}
            </Button>

            {showPasswordSection && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Dejá en blanco si no querés cambiar la contraseña
                  </Alert>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nueva Contraseña"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    helperText="Mínimo 8 caracteres"
                    error={newPassword.length > 0 && newPassword.length < 8}
                    InputLabelProps={{ style: { color: COLORS.textMuted } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Confirmar Contraseña"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                    helperText={
                      confirmPassword.length > 0 && newPassword !== confirmPassword
                        ? 'Las contraseñas no coinciden'
                        : ''
                    }
                    InputLabelProps={{ style: { color: COLORS.textMuted } }}
                  />
                </Grid>
              </Grid>
            )}
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
        <Button onClick={() => navigate('/admin-students')} sx={{ color: COLORS.red }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: COLORS.orange,
            color: '#000',
            fontWeight: 700,
            px: 4,
            '&:hover': { bgcolor: '#e68a00' },
          }}
        >
          {loading ? 'Guardando...' : '✓ Guardar Cambios'}
        </Button>
      </Box>
    </Box>
  );
};

export default EditStudentPage;

