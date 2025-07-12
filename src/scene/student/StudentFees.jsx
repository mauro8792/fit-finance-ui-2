import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from '@mui/material';
import { 
  CheckCircle, 
  Warning, 
  Error,
  Payment,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';
import { Header } from '../../components';

export const StudentFees = () => {
  const navigate = useNavigate();
  const { getStudentFeesData } = useAuthStore();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    partial: 0,
    pending: 0
  });

  useEffect(() => {
    const loadFees = async () => {
      try {
        setLoading(true);
        const data = await getStudentFeesData();
        setFees(data.fees || []);
        setSummary(data.summary || {});
      } catch (error) {
        console.error('Error cargando cuotas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar el componente

  const getPaymentStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return <Chip icon={<CheckCircle />} label="Pagado" color="success" size="small" />;
      case 'partial':
        return <Chip icon={<Warning />} label="Parcial" color="warning" size="small" />;
      case 'pending':
        return <Chip icon={<Error />} label="Pendiente" color="error" size="small" />;
      default:
        return <Chip label="N/A" color="default" size="small" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <Box m="20px">
        <Header title="Mis Cuotas" subtitle="Cargando información..." />
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Box display="flex" alignItems="center" mb={2}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Volver al Dashboard
        </Button>
        <Header title="Mis Cuotas" subtitle="Historial de pagos y cuotas pendientes" />
      </Box>

      {/* Resumen */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Payment sx={{ fontSize: 40, color: '#666', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {summary.total || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Cuotas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
            <CardContent>
              <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="#4caf50">
                {summary.paid || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pagadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0' }}>
            <CardContent>
              <Warning sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="#ff9800">
                {summary.partial || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Parciales
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#ffebee' }}>
            <CardContent>
              <Error sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="#f44336">
                {summary.pending || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de Cuotas */}
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Detalle de Cuotas
          </Typography>
          
          {fees.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Período</strong></TableCell>
                    <TableCell><strong>Monto</strong></TableCell>
                    <TableCell><strong>Pagado</strong></TableCell>
                    <TableCell><strong>Pendiente</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Vencimiento</strong></TableCell>
                    <TableCell><strong>Último Pago</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fees.map((fee) => (
                    <TableRow key={fee.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {fee.month}/{fee.year}
                        </Typography>
                      </TableCell>
                      <TableCell>${fee.amount}</TableCell>
                      <TableCell>
                        <Typography color={fee.amountPaid > 0 ? 'success.main' : 'text.secondary'}>
                          ${fee.amountPaid}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color={fee.amount - fee.amountPaid > 0 ? 'error.main' : 'success.main'}>
                          ${fee.amount - fee.amountPaid}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusChip(fee.paymentStatus)}
                      </TableCell>
                      <TableCell>{formatDate(fee.dueDate)}</TableCell>
                      <TableCell>
                        {fee.lastPaymentDate ? formatDate(fee.lastPaymentDate) : 'Sin pagos'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No tienes cuotas registradas aún.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
