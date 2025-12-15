import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  LinearProgress,
  Button,
  Chip,
} from '@mui/material';
import { 
  CheckCircle,
  Warning,
  CalendarToday,
  ArrowForward,
  FitnessCenter,
  Restaurant,
  DirectionsRun,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuthStore } from '../../hooks';
import { useFeesStore } from '../../hooks/useFeesStore';

const COLORS = {
  orange: '#ff9800',
  green: '#4caf50',
  red: '#f44336',
  blue: '#2196f3',
  dark: '#1a1a2e',
};

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { getStudentFeesData } = useAuthStore();
  const { getMyCoachPaymentInfo } = useFeesStore();
  const { student, user } = useSelector(state => state.auth);
  
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [coachPaymentInfo, setCoachPaymentInfo] = useState(null);
  
  // Permisos del estudiante (están en student.permissions)
  const permissions = student?.permissions || {};
  const canAccessRoutine = permissions.canAccessRoutine ?? true;
  const canAccessNutrition = permissions.canAccessNutrition ?? true;
  const canAccessCardio = permissions.canAccessCardio ?? true;
  const canAccessWeight = permissions.canAccessWeight ?? true;

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

  // Obtener la próxima cuota pendiente
  const nextFee = fees.find(f => f.status !== 'paid' && (f.isCurrent || f.isNext)) || fees.find(f => f.status !== 'paid');
  const isUpToDate = summary.pending === 0 && summary.partial === 0;

  // Formatear fecha
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0d1421 100%)',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Box textAlign="center">
          <Typography variant="h5" color="white" mb={2}>Cargando...</Typography>
          <LinearProgress sx={{ width: 200, bgcolor: 'rgba(255,255,255,0.1)' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0d1421 100%)',
      p: { xs: 2, sm: 3 },
      pb: 10,
    }}>
      {/* Saludo */}
      <Typography variant="h5" fontWeight="bold" color="white" mb={3}>
        👋 Hola, {student?.firstName || user?.name || 'Atleta'}!
      </Typography>

      {/* CARD PRINCIPAL - Estado de Cuota */}
      <Card 
        onClick={() => navigate('/student/fees')}
        sx={{ 
          mb: 3,
          cursor: 'pointer',
          background: isUpToDate 
            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.05) 100%)'
            : nextFee?.isOverdue 
              ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(244, 67, 54, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.05) 100%)',
          border: `2px solid ${isUpToDate ? COLORS.green : nextFee?.isOverdue ? COLORS.red : COLORS.orange}`,
          borderRadius: 3,
          transition: 'transform 0.2s',
          '&:hover': { transform: 'scale(1.02)' },
        }}
      >
        <CardContent sx={{ py: 3 }}>
          {isUpToDate ? (
            // ✅ Al día
            <Box textAlign="center">
              <CheckCircle sx={{ fontSize: 50, color: COLORS.green, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color={COLORS.green}>
                ¡Estás al día! 🎉
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.6)" mt={1}>
                No tenés cuotas pendientes
              </Typography>
            </Box>
          ) : nextFee ? (
            // ⚠️ Cuota pendiente
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Chip 
                  label={nextFee.isOverdue ? "⚠️ CUOTA VENCIDA" : "📅 PRÓXIMO PAGO"} 
                  size="small"
                  sx={{ 
                    bgcolor: nextFee.isOverdue ? COLORS.red : COLORS.orange, 
                    color: 'white', 
                    fontWeight: 'bold',
                  }} 
                />
                <ArrowForward sx={{ color: 'rgba(255,255,255,0.5)' }} />
              </Box>

              <Typography variant="h6" color="white" fontWeight="bold">
                {nextFee.monthName} {nextFee.year}
              </Typography>
              
              <Typography variant="h4" fontWeight="bold" color={nextFee.isOverdue ? COLORS.red : COLORS.orange} my={1}>
                ${(nextFee.remainingAmount || nextFee.value)?.toLocaleString()}
              </Typography>

              {nextFee.dueDate && (
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">
                    {nextFee.isOverdue ? 'Venció el' : 'Vence el'} {formatDueDate(nextFee.dueDate)}
                  </Typography>
                </Box>
              )}

              {nextFee.status === 'partial' && (
                <Typography variant="caption" color={COLORS.orange} display="block" mt={1}>
                  Ya pagaste ${nextFee.amountPaid?.toLocaleString()}
                </Typography>
              )}
            </Box>
          ) : (
            <Box textAlign="center">
              <Typography variant="body1" color="rgba(255,255,255,0.6)">
                No hay cuotas registradas
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Info del coach para transferir */}
      {!isUpToDate && coachPaymentInfo?.hasCoach && coachPaymentInfo?.coach?.paymentAlias && (
        <Card sx={{ 
          mb: 3, 
          bgcolor: 'rgba(33, 150, 243, 0.1)',
          border: `1px solid ${COLORS.blue}`,
          borderRadius: 2,
        }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="subtitle2" color={COLORS.blue} fontWeight="bold" mb={1}>
              💳 Alias para transferir:
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              color="white" 
              sx={{ fontFamily: 'monospace' }}
            >
              {coachPaymentInfo.coach.paymentAlias}
            </Typography>
            <Button 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(coachPaymentInfo.coach.paymentAlias);
              }}
              sx={{ color: COLORS.blue, mt: 1, textTransform: 'none' }}
            >
              📋 Copiar alias
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Accesos rápidos - solo mostrar los habilitados */}
      {(canAccessRoutine || canAccessNutrition || canAccessCardio) && (
        <>
          <Typography variant="subtitle1" color="rgba(255,255,255,0.7)" fontWeight="bold" mb={2}>
            ⚡ Acceso rápido
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
            {canAccessRoutine && (
              <Card 
                onClick={() => navigate('/student/routine')}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  minWidth: 100,
                  flex: '1 1 auto',
                  maxWidth: 150,
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <FitnessCenter sx={{ fontSize: 32, color: COLORS.orange, mb: 1 }} />
                  <Typography variant="caption" color="white" display="block">
                    Mi Rutina
                  </Typography>
                </CardContent>
              </Card>
            )}

            {canAccessNutrition && (
              <Card 
                onClick={() => navigate('/student/nutrition')}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  minWidth: 100,
                  flex: '1 1 auto',
                  maxWidth: 150,
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Restaurant sx={{ fontSize: 32, color: COLORS.green, mb: 1 }} />
                  <Typography variant="caption" color="white" display="block">
                    Nutrición
                  </Typography>
                </CardContent>
              </Card>
            )}

            {canAccessCardio && (
              <Card 
                onClick={() => navigate('/student/cardio')}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  minWidth: 100,
                  flex: '1 1 auto',
                  maxWidth: 150,
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <DirectionsRun sx={{ fontSize: 32, color: COLORS.blue, mb: 1 }} />
                  <Typography variant="caption" color="white" display="block">
                    Cardio
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </>
      )}

      {/* Ver todas las cuotas */}
      <Button
        fullWidth
        variant="outlined"
        onClick={() => navigate('/student/fees')}
        sx={{ 
          mt: 3,
          color: 'rgba(255,255,255,0.7)',
          borderColor: 'rgba(255,255,255,0.2)',
          textTransform: 'none',
          '&:hover': { borderColor: 'rgba(255,255,255,0.4)' },
        }}
      >
        Ver historial de cuotas →
      </Button>
    </Box>
  );
};
