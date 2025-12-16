import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useFeesStore } from '../../hooks';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const { getMyPaymentHistory } = useFeesStore();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const data = await getMyPaymentHistory(100);
      setPayments(data);
    } catch (err) {
      setError('Error al cargar el historial de pagos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#ff9800' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/student/fees')} sx={{ color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon sx={{ color: '#ff9800', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
            Historial de Pagos
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {payments.length === 0 ? (
        <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ReceiptLongIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              No hay pagos registrados
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', mt: 1 }}>
              Aquí verás el historial de tus pagos realizados
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Resumen */}
          <Card sx={{ 
            bgcolor: 'rgba(76, 175, 80, 0.1)', 
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: 3,
          }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Total pagos registrados
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>
                    {payments.length}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Monto total pagado
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
                    {formatCurrency(payments.reduce((acc, p) => acc + parseFloat(p.amount), 0))}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Lista de pagos */}
          {payments.map((payment, index) => (
            <Card
              key={payment.id}
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 700 }}>
                      {formatCurrency(payment.amount)}
                    </Typography>
                  </Box>
                  <Chip
                    label={payment.status === 'completed' ? 'Acreditado' : payment.status}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(76, 175, 80, 0.2)',
                      color: '#4caf50',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {payment.fee && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Cuota de <strong>{getMonthName(payment.fee.month)} {payment.fee.year}</strong>
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.1)' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {formatDate(payment.date)}
                  </Typography>
                  
                  {payment.registeredBy && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Registrado por {payment.registeredBy.name}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {payment.notes && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.4)', 
                      display: 'block', 
                      mt: 1,
                      fontStyle: 'italic',
                    }}
                  >
                    Nota: {payment.notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PaymentHistory;

