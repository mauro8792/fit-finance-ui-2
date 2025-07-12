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
    <Box m="20px">
      <Header 
        title={`Bienvenido, ${studentData?.student?.firstName || student?.firstName || user?.fullName}`} 
        subtitle="Dashboard del estudiante" 
      />

      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: 200, // Altura fija
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'space-between'
            }}>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountCircle sx={{ fontSize: 24, mr: 1 }} />
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                >
                  Información Personal
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                mb={1}
                sx={{ 
                  fontWeight: 600,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '1.1rem'
                }}
              >
                <strong>{studentData?.student?.firstName} {studentData?.student?.lastName}</strong>
              </Typography>
              <Typography 
                variant="body2" 
                mb={1}
                sx={{ 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '0.95rem'
                }}
              >
                📧 {user?.email}
              </Typography>
              <Typography 
                variant="body2" 
                mb={1}
                sx={{ 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '0.95rem'
                }}
              >
                📄 Doc: {studentData?.student?.document}
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '0.95rem'
                }}
              >
                📞 {studentData?.student?.phone}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Información del Deporte */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            height: 200, // Altura fija
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'space-between'
            }}>
              <Box display="flex" alignItems="center" mb={2}>
                <School sx={{ fontSize: 24, mr: 1 }} />
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                >
                  Deporte Inscrito
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                mb={1}
                sx={{ 
                  fontWeight: 600,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '1.1rem'
                }}
              >
                <strong>🏋️ {studentData?.sport?.name || 'No inscrito'}</strong>
              </Typography>
              <Typography 
                variant="body2" 
                mb={1}
                sx={{ 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '0.95rem'
                }}
              >
                💰 Cuota: ${studentData?.sport?.monthlyFee?.toLocaleString() || 0}
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '0.95rem'
                }}
              >
                ⚡ Estado: {studentData?.student?.isActive ? '✅ Activo' : '❌ Inactivo'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen Financiero */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            height: 200, // Altura fija
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'space-between'
            }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Payment sx={{ fontSize: 24, mr: 1 }} />
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                >
                  Resumen Financiero
                </Typography>
              </Box>
              
              <Box>
                {/* Total Pagado */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: '1rem',
                      fontWeight: 500,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    💳 Total Pagado:
                  </Typography>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                      fontSize: '1.5rem'
                    }}
                  >
                    ${studentData?.feesSummary?.totalPaid?.toLocaleString() || 0}
                  </Typography>
                </Box>
                
                {/* Línea divisoria */}
                <Box sx={{ 
                  borderBottom: '2px solid rgba(255,255,255,0.8)', 
                  mb: 2 
                }} />
                
                {/* Saldo Pendiente */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: '1rem',
                      fontWeight: 500,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    ⏳ Saldo Pendiente:
                  </Typography>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                      fontSize: '1.5rem'
                    }}
                  >
                    ${studentData?.feesSummary?.currentPending?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado de Cuotas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box display="flex" alignItems="center">
                  <Payment sx={{ fontSize: 24, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Estado de Cuotas - Haga click para pagar
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
                  VER TODAS
                </Button>
              </Box>

              {studentData?.feesSummary?.recentFees && studentData.feesSummary.recentFees.length > 0 ? (
                <Grid container spacing={2}>
                  {studentData.feesSummary.recentFees.map((fee) => (
                    <Grid item xs={12} sm={6} md={3} key={fee.id}>
                      <Card 
                        variant="outlined"
                        sx={{
                          border: fee.paymentStatus === 'paid' ? '2px solid #4caf50' : 
                                 fee.paymentStatus === 'partial' ? '2px solid #ff9800' : 
                                 '2px solid #f44336',
                          cursor: fee.paymentStatus !== 'paid' ? 'pointer' : 'default',
                          '&:hover': fee.paymentStatus !== 'paid' ? { 
                            boxShadow: 4,
                            transform: 'translateY(-3px)',
                            transition: 'all 0.3s ease'
                          } : {},
                          height: 300, // Altura optimizada para mostrar todo el contenido
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        onClick={() => {
                          if (fee.paymentStatus !== 'paid') {
                            console.log('Abriendo opciones de pago para cuota:', fee.id);
                            // TODO: Implementar modal de opciones de pago
                          }
                        }}
                      >
                        <CardContent sx={{ 
                          p: 1.5, // Padding reducido para más espacio
                          display: 'flex', 
                          flexDirection: 'column',
                          height: '100%',
                          justifyContent: 'space-between'
                        }}>
                          <Typography 
                            variant="h6" // Tamaño reducido para ahorrar espacio
                            fontWeight="bold" 
                            mb={0.5} // Margen reducido
                            sx={{ 
                              color: '#1565c0',
                              fontSize: '1.1rem'
                            }}
                          >
                            {fee.monthName || getMonthName(fee.month)} {fee.year}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            mb={1} // Margen reducido
                            sx={{ 
                              color: '#757575',
                              fontSize: '0.75rem'
                            }}
                          >
                            Período: {fee.month}/{fee.year}
                          </Typography>

                          <Box mb={1}> // Margen reducido
                            <Typography 
                              variant="h6" 
                              fontWeight="bold"
                              sx={{ 
                                color: '#1976d2',
                                fontSize: '1.2rem'
                              }}
                            >
                              ${fee.amount?.toLocaleString()}
                            </Typography>
                          </Box>

                          <Box mb={1}> // Margen reducido
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              sx={{ 
                                color: '#2e7d32',
                                fontSize: '0.8rem'
                              }}
                            >
                              ✅ Pagado: ${fee.amountPaid?.toLocaleString()}
                            </Typography>
                            {fee.remainingAmount > 0 && (
                              <Typography 
                                variant="body2" 
                                fontWeight="bold"
                                sx={{ 
                                  color: '#d32f2f',
                                  fontSize: '0.8rem'
                                }}
                              >
                                ⏳ Restante: ${fee.remainingAmount?.toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                          
                          <Box display="flex" justifyContent="center">
                            {getPaymentStatusChip(fee.paymentStatus)}
                          </Box>
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
