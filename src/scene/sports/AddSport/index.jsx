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
  Typography,
  Box,
  Alert
} from '@mui/material';

import { useSportsStore } from '../../../hooks';

export const AddSportModal = ({ openModal, setOpenModal, fetchSports }) => {
  const { create } = useSportsStore();

  const theme = useTheme();
  const mobileScreen = theme.breakpoints.down('sm');

  // Definimos el ancho y alto del modal en función del tamaño de la pantalla
  const modalWidth = mobileScreen ? '90vw' : 600;

  // Establecemos la posición del modal en el centro de la pantalla solo en pantallas más grandes
  const modalPosition = mobileScreen ? 'absolute' : 'fixed';
  const topPosition = mobileScreen ? '5%' : '50%';
  const leftPosition = mobileScreen ? '5%' : '50%';
  const transform = mobileScreen ? 'translate(0%, -5%)' : 'translate(-50%, -50%)';

  const [formData, setFormData] = useState({
    name: '',
    monthlyFee: '',
    description: '',
  });

  useEffect(() => {}, []);

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({
      name: '',
      monthlyFee: '',
      description: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await create(formData);
      handleCloseModal();
      if (fetchSports) {
        await fetchSports(); // Recargar la lista
      }
    } catch (error) {
      console.error("Error creating sport:", error);
    }
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
          Agregar Nueva Disciplina
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crea una nueva disciplina deportiva base
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Después de crear la disciplina, podrás agregar diferentes planes de precios y frecuencias en la sección de &ldquo;Gestión de Planes&rdquo;.
            </Typography>
          </Alert>

          <TextField 
            label="Nombre de la Disciplina" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            variant="outlined"
            placeholder="ej: Boxeo, Yoga, Crossfit"
            helperText="Nombre de la disciplina deportiva"
          />
          
          <TextField 
            label="Precio Base Mensual" 
            name="monthlyFee" 
            type="number"
            value={formData.monthlyFee} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            variant="outlined"
            inputProps={{ min: 0, step: "0.01" }}
            helperText="Precio base de referencia (podrás crear planes específicos después)"
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
            placeholder="Describe la disciplina deportiva..."
            helperText="Información general sobre la disciplina"
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
          disabled={!formData.name || !formData.monthlyFee}
        >
          Crear Disciplina
        </Button>
      </DialogActions>
    </Dialog>
  );
};
