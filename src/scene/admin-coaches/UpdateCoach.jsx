import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  Autocomplete,
  Chip,
  Alert,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useCoachesStore, useSportsStore } from '../../hooks';

const UpdateCoach = ({ open, onClose, coachId }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
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
    selectedCoach,
    loading,
    fetchCoach,
    updateCoach,
    clearSelectedCoach,
  } = useCoachesStore();

  const { sports, findAllSports } = useSportsStore();

  useEffect(() => {
    if (open && coachId) {
      fetchCoach(coachId);
      findAllSports();
    }
    return () => {
      if (!open) {
        clearSelectedCoach();
      }
    };
  }, [open, coachId, fetchCoach, findAllSports, clearSelectedCoach]);

  useEffect(() => {
    if (selectedCoach) {
      setFormData({
        specialization: selectedCoach.specialization || '',
        experience: selectedCoach.experience || '',
        certification: selectedCoach.certification || '',
        bio: selectedCoach.bio || '',
        salary: selectedCoach.salary ? selectedCoach.salary.toString() : '',
        sportIds: selectedCoach.sports?.map(sport => sport.id) || [],
      });
    }
  }, [selectedCoach]);

  const handleClose = () => {
    setFormData({
      specialization: '',
      experience: '',
      certification: '',
      bio: '',
      salary: '',
      sportIds: [],
    });
    setFormErrors({});
    setSubmitError('');
    setActiveTab(0);
    onClose();
  };

  const validateForm = () => {
    const errors = {};
    
    if (formData.salary && isNaN(parseFloat(formData.salary))) {
      errors.salary = 'El salario debe ser un número válido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const updateData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      };

      await updateCoach(coachId, updateData);
      handleClose();
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Error al actualizar el coach');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
              rows={4}
              fullWidth
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Gestiona los deportes que este coach puede entrenar.
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
                    color="primary"
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Deportes Asignados"
                  placeholder="Selecciona deportes..."
                />
              )}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Deportes seleccionados: {formData.sportIds.length}
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!selectedCoach && !loading) {
    return null;
  }

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
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        pb: 1
      }}>
        <Avatar 
          sx={{ 
            bgcolor: theme.palette.primary.main, 
            mr: 2, 
            width: 40, 
            height: 40 
          }}
        >
          {selectedCoach?.user?.fullName?.charAt(0) || 'C'}
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Editar Coach
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCoach?.user?.fullName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Cargando información del coach...</Typography>
          </Box>
        ) : (
          <>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}

            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="Información Personal" />
              <Tab label="Deportes Asignados" />
            </Tabs>

            {renderTabContent()}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UpdateCoach.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  coachId: PropTypes.number,
};

export default UpdateCoach;
