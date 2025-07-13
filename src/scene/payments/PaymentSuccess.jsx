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
  CheckCircle,
  Home,
  Receipt
} from '@mui/icons-material';

export const PaymentSuccess = () => {
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
    const site_id = searchParams.get('site_id');
    const processing_mode = searchParams.get('processing_mode');
    const merchant_account_id = searchParams.get('merchant_account_id');

    setPaymentData({
      collection_id,
      collection_status,
      payment_id,
      status,
      external_reference,
      payment_type,
      merchant_order_id,
      preference_id,
      site_id,
      processing_mode,
      merchant_account_id
    });

    setLoading(false);

    // Opcional: Aquí podrías hacer una llamada al backend para verificar el pago
    // y actualizar el estado en tu base de datos
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/student/dashboard');
  };

  const handleViewPayments = () => {
    navigate('/student/payments');
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
          <CheckCircle
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 2
            }}
          />
          
          <Typography variant="h4" fontWeight="bold" color="success.main" mb={2}>
            ¡Pago Exitoso!
          </Typography>
          
          <Typography variant="h6" color="text.secondary" mb={3}>
            Tu pago ha sido procesado correctamente
          </Typography>

          {paymentData && (
            <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>ID de Pago:</strong> {paymentData.payment_id || paymentData.collection_id}
              </Typography>
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
            Recibirás un email de confirmación en los próximos minutos.
            El pago se reflejará en tu estado de cuenta inmediatamente.
          </Typography>

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={handleGoHome}
              size="large"
            >
              Ir al Dashboard
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Receipt />}
              onClick={handleViewPayments}
              size="large"
            >
              Ver mis Pagos
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
