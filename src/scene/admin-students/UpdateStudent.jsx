import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  Autocomplete,
  Alert,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useStudentsStore, useSportsStore, useCoachesStore } from '../../hooks';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

// Registrar locale español
registerLocale('es', es);

const UpdateStudent = ({ open, onClose, studentId, onSuccess }) => {
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

  useEffect(() => {
    if (open) {
      findAllSports();
      fetchCoaches();
    }
  }, [open, findAllSports, fetchCoaches]);

  useEffect(() => {
    const loadStudent = async () => {
      if (studentId && open) {
        setLoadingData(true);
        try {
          const student = await getStudentById(studentId);
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
  }, [studentId, open, getStudentById]);

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
      return '⚠️ El formato de fecha es inválido (usar AAAA-MM-DD)';
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
      
      await updateStudent(studentId, dataToSend);
      
      // Limpiar campos de contraseña
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(parseErrorMessage(err));
    }
  };

  if (!open) return null;

  const selectedSport = (sports || []).find((s) => s.id === formData.sportId);
  const selectedCoach = (coaches || []).find((c) => c.id === formData.coachId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          ✏️ Editar Estudiante
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loadingData ? (
          <Typography>Cargando...</Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Documento"
                  value={formData.document}
                  onChange={(e) => handleInputChange('document', e.target.value)}
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
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                    Fecha de Nacimiento
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(255,255,255,0.2)',
                    p: 1.5,
                  }}>
                    <CalendarTodayIcon sx={{ color: '#ff9800', fontSize: 20 }} />
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
                            color: '#fff',
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
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                    Fecha de Inicio
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(255,255,255,0.2)',
                    p: 1.5,
                  }}>
                    <CalendarTodayIcon sx={{ color: '#ff9800', fontSize: 20 }} />
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
                            color: '#fff',
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

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Asignaciones
                </Typography>
              </Grid>

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

              {/* Sección de Cambio de Contraseña */}
              <Grid item xs={12}>
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Button
                    variant="text"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    sx={{ color: '#ff9800', mb: 1 }}
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
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateStudent;

