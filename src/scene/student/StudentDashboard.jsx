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

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMonthName = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || `Mes ${month}`;
  };

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
    <Box m="8px" sx={{ height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
      <Header 
        title={`Bienvenido, ${studentData?.student?.firstName || student?.firstName || user?.fullName}`} 
        subtitle="Dashboard del estudiante" 
      />

      <Grid container spacing={1} sx={{ height: 'calc(100% - 70px)', overflow: 'hidden' }}>
        {/* Información Personal y Deporte en una sola fila más compacta */}
        <Grid item xs={12} sx={{ height: '120px' }}>
          <Grid container spacing={1} sx={{ height: '100%' }}>
            {/* Información Personal */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, color: 'white' }}>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <AccountCircle sx={{ fontSize: 18, mr: 0.5 }} />
                    <Typography variant="subtitle2" fontWeight="bold" fontSize="0.85rem">
                      Información Personal
                    </Typography>
                  </Box>
                  <Typography variant="caption" mb={0.2} display="block" fontSize="0.7rem">
                    <strong>{studentData?.student?.firstName} {studentData?.student?.lastName}</strong>
                  </Typography>
                  <Typography variant="caption" mb={0.2} display="block" fontSize="0.65rem">
                    📧 {user?.email}
                  </Typography>
                  <Typography variant="caption" mb={0.2} display="block" fontSize="0.65rem">
                    📄 Doc: {studentData?.student?.document} | 📞 {studentData?.student?.phone}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Información del Deporte */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, color: 'white' }}>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <School sx={{ fontSize: 18, mr: 0.5 }} />
                    <Typography variant="subtitle2" fontWeight="bold" fontSize="0.85rem">
                      Deporte Inscrito
                    </Typography>
                  </Box>
                  <Typography variant="caption" mb={0.2} display="block" fontSize="0.7rem">
                    <strong>🏋️ {studentData?.sport?.name || 'No inscrito'}</strong>
                  </Typography>
                  <Typography variant="caption" mb={0.2} display="block" fontSize="0.65rem">
                    💰 Cuota: ${studentData?.sport?.monthlyFee?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="caption" mb={0.2} display="block" fontSize="0.65rem">
                    ⚡ Estado: {studentData?.student?.isActive ? '✅ Activo' : '❌ Inactivo'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Resumen Financiero */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, color: 'white' }}>
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Payment sx={{ fontSize: 18, mr: 0.5 }} />
                    <Typography variant="subtitle2" fontWeight="bold" fontSize="0.85rem">
                      Resumen Financiero
                    </Typography>
                  </Box>
                  <Typography variant="caption" mb={0.2} display="block" fontSize="0.7rem">
                    <strong>💳 Total Pagado: ${studentData?.feesSummary?.totalPaid?.toLocaleString() || 0}</strong>
                  </Typography>
                  <Typography variant="caption" mb={0.2} display="block" fontSize="0.65rem">
                    ⏳ Pendiente: ${studentData?.feesSummary?.totalPending?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="caption" mb={0.2} display="block" fontSize="0.65rem">
                    📊 Cuotas al día: {studentData?.feesSummary?.paidFeesCount || 0}/{studentData?.feesSummary?.totalFeesCount || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Estado de Pagos - Ahora con más espacio y preparado para funcionalidad de pagos */}
        <Grid item xs={12} sx={{ height: 'calc(100% - 140px)', overflow: 'hidden' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                <Box display="flex" alignItems="center">
                  <Payment sx={{ fontSize: 18, mr: 0.5 }} />
                  <Typography variant="subtitle1" fontWeight="bold" fontSize="0.9rem">
                    Estado de Cuotas - Haga click para pagar
                  </Typography>
                </Box>
                <Button 
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/student/fees')}
                  sx={{ 
                    bgcolor: '#70d8bd',
                    '&:hover': { bgcolor: '#5cbaa3' },
                    fontSize: '0.65rem',
                    px: 1.5,
                    py: 0.3,
                    minWidth: 'auto'
                  }}
                >
                  Ver Todas
                </Button>
              </Box>

              {studentData?.feesSummary?.recentFees && studentData.feesSummary.recentFees.length > 0 ? (
                <Box sx={{ 
                  overflowX: 'auto', 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'stretch',
                  '&::-webkit-scrollbar': {
                    height: 3,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                    borderRadius: 10,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#70d8bd',
                    borderRadius: 10,
                  },
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 0.8, 
                    minWidth: 'max-content',
                    py: 0.5,
                    height: '100%',
                    alignItems: 'stretch'
                  }}>
                    {studentData.feesSummary.recentFees.map((fee) => (
                      <Card 
                        key={fee.id}
                        variant="outlined"
                        sx={{
                          minWidth: 240,
                          maxWidth: 280,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: fee.paymentStatus === 'paid' ? '2px solid #4caf50' : 
                                 fee.paymentStatus === 'partial' ? '2px solid #ff9800' : 
                                 '2px solid #f44336',
                          cursor: fee.paymentStatus !== 'paid' ? 'pointer' : 'default',
                          '&:hover': fee.paymentStatus !== 'paid' ? { 
                            boxShadow: 4,
                            transform: 'translateY(-3px)',
                            transition: 'all 0.3s ease',
                            backgroundColor: '#f5f5f5'
                          } : {},
                          position: 'relative',
                          overflow: 'visible'
                        }}
                        onClick={() => {
                          if (fee.paymentStatus !== 'paid') {
                            // Aquí irá la lógica de pago en el futuro
                            console.log('Abriendo opciones de pago para cuota:', fee.id);
                            // TODO: Implementar modal de opciones de pago (MercadoPago, Transferencia, Efectivo)
                          }
                        }}
                      >
                        {/* Indicador de que se puede pagar */}
                        {fee.paymentStatus !== 'paid' && (
                          <Box sx={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            backgroundColor: '#ff9800',
                            color: 'white',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            boxShadow: 3,
                            zIndex: 1
                          }}>
                            💳
                          </Box>
                        )}
                        
                        <CardContent sx={{ 
                          p: 2, 
                          '&:last-child': { pb: 2 }, 
                          display: 'flex', 
                          flexDirection: 'column',
                          height: '100%',
                          justifyContent: 'space-between'
                        }}>
                          {/* Header de la cuota */}
                          <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="h6" fontWeight="bold" color="primary.main" fontSize="1.1rem">
                                {fee.monthName || getMonthName(fee.month)} {fee.year}
                              </Typography>
                              {fee.paymentStatus === 'paid' && (
                                <CheckCircle sx={{ fontSize: 24, color: '#4caf50' }} />
                              )}
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" mb={2} fontSize="0.8rem">
                              Período: {fee.month}/{fee.year}
                            </Typography>
                          </Box>

                          {/* Información financiera */}
                          <Box sx={{ mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" mb={1.5} 
                                 sx={{ 
                                   backgroundColor: '#f8f9fa', 
                                   p: 1, 
                                   borderRadius: 1,
                                   border: '1px solid #e9ecef'
                                 }}>
                              <Typography variant="body1" fontWeight="bold" fontSize="0.9rem">
                                Monto Total:
                              </Typography>
                              <Typography variant="body1" fontWeight="bold" fontSize="0.9rem" color="primary.main">
                                ${fee.amount?.toLocaleString()}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" justifyContent="space-between" mb={1} 
                                 sx={{ 
                                   backgroundColor: '#e8f5e8', 
                                   p: 1, 
                                   borderRadius: 1,
                                   border: '1px solid #c8e6c9'
                                 }}>
                              <Typography variant="body1" color="success.main" fontWeight="bold" fontSize="0.9rem">
                                ✅ Pagado:
                              </Typography>
                              <Typography variant="body1" color="success.main" fontWeight="bold" fontSize="0.9rem">
                                ${fee.amountPaid?.toLocaleString()}
                              </Typography>
                            </Box>
                            
                            {fee.remainingAmount > 0 && (
                              <Box display="flex" justifyContent="space-between" mb={1}
                                   sx={{ 
                                     backgroundColor: '#ffebee', 
                                     p: 1, 
                                     borderRadius: 1,
                                     border: '1px solid #ffcdd2'
                                   }}>
                                <Typography variant="body1" color="error.main" fontWeight="bold" fontSize="0.9rem">
                                  ⏳ Restante:
                                </Typography>
                                <Typography variant="body1" color="error.main" fontWeight="bold" fontSize="0.9rem">
                                  ${fee.remainingAmount?.toLocaleString()}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          
                          {/* Estado y opciones de pago */}
                          <Box>
                            <Box display="flex" justifyContent="center" mb={2}>
                              <Chip 
                                icon={fee.paymentStatus === 'paid' ? <CheckCircle /> : 
                                     fee.paymentStatus === 'partial' ? <Warning /> : <Error />}
                                label={fee.paymentStatus === 'paid' ? 'Al día' : 
                                      fee.paymentStatus === 'partial' ? 'Pago Parcial' : 'Pendiente'}
                                color={fee.paymentStatus === 'paid' ? 'success' : 
                                      fee.paymentStatus === 'partial' ? 'warning' : 'error'}
                                size="medium"
                                sx={{ fontSize: '0.8rem', height: '28px', fontWeight: 'bold' }}
                              />
                            </Box>
                            
                            {/* Opciones de pago para cuotas pendientes */}
                            {fee.paymentStatus !== 'paid' && (
                              <Box sx={{ 
                                backgroundColor: '#f0f8ff', 
                                p: 1.5, 
                                borderRadius: 2,
                                border: '1px dashed #70d8bd',
                                textAlign: 'center'
                              }}>
                                <Typography variant="caption" fontSize="0.75rem" color="text.secondary" mb={1} display="block" fontWeight="bold">
                                  💡 Opciones de Pago Disponibles:
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={0.5}>
                                  <Typography variant="caption" fontSize="0.7rem" color="primary.main">
                                    💳 <strong>MercadoPago</strong> - Pago online
                                  </Typography>
                                  <Typography variant="caption" fontSize="0.7rem" color="info.main">
                                    🏦 <strong>Transferencia</strong> - Datos bancarios
                                  </Typography>
                                  <Typography variant="caption" fontSize="0.7rem" color="warning.main">
                                    � <strong>Efectivo</strong> - Pago presencial
                                  </Typography>
                                </Box>
                                
                                {fee.paymentStatus !== 'paid' && (
                                  <Typography variant="caption" fontSize="0.65rem" color="text.secondary" mt={1} display="block" fontStyle="italic">
                                    �️ Haga click en esta tarjeta para pagar
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ fontSize: '0.75rem', mt: 1 }}>
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
