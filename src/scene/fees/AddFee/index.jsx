/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, useTheme } from '@mui/material';

import { useSportsStore } from '../../../hooks';

export const AddFeeModal = ({ openModal, setOpenModal, fetchSports }) => {
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
    await create(formData);
    handleCloseModal();
    fetchSports();
  };

  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      maxWidth={false}
      fullWidth
      style={{ width: modalWidth, position: modalPosition, top: topPosition, left: leftPosition, transform }}
    >
      <DialogTitle>Agregar Disciplina</DialogTitle>
      <DialogContent>
        <TextField label='Nombre' name='name' value={formData.name} onChange={handleInputChange} fullWidth margin='normal' variant='outlined' />
        <TextField label='Valor de cuota' name='monthlyFee' value={formData.monthlyFee} onChange={handleInputChange} fullWidth margin='normal' variant='outlined' />

        <TextField label='Descripcion' name='description' value={formData.description} onChange={handleInputChange} fullWidth margin='normal' variant='outlined' />
      </DialogContent>
      <DialogActions>
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
