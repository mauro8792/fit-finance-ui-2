/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  FormControlLabel, 
  Switch, 
  useTheme, 
  MenuItem,
  InputLabel,
  Select,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { useSportPlansStore } from '../../../hooks';

export const UpdateStudentModal = ({ openModal, setOpenModal, selectedUser, onSaveChanges, setSelectedUser, sports }) => {
  const theme = useTheme();
  const mobileScreen = theme.breakpoints.down('sm');
  const { findSportPlansBySport } = useSportPlansStore();

  // Definimos el ancho y alto del modal en función del tamaño de la pantalla
  const modalWidth = mobileScreen ? '90vw' : 800;

  // Establecemos la posición del modal en el centro de la pantalla solo en pantallas más grandes
  const modalPosition = mobileScreen ? 'absolute' : 'fixed';
  const topPosition = mobileScreen ? '5%' : '50%';
  const leftPosition = mobileScreen ? '5%' : '50%';
  const transform = mobileScreen ? 'translate(0%, -5%)' : 'translate(-50%, -50%)';

  const [formData, setFormData] = useState({
    id: selectedUser?.id || '',
    firstName: selectedUser?.firstName || '',
    lastName: selectedUser?.lastName || '',
    birthDate: selectedUser?.birthDate || '',
    phone: selectedUser?.phone || '',
    startDate: selectedUser?.startDate || '',
    document: selectedUser?.document || '',
    isActive: selectedUser?.isActive || false,
    sportId: selectedUser?.sportId || selectedUser?.sport?.id || '',
    sportPlanId: selectedUser?.sportPlanId || '',
  });

  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Cargar planes cuando cambia el deporte seleccionado
  useEffect(() => {
    const loadSportPlans = async (sportId) => {
      if (!sportId) {
        setAvailablePlans([]);
        return;
      }

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
    }
  }, [formData.sportId, findSportPlansBySport]);

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (selectedUser && openModal) {
      setFormData({
        id: selectedUser.id || '',
        firstName: selectedUser.firstName || '',
        lastName: selectedUser.lastName || '',
        birthDate: selectedUser.birthDate || '',
        phone: selectedUser.phone || '',
        startDate: selectedUser.startDate || '',
        document: selectedUser.document || '',
        isActive: selectedUser.isActive || false,
        sportId: selectedUser.sportId || selectedUser.sport?.id || '',
        sportPlanId: selectedUser.sportPlanId || '',
      });
    }
  }, [selectedUser, openModal]);
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'sportId') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
        sportPlanId: '', // Reset sport plan when sport changes
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked,
    }));
  };

  const handleSaveChanges = async () => {
    onSaveChanges(formData);
    setOpenModal(false);
  };

  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      maxWidth={false}
      fullWidth
      style={{ width: modalWidth, position: modalPosition, top: topPosition, left: leftPosition, transform }}
      
    >
      <DialogTitle>Editar Estudiante</DialogTitle>
      <DialogContent style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        <FormControl fullWidth margin='normal'>
          <TextField label='Nombre' name='firstName' value={formData.firstName} onChange={handleInputChange} variant='outlined' />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Apellido' name='lastName' value={formData.lastName} onChange={handleInputChange} variant='outlined' />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField
            label='Fecha de Nacimiento'
            name='birthDate'
            value={formData.birthDate}
            onChange={handleInputChange}
            type='date'
            variant='outlined'
            InputLabelProps={{
              shrink: true,
            }}
          />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Teléfono' name='phone' value={formData.phone} onChange={handleInputChange} variant='outlined' />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField
            label='Fecha de Inicio'
            name='startDate'
            value={formData.startDate}
            onChange={handleInputChange}
            type='date'
            variant='outlined'
            InputLabelProps={{
              shrink: true,
            }}
          />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Documento' name='document' value={formData.document} onChange={handleInputChange} variant='outlined' />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Deporte' name='sportId' select value={formData.sportId} onChange={handleInputChange} variant='outlined'>
            {sports.map((sport) => (
              <MenuItem key={sport.id} value={sport.id}>
                {' '}
                {/* Cambiar value */}
                {`${sport.name} - ${sport.monthlyFee}`}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>

        {/* Sport Plan Selector */}
        <FormControl fullWidth margin='normal'>
          <InputLabel id="sport-plan-select-label">Plan del Deporte</InputLabel>
          <Select
            labelId="sport-plan-select-label"
            name="sportPlanId"
            value={formData.sportPlanId}
            onChange={handleInputChange}
            label="Plan del Deporte"
            disabled={!formData.sportId}
          >
            <MenuItem value="">
              <em>Sin plan específico</em>
            </MenuItem>
            {loadingPlans ? (
              <MenuItem value="" disabled>
                Cargando planes...
              </MenuItem>
            ) : (
              availablePlans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  <Box>
                    <Typography variant="body1">
                      {plan.name} - ${plan.monthlyFee}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.weeklyFrequency === 1 ? '1 vez por semana' : 
                       plan.weeklyFrequency === 2 ? '2 veces por semana' : 
                       plan.weeklyFrequency === 3 ? '3 veces por semana' : 
                       `${plan.weeklyFrequency} veces por semana`}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
          {formData.sportId && availablePlans.length === 0 && !loadingPlans && (
            <Alert severity="info" sx={{ mt: 1 }}>
              No hay planes disponibles para este deporte.
            </Alert>
          )}
        </FormControl>

        <FormControlLabel control={<Switch checked={formData.isActive} onChange={handleSwitchChange} name='isActive' color='primary' />} label='Activo' />
      </DialogContent>
      <DialogActions style={{ justifyContent: 'flex-end' }}>
        <Button onClick={handleCloseModal} color='primary'>
          Cancelar
        </Button>
        <Button onClick={handleSaveChanges} color='primary'>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
