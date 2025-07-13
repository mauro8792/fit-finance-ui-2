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
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Configurar datos para transferencia bancaria
      const paymentData = {
        feeId: fee.id,
        amount: fee.remainingAmount || fee.amount,
        description: `Cuota ${fee.monthName || `${fee.month}/${fee.year}`}`,
        // Datos del pagador
        payerEmail: studentData?.user?.email || "estudiante@test.com",
        payerFirstName: studentData?.student?.firstName || "Test", 
        payerLastName: studentData?.student?.lastName || "User",
        payerDocument: studentData?.student?.document || "12345678",
        // Método de pago fijo: transferencia bancaria
        preferredPaymentMethod: 'bank_transfer',
        bankTransferData: {
          alias: BANK_CONFIG.alias,
          cbu: BANK_CONFIG.cbu,
          accountHolder: BANK_CONFIG.accountHolder,
          bankName: BANK_CONFIG.bankName
        }
      };

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
      alert(`Se abrió MercadoPago. Transferí al alias: ${BANK_CONFIG.alias} y el pago se acreditará automáticamente.`);

    } catch (error) {
      console.error('Error al crear preferencia de pago:', error);
      setError('Error al procesar el pago. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

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
          � Pagar Cuota - Transferencia
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
        p: { xs: 1.5, sm: 3 }, 
        bgcolor: 'white',
        flexGrow: 1, // Para ocupar el espacio disponible en mobile
        overflowY: 'auto', // Scroll si es necesario
        maxHeight: { xs: 'calc(100vh - 180px)', sm: 'auto' } // Altura máxima en mobile
      }}>
        {/* Información de la cuota */}
        <Card sx={{ 
          mb: { xs: 1.5, sm: 3 }, 
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
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography 
                variant="body2" 
                color="#333"
                sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}
              >
                <strong>A pagar:</strong>
              </Typography>
              <Typography 
                variant="h6" 
                color="#2e7d32" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                ${(fee.remainingAmount || fee.amount)?.toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ mb: { xs: 1.5, sm: 3 } }} />

        {error && (
          <Alert severity="error" sx={{ mb: { xs: 1.5, sm: 2 } }}>
            {error}
          </Alert>
        )}

        {/* Botón de Pago Único */}
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          mb={{ xs: 2, sm: 3 }} 
          color="#333"
          textAlign="center"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          💳 Pagar con Transferencia Bancaria
        </Typography>

        <Card 
          sx={{ 
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            bgcolor: '#fff3e0',
            border: `3px solid #ffcc02`,
            borderRadius: { xs: 2, sm: 3 },
            minHeight: { xs: 'auto', sm: 120 },
            '&:hover': loading ? {} : {
              transform: 'translateY(-4px)',
              boxShadow: 6,
              borderColor: '#f57c00'
            },
            '&:active': {
              transform: 'scale(0.98)'
            }
          }}
          onClick={() => !loading && handlePayment()}
        >
          <CardContent sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, sm: 2 },
            py: { xs: 1.5, sm: 3 },
            px: { xs: 1.5, sm: 2 },
            textAlign: 'center'
          }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <QrCode sx={{ fontSize: { xs: 32, sm: 48 }, color: '#f57c00' }} />
              {loading && (
                <CircularProgress size={24} sx={{ color: '#f57c00' }} />
              )}
            </Box>
            
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              color="#333"
              sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
            >
              Transferir al Alias
            </Typography>
            
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              color="#f57c00"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.3rem' },
                backgroundColor: 'rgba(245, 124, 0, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px'
              }}
            >
              {BANK_CONFIG.alias}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="#666"
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '1rem' },
                display: { xs: 'none', sm: 'block' } // Ocultar en mobile para ahorrar espacio
              }}
            >
              {BANK_CONFIG.instructions}
            </Typography>

            {loading && (
              <Typography 
                variant="body2" 
                color="#f57c00"
                fontWeight="bold"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem' } }}
              >
                Abriendo MercadoPago...
              </Typography>
            )}
          </CardContent>
        </Card>

        <Box 
          mt={{ xs: 1.5, sm: 3 }} 
          p={{ xs: 1, sm: 2 }} 
          bgcolor="#f0f7ff" 
          borderRadius={2} 
          border="1px solid #bbdefb"
        >
          <Typography 
            variant="body2" 
            color="#1976d2" 
            textAlign="center" 
            fontWeight="500"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            🔒 Transferencia segura procesada por MercadoPago
          </Typography>
          <Typography 
            variant="body2" 
            color="#1976d2" 
            textAlign="center" 
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.8rem' }, 
              mt: 0.5,
              display: { xs: 'none', sm: 'block' } // Ocultar en mobile
            }}
          >
            Tu pago se acreditará automáticamente
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: { xs: 1.5, sm: 3 }, 
        pt: { xs: 0.5, sm: 0 }, 
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
            minHeight: { xs: 44, sm: 36 }, // Altura mínima para touch en mobile
            fontSize: { xs: '0.9rem', sm: '0.875rem' },
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
