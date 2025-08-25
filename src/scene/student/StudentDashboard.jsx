  import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  Button,
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  AccountCircle, 
  Payment, 
  Warning,
  CheckCircle,
  Error,
  FitnessCenter as FitnessCenterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';
import { PaymentModal } from '../../components';
import Swal from 'sweetalert2';
  
  
  
export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { getStudentData } = useAuthStore();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

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
      <Box sx={{ 
        height: 'calc(100vh - 64px)', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0d1421 100%)',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' },
            background: 'linear-gradient(135deg, #70d8bd 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3
          }}>
            Cargando información...
          </Typography>
          <LinearProgress sx={{ 
            mt: 2, 
            width: 300,
            height: 6,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(135deg, #70d8bd 0%, #42a5f5 100%)'
            }
          }} />
        </Box>
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
    <Box sx={{ 
      height: { xs: 'auto', sm: 'calc(100vh - 64px)' },
      minHeight: { xs: 'calc(100vh - 64px)', sm: 'auto' },
      overflow: { xs: 'visible', sm: 'hidden' },
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0d1421 100%)',
      pb: { xs: 4, sm: 0 } // Padding bottom extra en mobile
    }}>
      {/* Header Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        p: { xs: 2, sm: 3 },
        borderRadius: { xs: '0 0 16px 16px', sm: '0 0 20px 20px' },
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        mb: 2
      }}>
        <Typography variant="h4" fontWeight="bold" sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem' },
          textAlign: 'center'
        }}>
          🎯 Dashboard Estudiante
        </Typography>
        <Typography variant="h6" sx={{ 
          fontSize: { xs: '1rem', sm: '1.2rem' },
          textAlign: 'center',
          opacity: 0.9,
          mt: 1
        }}>
          ¡Bienvenido de vuelta!
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: { xs: 'none', sm: 1 },
        overflow: { xs: 'visible', sm: 'auto' },
        px: { xs: 1, sm: 2, md: 3 },
        pb: { xs: 2, sm: 2 }
      }}>
        {/* Payment Status Card */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '1px solid #333',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          mb: 3,
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} 
                 alignItems={{ xs: 'flex-start', sm: 'center' }} 
                 justifyContent="space-between" mb={3} gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #70d8bd 0%, #5cbaa3 100%)',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Payment sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" sx={{ 
                  fontSize: { xs: '1.3rem', sm: '1.5rem' },
                  background: 'linear-gradient(135deg, #70d8bd 0%, #42a5f5 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: '#70d8bd'
                }}>
                  Estado de Cuotas
                </Typography>
              </Box>
              <Button 
                variant="contained"
                onClick={() => navigate('/student/fees')}
                sx={{ 
                  background: 'linear-gradient(135deg, #70d8bd 0%, #5cbaa3 100%)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #5cbaa3 0%, #4a9d88 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(112, 216, 189, 0.4)'
                  },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.2, sm: 1.5 },
                  borderRadius: 2,
                  fontWeight: 'bold',
                  width: { xs: '100%', sm: 'auto' },
                  transition: 'all 0.3s ease'
                }}
              >
                VER TODAS
              </Button>
            </Box>

            {studentData?.feesSummary?.recentFees && studentData.feesSummary.recentFees.length > 0 ? (
              <Box sx={{ 
                maxHeight: { xs: 'none', sm: 400, md: 500 },
                overflow: { xs: 'visible', sm: 'auto' },
                '&::-webkit-scrollbar': {
                  width: '8px',
                  display: { xs: 'none', sm: 'block' }
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(135deg, #70d8bd 0%, #5cbaa3 100%)',
                  borderRadius: '4px',
                },
              }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(auto-fit, minmax(320px, 1fr))',
                      lg: 'repeat(3, 1fr)'
                    },
                    gap: { xs: 2, sm: 2.5, lg: 3 }
                  }}
                >
                  {studentData.feesSummary.recentFees.map((fee) => {
                    const isNext = isNextPayableFee(fee);
                    const isPaid = fee.paymentStatus === 'paid';
                    
                    return (
                      <Card 
                        key={fee.id}
                        sx={{
                          background: isPaid ? 
                            'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' :
                            isNext ? 
                            'linear-gradient(135deg, #0d4f3c 0%, #1a5f47 100%)' :
                            'linear-gradient(135deg, #3a1e1e 0%, #4a2626 100%)',
                          border: isPaid ? '2px solid #4caf50' :
                                 isNext ? '2px solid #70d8bd' : '2px solid #f44336',
                          borderRadius: 3,
                          cursor: !isPaid ? 'pointer' : 'default',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          ...(!isPaid && {
                            '&:hover': {
                              transform: { xs: 'none', sm: 'translateY(-5px)' },
                              boxShadow: isNext ? 
                                '0 12px 40px rgba(112, 216, 189, 0.3)' :
                                '0 12px 40px rgba(244, 67, 54, 0.3)'
                            }
                          })
                        }}
                        onClick={() => {
                          if (!isPaid) {
                            handleOpenPaymentModal(fee);
                          }
                        }}
                      >
                        {/* Next Payment Indicator */}
                        {isNext && !isPaid && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              background: 'linear-gradient(135deg, #70d8bd 0%, #5cbaa3 100%)',
                              color: 'white',
                              px: 2,
                              py: 1,
                              borderRadius: '0 0 0 16px',
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              fontWeight: 'bold',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              zIndex: 1
                            }}
                          >
                            💳 PRÓXIMO
                          </Box>
                        )}

                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, color: 'white' }}>
                          <Typography 
                            variant="h6"
                            fontWeight="bold" 
                            mb={1.5}
                            sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }}
                          >
                            {fee.monthName || getMonthName(fee.month)} {fee.year}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            mb={2} 
                            sx={{ 
                              opacity: 0.8,
                              fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }}
                          >
                            Período: {fee.month}/{fee.year}
                          </Typography>

                          <Box mb={2}>
                            <Typography 
                              variant="h5" 
                              fontWeight="bold"
                              sx={{ 
                                color: '#fff',
                                fontSize: { xs: '1.2rem', sm: '1.5rem' }
                              }}
                            >
                              ${fee.amount?.toLocaleString()}
                            </Typography>
                          </Box>

                          <Box mb={2} sx={{ 
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            p: 1.5
                          }}>
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              sx={{ 
                                color: '#4caf50', 
                                mb: 0.5,
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}
                            >
                              ✅ Pagado: ${fee.amountPaid?.toLocaleString()}
                            </Typography>
                            {fee.remainingAmount > 0 && (
                              <Typography 
                                variant="body2" 
                                fontWeight="bold"
                                sx={{ 
                                  color: '#ff5722',
                                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
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
                    );
                  })}
                </Box>
              </Box>
            ) : (
              <Alert 
                severity="info" 
                sx={{ 
                  background: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  color: '#42a5f5',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  py: { xs: 2, sm: 3 }
                }}
              >
                No tienes cuotas registradas aún.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2
        }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid #333',
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-5px)' },
              boxShadow: '0 12px 40px rgba(33, 150, 243, 0.3)'
            }
          }}
          onClick={() => navigate('/student/routine')}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                borderRadius: '50%',
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <FitnessCenterIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ 
                color: '#42a5f5',
                mb: 1,
                fontSize: { xs: '1rem', sm: '1.2rem' }
              }}>
                Mi Rutina
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#ccc',
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}>
                Ver y seguir tu rutina de entrenamiento
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid #333',
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-5px)' },
              boxShadow: '0 12px 40px rgba(156, 39, 176, 0.3)'
            }
          }}
          onClick={() => navigate('/student/profile')}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
                borderRadius: '50%',
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <AccountCircle sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ 
                color: '#ab47bc',
                mb: 1,
                fontSize: { xs: '1rem', sm: '1.2rem' }
              }}>
                Mi Perfil
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#ccc',
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}>
                Actualizar información personal
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Payment Modal */}
      {selectedFee && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={handleClosePaymentModal}
          fee={selectedFee}
          studentData={studentData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  );
 }