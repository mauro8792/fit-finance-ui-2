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
import BANK_CONFIG from '../config/bankConfig';

export const PaymentModal = ({ 
  open, 
  onClose, 
  fee,
  studentData
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState(null); // Nuevo estado para método específico
  const [error, setError] = useState(null);

  const handlePayment = async (paymentMethod) => {
    try {
      setLoading(true);
      setLoadingMethod(paymentMethod); // Marcar qué método está cargando
      setError(null);

      // Configurar datos adicionales según el método de pago
      const paymentData = {
        feeId: fee.id,
        amount: fee.remainingAmount || fee.amount,
        description: `Cuota ${fee.monthName || `${fee.month}/${fee.year}`}`,
        // Datos del pagador
        payerEmail: studentData?.user?.email || "estudiante@test.com",
        payerFirstName: studentData?.student?.firstName || "Test", 
        payerLastName: studentData?.student?.lastName || "User",
        payerDocument: studentData?.student?.document || "12345678",
        // Método de pago preferido
        preferredPaymentMethod: paymentMethod
      };

      // Agregar datos específicos para transferencia bancaria
      if (paymentMethod === 'bank_transfer') {
        paymentData.bankTransferData = {
          alias: BANK_CONFIG.alias,
          cbu: BANK_CONFIG.cbu,
          accountHolder: BANK_CONFIG.accountHolder,
          bankName: BANK_CONFIG.bankName
        };
      }

      // Crear preferencia de pago en MercadoPago
      const response = await financeApi.post('/mercadopago/create-preference', paymentData);

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
      setLoadingMethod(null); // Limpiar el método que estaba cargando
    }
  };

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Tarjeta de Crédito',
      description: 'Pago inmediato con tarjeta de crédito',
      icon: <CreditCard sx={{ fontSize: { xs: 32, sm: 40 }, color: '#1976d2' }} />,
      color: '#e3f2fd',
      border: '#bbdefb'
    },
    {
      id: 'debit_card', 
      name: 'Tarjeta de Débito',
      description: 'Pago inmediato con tarjeta de débito',
      icon: <AccountBalance sx={{ fontSize: { xs: 32, sm: 40 }, color: '#388e3c' }} />,
      color: '#e8f5e8',
      border: '#c8e6c9'
    },
    {
      id: 'bank_transfer',
      name: 'Transferencia Bancaria',
      description: `${BANK_CONFIG.instructions}`,
      icon: <QrCode sx={{ fontSize: { xs: 32, sm: 40 }, color: '#f57c00' }} />,
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
      fullScreen={window.innerWidth < 600} // Pantalla completa en mobile
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 }, // Sin bordes redondeados en mobile
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          bgcolor: 'white',
          m: { xs: 0, sm: 2 }, // Sin margin en mobile
          maxHeight: { xs: '100vh', sm: '90vh' },
          height: { xs: '100vh', sm: 'auto' } // Altura completa en mobile
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderBottom: 'none',
        p: { xs: 2, sm: 3 }, // Padding responsivo
        position: { xs: 'sticky', sm: 'static' }, // Sticky en mobile
        top: 0,
        zIndex: 1
      }}>
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          color="white"
          sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          💳 Opciones de Pago
        </Typography>
        <Button 
          onClick={onClose}
          sx={{ 
            minWidth: 'auto', 
            p: { xs: 0.5, sm: 1 },
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ 
        p: { xs: 2, sm: 3 }, 
        bgcolor: 'white',
        flexGrow: 1, // Para ocupar el espacio disponible en mobile
        overflowY: 'auto' // Scroll si es necesario
      }}>
        {/* Información de la cuota */}
        <Card sx={{ 
          mb: { xs: 2, sm: 3 }, 
          bgcolor: '#f8f9fa', 
          border: '1px solid #e9ecef',
          borderRadius: { xs: 2, sm: 3 }
        }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              mb={1} 
              color="#1976d2"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {fee.monthName || `${fee.month}/${fee.year}`}
            </Typography>
            <Typography 
              variant="body1" 
              mb={1} 
              color="#333"
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              <strong>Monto total:</strong> ${fee.amount?.toLocaleString()}
            </Typography>
            <Typography 
              variant="body1" 
              mb={1} 
              color="#333"
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              <strong>Ya pagado:</strong> ${fee.amountPaid?.toLocaleString()}
            </Typography>
            <Typography 
              variant="h6" 
              color="#2e7d32" 
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
            >
              <strong>A pagar:</strong> ${(fee.remainingAmount || fee.amount)?.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Métodos de pago */}
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          mb={2} 
          color="#333"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          Selecciona tu método de pago:
        </Typography>

        <Box display="flex" flexDirection="column" gap={{ xs: 1.5, sm: 2 }}>
          {paymentMethods.map((method) => (
            <Card 
              key={method.id}
              sx={{ 
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                bgcolor: method.color,
                border: `2px solid ${method.border}`,
                borderRadius: { xs: 2, sm: 3 },
                minHeight: { xs: 80, sm: 'auto' }, // Altura mínima para touch en mobile
                opacity: loading && loadingMethod !== method.id ? 0.5 : 1, // Opacidad reducida para métodos no seleccionados
                '&:hover': loading ? {} : {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                  borderColor: '#1976d2'
                },
                '&:active': { // Efecto al tocar en mobile
                  transform: 'scale(0.98)'
                }
              }}
              onClick={() => !loading && handlePayment(method.id)}
            >
              <CardContent sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1.5, sm: 2 },
                py: { xs: 1.5, sm: 2 },
                px: { xs: 1.5, sm: 2 }
              }}>
                {method.icon}
                <Box flex={1}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    color="#333"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    {method.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="#666"
                    sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                  >
                    {method.description}
                  </Typography>
                </Box>
                {loading && loadingMethod === method.id && (
                  <CircularProgress size={24} />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box 
          mt={{ xs: 2, sm: 3 }} 
          p={{ xs: 1.5, sm: 2 }} 
          bgcolor="#f0f7ff" 
          borderRadius={2} 
          border="1px solid #bbdefb"
        >
          <Typography 
            variant="body2" 
            color="#1976d2" 
            textAlign="center" 
            fontWeight="500"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            🔒 Pago seguro procesado por MercadoPago
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 }, 
        pt: { xs: 1, sm: 0 }, 
        bgcolor: 'white',
        borderTop: { xs: '1px solid #e0e0e0', sm: 'none' }, // Separador en mobile
        position: { xs: 'sticky', sm: 'static' }, // Sticky en mobile
        bottom: 0
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          fullWidth
          sx={{
            minHeight: { xs: 48, sm: 36 }, // Altura mínima para touch en mobile
            fontSize: { xs: '1rem', sm: '0.875rem' },
            fontWeight: 'bold'
          }}
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
