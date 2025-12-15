import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  LinearProgress,
  Alert,
  Button,
  IconButton,
  Collapse,
} from '@mui/material';
import { 
  CheckCircle, 
  Warning, 
  Error as ErrorIcon,
  ArrowBack,
  ContentCopy,
  ExpandMore,
  ExpandLess,
  CalendarToday,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';
import { useFeesStore } from '../../hooks/useFeesStore';

const COLORS = {
  orange: '#ff9800',
  green: '#4caf50',
  red: '#f44336',
  blue: '#2196f3',
  dark: '#1a1a2e',
  cardBg: 'rgba(255,255,255,0.05)',
};

export const StudentFees = () => {
  const navigate = useNavigate();
  const { getStudentFeesData } = useAuthStore();
  const { getMyCoachPaymentInfo } = useFeesStore();
  
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    partial: 0,
    pending: 0
  });
  const [coachPaymentInfo, setCoachPaymentInfo] = useState(null);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [feesData, paymentInfo] = await Promise.all([
          getStudentFeesData(),
          getMyCoachPaymentInfo().catch(() => null),
        ]);
        setFees(feesData.fees || []);
        setSummary(feesData.summary || {});
        setCoachPaymentInfo(paymentInfo);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyAlias = () => {
    if (coachPaymentInfo?.coach?.paymentAlias) {
      navigator.clipboard.writeText(coachPaymentInfo.coach.paymentAlias);
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    }
  };

  // Separar cuotas
  const nextFee = fees.find(f => f.status !== 'paid' && (f.isCurrent || f.isNext));
  const pendingFees = fees.filter(f => f.status !== 'paid' && f.id !== nextFee?.id);
  const paidFees = fees.filter(f => f.status === 'paid');
  const isUpToDate = summary.pending === 0 && summary.partial === 0;

  // Formatear fecha de vencimiento
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <Box m={{ xs: 1, sm: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="white" mb={2}>
          💰 Mis Cuotas
        </Typography>
        <LinearProgress sx={{ bgcolor: 'rgba(255,152,0,0.2)', '& .MuiLinearProgress-bar': { bgcolor: COLORS.orange } }} />
      </Box>
    );
  }

  return (
    <Box m={{ xs: 1, sm: 2 }} pb={4}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton 
          onClick={() => navigate('/student')}
          sx={{ 
            bgcolor: COLORS.orange,
            color: 'white',
            '&:hover': { bgcolor: '#e68a00' },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" color="white">
          💰 Estado de Cuotas
        </Typography>
      </Box>

      {/* CARD PRINCIPAL - Estado Actual */}
      {isUpToDate ? (
        // ✅ Al día
        <Card sx={{ 
          mb: 3,
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.05) 100%)',
          border: `2px solid ${COLORS.green}`,
          borderRadius: 3,
        }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 60, color: COLORS.green, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color={COLORS.green}>
              ¡Estás al día! 🎉
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.7)" mt={1}>
              No tenés cuotas pendientes
            </Typography>
          </CardContent>
        </Card>
      ) : nextFee ? (
        // ⚠️ Próxima cuota
        <Card sx={{ 
          mb: 3,
          background: nextFee.isOverdue 
            ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(244, 67, 54, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.05) 100%)',
          border: `2px solid ${nextFee.isOverdue ? COLORS.red : COLORS.orange}`,
          borderRadius: 3,
        }}>
          <CardContent sx={{ py: 3 }}>
            {/* Badge superior */}
            <Box display="flex" justifyContent="center" mb={2}>
              <Chip 
                label={nextFee.isOverdue ? "⚠️ VENCIDA" : nextFee.isCurrent ? "📅 CUOTA ACTUAL" : "📅 PRÓXIMA CUOTA"} 
                sx={{ 
                  bgcolor: nextFee.isOverdue ? COLORS.red : COLORS.orange, 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  px: 2,
                }} 
              />
            </Box>

            {/* Mes y monto */}
            <Typography variant="h5" fontWeight="bold" color="white" textAlign="center">
              {nextFee.monthName} {nextFee.year}
            </Typography>
            
            <Typography variant="h3" fontWeight="bold" color={nextFee.isOverdue ? COLORS.red : COLORS.orange} textAlign="center" my={2}>
              ${(nextFee.remainingAmount || nextFee.value)?.toLocaleString()}
            </Typography>

            {/* Fecha de vencimiento */}
            {nextFee.dueDate && (
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                <CalendarToday sx={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }} />
                <Typography variant="body1" color="rgba(255,255,255,0.7)">
                  {nextFee.isOverdue ? 'Venció el' : 'Vence el'} <strong style={{ color: 'white' }}>{formatDueDate(nextFee.dueDate)}</strong>
                </Typography>
              </Box>
            )}

            {/* Si es pago parcial */}
            {nextFee.status === 'partial' && (
              <Alert 
                severity="info" 
                sx={{ 
                  bgcolor: 'rgba(255,152,0,0.1)', 
                  border: `1px solid ${COLORS.orange}`,
                  mb: 2,
                }}
              >
                Ya pagaste ${nextFee.amountPaid?.toLocaleString()} - Te falta ${nextFee.remainingAmount?.toLocaleString()}
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Info de Pago del Coach */}
      {coachPaymentInfo?.hasCoach && coachPaymentInfo?.coach?.paymentAlias && (
        <Card sx={{ 
          mb: 3, 
          bgcolor: 'rgba(33, 150, 243, 0.1)',
          border: `1px solid ${COLORS.blue}`,
          borderRadius: 2,
        }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" color={COLORS.blue} mb={2}>
              💳 Datos para Transferencia
            </Typography>
            
            <Box sx={{ 
              bgcolor: 'rgba(0,0,0,0.2)', 
              p: 2, 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}>
              <Box flex={1}>
                <Typography variant="caption" color="rgba(255,255,255,0.5)">
                  Alias / CBU:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="white" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {coachPaymentInfo.coach.paymentAlias}
                </Typography>
              </Box>
              <IconButton
                onClick={handleCopyAlias}
                size="small"
                sx={{ 
                  color: copiedAlias ? COLORS.green : 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>
            {copiedAlias && (
              <Typography variant="caption" color={COLORS.green} mt={1} display="block">
                ✓ Copiado al portapapeles
              </Typography>
            )}

            {coachPaymentInfo.coach.paymentNotes && (
              <Typography variant="body2" color="rgba(255,255,255,0.6)" mt={2} fontSize={12}>
                💡 {coachPaymentInfo.coach.paymentNotes}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cuotas futuras pendientes */}
      {pendingFees.length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle2" color="rgba(255,255,255,0.5)" mb={1}>
            Próximos meses pendientes ({pendingFees.length})
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {pendingFees.slice(0, 3).map((fee) => (
              <Chip 
                key={fee.id}
                label={`${fee.monthName?.slice(0,3)} - $${fee.value?.toLocaleString()}`}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,152,0,0.15)', 
                  color: COLORS.orange,
                  border: '1px solid rgba(255,152,0,0.3)',
                }}
              />
            ))}
            {pendingFees.length > 3 && (
              <Chip 
                label={`+${pendingFees.length - 3} más`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Historial de pagos (colapsable) */}
      {paidFees.length > 0 && (
        <Box>
          <Button
            fullWidth
            onClick={() => setShowHistory(!showHistory)}
            endIcon={showHistory ? <ExpandLess /> : <ExpandMore />}
            sx={{ 
              color: 'rgba(255,255,255,0.6)',
              justifyContent: 'space-between',
              textTransform: 'none',
              mb: 1,
            }}
          >
            <Typography variant="subtitle2">
              ✅ Historial de pagos ({paidFees.length} cuota{paidFees.length !== 1 ? 's' : ''})
            </Typography>
          </Button>
          
          <Collapse in={showHistory}>
            <Box display="flex" flexDirection="column" gap={1}>
              {paidFees.map((fee) => (
                <Box 
                  key={fee.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    bgcolor: 'rgba(76, 175, 80, 0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle sx={{ color: COLORS.green, fontSize: 18 }} />
                    <Typography variant="body2" color="white">
                      {fee.monthName} {fee.year}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color={COLORS.green} fontWeight="bold">
                    ${fee.value?.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Sin cuotas */}
      {fees.length === 0 && (
        <Alert 
          severity="info" 
          sx={{ 
            bgcolor: 'rgba(33, 150, 243, 0.1)', 
            color: 'white',
            border: `1px solid ${COLORS.blue}`,
          }}
        >
          No tenés cuotas registradas aún. Aparecerán cuando se generen.
        </Alert>
      )}
    </Box>
  );
};
