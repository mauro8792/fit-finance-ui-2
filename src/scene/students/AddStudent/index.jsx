/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  MenuItem, 
  TextField, 
  useTheme,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import { useStudentsStore, useSportPlansStore } from '../../../hooks';

import { format } from 'date-fns';

export const AddStudentModal = ({ openModal, setOpenModal, fetchStudents, sports }) => {
  const { create } = useStudentsStore();
  const { findSportPlansBySport } = useSportPlansStore();

  const theme = useTheme();
  const mobileScreen = theme.breakpoints.down('sm');

  // Definimos el ancho y alto del modal en función del tamaño de la pantalla
  const modalWidth = mobileScreen ? '90vw' : 700;

  // Establecemos la posición del modal en el centro de la pantalla solo en pantallas más grandes
  const modalPosition = mobileScreen ? 'absolute' : 'fixed';
  const topPosition = mobileScreen ? '5%' : '50%';
  const leftPosition = mobileScreen ? '5%' : '50%';
  const transform = mobileScreen ? 'translate(0%, -5%)' : 'translate(-50%, -50%)';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    sportId: '',
    sportPlanId: '',
    document: '',
    isActive: true,
  });

  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {}, []);

  // Cargar planes cuando cambia el deporte seleccionado
  useEffect(() => {
    const loadSportPlans = async (sportId) => {
      setLoadingPlans(true);
      try {
        const plans = await findSportPlansBySport(sportId);
        setAvailablePlans(plans || []);
      } catch (error) {
        console.error('Error loading sport plans:', error);
        setAvailablePlans([]);
      } finally {
        setLoadingPlans(false);
      }
    };

    if (formData.sportId) {
      loadSportPlans(formData.sportId);
    } else {
      setAvailablePlans([]);
      setFormData(prev => ({ ...prev, sportPlanId: '' }));
    }
  }, [formData.sportId, findSportPlansBySport]);

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({
      firstName: '',
      lastName: '',
      birthDate: '',
      phone: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      sportId: '',
      sportPlanId: '',
      document: '',
      isActive: true,
    });
    setAvailablePlans([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    await create(formData);
    handleCloseModal();
    fetchStudents();
  };

  const selectedSport = sports.find(sport => sport.id === formData.sportId);
  const selectedPlan = availablePlans.find(plan => plan.id === formData.sportPlanId);

  const getFrequencyText = (frequency) => {
    if (frequency === 1) return '1 vez por semana';
    if (frequency === 2) return '2 veces por semana';
    if (frequency === 3) return '3 veces por semana';
    return `${frequency} veces por semana`;
  };

  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      maxWidth={false}
      fullWidth
      style={{ width: modalWidth, position: modalPosition, top: topPosition, left: leftPosition, transform }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Agregar Nuevo Estudiante
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Información personal */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Información Personal
          </Typography>
          
          <TextField 
            label="Nombre" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            variant="outlined" 
          />
          
          <TextField 
            label="Apellido" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            variant="outlined" 
          />
          
          <TextField 
            label="Documento" 
            name="document" 
            value={formData.document} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            variant="outlined" 
          />
          
          <TextField
            label="Fecha de Nacimiento"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            variant="outlined"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField 
            label="Teléfono" 
            name="phone" 
            value={formData.phone} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            variant="outlined" 
          />
          
          <TextField
            label="Fecha de Inicio"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            variant="outlined"
            type="date"
            InputLabelProps={{ shrink: true }}
          />

          {/* Información deportiva */}
          <Typography variant="subtitle1" sx={{ mb: 2, mt: 3, fontWeight: 'bold' }}>
            Información Deportiva
          </Typography>

          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Disciplina Deportiva</InputLabel>
            <Select
              name="sportId"
              value={formData.sportId}
              onChange={handleInputChange}
              label="Disciplina Deportiva"
            >
              {sports.map((sport) => (
                <MenuItem key={sport.id} value={sport.id}>
                  {sport.name} - ${sport.monthlyFee} (precio base)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedSport && (
            <Box sx={{ mt: 2, mb: 2 }}>
              {loadingPlans ? (
                <Typography variant="body2" color="text.secondary">
                  Cargando planes disponibles...
                </Typography>
              ) : availablePlans.length > 0 ? (
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Plan Específico</InputLabel>
                  <Select
                    name="sportPlanId"
                    value={formData.sportPlanId}
                    onChange={handleInputChange}
                    label="Plan Específico"
                  >
                    {availablePlans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        <Box>
                          <Typography variant="body1">
                            {plan.name} - ${plan.monthlyFee}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getFrequencyText(plan.weeklyFrequency)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Alert severity="info">
                  <Typography variant="body2">
                    No hay planes específicos creados para {selectedSport.name}. 
                    Se usará el precio base de ${selectedSport.monthlyFee}.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          {selectedPlan && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Plan Seleccionado:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip label={selectedPlan.name} size="small" />
                <Chip label={`$${selectedPlan.monthlyFee}/mes`} size="small" color="primary" />
                <Chip label={getFrequencyText(selectedPlan.weeklyFrequency)} size="small" color="secondary" />
              </Box>
              {selectedPlan.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedPlan.description}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCloseModal} color="primary">
          Cancelar
        </Button>
        <Button 
          onClick={handleSaveChanges} 
          color="primary" 
          variant="contained"
          disabled={!formData.firstName || !formData.lastName || !formData.sportId}
        >
          Guardar Estudiante
        </Button>
      </DialogActions>
    </Dialog>
  );
};
