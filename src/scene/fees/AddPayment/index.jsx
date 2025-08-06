/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, Grid, InputAdornment, Typography, InputLabel, Select, MenuItem, CircularProgress, Box } from '@mui/material';
import { format } from 'date-fns';
import { useFeesStore } from '../../../hooks/useFeesStore';
import { UnpaidFeesAlert } from './UnpaidFeesAlert';

const paymentMethods = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Tarjeta de Crédito' },
  { value: 'transferencia', label: 'Transferencia' },
];

export const AddPaymentModal = ({ openModal, selectedFee, handleCloseModal, handlePaymentSubmit }) => {
  const { validateSequentialPayment } = useFeesStore();

  const remainingPayment = parseInt(selectedFee.value) - parseInt(selectedFee.amountPaid);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [error, setError] = useState(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [canProceedWithPayment, setCanProceedWithPayment] = useState(false);

  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Validar pagos secuenciales cuando se abre el modal (con flag para evitar loop)
  const hasValidatedRef = useRef(false);
  useEffect(() => {
    const validatePaymentSequence = async () => {
      if (!selectedFee?.student?.id || !selectedFee?.id) {
        console.error('❌ Datos de cuota o estudiante incompletos:', selectedFee);
        setError('Datos de cuota incompletos');
        setCanProceedWithPayment(false);
        setValidationLoading(false);
        return;
      }

      setValidationLoading(true);
      setError(null);
      try {
        const result = await validateSequentialPayment(selectedFee.student.id, selectedFee.id);
        setValidationResult(result);
        setCanProceedWithPayment(result.isValid);
        if (!result.isValid) {
          setError(result.message);
        }
      } catch (error) {
        console.error('Error validating payment sequence:', error);
        let errorMessage = 'Error al validar el orden de pagos. Por favor, intente nuevamente.';
        if (error.response?.status === 404) {
          errorMessage = 'No se encontró el estudiante o la cuota especificada.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Error del servidor. Por favor, contacte al administrador.';
        } else if (error.message?.includes('Network Error')) {
          errorMessage = 'Error de conexión. Verifique su conexión a internet.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'No se puede conectar al servidor. Verifique que el backend esté funcionando.';
        }
        setError(errorMessage);
        setCanProceedWithPayment(false);
      } finally {
        setValidationLoading(false);
      }
    };

    if (openModal && selectedFee && !hasValidatedRef.current) {
      hasValidatedRef.current = true;
      validatePaymentSequence();
    }
    if (!openModal) {
      hasValidatedRef.current = false;
    }
  }, [openModal, selectedFee, validateSequentialPayment]);

  const resetModalState = () => {
    setPaymentAmount('');
    setSelectedPaymentMethod('');
    setError(null);
    setValidationResult(null);
    setCanProceedWithPayment(false);
    setValidationLoading(false);
  };

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
    
    // Verificar si se puede proceder con el pago
    if (!canProceedWithPayment) {
      setError('No se puede proceder con el pago debido a cuotas anteriores pendientes');
      return;
    }

    if (!paymentAmount) {
      setError('Ingrese un monto de pago');
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Seleccione un método de pago');
      return;
    }

    // Validar que el monto no exceda lo que falta por pagar
    if (parseInt(paymentAmount) > remainingPayment) {
      setError(`El monto no puede exceder $${remainingPayment}`);
      return;
    }

    const paymentPayload = {
      studentId: selectedFee.student.id,
      feeId: selectedFee.id,
      paymentDate,
      amountPaid: parseInt(paymentAmount),
      paymentMethod: selectedPaymentMethod,
    };
    
    try {
      await handlePaymentSubmit(paymentPayload);
      resetModalState();
    } catch (error) {
      setError('Error al procesar el pago. Por favor, intente nuevamente.');
    }
  };

  const handleModalClose = () => {
    resetModalState();
    handleCloseModal();
  };

  return (
    <Dialog 
      open={openModal} 
      onClose={handleModalClose} 
      maxWidth={false}
      sx={{
        '& .MuiDialog-paper': {
          width: '800px',
          minHeight: '600px',
          maxHeight: '90vh',
          margin: '20px',
        }
      }}
    >
      <DialogTitle>Ingresar pago : {selectedFee.nameStudent}</DialogTitle>
      <DialogContent>
        {/* Mostrar loading mientras se valida */}
        {validationLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress size={30} sx={{ mr: 2 }} />
            <Typography>Validando orden de pagos...</Typography>
          </Box>
        )}

        {/* Mostrar alerta de cuotas pendientes si existen */}
        {validationResult && !validationResult.isValid && validationResult.unpaidFees && (
          <UnpaidFeesAlert 
            unpaidFees={validationResult.unpaidFees} 
            studentName={selectedFee.nameStudent}
          />
        )}

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
          
          {/* Campos de pago en una sola fila: Monto, Método y Fecha */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin='normal'>
              <TextField
                label='Monto a pagar'
                value={paymentAmount}
                onChange={handlePaymentChange}
                variant='outlined'
                type='number'
                disabled={!canProceedWithPayment || validationLoading}
                InputProps={{
                  inputProps: {
                    min: 1,
                    max: remainingPayment,
                    inputMode: 'numeric',
                    step: 1,
                  },
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Typography variant='body2'>$</Typography>
                    </InputAdornment>
                  ),
                }}
                helperText={canProceedWithPayment ? `Máx: $${remainingPayment.toLocaleString()}` : 'Resolver cuotas pendientes'}
              />
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin='normal'>
              <InputLabel>Método de Pago</InputLabel>
              <Select 
                value={selectedPaymentMethod} 
                onChange={handlePaymentMethodChange} 
                label='Método de Pago'
                disabled={!canProceedWithPayment || validationLoading}
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin='normal'>
              <TextField 
                label='Fecha de pago' 
                type='date' 
                value={paymentDate} 
                onChange={handlePaymentDateChange} 
                variant='outlined'
                disabled={!canProceedWithPayment || validationLoading}
              />
            </FormControl>
          </Grid>
        </Grid>
        {error && (
          <Typography variant='body2' color='error' sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions style={{ justifyContent: 'flex-end' }}>
        <Button onClick={handleModalClose} color='primary'>
          Cancelar
        </Button>
        <Button 
          onClick={handlePaymentSubmit2} 
          color='primary'
          disabled={!canProceedWithPayment || validationLoading}
          variant={canProceedWithPayment ? 'contained' : 'outlined'}
        >
          {validationLoading ? 'Validando...' : 'Guardar Pago'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
