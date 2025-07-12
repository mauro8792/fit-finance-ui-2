/* eslint-disable react/prop-types */
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, Grid, Accordion, AccordionSummary, Typography, AccordionDetails } from '@mui/material';
import { format } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@emotion/react';

export const ViewFeeModal = ({ openModal, selectedFee, handleCloseModal }) => {
  const remainingPayment = parseInt(selectedFee.value) - parseInt(selectedFee.amountPaid);
const theme = useTheme();
  return (
    <Dialog 
      open={openModal} 
      onClose={handleCloseModal} 
      maxWidth={false}
      sx={{
        '& .MuiDialog-paper': {
          width: '700px',
          minHeight: '500px',
          maxHeight: '85vh',
          margin: '20px',
        }
      }}
    >
      <DialogTitle>Información de la cuota</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin='normal'>
              <TextField label='Nombre' value={selectedFee.nameStudent} variant='outlined' disabled />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin='normal'>
              <TextField label='Valor de cuota' value={selectedFee.value} variant='outlined' disabled />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin='normal'>
              <TextField label='Pago parcial' value={selectedFee.amountPaid} variant='outlined' disabled />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin='normal'>
              <TextField label='Resta' value={remainingPayment} variant='outlined' disabled />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin='normal'>
              <TextField label='Fecha venc.' value={format(new Date(selectedFee.startDate), 'dd-MM-yyyy')} variant='outlined' disabled />
            </FormControl>
          </Grid>
        </Grid>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Ver Pagos</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              {/* Aquí puedes mapear los pagos y mostrar la información de cada uno */}
              {selectedFee.payments.map((payment) => (
                <div
                  key={payment.id}
                  style={{
                    border: `1px solid ${theme.palette.primary.main}`, // Usamos el color primario del tema
                    borderRadius: '5px',
                    padding: '10px',
                    marginBottom: '10px',
                  }}
                >
                  {' '}
                  <Typography variant='subtitle1'>Fecha de Pago: {format(new Date(payment.paymentDate), 'dd-MM-yyyy')}</Typography>
                  <Typography variant='body1'>Monto Pagado: {payment.amountPaid}</Typography>
                  <Typography variant='body1'>Método de Pago: {payment.paymentMethod}</Typography>
                  {/* ... Otros detalles del pago ... */}
                </div>
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'flex-end' }}>
        <Button onClick={handleCloseModal} color='primary'>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
