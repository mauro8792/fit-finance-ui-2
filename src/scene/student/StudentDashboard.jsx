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
import { Header, PaymentModal } from '../../components';
import { RoutineTable } from '../../components/RoutineTable';
import Swal from 'sweetalert2';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, student, getStudentData } = useAuthStore();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showRoutine, setShowRoutine] = useState(false);

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
  }, [getStudentData]);

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

  // Función para determinar si una cuota es la próxima a pagar
  const getNextPayableFee = () => {
    const pendingFees = studentData?.feesSummary?.recentFees?.filter(f => f.paymentStatus !== 'paid') || [];
    
    if (pendingFees.length === 0) return null;

    return pendingFees.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.year, oldest.month - 1);
      const currentDate = new Date(current.year, current.month - 1);
      return currentDate < oldestDate ? current : oldest;
    });
  };

  const isNextPayableFee = (fee) => {
    const nextFee = getNextPayableFee();
    return nextFee && fee.id === nextFee.id;
  };

  const handleOpenPaymentModal = (fee) => {
    // Validar pago secuencial
    const pendingFees = studentData?.feesSummary?.recentFees?.filter(f => f.paymentStatus !== 'paid') || [];
    
    if (pendingFees.length === 0) {
      return;
    }

    // Encontrar la cuota más antigua pendiente
    const oldestPendingFee = pendingFees.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.year, oldest.month - 1);
      const currentDate = new Date(current.year, current.month - 1);
      return currentDate < oldestDate ? current : oldest;
    });

    // Si la cuota seleccionada no es la más antigua pendiente, mostrar advertencia
    if (fee.id !== oldestPendingFee.id) {
      const oldestMonthName = getMonthName(oldestPendingFee.month);
      const selectedMonthName = getMonthName(fee.month);
      
      Swal.fire({
        title: '⚠️ Pago Secuencial Requerido',
        html: `
          <div style="text-align: left; font-size: 14px; line-height: 1.6;">
            <p><strong>No puedes pagar la cuota de ${selectedMonthName}</strong></p>
            <p>Debes pagar primero la cuota de <strong>${oldestMonthName}</strong> que está pendiente.</p>
            <br>
            <p style="color: #666;">💡 <em>Los pagos deben realizarse en orden cronológico para mantener el registro correcto.</em></p>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: `Pagar ${oldestMonthName}`,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#70d8bd',
        cancelButtonColor: '#d33'
      }).then((result) => {
        if (result.isConfirmed) {
          // Si acepta, abrir modal para la cuota más antigua
          setSelectedFee(oldestPendingFee);
          setPaymentModalOpen(true);
        }
      });
      return;
    }

    // Si es la cuota correcta, proceder normalmente
    setSelectedFee(fee);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedFee(null);
  };

  const handlePaymentSuccess = async () => {
    // Recargar datos del estudiante después de un pago exitoso
    try {
      const data = await getStudentData();
      setStudentData(data);
    } catch (error) {
      console.error('Error recargando datos:', error);
    }
    handleClosePaymentModal();
  };

  return (

    <Box 
      className="student-dashboard"
      sx={{ 
        p: { xs: 1, sm: 1.5, md: 2 },
        maxWidth: '100vw',
        overflowX: 'hidden',
        minHeight: { xs: '100vh', md: 'auto' },
        pb: { xs: 15, sm: 10, md: 3 }
      }}
    >
      <Header 
        title={`Bienvenido, ${studentData?.student?.firstName || student?.firstName || user?.fullName}`} 
      />

      {/* Cards principales y cuotas */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {/* Fila 1: Información Compacta - Todas en una fila */}
        <Grid item xs={12} sm={4} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: { xs: 180, sm: 180, md: 180 },
            minHeight: { xs: 180, sm: 180, md: 180 },
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              color: 'white',
              p: { xs: 1.5, sm: 2 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'center'
            }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <AccountCircle sx={{ fontSize: { xs: 20, sm: 24 }, mr: 1 }} />
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    textAlign: 'center'
                  }}
                >
                  {studentData?.student?.firstName || student?.firstName || user?.fullName}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  textAlign: 'center',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' }
                }}
              >
                📧 {studentData?.student?.email || student?.email || user?.email}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  textAlign: 'center',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' }
                }}
              >
                📱 {studentData?.student?.phone || student?.phone}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)',
            height: { xs: 180, sm: 180, md: 180 },
            minHeight: { xs: 180, sm: 180, md: 180 },
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              color: 'white',
              p: { xs: 1.5, sm: 2 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'center'
            }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <School sx={{ fontSize: { xs: 20, sm: 24 }, mr: 1 }} />
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    textAlign: 'center'
                  }}
                >
                  {studentData?.student?.sport?.name || 'Fútbol'}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  textAlign: 'center',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' }
                }}
              >
                💰 ${studentData?.student?.sport?.monthlyFee?.toLocaleString() || '8,500'}/mes
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  textAlign: 'center',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' }
                }}
              >
                📅 Desde: {studentData?.student?.startDate ? 
                  new Date(studentData.student.startDate).toLocaleDateString('es-ES') : 'N/A'}
              </Typography>
              {/* Info del Profesor debajo del deporte */}
              {studentData?.coach && (
                <Box mt={1.5} textAlign="center">
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white', opacity: 0.95 }}>
                    Profesor: {studentData.coach.firstName} {studentData.coach.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.85, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                    📧 {studentData.coach.email}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #00cec9 0%, #55efc4 100%)',
            height: { xs: 180, sm: 180, md: 180 },
            minHeight: { xs: 180, sm: 180, md: 180 },
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ 
              color: 'white',
              p: { xs: 1.5, sm: 2 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'center'
            }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <Payment sx={{ fontSize: { xs: 20, sm: 24 }, mr: 1 }} />
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    fontSize: { xs: '0.9rem', sm: '1.1rem' }
                  }}
                >
                  Resumen Financiero
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.75rem', sm: '0.85rem' }
                  }}
                >
                  💰 Total Pagado:
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  $0
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.75rem', sm: '0.85rem' }
                  }}
                >
                  ⏳ Saldo Pendiente:
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  ${studentData?.feesSummary?.totalPending?.toLocaleString() || '8,500'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Fila 2: Estado de Cuotas - Ancho completo */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
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
                    '&:hover': { bgcolor: '#5cbaa3' },
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  VER TODAS
                </Button>
              </Box>

              {studentData?.feesSummary?.recentFees && studentData.feesSummary.recentFees.length > 0 ? (
                <Box 
                  sx={{ 
                    maxHeight: { xs: 'none', sm: 'none', md: '400px' },
                    overflowY: { xs: 'visible', sm: 'visible', md: 'auto' },
                    overflowX: 'hidden',
                    pr: { xs: 0, sm: 0, md: 1 }
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(auto-fit, minmax(280px, 1fr))',
                        sm: 'repeat(auto-fit, minmax(300px, 1fr))',
                        md: 'repeat(3, 1fr)' // Exactamente 3 columnas en desktop
                      },
                      gap: { xs: 1, sm: 1.5, md: 2 },
                      width: '100%'
                    }}
                  >
                    {studentData.feesSummary.recentFees.map((fee) => (
                      <Box key={fee.id}>
                        <Card 
                          variant="outlined"
                          sx={{
                            border: fee.paymentStatus === 'paid' ? '2px solid #4caf50' : 
                                   fee.paymentStatus === 'partial' ? '2px solid #ff9800' : 
                                   isNextPayableFee(fee) ? '3px solid #70d8bd' :
                                   '2px solid #f44336',
                            cursor: fee.paymentStatus !== 'paid' ? 'pointer' : 'default',
                            position: 'relative',
                            '&:hover': fee.paymentStatus !== 'paid' ? { 
                              boxShadow: 4,
                              transform: 'translateY(-3px)',
                              transition: 'all 0.3s ease'
                            } : {},
                            height: { xs: 'auto', sm: 240, md: 260 },
                            minHeight: { xs: 180 },
                            display: 'flex',
                            flexDirection: 'column',
                            background: isNextPayableFee(fee) && fee.paymentStatus !== 'paid' ? 
                              'linear-gradient(135deg, #f0fdf9 0%, #e6fffa 100%)' : 'white'
                          }}
                          onClick={() => {
                            if (fee.paymentStatus !== 'paid') {
                              handleOpenPaymentModal(fee);
                            }
                          }}
                        >
                          {/* Indicador de próxima cuota a pagar */}
                          {isNextPayableFee(fee) && fee.paymentStatus !== 'paid' && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'linear-gradient(135deg, #70d8bd 0%, #5cbaa3 100%)',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                boxShadow: 2,
                                zIndex: 1
                              }}
                            >
                              💳 PRÓXIMO
                            </Box>
                          )}

                          <CardContent sx={{ 
                            p: { xs: 0.8, sm: 1.2 },
                            display: 'flex', 
                            flexDirection: 'column',
                            height: '100%',
                            justifyContent: 'space-between'
                          }}>
                            <Typography 
                              variant="h6"
                              fontWeight="bold" 
                              mb={{ xs: 0.3, sm: 0.4 }}
                              sx={{ 
                                color: '#1565c0',
                                fontSize: { xs: '0.85rem', sm: '1rem' }
                              }}
                            >
                              {fee.monthName || getMonthName(fee.month)} {fee.year}
                            </Typography>
                            
                            <Typography 
                              variant="body2" 
                              mb={0.8} 
                              sx={{ 
                                color: '#757575',
                                fontSize: '0.7rem'
                              }}
                            >
                              Período: {fee.month}/{fee.year}
                            </Typography>

                            <Box mb={0.8}> 
                              <Typography 
                                variant="h6" 
                                fontWeight="bold"
                                sx={{ 
                                  color: '#1976d2',
                                  fontSize: { xs: '1rem', sm: '1.1rem' }
                                }}
                              >
                                ${fee.amount?.toLocaleString()}
                              </Typography>
                            </Box>

                            <Box mb={0.8}> 
                              <Typography 
                                variant="body2" 
                                fontWeight="bold"
                                sx={{ 
                                  color: '#2e7d32',
                                  fontSize: '0.75rem'
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
                                    fontSize: '0.75rem'
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
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">
                  No tienes cuotas registradas aún.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* Botón para ir a la rutina */}
      <Box mt={3} mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/student/routine')}
        >
          Ver rutina
        </Button>
      </Box>

      {/* Modal de Pago */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={handleClosePaymentModal}
        fee={selectedFee}
        studentData={studentData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Box>
  );
}
