/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, useTheme } from '@mui/material';

export const UpdateSportModal = ({ openModal, setOpenModal, sportSelected, onSaveChanges, setSportSelected }) => {
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
    id: sportSelected?.id || '',
    name: sportSelected?.name || '',
    monthlyFee: sportSelected?.monthlyFee || '',
    description: sportSelected?.description || '',
  });
  const handleCloseModal = () => {
    setOpenModal(false);
    setSportSelected(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
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
      <DialogTitle>Editar disciplina</DialogTitle>
      <DialogContent style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <FormControl fullWidth margin='normal'>
          <TextField label='Nombre' name='firstName' value={formData.name} onChange={handleInputChange} variant='outlined' />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Valor de cuota' name='monthlyFee' value={formData.monthlyFee} onChange={handleInputChange} variant='outlined' />
        </FormControl>

        <FormControl fullWidth margin='normal'>
          <TextField label='Descripcion' name='description' value={formData.description} onChange={handleInputChange} variant='outlined' />
        </FormControl>
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
