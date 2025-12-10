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
import { useStudentsStore, useSportsStore, useCoachesStore } from '../../hooks';

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

  const handleSubmit = async () => {
    try {
      setError('');
      await updateStudent(studentId, formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Error actualizando estudiante');
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
                <TextField
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
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
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
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

