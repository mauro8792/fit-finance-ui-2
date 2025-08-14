/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  useTheme,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Divider
} from '@mui/material';

import { useSportsStore, useSportPlansStore } from '../../../hooks';

export const AddSportPlanModal = ({ openModal, setOpenModal, fetchSportPlans }) => {
  const { create } = useSportPlansStore();
  const { findAllSports, sports } = useSportsStore();

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
    sportId: '',
    name: '',
    weeklyFrequency: '',
    monthlyFee: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    findAllSports();
  }, [findAllSports]);

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({
      sportId: '',
      name: '',
      weeklyFrequency: '',
      monthlyFee: '',
      description: '',
      isActive: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      isActive: e.target.checked,
    }));
  };

  const handleSaveChanges = async () => {
    await create(formData);
    handleCloseModal();
    if (fetchSportPlans) {
      fetchSportPlans();
    }
  };

  const selectedSport = sports.find(sport => sport.id === formData.sportId);

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
          Agregar Plan de Disciplina
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crea diferentes planes con frecuencias y precios específicos para una disciplina
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Disciplina</InputLabel>
            <Select
              name="sportId"
              value={formData.sportId}
              onChange={handleInputChange}
              label="Disciplina"
            >
              {sports.map((sport) => (
                <MenuItem key={sport.id} value={sport.id}>
                  {sport.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedSport && (
            <Box sx={{ mt: 1, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Disciplina seleccionada:</strong> {selectedSport.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Precio base:</strong> ${selectedSport.monthlyFee}
              </Typography>
            </Box>
          )}

          <TextField 
            label="Nombre del Plan" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            variant="outlined"
            placeholder="ej: Plan 2 veces por semana, Plan Principiante"
            helperText="Nombre descriptivo para identificar este plan"
          />

          <TextField 
            label="Frecuencia Semanal" 
            name="weeklyFrequency" 
            type="number"
            value={formData.weeklyFrequency} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            variant="outlined"
            inputProps={{ min: 1, max: 7 }}
            helperText="Número de días por semana (1-7)"
          />

          <TextField 
            label="Precio Mensual" 
            name="monthlyFee" 
            type="number"
            value={formData.monthlyFee} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            variant="outlined"
            inputProps={{ min: 0, step: "0.01" }}
            helperText="Precio en pesos para este plan específico"
          />

          <TextField 
            label="Descripción" 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            variant="outlined"
            multiline
            rows={3}
            placeholder="Describe las características de este plan..."
            helperText="Información adicional sobre el plan"
          />

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleSwitchChange}
                name="isActive"
                color="primary"
              />
            }
            label="Plan activo"
          />
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
          disabled={!formData.sportId || !formData.name || !formData.weeklyFrequency || !formData.monthlyFee}
        >
          Guardar Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
};
