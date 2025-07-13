import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Error,
  Home,
  Refresh
} from '@mui/icons-material';

export const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Obtener parámetros de MercadoPago
    const collection_id = searchParams.get('collection_id');
    const collection_status = searchParams.get('collection_status');
    const payment_id = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const external_reference = searchParams.get('external_reference');
    const payment_type = searchParams.get('payment_type');
    const merchant_order_id = searchParams.get('merchant_order_id');
    const preference_id = searchParams.get('preference_id');

    setPaymentData({
      collection_id,
      collection_status,
      payment_id,
      status,
      external_reference,
      payment_type,
      merchant_order_id,
      preference_id
    });

    setLoading(false);
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/student/dashboard');
  };

  const handleRetryPayment = () => {
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      sx={{ p: 3 }}
    >
      <Card sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          <Error
            sx={{
              fontSize: 80,
              color: 'error.main',
              mb: 2
            }}
          />
          
          <Typography variant="h4" fontWeight="bold" color="error.main" mb={2}>
            Pago No Procesado
          </Typography>
          
          <Typography variant="h6" color="text.secondary" mb={3}>
            Hubo un problema al procesar tu pago
          </Typography>

          {paymentData && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {paymentData.payment_id && (
                <Typography variant="body2">
                  <strong>ID de Referencia:</strong> {paymentData.payment_id || paymentData.collection_id}
                </Typography>
              )}
              {paymentData.external_reference && (
                <Typography variant="body2">
                  <strong>Cuota:</strong> #{paymentData.external_reference}
                </Typography>
              )}
              {paymentData.status && (
                <Typography variant="body2">
                  <strong>Estado:</strong> {paymentData.status || paymentData.collection_status}
                </Typography>
              )}
            </Alert>
          )}

          <Typography variant="body1" color="text.secondary" mb={4}>
            No se realizó ningún cargo a tu tarjeta o cuenta.
            Puedes intentar nuevamente o contactar con soporte si el problema persiste.
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={4}>
            <strong>Posibles causas:</strong>
            <br />
            • Fondos insuficientes
            <br />
            • Datos incorrectos de la tarjeta
            <br />
            • Límite de la tarjeta excedido
            <br />
            • Problemas temporales del banco
          </Typography>

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRetryPayment}
              size="large"
              color="primary"
            >
              Intentar Nuevamente
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={handleGoHome}
              size="large"
            >
              Ir al Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
