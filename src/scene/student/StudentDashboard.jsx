import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  Button,
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  AccountCircle, 
  School, 
  Payment, 
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';
import { Header } from '../../components';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, student, getStudentData } = useAuthStore();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        const data = await getStudentData();
        setStudentData(data);
      } catch (error) {
        console.error('Error cargando datos del estudiante:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar el componente

  if (loading) {
    return (
      <Box m="20px">
        <Header title="Dashboard Estudiante" subtitle="Cargando información..." />
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  const getPaymentStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return <Chip icon={<CheckCircle />} label="Al día" color="success" />;
      case 'partial':
        return <Chip icon={<Warning />} label="Pago parcial" color="warning" />;
      case 'pending':
        return <Chip icon={<Error />} label="Pendiente" color="error" />;
      default:
        return <Chip label="Sin información" color="default" />;
    }
  };

  return (
    <Box m="20px">
      <Header 
        title={`Bienvenido, ${student?.name || user?.fullName}`} 
        subtitle="Dashboard del estudiante" 
      />

      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountCircle sx={{ fontSize: 30, mr: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  Información Personal
                </Typography>
              </Box>
              <Typography variant="body1" mb={1}>
                <strong>Nombre:</strong> {student?.name} {student?.lastName}
              </Typography>
              <Typography variant="body1" mb={1}>
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body1" mb={1}>
                <strong>Documento:</strong> {studentData?.document || 'No disponible'}
              </Typography>
              <Typography variant="body1" mb={1}>
                <strong>Teléfono:</strong> {studentData?.phone || 'No disponible'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Información del Deporte */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <School sx={{ fontSize: 30, mr: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  Deporte Inscrito
                </Typography>
              </Box>
              <Typography variant="body1" mb={1}>
                <strong>Deporte:</strong> {studentData?.sport?.name || 'No inscrito'}
              </Typography>
              <Typography variant="body1" mb={1}>
                <strong>Cuota Mensual:</strong> ${studentData?.sport?.monthlyFee || 0}
              </Typography>
              <Typography variant="body1" mb={1}>
                <strong>Estado:</strong> {studentData?.isActive ? 'Activo' : 'Inactivo'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado de Pagos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Payment sx={{ fontSize: 30, mr: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    Estado de Cuotas
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/student/fees')}
                  sx={{ 
                    bgcolor: '#70d8bd',
                    '&:hover': { bgcolor: '#5cbaa3' }
                  }}
                >
                  Ver Todas las Cuotas
                </Button>
              </Box>

              {studentData?.recentFees && studentData.recentFees.length > 0 ? (
                <Grid container spacing={2}>
                  {studentData.recentFees.slice(0, 3).map((fee) => (
                    <Grid item xs={12} md={4} key={fee.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" mb={1}>
                            {fee.month}/{fee.year}
                          </Typography>
                          <Typography variant="body2" mb={1}>
                            Monto: ${fee.amount}
                          </Typography>
                          <Typography variant="body2" mb={1}>
                            Pagado: ${fee.amountPaid}
                          </Typography>
                          {getPaymentStatusChip(fee.paymentStatus)}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No tienes cuotas registradas aún.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
