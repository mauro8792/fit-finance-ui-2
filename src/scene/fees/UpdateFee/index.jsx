/* eslint-disable react/prop-types */
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, TextField } from '@mui/material';
import { format } from 'date-fns';
import { useState } from 'react';

export const UpdateFeeModal = ({ openModal, handleCloseModal, fee, handleUpdateFee }) => {
  const [updatedStartDate, setUpdatedStartDate] = useState(format(new Date(fee.startDate), 'yyyy-MM-dd'));
  const [updatedEndDate, setUpdatedEndDate] = useState(format(new Date(fee.endDate), 'yyyy-MM-dd'));
  const [updatedValue, setUpdatedValue] = useState(fee.value);
  const [updatedAmountPaid, setUpdatedAmountPaid] = useState(fee.amountPaid);
  const [updatedMonth, setUpdatedMonth] = useState(fee.month);
  const [updatedYear, setUpdatedYear] = useState(fee.year);

  const handleStartDateChange = (event) => {
    setUpdatedStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setUpdatedEndDate(event.target.value);
  };

  const handleValueChange = (event) => {
    setUpdatedValue(event.target.value);
  };

  const handleAmountPaidChange = (event) => {
    setUpdatedAmountPaid(event.target.value);
  };

  const handleMonthChange = (event) => {
    setUpdatedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setUpdatedYear(event.target.value);
  };

  const handleUpdate = () => {
    const updatedFee = {
      ...fee,
      startDate: updatedStartDate,
      endDate: updatedEndDate,
      value: updatedValue,
      amountPaid: updatedAmountPaid,
      month: updatedMonth,
      year: updatedYear,
    };
    handleUpdateFee(updatedFee);
    handleCloseModal(); // Cerrar el modal después de la actualización
  };

  return (
    <Dialog open={openModal} onClose={handleCloseModal}>
      <DialogTitle>Modificar Cuota</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin='normal'>
          <TextField label='Fecha de inicio' type='date' value={updatedStartDate} onChange={handleStartDateChange} variant='outlined' />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField label='Fecha de fin' type='date' value={updatedEndDate} onChange={handleEndDateChange} variant='outlined' />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField
            label='Valor de la cuota'
            value={updatedValue}
            onChange={handleValueChange}
            variant='outlined'
            type='number'
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
          />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField
            label='Pago parcial'
            value={updatedAmountPaid}
            onChange={handleAmountPaidChange}
            variant='outlined'
            type='number'
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
          />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField
            label='Mes'
            value={updatedMonth}
            onChange={handleMonthChange}
            variant='outlined'
            type='number'
            InputProps={{
              inputProps: {
                min: 1,
                max: 12,
              },
            }}
          />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <TextField
            label='Año'
            value={updatedYear}
            onChange={handleYearChange}
            variant='outlined'
            type='number'
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal} color='primary'>
          Cancelar
        </Button>
        <Button onClick={handleUpdate} color='primary'>
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

