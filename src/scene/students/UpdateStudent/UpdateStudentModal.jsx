/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, FormControlLabel, Switch, useTheme, MenuItem } from '@mui/material';

export const UpdateStudentModal = ({ openModal, setOpenModal, selectedUser, onSaveChanges, setSelectedUser, sports }) => {
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
    id: selectedUser?.id || '',
    firstName: selectedUser?.firstName || '',
    lastName: selectedUser?.lastName || '',
    birthDate: selectedUser?.birthDate || '',
    phone: selectedUser?.phone || '',
    startDate: selectedUser?.startDate || '',
    document: selectedUser?.document || '',
    isActive: selectedUser?.isActive || false,
    sportId: selectedUser?.sportId || '',
  });
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
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
