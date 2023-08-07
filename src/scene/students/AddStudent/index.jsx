/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, useTheme } from '@mui/material';
import { useStudentsStore } from '../../../hooks/useStudentsStore';


import { format } from 'date-fns';


export const AddStudentModal = ({ openModal, setOpenModal, fetchStudents, sports }) => {
  const { create } = useStudentsStore();

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
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    sportId: '',
    document: '',
    isActive: true,
  });

  useEffect(() => {}, []);

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({
      firstName: '',
      lastName: '',
      birthDate: '',
      phone: '',
      startDate: '',
      sportId: '',
      document: '',
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

  const handleSaveChanges = async () => {
    await create(formData);
    handleCloseModal();
    fetchStudents();
  };

  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      maxWidth={false}
      fullWidth
      style={{ width: modalWidth, position: modalPosition, top: topPosition, left: leftPosition, transform }}
    >
      <DialogTitle>Agregar Estudiante</DialogTitle>
      <DialogContent>
        <TextField label='Nombre' name='firstName' value={formData.firstName} onChange={handleInputChange} fullWidth margin='normal' variant='outlined' />
        <TextField label='Apellido' name='lastName' value={formData.lastName} onChange={handleInputChange} fullWidth margin='normal' variant='outlined' />
        <TextField
          label='Fecha de Nacimiento'
          name='birthDate'
          value={formData.birthDate}
          onChange={handleInputChange}
          fullWidth
          margin='normal'
          variant='outlined'
          type='date'
          InputLabelProps={{ shrink: true }}
        />
        <TextField label='Teléfono' name='phone' value={formData.phone} onChange={handleInputChange} fullWidth margin='normal' variant='outlined' />
        <TextField
          label='Fecha de Inicio'
          name='startDate'
          defaultValue={formData.startDate}
          onChange={handleInputChange}
          fullWidth
          margin='normal'
          variant='outlined'
          type='date'
          InputLabelProps={{ shrink: true }}
        />
        <TextField label='Deporte' name='sportId' select value={formData.sportId} onChange={handleInputChange} fullWidth margin='normal' variant='outlined'>
          {sports.map((sport) => (
            <MenuItem key={sport.id} value={sport.id}>
              {`${sport.name} - ${sport.monthlyFee}`}
            </MenuItem>
          ))}
        </TextField>
        <TextField label='Documento' name='document' value={formData.document} onChange={handleInputChange} fullWidth margin='normal' variant='outlined' />
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
