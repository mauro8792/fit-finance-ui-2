/* eslint-disable react/prop-types */
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl } from '@mui/material';

export const ViewFeeModal = ({ openModal,  selectedFee, handleCloseModal }) => {
  return (
    <Dialog open={openModal} onClose={handleCloseModal} maxWidth={false} fullWidth style={{ position: 'absolute' }}>
      <DialogTitle>Información de la disciplina</DialogTitle>
      <DialogContent style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <FormControl fullWidth margin='normal'>
          <TextField label='Nombre' value={selectedFee.nameStudent} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Valor de cuota' value={selectedFee.value} variant='outlined' disabled />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Descripcion' value={selectedFee.startDate} variant='outlined' disabled />
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
