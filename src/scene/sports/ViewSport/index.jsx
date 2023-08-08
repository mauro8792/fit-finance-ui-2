/* eslint-disable react/prop-types */
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl } from '@mui/material';

export const ViewSportModal = ({ openModal,  selectedUser, handleCloseModal }) => {
  return (
    <Dialog open={openModal} onClose={handleCloseModal} maxWidth={false} fullWidth style={{ position: 'absolute' }}>
      <DialogTitle>Información de la disciplina</DialogTitle>
      <DialogContent style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <FormControl fullWidth margin='normal'>
          <TextField label='Nombre' value={selectedUser.name} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Valor de cuota' value={selectedUser.monthlyFee} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Descripcion' value={selectedUser.description} variant='outlined' disabled />
        </FormControl>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'flex-end' }}>
        <Button onClick={handleCloseModal} color='primary'>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
