import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  QrCode,
  Close
} from '@mui/icons-material';
import { financeApi } from '../api';

export const PaymentModal = ({ 
  open, 
  onClose, 
  fee,
  studentData
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async (paymentMethod) => {
    try {
      setLoading(true);
      setError(null);

      // Crear preferencia de pago en MercadoPago
      const response = await financeApi.post('/mercadopago/create-preference', {
        feeId: fee.id, // Mantener como número
        amount: fee.remainingAmount || fee.amount,
        description: `Cuota ${fee.monthName || `${fee.month}/${fee.year}`}`,
        // Datos del pagador (obtener del contexto o formulario)
        payerEmail: studentData?.user?.email || "estudiante@test.com",
        payerFirstName: studentData?.student?.firstName || "Test", 
        payerLastName: studentData?.student?.lastName || "User",
        payerDocument: studentData?.student?.document || "12345678"
      });

      console.log('Response from backend:', response.data);

      // MercadoPago devuelve init_point (con underscore)
      const initPoint = response.data.init_point || response.data.sandbox_init_point;

      if (!initPoint) {
        throw new Error('No se recibió el link de pago de MercadoPago');
      }

      // Redirigir a MercadoPago
      window.open(initPoint, '_blank');
      
      // Cerrar modal y mostrar mensaje
      onClose();
      
      // Opcional: Mostrar mensaje de que se abrió la ventana de pago
      alert('Se abrió la ventana de MercadoPago. Complete el pago y regrese para ver la actualización.');

    } catch (error) {
      console.error('Error al crear preferencia de pago:', error);
      setError('Error al procesar el pago. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Tarjeta de Crédito',
      description: 'Paga con tu tarjeta de crédito',
      icon: <CreditCard sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#e3f2fd',
      border: '#bbdefb'
    },
    {
      id: 'debit_card',
      name: 'Tarjeta de Débito',
      description: 'Paga con tu tarjeta de débito',
      icon: <AccountBalance sx={{ fontSize: 40, color: '#388e3c' }} />,
      color: '#e8f5e8',
      border: '#c8e6c9'
    },
    {
      id: 'bank_transfer',
      name: 'Transferencia Bancaria',
      description: 'Paga mediante transferencia',
      icon: <QrCode sx={{ fontSize: 40, color: '#f57c00' }} />,
      color: '#fff3e0',
      border: '#ffcc02'
    }
  ];

  if (!fee) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          bgcolor: 'white'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderBottom: 'none'
      }}>
        <Typography variant="h6" fontWeight="bold" color="white">
          💳 Opciones de Pago
        </Typography>
        <Button 
          onClick={onClose}
          sx={{ 
            minWidth: 'auto', 
            p: 1,
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: 'white' }}>
        {/* Información de la cuota */}
        <Card sx={{ mb: 3, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={1} color="#1976d2">
              {fee.monthName || `${fee.month}/${fee.year}`}
            </Typography>
            <Typography variant="body1" mb={1} color="#333">
              <strong>Monto total:</strong> ${fee.amount?.toLocaleString()}
            </Typography>
            <Typography variant="body1" mb={1} color="#333">
              <strong>Ya pagado:</strong> ${fee.amountPaid?.toLocaleString()}
            </Typography>
            <Typography variant="h6" color="#2e7d32" fontWeight="bold">
              <strong>A pagar:</strong> ${(fee.remainingAmount || fee.amount)?.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Métodos de pago */}
        <Typography variant="h6" fontWeight="bold" mb={2} color="#333">
          Selecciona tu método de pago:
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {paymentMethods.map((method) => (
            <Card 
              key={method.id}
              sx={{ 
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                bgcolor: method.color,
                border: `2px solid ${method.border}`,
                '&:hover': loading ? {} : {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                  borderColor: '#1976d2'
                }
              }}
              onClick={() => !loading && handlePayment(method.id)}
            >
              <CardContent sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                py: 2
              }}>
                {method.icon}
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold" color="#333">
                    {method.name}
                  </Typography>
                  <Typography variant="body2" color="#666">
                    {method.description}
                  </Typography>
                </Box>
                {loading && (
                  <CircularProgress size={24} />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box mt={3} p={2} bgcolor="#f0f7ff" borderRadius={2} border="1px solid #bbdefb">
          <Typography variant="body2" color="#1976d2" textAlign="center" fontWeight="500">
            🔒 Pago seguro procesado por MercadoPago
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, bgcolor: 'white' }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          fullWidth
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PaymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fee: PropTypes.shape({
    id: PropTypes.number.isRequired,
    monthName: PropTypes.string,
    month: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
    amount: PropTypes.number.isRequired,
    amountPaid: PropTypes.number,
    remainingAmount: PropTypes.number
  }).isRequired,
  studentData: PropTypes.shape({
    student: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      document: PropTypes.string
    }),
    user: PropTypes.shape({
      email: PropTypes.string
    })
  })
};
