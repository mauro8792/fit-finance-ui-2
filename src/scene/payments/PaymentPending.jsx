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
  HourglassEmpty,
  Home,
  Refresh
} from '@mui/icons-material';

export const PaymentPending = () => {
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

  const handleCheckStatus = () => {
    // Aquí podrías hacer una consulta al backend para verificar el estado
    window.location.reload();
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
          <HourglassEmpty
            sx={{
              fontSize: 80,
              color: 'warning.main',
              mb: 2
            }}
          />
          
          <Typography variant="h4" fontWeight="bold" color="warning.main" mb={2}>
            Pago Pendiente
          </Typography>
          
          <Typography variant="h6" color="text.secondary" mb={3}>
            Tu pago está siendo procesado
          </Typography>

          {paymentData && (
            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              {paymentData.payment_id && (
                <Typography variant="body2">
                  <strong>ID de Pago:</strong> {paymentData.payment_id || paymentData.collection_id}
                </Typography>
              )}
              {paymentData.external_reference && (
                <Typography variant="body2">
                  <strong>Referencia:</strong> Cuota #{paymentData.external_reference}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Estado:</strong> {paymentData.status || paymentData.collection_status}
              </Typography>
            </Alert>
          )}

          <Typography variant="body1" color="text.secondary" mb={4}>
            Tu pago está siendo verificado por el banco o medio de pago.
            Este proceso puede tomar unos minutos o hasta 24 horas dependiendo del método utilizado.
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={4}>
            <strong>¿Qué significa esto?</strong>
            <br />
            • Si pagaste con transferencia bancaria, puede tomar hasta 24hs
            <br />
            • Si pagaste con tarjeta, generalmente se procesa en minutos
            <br />
            • Recibirás una notificación cuando se confirme el pago
            <br />
            • No es necesario que pagues nuevamente
          </Typography>

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleCheckStatus}
              size="large"
              color="warning"
            >
              Verificar Estado
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
