  import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  Payment, 
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { useAuthStore } from '../../hooks';
import { PaymentModal } from '../../components';
import Swal from 'sweetalert2';
  
  
  
export const StudentDashboard = () => {
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
      height: 'calc(100vh - 64px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0d1421 100%)',
      maxHeight: 'calc(100vh - 64px)'
    }}>
      {/* Main Content */}
      <Box sx={{ 
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 1.5 }
      }}>
        {/* Payment Status Card */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '1px solid #333',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 120px)'
        }}>
          <CardContent sx={{ 
            p: { xs: 1, sm: 1.5 }
          }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Box sx={{
                background: 'linear-gradient(135deg, #70d8bd 0%, #5cbaa3 100%)',
                borderRadius: '50%',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Payment sx={{ fontSize: { xs: 18, sm: 20 }, color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                background: 'linear-gradient(135deg, #70d8bd 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: '#70d8bd',
                ml: 1.5
              }}>
                Estado de Cuotas
              </Typography>
            </Box>

            {studentData?.feesSummary?.recentFees && studentData.feesSummary.recentFees.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(auto-fit, minmax(250px, 1fr))',
                    lg: 'repeat(3, 1fr)'
                  },
                  gap: { xs: 1, sm: 1.5 },
                  height: { xs: '180px', sm: '200px', md: '220px' },
                  maxHeight: { xs: '180px', sm: '200px', md: '220px' }
                }}
              >
                {studentData.feesSummary.recentFees.slice(0, 3).map((fee) => {
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
                        height: '100%',
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
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '0 0 0 12px',
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            zIndex: 1
                          }}
                        >
                          💳 PRÓXIMO
                        </Box>
                      )}

                      <CardContent sx={{ 
                        p: { xs: 1, sm: 1.5 }, 
                        color: 'white',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Typography 
                            variant="h6"
                            fontWeight="bold" 
                            mb={0.5}
                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                          >
                            {fee.monthName || getMonthName(fee.month)} {fee.year}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            mb={1} 
                            sx={{ 
                              opacity: 0.8,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' }
                            }}
                          >
                            Período: {fee.month}/{fee.year}
                          </Typography>

                          <Box mb={1}>
                            <Typography 
                              variant="h5" 
                              fontWeight="bold"
                              sx={{ 
                                color: '#fff',
                                fontSize: { xs: '1rem', sm: '1.1rem' }
                              }}
                            >
                              ${fee.amount?.toLocaleString()}
                            </Typography>
                          </Box>

                          <Box mb={1} sx={{ 
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: 1.5,
                            p: 0.8
                          }}>
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              sx={{ 
                                color: '#4caf50', 
                                mb: 0.3,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
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
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                              >
                                ⏳ Restante: ${fee.remainingAmount?.toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        <Box display="flex" justifyContent="center" mt="auto">
                          {getPaymentStatusChip(fee.paymentStatus)}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            ) : (
              <Alert 
                severity="info" 
                sx={{ 
                  background: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  color: '#42a5f5',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  py: { xs: 1, sm: 1.5 }
                }}
              >
                No tienes cuotas registradas aún.
              </Alert>
            )}
          </CardContent>
        </Card>
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