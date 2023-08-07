/* eslint-disable react/prop-types */
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, FormControlLabel, Switch } from '@mui/material';

export const ViewStudentModal = ({ openModal,  selectedUser, handleCloseModal }) => {
  return (
    <Dialog open={openModal} onClose={handleCloseModal} maxWidth={false} fullWidth style={{ position: 'absolute' }}>
      <DialogTitle>Información del Estudiante</DialogTitle>
      <DialogContent style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <FormControl fullWidth margin='normal'>
          <TextField label='Nombre' value={selectedUser.firstName} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Apellido' value={selectedUser.lastName} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField
            label='Fecha de Nacimiento'
            value={selectedUser.birthDate}
            type='date'
            variant='outlined'
            InputLabelProps={{
              shrink: true,
            }}
            disabled
          />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Teléfono' value={selectedUser.phone} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField
            label='Fecha de Inicio'
            value={selectedUser.startDate}
            type='date'
            variant='outlined'
            InputLabelProps={{
              shrink: true,
            }}
            disabled
          />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Documento' value={selectedUser.document} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Deporte' value={selectedUser.sportName} variant='outlined' disabled />
        </FormControl>
        <FormControlLabel control={<Switch checked={selectedUser.isActive} name='isActive' color='primary' disabled />} label='Activo' />
      </DialogContent>
      <DialogActions style={{ justifyContent: 'flex-end' }}>
        <Button onClick={handleCloseModal} color='primary'>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
