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
    ];
    return months[month] || '';
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
// Chip de estado de pago
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

  // Modal de pago
  const handleOpenPaymentModal = (fee) => {
    const pendingFees = studentData?.feesSummary?.recentFees?.filter(f => f.paymentStatus !== 'paid') || [];
    if (pendingFees.length === 0) return;
    const oldestPendingFee = pendingFees.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.year, oldest.month - 1);
      const currentDate = new Date(current.year, current.month - 1);
      return currentDate < oldestDate ? current : oldest;
    });
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
          setSelectedFee(oldestPendingFee);
          setPaymentModalOpen(true);
        }
      });
      return;
    }
    setSelectedFee(fee);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedFee(null);
  };

  const handlePaymentSuccess = async () => {
    try {
      const data = await getStudentData();
      setStudentData(data);
    } catch (error) {
      console.error('Error recargando datos:', error);
    }
    handleClosePaymentModal();
  };


  return (

      <Box>
        <Header title="Dashboard Estudiante" subtitle="Bienvenido" />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ boxShadow: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={2} gap={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                  <Payment sx={{ fontSize: { xs: 20, sm: 24 }, mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                    Estado de Cuotas
                  </Typography>
                </Box>
              </Box>

              {studentData?.feesSummary?.recentFees && studentData.feesSummary.recentFees.length > 0 ? (
                <Box 
                  sx={{ 
                    maxHeight: { xs: 350, sm: 'none', md: 400 },
                    overflowY: { xs: 'auto', sm: 'visible', md: 'auto' },
                    overflowX: 'hidden',
                    pr: { xs: 0, sm: 0, md: 1 }
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(auto-fit, minmax(300px, 1fr))',
                        md: 'repeat(3, 1fr)'
                      },
                      gap: { xs: 2, sm: 2.5, md: 3 },
                      width: '100%'
                    }}
                  >
                    {studentData.feesSummary.recentFees.map((fee) => {
                      const cardSx = {
                        border: fee.paymentStatus === 'paid' ? '2px solid #4caf50' : 
                               fee.paymentStatus === 'partial' ? '2px solid #ff9800' : 
                               isNextPayableFee(fee) ? '3px solid #70d8bd' :
                               '2px solid #f44336',
                        cursor: fee.paymentStatus !== 'paid' ? 'pointer' : 'default',
                        position: 'relative',
                        minHeight: { xs: 120, sm: 180 },
                        display: 'flex',
                        flexDirection: 'column',
                        background: isNextPayableFee(fee) && fee.paymentStatus !== 'paid' ? 
                          'linear-gradient(135deg, #f0fdf9 0%, #e6fffa 100%)' : 'white',
                        mb: { xs: 2, sm: 0 },
                        ...(fee.paymentStatus !== 'paid' && {
                          '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-3px)',
                            transition: 'all 0.3s ease'
                          }
                        })
                      };
                      return (
                        <Box key={fee.id}>
                          <Card 
                            variant="outlined"
                            sx={cardSx}
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
                                  px: { xs: 1.5, sm: 1 },
                                  py: { xs: 1, sm: 0.5 },
                                  borderRadius: 1,
                                  fontSize: { xs: '0.9rem', sm: '0.7rem' },
                                  fontWeight: 'bold',
                                  boxShadow: 2,
                                  zIndex: 1
                                }}
                              >
                                💳 PRÓXIMO
                              </Box>
                            )}

                            <CardContent sx={{ 
                              p: { xs: 1, sm: 1.5 },
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              justifyContent: 'space-between'
                            }}>
                              <Typography 
                                variant="h6"
                                fontWeight="bold" 
                                mb={{ xs: 0.5, sm: 0.7 }}
                                sx={{ 
                                  color: '#1565c0',
                                  fontSize: { xs: '1rem', sm: '1.1rem' }
                                }}
                              >
                                {fee.monthName || getMonthName(fee.month)} {fee.year}
                              </Typography>
                              
                              <Typography 
                                variant="body2" 
                                mb={1} 
                                sx={{ 
                                  color: '#757575',
                                  fontSize: { xs: '0.85rem', sm: '0.95rem' }
                                }}
                              >
                                Período: {fee.month}/{fee.year}
                              </Typography>

                              <Box mb={1}> 
                                <Typography 
                                  variant="h6" 
                                  fontWeight="bold"
                                  sx={{ 
                                    color: '#1976d2',
                                    fontSize: { xs: '1.1rem', sm: '1.2rem' }
                                  }}
                                >
                                  ${fee.amount?.toLocaleString()}
                                </Typography>
                              </Box>

                              <Box mb={1}> 
                                <Typography 
                                  variant="body2" 
                                  fontWeight="bold"
                                  sx={{ 
                                    color: '#2e7d32',
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
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
                                      fontSize: { xs: '0.9rem', sm: '1rem' }
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
                      );
                    })}
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, py: { xs: 2, sm: 2.5 } }}>
                  No tienes cuotas registradas aún.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        </Grid>
        
     
        {/* Modal de Pago */}
        <PaymentModal
          open={paymentModalOpen}
          onClose={handleClosePaymentModal}
          fee={selectedFee}
          studentData={studentData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </Box>

    
  )
 }