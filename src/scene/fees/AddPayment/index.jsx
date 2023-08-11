/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, Grid, InputAdornment, Typography, InputLabel, Select, MenuItem } from '@mui/material';
import { format } from 'date-fns';

const paymentMethods = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Tarjeta de Crédito' },
  { value: 'transferencia', label: 'Transferencia' },
];

export const AddPaymentModal = ({ openModal, selectedFee, handleCloseModal, handlePaymentSubmit }) => {

  const remainingPayment = parseInt(selectedFee.value) - parseInt(selectedFee.amountPaid);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [error, setError] = useState(null); // Estado para almacenar el mensaje de error

  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd')); // Fecha actual por defecto

  const handlePaymentChange = (event) => {
    setPaymentAmount(event.target.value);
  };

  const handlePaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const handlePaymentDateChange = (event) => {
    setPaymentDate(event.target.value);
  };

  const handlePaymentSubmit2 = async () => {
    setError(null);
    if (!paymentAmount) {
      setError('Ingrese un monto de pago');
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Seleccione un método de pago');
      return;
    }

    const paymentPayload = {
      studentId: selectedFee.student.id,
      feeId: selectedFee.id,
      paymentDate,
      amountPaid: parseInt(paymentAmount),
      paymentMethod: selectedPaymentMethod,
    };
    handlePaymentSubmit(paymentPayload);
    setPaymentAmount('');
    setSelectedPaymentMethod('');
  };

  return (
    <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth='md' style={{ position: 'absolute' }}>
      <DialogTitle>Ingresar pago : {selectedFee.nameStudent}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
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
          <Grid item xs={12}>
            <FormControl fullWidth margin='normal'>
              <TextField
                label='Monto a pagar'
                value={paymentAmount}
                onChange={handlePaymentChange}
                variant='outlined'
                type='number'
                InputProps={{
                  inputProps: {
                    min: 1, // Evita números negativos o cero
                    inputMode: 'numeric', // Indica que se espera una entrada numérica
                    step: 1, // Solo permite números enteros
                  },
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Typography variant='body2'>$</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin='normal'>
              <InputLabel>Método de Pago</InputLabel>
              <Select value={selectedPaymentMethod} onChange={handlePaymentMethodChange} label='Método de Pago'>
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin='normal'>
              <TextField label='Fecha de pago' type='date' value={paymentDate} onChange={handlePaymentDateChange} variant='outlined' />
            </FormControl>
          </Grid>
        </Grid>
        {error && (
          <Typography variant='body2' color='error'>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions style={{ justifyContent: 'flex-end' }}>
        <Button onClick={handleCloseModal} color='primary'>
          Cancelar
        </Button>
        <Button onClick={handlePaymentSubmit2} color='primary'>
          Guardar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
};
