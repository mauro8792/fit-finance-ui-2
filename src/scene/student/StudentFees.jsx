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
  Button,
  IconButton,
} from '@mui/material';
import { 
  CheckCircle, 
  Warning, 
  Error as ErrorIcon,
  ArrowBack,
  ContentCopy,
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

  const getStatusColor = (status, isOverdue) => {
    if (status === 'paid') return COLORS.green;
    if (isOverdue) return COLORS.red;
    if (status === 'partial') return COLORS.orange;
    return COLORS.red;
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
    <Box m={{ xs: 1, sm: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton 
          onClick={() => navigate('/')}
          sx={{ 
            bgcolor: COLORS.orange,
            color: 'white',
            '&:hover': { bgcolor: '#e68a00' },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" color="white">
          💰 Mis Cuotas
        </Typography>
      </Box>

      {/* Resumen: Solo si tiene pendientes */}
      {(summary.pending > 0 || summary.partial > 0) && (
        <Card sx={{ 
          mb: 3,
          bgcolor: 'rgba(244, 67, 54, 0.1)',
          border: `2px solid ${COLORS.red}`,
          p: 2,
          textAlign: 'center',
        }}>
          <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={1}>
            💸 Tenés pendiente:
          </Typography>
          <Typography variant="h3" fontWeight="bold" color={COLORS.red}>
            ${fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + (f.remainingAmount || f.value || 0), 0).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.5)">
            {summary.pending + summary.partial} cuota{(summary.pending + summary.partial) !== 1 ? 's' : ''} sin pagar
          </Typography>
        </Card>
      )}

      {/* Si está todo pago */}
      {summary.pending === 0 && summary.partial === 0 && summary.paid > 0 && (
        <Card sx={{ 
          mb: 3,
          bgcolor: 'rgba(76, 175, 80, 0.1)',
          border: `2px solid ${COLORS.green}`,
          p: 2,
          textAlign: 'center',
        }}>
          <Typography variant="h5" fontWeight="bold" color={COLORS.green}>
            ✅ ¡Estás al día!
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.5)">
            Todas tus cuotas están pagadas
          </Typography>
        </Card>
      )}

      {/* Info de Pago del Coach */}
      {coachPaymentInfo?.hasCoach && coachPaymentInfo?.coach?.paymentAlias && (
        <Card sx={{ 
          mb: 3, 
          bgcolor: 'rgba(33, 150, 243, 0.1)',
          border: `2px solid ${COLORS.blue}`,
        }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" color={COLORS.blue} mb={2}>
              💳 Datos para Transferencia
            </Typography>
            
            <Box sx={{ 
              bgcolor: 'rgba(255,255,255,0.05)', 
              p: 2, 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}>
              <Box>
                <Typography variant="caption" color="rgba(255,255,255,0.5)">
                  Alias / CBU:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="white" sx={{ fontFamily: 'monospace' }}>
                  {coachPaymentInfo.coach.paymentAlias}
                </Typography>
                {coachPaymentInfo.coach.name && (
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">
                    Titular: {coachPaymentInfo.coach.name}
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCopyAlias}
                startIcon={<ContentCopy />}
                sx={{ 
                  color: copiedAlias ? COLORS.green : 'white',
                  borderColor: copiedAlias ? COLORS.green : 'rgba(255,255,255,0.3)',
                }}
              >
                {copiedAlias ? '¡Copiado!' : 'Copiar'}
              </Button>
            </Box>

            {coachPaymentInfo.coach.paymentNotes && (
              <Typography variant="body2" color="rgba(255,255,255,0.7)" mt={2} fontStyle="italic">
                💡 {coachPaymentInfo.coach.paymentNotes}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de Cuotas */}
      <Typography variant="subtitle1" fontWeight="bold" color="rgba(255,255,255,0.7)" mb={2}>
        📋 Historial de Cuotas
      </Typography>

      {fees.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {fees.map((fee) => (
            <Card 
              key={fee.id}
              sx={{
                bgcolor: COLORS.cardBg,
                border: `2px solid ${getStatusColor(fee.status, fee.isOverdue)}`,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2,
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {/* Izquierda: Mes y Estado */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="white">
                      {fee.monthName}
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">
                      {fee.year}
                    </Typography>
                  </Box>
                  
                  {fee.isCurrent && (
                    <Chip 
                      label="Actual" 
                      size="small" 
                      sx={{ bgcolor: COLORS.blue, color: 'white', fontWeight: 'bold' }} 
                    />
                  )}
                  {fee.isOverdue && (
                    <Chip 
                      label="Vencida" 
                      size="small" 
                      sx={{ bgcolor: COLORS.red, color: 'white', fontWeight: 'bold' }} 
                    />
                  )}
                </Box>

                {/* Centro: Monto */}
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight="bold" color={COLORS.orange}>
                    ${fee.value?.toLocaleString()}
                  </Typography>
                </Box>

                {/* Derecha: Estado de pago */}
                <Box textAlign="right" minWidth={100}>
                  {fee.status === 'paid' ? (
                    <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                      <CheckCircle sx={{ color: COLORS.green, fontSize: 20 }} />
                      <Typography variant="body2" color={COLORS.green} fontWeight="bold">
                        Pagada
                      </Typography>
                    </Box>
                  ) : fee.status === 'partial' ? (
                    <Box>
                      <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                        <Warning sx={{ color: COLORS.orange, fontSize: 20 }} />
                        <Typography variant="body2" color={COLORS.orange} fontWeight="bold">
                          Parcial
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="rgba(255,255,255,0.5)">
                        Pagado: ${fee.amountPaid?.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" display="block" color={COLORS.red}>
                        Resta: ${fee.remainingAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                        <ErrorIcon sx={{ color: COLORS.red, fontSize: 20 }} />
                        <Typography variant="body2" color={COLORS.red} fontWeight="bold">
                          Pendiente
                        </Typography>
                      </Box>
                      <Typography variant="caption" color={COLORS.red}>
                        ${fee.remainingAmount?.toLocaleString() || fee.value?.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
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
