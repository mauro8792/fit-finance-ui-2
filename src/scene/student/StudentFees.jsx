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
import { Header, Layout } from '../../components';

export const StudentFees = () => {
  const navigate = useNavigate();
  const { getStudentFeesData } = useAuthStore();
  // ...existing code...
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
  }, [getStudentFeesData]);

  if (loading) {
    return (
        <Box m={{ xs: 1, sm: 2 }}>
          <Header title="Mis Cuotas" subtitle="Cargando información..." />
          <LinearProgress sx={{ mt: 2 }} />
        </Box>
    );
  }

  return (
      <Box m={{ xs: 1, sm: 2 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/')}
            variant="contained"
            sx={{ 
              mr: 3,
              bgcolor: '#70d8bd',
              '&:hover': { bgcolor: '#5cbaa3' }
            }}
          >
            Volver a Inicio
          </Button>
          <Header title="📊 Historial de Cuotas"  />
        </Box>

        {/* Resumen */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
              color: 'white',
              height: 140
            }}>
              <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Payment sx={{ fontSize: 40, mb: 1 }} />
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {summary.total || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.95,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                    fontWeight: 500
                  }}
                >
                  Total Cuotas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
              color: 'white',
              height: 140
            }}>
              <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {summary.paid || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.95,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                    fontWeight: 500
                  }}
                >
                  Pagadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
              color: 'white',
              height: 140
            }}>
              <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Warning sx={{ fontSize: 40, mb: 1 }} />
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {summary.partial || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.95,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                    fontWeight: 500
                  }}
                >
                  Parciales
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #e84393 0%, #fd79a8 100%)',
              color: 'white',
              height: 140
            }}>
              <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Error sx={{ fontSize: 40, mb: 1 }} />
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {summary.pending || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.95,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                    fontWeight: 500
                  }}
                >
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de Cuotas */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center">
                <Payment sx={{ fontSize: 24, mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  📋 Historial de Cuotas
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                📊 Solo consulta - Para pagar ve a Inicio
              </Typography>
            </Box>
            {fees.length > 0 ? (
              <Grid container spacing={2}>
                {fees.map((fee) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={fee.id}>
                    <Card 
                      sx={{
                        height: 280,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        cursor: 'default',
                        transition: 'all 0.2s ease',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          transform: 'translateY(-1px)'
                        },
                        background: 'white',
                        borderTop: fee.status === 'paid' ? '4px solid #4caf50' : 
                                  fee.status === 'partial' ? '4px solid #ff9800' : 
                                  '4px solid #f44336'
                      }}
                    >
                      <Box sx={{
                        background: fee.isCurrent ? 
                          'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' : 
                          fee.isOverdue ? 
                          'linear-gradient(135deg, #fff3e0 0%, #ffebee 100%)' : 
                          'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        p: 1.5,
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            sx={{ 
                              color: '#1565c0',
                              fontSize: '1.1rem'
                            }}
                          >
                            {fee.monthName || `${fee.month}/${fee.year}`}
                          </Typography>
                          {fee.isCurrent && (
                            <Chip 
                              label="Actual" 
                              size="small" 
                              sx={{ 
                                bgcolor: '#1976d2', 
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                              }} 
                            />
                          )}
                          {fee.isOverdue && (
                            <Chip 
                              label="Vencida" 
                              size="small" 
                              sx={{ 
                                bgcolor: '#d32f2f', 
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                              }} 
                            />
                          )}
                        </Box>
                        <Typography 
                          variant="h5" 
                          fontWeight="bold" 
                          sx={{ 
                            color: '#1565c0',
                            fontSize: '1.3rem'
                          }}
                        >
                          ${fee.value?.toLocaleString() || fee.amount?.toLocaleString()}
                        </Typography>
                      </Box>
                      <CardContent sx={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 1.5,
                        bgcolor: 'white'
                      }}>
                        <Box mb={1.5}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#424242',
                                fontWeight: 600,
                                fontSize: '0.85rem'
                              }}
                            >
                              Pagado
                            </Typography>
                            <Typography 
                              variant="body1" 
                              fontWeight="bold" 
                              sx={{
                                color: fee.amountPaid > 0 ? '#2e7d32' : '#9e9e9e',
                                fontSize: '0.95rem'
                              }}
                            >
                              ${fee.amountPaid?.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#424242',
                                fontWeight: 600,
                                fontSize: '0.85rem'
                              }}
                            >
                              Pendiente
                            </Typography>
                            <Typography 
                              variant="body1" 
                              fontWeight="bold" 
                              sx={{
                                color: fee.remainingAmount > 0 ? '#d32f2f' : '#2e7d32',
                                fontSize: '0.95rem'
                              }}
                            >
                              ${fee.remainingAmount?.toLocaleString() || (fee.amount - fee.amountPaid)?.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Box display="flex" justifyContent="center" mb={0.5}>
                            <Chip 
                              label={fee.status === 'paid' ? '✅ Pagado' : 
                                    fee.status === 'partial' ? '⚠️ Parcial' : '❌ Pendiente'}
                              color={fee.status === 'paid' ? 'success' : 
                                    fee.status === 'partial' ? 'warning' : 'error'}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>
                          {(fee.status !== 'paid' && fee.paymentStatus !== 'paid') && (
                            <Box 
                              sx={{
                                textAlign: 'center',
                                bgcolor: 'info.main',
                                color: 'white',
                                py: 0.3,
                                px: 1,
                                borderRadius: 1,
                                mx: -1.5,
                                mb: -1.5
                              }}
                            >
                              <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                                💳 Ve a Inicio para pagar
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  📋 No tienes cuotas registradas aún
                </Typography>
                <Typography variant="body2">
                  Las cuotas aparecerán aquí cuando se generen.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
  );
  //     <Grid container spacing={3} mb={3}>
  //       <Grid item xs={12} sm={6} md={3}>
  //         <Card sx={{ 
  //           background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
  //           color: 'white',
  //           height: 140
  //         }}>
  //           <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
  //             <Payment sx={{ fontSize: 40, mb: 1 }} />
  //             <Typography 
  //               variant="h4" 
  //               fontWeight="bold"
  //               sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
  //             >
  //               {summary.total || 0}
  //             </Typography>
  //             <Typography 
  //               variant="body2" 
  //               sx={{ 
  //                 opacity: 0.95,
  //                 textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
  //                 fontWeight: 500
  //               }}
  //             >
  //               Total Cuotas
  //             </Typography>
  //           </CardContent>
  //         </Card>
  //       </Grid>
        
  //       <Grid item xs={12} sm={6} md={3}>
  //         <Card sx={{ 
  //           background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
  //           color: 'white',
  //           height: 140
  //         }}>
  //           <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
  //             <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
  //             <Typography 
  //               variant="h4" 
  //               fontWeight="bold"
  //               sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
  //             >
  //               {summary.paid || 0}
  //             </Typography>
  //             <Typography 
  //               variant="body2" 
  //               sx={{ 
  //                 opacity: 0.95,
  //                 textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
  //                 fontWeight: 500
  //               }}
  //             >
  //               Pagadas
  //             </Typography>
  //           </CardContent>
  //         </Card>
  //       </Grid>

  //       <Grid item xs={12} sm={6} md={3}>
  //         <Card sx={{ 
  //           background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
  //           color: 'white',
  //           height: 140
  //         }}>
  //           <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
  //             <Warning sx={{ fontSize: 40, mb: 1 }} />
  //             <Typography 
  //               variant="h4" 
  //               fontWeight="bold"
  //               sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
  //             >
  //               {summary.partial || 0}
  //             </Typography>
  //             <Typography 
  //               variant="body2" 
  //               sx={{ 
  //                 opacity: 0.95,
  //                 textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
  //                 fontWeight: 500
  //               }}
  //             >
  //               Parciales
  //             </Typography>
  //           </CardContent>
  //         </Card>
  //       </Grid>

  //       <Grid item xs={12} sm={6} md={3}>
  //         <Card sx={{ 
  //           background: 'linear-gradient(135deg, #e84393 0%, #fd79a8 100%)',
  //           color: 'white',
  //           height: 140
  //         }}>
  //           <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
  //             <Error sx={{ fontSize: 40, mb: 1 }} />
  //             <Typography 
  //               variant="h4" 
  //               fontWeight="bold"
  //               sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
  //             >
  //               {summary.pending || 0}
  //             </Typography>
  //             <Typography 
  //               variant="body2" 
  //               sx={{ 
  //                 opacity: 0.95,
  //                 textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
  //                 fontWeight: 500
  //               }}
  //             >
  //               Pendientes
  //             </Typography>
  //           </CardContent>
  //         </Card>
  //       </Grid>
  //     </Grid>

  //     {/* Tabla de Cuotas */}
  //     <Card>
  //       <CardContent>
  //         <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
  //           <Box display="flex" alignItems="center">
  //             <Payment sx={{ fontSize: 24, mr: 1, color: 'primary.main' }} />
  //             <Typography variant="h5" fontWeight="bold">
  //               📋 Historial de Cuotas
  //             </Typography>
  //           </Box>
  //           <Typography variant="body2" color="text.secondary" fontStyle="italic">
  //             📊 Solo consulta - Para pagar ve a Inicio
  //           </Typography>
  //         </Box>
          
  //         {fees.length > 0 ? (
  //           <Grid container spacing={2}>
  //             {fees.map((fee) => (
  //               <Grid item xs={12} sm={6} md={4} lg={3} key={fee.id}>
  //                 <Card 
  //                   sx={{
  //                     height: 280,
  //                     display: 'flex',
  //                     flexDirection: 'column',
  //                     borderRadius: 3,
  //                     cursor: 'default', // Sin hover para pago
  //                     transition: 'all 0.2s ease',
  //                     overflow: 'hidden',
  //                     position: 'relative',
  //                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  //                     '&:hover': {
  //                       boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  //                       transform: 'translateY(-1px)' // Hover más sutil
  //                     },
  //                     background: 'white',
  //                     borderTop: fee.status === 'paid' ? '4px solid #4caf50' : 
  //                               fee.status === 'partial' ? '4px solid #ff9800' : 
  //                               '4px solid #f44336'
  //                   }}
  //                   onClick={() => {
  //                     if (fee.status !== 'paid' && fee.paymentStatus !== 'paid') {
  //                       console.log('Abriendo opciones de pago para cuota:', fee.id);
  //                       // TODO: Implementar modal de opciones de pago
  //                     }
  //                   }}
  //                 >
  //                   {/* Header con degradado sutil */}
  //                   <Box sx={{
  //                     background: fee.isCurrent ? 
  //                       'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' : 
  //                       fee.isOverdue ? 
  //                       'linear-gradient(135deg, #fff3e0 0%, #ffebee 100%)' : 
  //                       'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  //                     p: 1.5, // Padding reducido para más espacio
  //                     borderBottom: '1px solid rgba(0,0,0,0.05)'
  //                   }}>
  //                     <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
  //                       <Typography 
  //                         variant="h6" 
  //                         fontWeight="bold" 
  //                         sx={{ 
  //                           color: '#1565c0',
  //                           fontSize: '1.1rem' // Tamaño reducido
  //                         }}
  //                       >
  //                         {fee.monthName || `${fee.month}/${fee.year}`}
  //                       </Typography>
                        
  //                       {/* Chips de estado mejorados */}
  //                       {fee.isCurrent && (
  //                         <Chip 
  //                           label="Actual" 
  //                           size="small" 
  //                           sx={{ 
  //                             bgcolor: '#1976d2', 
  //                             color: 'white',
  //                             fontWeight: 'bold',
  //                             fontSize: '0.7rem'
  //                           }} 
  //                         />
  //                       )}
  //                       {fee.isOverdue && (
  //                         <Chip 
  //                           label="Vencida" 
  //                           size="small" 
  //                           sx={{ 
  //                             bgcolor: '#d32f2f', 
  //                             color: 'white',
  //                             fontWeight: 'bold',
  //                             fontSize: '0.7rem'
  //                           }} 
  //                         />
  //                       )}
  //                     </Box>
                      
  //                     {/* Monto principal destacado */}
  //                     <Typography 
  //                       variant="h5" 
  //                       fontWeight="bold" 
  //                       sx={{ 
  //                         color: '#1565c0',
  //                         fontSize: '1.3rem' // Tamaño ligeramente reducido
  //                       }}
  //                     >
  //                       ${fee.value?.toLocaleString() || fee.amount?.toLocaleString()}
  //                     </Typography>
  //                   </Box>

  //                   {/* Contenido financiero */}
  //                   <CardContent sx={{ 
  //                     flex: 1, 
  //                     display: 'flex', 
  //                     flexDirection: 'column',
  //                     justifyContent: 'space-between',
  //                     p: 1.5, // Padding reducido
  //                     bgcolor: 'white'
  //                   }}>
  //                     {/* Información de pagos */}
  //                     <Box mb={1.5}> {/* Margen reducido */}
  //                       <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}> {/* Margen reducido */}
  //                         <Typography 
  //                           variant="body2" 
  //                           sx={{ 
  //                             color: '#424242',
  //                             fontWeight: 600,
  //                             fontSize: '0.85rem' // Tamaño ligeramente reducido
  //                           }}
  //                         >
  //                           Pagado
  //                         </Typography>
  //                         <Typography 
  //                           variant="body1" 
  //                           fontWeight="bold" 
  //                           sx={{
  //                             color: fee.amountPaid > 0 ? '#2e7d32' : '#9e9e9e',
  //                             fontSize: '0.95rem' // Tamaño ligeramente reducido
  //                           }}
  //                         >
  //                           ${fee.amountPaid?.toLocaleString()}
  //                         </Typography>
  //                       </Box>
                        
  //                       <Box display="flex" justifyContent="space-between" alignItems="center">
  //                         <Typography 
  //                           variant="body2" 
  //                           sx={{ 
  //                             color: '#424242',
  //                             fontWeight: 600,
  //                             fontSize: '0.85rem' // Tamaño ligeramente reducido
  //                           }}
  //                         >
  //                           Pendiente
  //                         </Typography>
  //                         <Typography 
  //                           variant="body1" 
  //                           fontWeight="bold" 
  //                           sx={{
  //                             color: fee.remainingAmount > 0 ? '#d32f2f' : '#2e7d32',
  //                             fontSize: '0.95rem' // Tamaño ligeramente reducido
  //                           }}
  //                         >
  //                           ${fee.remainingAmount?.toLocaleString() || (fee.amount - fee.amountPaid)?.toLocaleString()}
  //                         </Typography>
  //                       </Box>
  //                     </Box>

  //                     {/* Footer */}
  //                     <Box>
  //                       {/* Estado mejorado */}
  //                       <Box display="flex" justifyContent="center" mb={0.5}>
  //                         <Chip 
  //                           label={fee.status === 'paid' ? '✅ Pagado' : 
  //                                 fee.status === 'partial' ? '⚠️ Parcial' : '❌ Pendiente'}
  //                           color={fee.status === 'paid' ? 'success' : 
  //                                 fee.status === 'partial' ? 'warning' : 'error'}
  //                           size="small"
  //                           sx={{ fontWeight: 'bold' }}
  //                         />
  //                       </Box>

  //                       {/* Mensaje informativo en lugar de botón de pago */}
  //                       {(fee.status !== 'paid' && fee.paymentStatus !== 'paid') && (
  //                         <Box 
  //                           sx={{
  //                             textAlign: 'center',
  //                             bgcolor: 'info.main',
  //                             color: 'white',
  //                             py: 0.3,
  //                             px: 1,
  //                             borderRadius: 1,
  //                             mx: -1.5,
  //                             mb: -1.5
  //                           }}
  //                         >
  //                           <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
  //                             💳 Ve a Inicio para pagar
  //                           </Typography>
  //                         </Box>
  //                       )}
  //                     </Box>
  //                   </CardContent>
  //                 </Card>
  //               </Grid>
  //             ))}
  //           </Grid>
  //         ) : (
  //           <Alert severity="info" sx={{ mt: 2 }}>
  //             <Typography variant="h6" gutterBottom>
  //               📋 No tienes cuotas registradas aún
  //             </Typography>
  //             <Typography variant="body2">
  //               Las cuotas aparecerán aquí cuando se generen.
  //             </Typography>
  //           </Alert>
  //         )}
  //       </CardContent>
  //     </Card>
  //   </Box>
  // );
};
