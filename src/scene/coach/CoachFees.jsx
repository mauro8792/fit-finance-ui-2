import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Select,
  MenuItem,
  TextField,
  IconButton,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Collapse,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Payment,
  ArrowBack,
  Search,
  Clear,
  Settings,
  ExpandMore,
  ExpandLess,
  Save,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFeesStore } from '../../hooks/useFeesStore';
import { Header } from '../../components';

const COLORS = {
  orange: '#ff9800',
  green: '#4caf50',
  red: '#f44336',
  yellow: '#ffeb3b',
  blue: '#2196f3',
  dark: '#1a1a2e',
  cardBg: 'rgba(255,255,255,0.05)',
};

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: (index + 1).toString(),
  label: new Date(0, index).toLocaleString('es', { month: 'long' }),
}));

const yearOptions = Array.from({ length: 5 }, (_, index) => {
  const year = 2024 + index;
  return { value: year.toString(), label: year.toString() };
});

export const CoachFees = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const { 
    getMyStudentsFees, 
    markFeeAsPaid, 
    updatePaymentConfig,
    createPriceSchedule,
    getPriceSchedules,
    cancelPriceSchedule,
    getCoachPlanPrices,
    saveCoachPlanPrices,
  } = useFeesStore();

  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [coachInfo, setCoachInfo] = useState({});

  // Configuración de pago
  const [showPaymentConfig, setShowPaymentConfig] = useState(false);
  const [paymentAlias, setPaymentAlias] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [defaultFeeAmount, setDefaultFeeAmount] = useState('');
  const [planPrices, setPlanPrices] = useState([]); // Precios por plan
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Aumentos programados
  const [showPriceSchedules, setShowPriceSchedules] = useState(false);
  const [priceSchedules, setPriceSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    effectiveMonth: (new Date().getMonth() + 2) > 12 ? 1 : new Date().getMonth() + 2,
    effectiveYear: (new Date().getMonth() + 2) > 12 ? new Date().getFullYear() + 1 : new Date().getFullYear(),
    amount: '',
    description: '',
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal de confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    fee: null,
  });
  const [marking, setMarking] = useState(false);

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await getMyStudentsFees({
        month: selectedMonth,
        year: selectedYear,
      });
      setFees(data.fees || []);
      setStatistics(data.statistics || {});
      setCoachInfo(data.coach || {});
      // Cargar configuración de pago
      setPaymentAlias(data.coach?.paymentAlias || '');
      setPaymentNotes(data.coach?.paymentNotes || '');
      setDefaultFeeAmount(data.coach?.defaultFeeAmount || '');
    } catch (error) {
      console.error('Error cargando cuotas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [selectedMonth, selectedYear]);

  const handleSavePaymentConfig = async () => {
    try {
      setSavingConfig(true);
      
      // Guardar configuración general
      await updatePaymentConfig({ 
        paymentAlias, 
        paymentNotes,
        defaultFeeAmount: defaultFeeAmount ? parseFloat(defaultFeeAmount) : null,
      });
      
      // Guardar precios por plan
      const pricesToSave = planPrices
        .filter(p => p.coachPrice !== null && p.coachPrice !== '')
        .map(p => ({
          sportPlanId: p.id,
          price: parseFloat(p.coachPrice),
        }));
      
      if (pricesToSave.length > 0) {
        await saveCoachPlanPrices(pricesToSave);
      }
      
      setSnackbar({ open: true, message: '✅ Configuración guardada', severity: 'success' });
      setShowPaymentConfig(false);
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setSnackbar({ open: true, message: '❌ Error al guardar', severity: 'error' });
    } finally {
      setSavingConfig(false);
    }
  };

  // Cargar aumentos programados
  const loadPriceSchedules = async () => {
    try {
      const data = await getPriceSchedules();
      setPriceSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error cargando aumentos:', error);
    }
  };

  useEffect(() => {
    if (showPriceSchedules) {
      loadPriceSchedules();
    }
  }, [showPriceSchedules]);

  // Cargar precios por plan cuando se abre la configuración
  const loadPlanPrices = async () => {
    try {
      setLoadingPlans(true);
      const data = await getCoachPlanPrices();
      setPlanPrices(data || []);
    } catch (error) {
      console.error('Error cargando precios de planes:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (showPaymentConfig) {
      loadPlanPrices();
    }
  }, [showPaymentConfig]);

  // Actualizar precio de un plan
  const handlePlanPriceChange = (planId, price) => {
    setPlanPrices(prev => prev.map(p => 
      p.id === planId ? { ...p, coachPrice: price } : p
    ));
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.amount || newSchedule.amount <= 0) {
      setSnackbar({ open: true, message: '❌ Ingresá un monto válido', severity: 'error' });
      return;
    }

    try {
      setSavingSchedule(true);
      await createPriceSchedule({
        effectiveMonth: parseInt(newSchedule.effectiveMonth),
        effectiveYear: parseInt(newSchedule.effectiveYear),
        amount: parseFloat(newSchedule.amount),
        description: newSchedule.description,
      });
      setSnackbar({ open: true, message: '✅ Aumento programado', severity: 'success' });
      setNewSchedule({
        ...newSchedule,
        amount: '',
        description: '',
      });
      loadPriceSchedules();
    } catch (error) {
      console.error('Error creando aumento:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || '❌ Error al programar', severity: 'error' });
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    try {
      await cancelPriceSchedule(scheduleId);
      setSnackbar({ open: true, message: '✅ Aumento cancelado', severity: 'success' });
      loadPriceSchedules();
    } catch (error) {
      console.error('Error cancelando aumento:', error);
      setSnackbar({ open: true, message: '❌ Error al cancelar', severity: 'error' });
    }
  };

  // Filtrar cuotas
  const filteredFees = fees.filter((fee) => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && fee.status === 'completed') ||
      (statusFilter === 'partial' && fee.status === 'partial') ||
      (statusFilter === 'pending' && fee.status === 'pending') ||
      (statusFilter === 'overdue' && fee.isOverdue);
    return matchesSearch && matchesStatus;
  });

  const handleOpenConfirmDialog = (fee) => {
    setConfirmDialog({ open: true, fee });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, fee: null });
  };

  const handleMarkAsPaid = async () => {
    if (!confirmDialog.fee) return;

    try {
      setMarking(true);
      await markFeeAsPaid(confirmDialog.fee.id);
      handleCloseConfirmDialog();
      loadFees(); // Recargar datos
    } catch (error) {
      console.error('Error al marcar como pagada:', error);
      alert('Error al marcar la cuota como pagada');
    } finally {
      setMarking(false);
    }
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) return COLORS.red;
    switch (status) {
      case 'completed':
        return COLORS.green;
      case 'partial':
        return COLORS.orange;
      default:
        return COLORS.red;
    }
  };

  const getStatusLabel = (status, isOverdue) => {
    if (status === 'completed') return '✅ Pagada';
    if (isOverdue) return '🔴 Vencida';
    if (status === 'partial') return '🟡 Parcial';
    return '⏳ Pendiente';
  };

  if (loading) {
    return (
      <Box m={{ xs: 1, sm: 2 }}>
        <Header title="💰 Cuotas de Mis Alumnos" subtitle="Cargando información..." />
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box m={{ xs: 1, sm: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/coach')}
          variant="contained"
          sx={{
            bgcolor: COLORS.orange,
            '&:hover': { bgcolor: '#e68a00' },
          }}
        >
          Volver
        </Button>
        <Header title="💰 Cuotas de Mis Alumnos" />
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            startIcon={<Settings />}
            endIcon={showPaymentConfig ? <ExpandLess /> : <ExpandMore />}
            onClick={() => { setShowPaymentConfig(!showPaymentConfig); setShowPriceSchedules(false); }}
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': { borderColor: COLORS.orange, color: COLORS.orange },
            }}
          >
            {isMobile ? 'Pagos' : 'Configurar Pagos'}
          </Button>
          <Button
            endIcon={showPriceSchedules ? <ExpandLess /> : <ExpandMore />}
            onClick={() => { setShowPriceSchedules(!showPriceSchedules); setShowPaymentConfig(false); }}
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': { borderColor: COLORS.green, color: COLORS.green },
            }}
          >
            📈 {isMobile ? 'Aumentos' : 'Programar Aumentos'}
          </Button>
        </Box>
      </Box>

      {/* Configuración de Pago */}
      <Collapse in={showPaymentConfig}>
        <Card sx={{ mb: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.orange}` }}>
          <CardContent>
            <Typography variant="h6" color={COLORS.orange} mb={2} fontWeight="bold">
              ⚙️ Configuración de Pagos
            </Typography>
            
            {/* Precios por Plan */}
            <Box sx={{ 
              bgcolor: 'rgba(255,152,0,0.1)', 
              border: '1px solid rgba(255,152,0,0.3)',
              borderRadius: 2,
              p: 2,
              mb: 3,
            }}>
              <Typography variant="subtitle2" color={COLORS.orange} mb={2} fontWeight="bold">
                💰 Tus precios por plan
              </Typography>
              
              {loadingPlans ? (
                <Typography color="rgba(255,255,255,0.5)">Cargando planes...</Typography>
              ) : planPrices.length === 0 ? (
                <Typography color="rgba(255,255,255,0.5)">No hay planes disponibles</Typography>
              ) : (
                <Grid container spacing={2}>
                  {planPrices.map((plan) => (
                    <Grid item xs={12} sm={6} md={4} key={plan.id}>
                      <Box sx={{ 
                        bgcolor: 'rgba(0,0,0,0.2)', 
                        borderRadius: 1, 
                        p: 1.5,
                        border: plan.coachPrice ? '1px solid rgba(76,175,80,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      }}>
                        <Typography variant="body2" color="white" fontWeight="bold" mb={0.5}>
                          {plan.name}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)" display="block" mb={1}>
                          {plan.sport?.name} • {plan.weeklyFrequency}x/sem
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          size="small"
                          value={plan.coachPrice || ''}
                          onChange={(e) => handlePlanPriceChange(plan.id, e.target.value)}
                          placeholder={plan.defaultPrice ? `$${plan.defaultPrice}` : 'Precio'}
                          InputProps={{
                            startAdornment: <Typography sx={{ color: 'rgba(255,255,255,0.5)', mr: 0.5, fontSize: '0.9rem' }}>$</Typography>,
                          }}
                          sx={{
                            '& .MuiInputBase-root': { 
                              bgcolor: 'rgba(255,255,255,0.1)', 
                              color: 'white',
                            },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                          }}
                        />
                        {plan.defaultPrice && !plan.coachPrice && (
                          <Typography variant="caption" color="rgba(255,255,255,0.4)" mt={0.5} display="block">
                            Base: ${Number(plan.defaultPrice).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              <Typography variant="caption" color="rgba(255,255,255,0.5)" mt={2} display="block">
                Configurá el precio que cobrás por cada plan. Si no ponés precio, se usa el precio base del sistema.
              </Typography>
            </Box>

            <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={2}>
              📱 Datos para que tus alumnos te transfieran:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Alias / CBU"
                  value={paymentAlias}
                  onChange={(e) => setPaymentAlias(e.target.value)}
                  placeholder="mi.alias.mp"
                  sx={{
                    '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instrucciones de pago (opcional)"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ej: Transferir y enviar comprobante por WhatsApp"
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSavePaymentConfig}
                  disabled={savingConfig}
                  sx={{ bgcolor: COLORS.green, '&:hover': { bgcolor: '#388e3c' } }}
                >
                  {savingConfig ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      {/* Aumentos Programados */}
      <Collapse in={showPriceSchedules}>
        <Card sx={{ mb: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.green}` }}>
          <CardContent>
            <Typography variant="h6" color={COLORS.green} mb={2} fontWeight="bold">
              📈 Programar Aumento de Cuotas
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={3}>
              Programá un aumento que se aplicará automáticamente a las cuotas futuras.
            </Typography>
            
            {/* Formulario para nuevo aumento */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6} sm={3}>
                <Select
                  fullWidth
                  value={newSchedule.effectiveMonth}
                  onChange={(e) => setNewSchedule({ ...newSchedule, effectiveMonth: e.target.value })}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& .MuiSelect-icon': { color: 'white' },
                  }}
                >
                  {monthOptions.map((opt) => (
                    <MenuItem key={opt.value} value={parseInt(opt.value)}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Select
                  fullWidth
                  value={newSchedule.effectiveYear}
                  onChange={(e) => setNewSchedule({ ...newSchedule, effectiveYear: e.target.value })}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& .MuiSelect-icon': { color: 'white' },
                  }}
                >
                  {yearOptions.map((opt) => (
                    <MenuItem key={opt.value} value={parseInt(opt.value)}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Nuevo Monto"
                  value={newSchedule.amount}
                  onChange={(e) => setNewSchedule({ ...newSchedule, amount: e.target.value })}
                  size="small"
                  placeholder="40000"
                  sx={{
                    '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCreateSchedule}
                  disabled={savingSchedule || !newSchedule.amount}
                  sx={{ 
                    bgcolor: COLORS.green, 
                    height: '40px',
                    '&:hover': { bgcolor: '#388e3c' } 
                  }}
                >
                  {savingSchedule ? 'Guardando...' : '✅ Programar Aumento'}
                </Button>
              </Grid>
            </Grid>

            {/* Lista de aumentos programados */}
            {priceSchedules.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="rgba(255,255,255,0.7)" mb={2}>
                  📋 Aumentos programados:
                </Typography>
                <Grid container spacing={2}>
                  {priceSchedules.map((schedule) => (
                    <Grid item xs={12} sm={6} md={4} key={schedule.id}>
                      <Card sx={{ 
                        bgcolor: 'rgba(76, 175, 80, 0.1)', 
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                      }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                                Desde {schedule.monthName} {schedule.effectiveYear}
                              </Typography>
                              <Typography variant="h6" color={COLORS.green} fontWeight="bold">
                                ${schedule.amount?.toLocaleString()}
                              </Typography>
                              {schedule.studentName && (
                                <Typography variant="caption" color="rgba(255,255,255,0.5)">
                                  Solo: {schedule.studentName}
                                </Typography>
                              )}
                            </Box>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCancelSchedule(schedule.id)}
                              sx={{ color: COLORS.red }}
                            >
                              <Clear />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {priceSchedules.length === 0 && (
              <Alert severity="info" sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
                No tenés aumentos programados. Creá uno para que se aplique automáticamente.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Collapse>

      {/* Estadísticas */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${COLORS.blue} 0%, #1976d2 100%)`,
              color: 'white',
              cursor: 'pointer',
              border: statusFilter === 'all' ? '3px solid white' : 'none',
            }}
            onClick={() => setStatusFilter('all')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Payment sx={{ fontSize: 30, mb: 0.5 }} />
              <Typography variant="h4" fontWeight="bold">
                {statistics.total || 0}
              </Typography>
              <Typography variant="body2">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${COLORS.green} 0%, #388e3c 100%)`,
              color: 'white',
              cursor: 'pointer',
              border: statusFilter === 'paid' ? '3px solid white' : 'none',
            }}
            onClick={() => setStatusFilter('paid')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircle sx={{ fontSize: 30, mb: 0.5 }} />
              <Typography variant="h4" fontWeight="bold">
                {statistics.paid || 0}
              </Typography>
              <Typography variant="body2">Pagadas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${COLORS.orange} 0%, #f57c00 100%)`,
              color: 'white',
              cursor: 'pointer',
              border: statusFilter === 'partial' ? '3px solid white' : 'none',
            }}
            onClick={() => setStatusFilter('partial')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Warning sx={{ fontSize: 30, mb: 0.5 }} />
              <Typography variant="h4" fontWeight="bold">
                {statistics.partial || 0}
              </Typography>
              <Typography variant="body2">Parciales</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${COLORS.red} 0%, #d32f2f 100%)`,
              color: 'white',
              cursor: 'pointer',
              border: statusFilter === 'pending' || statusFilter === 'overdue' ? '3px solid white' : 'none',
            }}
            onClick={() => setStatusFilter('pending')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <ErrorIcon sx={{ fontSize: 30, mb: 0.5 }} />
              <Typography variant="h4" fontWeight="bold">
                {(statistics.pending || 0) + (statistics.overdue || 0)}
              </Typography>
              <Typography variant="body2">Pendientes</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3, bgcolor: COLORS.cardBg, border: '1px solid rgba(255,255,255,0.1)' }}>
        <CardContent>
          <Box
            display="flex"
            flexDirection={isMobile ? 'column' : 'row'}
            gap={2}
            alignItems="center"
          >
            {/* Período */}
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                📅 Período:
              </Typography>
              <Select
                native
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                size="small"
                sx={{
                  minWidth: 120,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '& .MuiSelect-icon': { color: 'white' },
                  '& option': { bgcolor: '#1a1a2e', color: 'white' },
                }}
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <Select
                native
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                size="small"
                sx={{
                  minWidth: 90,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '& .MuiSelect-icon': { color: 'white' },
                  '& option': { bgcolor: '#1a1a2e', color: 'white' },
                }}
              >
                {yearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Búsqueda */}
            <TextField
              placeholder="Buscar alumno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                minWidth: 200,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 1,
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.5)' },
              }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear sx={{ color: 'rgba(255,255,255,0.5)' }} />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Lista de cuotas */}
      {filteredFees.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay cuotas para mostrar con los filtros seleccionados.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredFees.map((fee) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={fee.id}>
              <Card
                sx={{
                  bgcolor: COLORS.cardBg,
                  border: `2px solid ${getStatusColor(fee.status, fee.isOverdue)}`,
                  borderRadius: 3,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${getStatusColor(fee.status, fee.isOverdue)}40`,
                  },
                }}
              >
                <CardContent>
                  {/* Nombre del alumno */}
                  <Typography variant="h6" fontWeight="bold" color="white" mb={1}>
                    {fee.studentName}
                  </Typography>

                  {/* Período */}
                  <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={2}>
                    📅 {fee.monthName} {fee.year}
                  </Typography>

                  {/* Montos */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        Valor:
                      </Typography>
                      <Typography variant="body2" color="white" fontWeight="bold">
                        ${fee.value?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        Pagado:
                      </Typography>
                      <Typography variant="body2" color={COLORS.green} fontWeight="bold">
                        ${fee.amountPaid?.toLocaleString()}
                      </Typography>
                    </Box>
                    {fee.remainingAmount > 0 && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="rgba(255,255,255,0.7)">
                          Resta:
                        </Typography>
                        <Typography variant="body2" color={COLORS.red} fontWeight="bold">
                          ${fee.remainingAmount?.toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Vencimiento */}
                  <Typography variant="caption" color="rgba(255,255,255,0.5)" display="block" mb={2}>
                    Vence: día {fee.dueDayOfMonth} de cada mes
                  </Typography>

                  {/* Estado y botón */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={getStatusLabel(fee.status, fee.isOverdue)}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(fee.status, fee.isOverdue)}20`,
                        color: getStatusColor(fee.status, fee.isOverdue),
                        fontWeight: 'bold',
                      }}
                    />

                    {fee.status !== 'completed' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenConfirmDialog(fee)}
                        sx={{
                          bgcolor: COLORS.green,
                          '&:hover': { bgcolor: '#388e3c' },
                          fontWeight: 'bold',
                        }}
                      >
                        ✅ Marcar Pagada
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog de confirmación */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirmDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: COLORS.dark, color: 'white' }}>
          ✅ Confirmar Pago
        </DialogTitle>
        <DialogContent sx={{ bgcolor: COLORS.dark, color: 'white', pt: 2 }}>
          {confirmDialog.fee && (
            <Box>
              <Typography variant="body1" mb={2}>
                ¿Confirmar que <strong>{confirmDialog.fee.studentName}</strong> pagó la cuota de{' '}
                <strong>{confirmDialog.fee.monthName} {confirmDialog.fee.year}</strong>?
              </Typography>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  p: 2,
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h4" color={COLORS.green} fontWeight="bold">
                  ${confirmDialog.fee.value?.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: COLORS.dark, p: 2 }}>
          <Button onClick={handleCloseConfirmDialog} variant="outlined" color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleMarkAsPaid}
            variant="contained"
            disabled={marking}
            sx={{ bgcolor: COLORS.green, '&:hover': { bgcolor: '#388e3c' } }}
          >
            {marking ? 'Guardando...' : '✅ Confirmar Pago'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

