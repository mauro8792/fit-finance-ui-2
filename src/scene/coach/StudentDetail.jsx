import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  LinearProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Tabs,
  Tab,
  Fade,
  Button,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import StudentPermissions from '../../components/StudentPermissions';
import { useAuthStore } from '../../hooks';
import RoutineWizard from './RoutineWizard';
import { useRoutineStore } from '../../hooks/useRoutineStore';
import NutritionProfileCard from './NutritionProfileCard';
import { getTrainingHistory, getExerciseHistory, getWeightHistory, getStudentSetNotes } from '../../api/fitFinanceApi';
import { getNutritionDashboard, getWeeklySummary, getNutritionProfile } from '../../api/nutritionApi';
import { getCardioSummary, getActivityInfo, formatDuration, INTENSITY_LEVELS } from '../../api/cardioApi';
import { getCoachSummary as getTrackedSummary, getActivityInfo as getTrackedActivityInfo } from '../../api/activityTrackerApi';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = {
  bg: '#0d0d0d',
  card: '#1a1a2e',
  cardDark: '#141428',
  text: '#e0e0e0',
  textMuted: '#888',
  border: 'rgba(255,255,255,0.1)',
  green: '#4cceac',
  orange: '#ff9800',
  blue: '#6870fa',
  purple: '#a855f7',
  pink: '#ec4899',
  gold: '#ffd700',
};

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudentById } = useAuthStore();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [macros, setMacros] = useState([]);
  const [loadingMacros, setLoadingMacros] = useState(true);
  const [showRoutineWizard, setShowRoutineWizard] = useState(false);
  const { getAllMacroCycles } = useRoutineStore();
  
  // Tab activo: 0=Información, 1=Entrenamiento, 2=Nutrición
  const [activeTab, setActiveTab] = useState(1); // Por defecto Entrenamiento
  
  // Función para recargar datos de nutrición y cardio
  const reloadNutritionData = () => {
    setLoadingNutrition(true);
    Promise.all([
      getNutritionDashboard(id).catch(() => null),
      getWeeklySummary(id).catch(() => null),
      getNutritionProfile(id).catch(() => null),
      getWeightHistory(id, 15).catch(() => []),
      getCardioSummary(id, 7).catch(() => null),
      getTrackedSummary(id, 7).catch(() => null),
    ])
      .then(([today, week, profile, weight, cardioLog, trackedCardio]) => {
        console.log('📊 Nutrition data loaded:', { today, week, profile, weight, cardioLog, trackedCardio });
        setNutritionToday(today);
        setNutritionWeek(week);
        setNutritionProfile(profile);
        setWeightHistory(weight || []);
        
        // Combinar cardio-log y activity-tracker
        const combinedCardio = combineCardioSummaries(cardioLog, trackedCardio);
        setCardioSummary(combinedCardio);
      })
      .finally(() => setLoadingNutrition(false));
  };
  
  // Función auxiliar para combinar resúmenes de cardio
  const combineCardioSummaries = (cardioLog, tracked) => {
    if (!cardioLog && !tracked) return null;
    if (!cardioLog) return tracked;
    if (!tracked) return cardioLog;
    
    // Combinar totales
    const totalSessions = (cardioLog.totalSessions || 0) + (tracked.totalSessions || 0);
    const totalMinutes = (cardioLog.totalMinutes || 0) + (tracked.totalMinutes || 0);
    const totalCalories = (cardioLog.totalCalories || 0) + (tracked.totalCalories || 0);
    
    // Combinar actividades por tipo
    const byActivityMap = {};
    
    // Agregar del cardio-log
    if (cardioLog.byActivity) {
      cardioLog.byActivity.forEach(a => {
        byActivityMap[a.type] = { 
          type: a.type, 
          minutes: a.minutes || 0, 
          sessions: a.sessions || 0,
          percent: 0,
        };
      });
    }
    
    // Agregar del tracked
    if (tracked.byActivity) {
      tracked.byActivity.forEach(a => {
        if (byActivityMap[a.type]) {
          byActivityMap[a.type].minutes += a.minutes || 0;
          byActivityMap[a.type].sessions += a.sessions || 0;
        } else {
          byActivityMap[a.type] = { 
            type: a.type, 
            minutes: a.minutes || 0, 
            sessions: a.sessions || 0,
            percent: 0,
          };
        }
      });
    }
    
    // Calcular porcentajes y convertir a array
    const byActivity = Object.values(byActivityMap).map(a => ({
      ...a,
      percent: totalMinutes > 0 ? Math.round((a.minutes / totalMinutes) * 100) : 0,
    })).sort((a, b) => b.minutes - a.minutes);
    
    return {
      totalSessions,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      totalCalories,
      averagePerDay: Math.round(totalMinutes / 7),
      byActivity,
    };
  };
  
  // Handler para cambio de tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Recargar datos de nutrición cuando se activa ese tab
    if (newValue === 2) {
      reloadNutritionData();
    }
  };
  
  // 📋 Historial de entrenamientos
  const [trainingHistory, setTrainingHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTab, setHistoryTab] = useState(2); // 0=Sesiones, 1=Ejercicios, 2=Gráficos
  const [exerciseHistory, setExerciseHistory] = useState(null);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [selectedChartExercise, setSelectedChartExercise] = useState(null);
  
  // 🍎 Datos de nutrición
  const [nutritionToday, setNutritionToday] = useState(null);
  const [nutritionWeek, setNutritionWeek] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [loadingNutrition, setLoadingNutrition] = useState(true);
  
  // ⚖️ Historial de peso
  const [weightHistory, setWeightHistory] = useState([]);
  
  // 🏃 Cardio
  const [cardioSummary, setCardioSummary] = useState(null);
  
  // 🎯 Modal de perfil nutricional
  const [showNutritionProfileModal, setShowNutritionProfileModal] = useState(false);
  
  // 🏃 Modal de detalle cardio
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [cardioDetails, setCardioDetails] = useState({ cardioLog: [], tracked: [] });
  
  // Notas del alumno en sets
  const [studentNotes, setStudentNotes] = useState([]);
  const [loadingCardioDetails, setLoadingCardioDetails] = useState(false);
  
  // 📝 Modal de detalle de nota
  const [showNoteDetailModal, setShowNoteDetailModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteExerciseDetail, setNoteExerciseDetail] = useState(null);
  const [loadingNoteDetail, setLoadingNoteDetail] = useState(false);
  
  // Función para abrir el modal de detalle de nota
  const handleOpenNoteDetail = async (note) => {
    setSelectedNote(note);
    setShowNoteDetailModal(true);
    setLoadingNoteDetail(true);
    
    try {
      // Cargar detalle del ejercicio con todos sus sets
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/exercise/${note.exerciseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const exerciseData = await response.json();
        setNoteExerciseDetail(exerciseData);
      }
    } catch (err) {
      console.error('Error cargando detalle del ejercicio:', err);
    } finally {
      setLoadingNoteDetail(false);
    }
  };

  // Función para abrir el modal de cardio con detalles
  const handleOpenCardioModal = async () => {
    setShowCardioModal(true);
    setLoadingCardioDetails(true);
    try {
      const [cardioLog, tracked] = await Promise.all([
        getCardioSummary(id, 7).catch(() => ({ recentLogs: [] })),
        getTrackedSummary(id, 7).catch(() => ({ recentActivities: [] })),
      ]);
      setCardioDetails({
        cardioLog: cardioLog?.recentLogs || [],
        tracked: tracked?.recentActivities || [],
      });
    } catch (err) {
      console.error('Error cargando detalles de cardio:', err);
    } finally {
      setLoadingCardioDetails(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getStudentById(id)
      .then((data) => setStudent(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));

    setLoadingMacros(true);
    getAllMacroCycles()
      .then((allMacros) => setMacros(allMacros.filter(m => m.studentId == id)))
      .finally(() => setLoadingMacros(false));

    // Cargar historial de entrenamientos (sesiones)
    setLoadingHistory(true);
    getTrainingHistory(id, 30)
      .then((data) => setTrainingHistory(data))
      .catch((err) => console.error('Error cargando historial:', err))
      .finally(() => setLoadingHistory(false));

    // Cargar historial por ejercicio
    setLoadingExercises(true);
    getExerciseHistory(id, 15)
      .then((data) => setExerciseHistory(data))
      .catch((err) => console.error('Error cargando ejercicios:', err))
      .finally(() => setLoadingExercises(false));

    // Cargar datos de nutrición, peso y cardio
    setLoadingNutrition(true);
    Promise.all([
      getNutritionDashboard(id).catch(() => null),
      getWeeklySummary(id).catch(() => null),
      getNutritionProfile(id).catch(() => null),
      getWeightHistory(id, 15).catch(() => []),
      getCardioSummary(id, 7).catch(() => null),
      getTrackedSummary(id, 7).catch(() => null),
    ])
      .then(([today, week, profile, weight, cardioLog, trackedCardio]) => {
        setNutritionToday(today);
        setNutritionWeek(week);
        setNutritionProfile(profile);
        setWeightHistory(weight || []);
        
        // Combinar cardio-log y activity-tracker
        const combinedCardio = combineCardioSummaries(cardioLog, trackedCardio);
        setCardioSummary(combinedCardio);
      })
      .finally(() => setLoadingNutrition(false));

    // Cargar notas del alumno en sets
    getStudentSetNotes(id, 10)
      .then((notes) => setStudentNotes(notes || []))
      .catch((err) => console.error('Error cargando notas:', err));
  }, [id, getStudentById, getAllMacroCycles]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.bg, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box textAlign="center">
          <CircularProgress sx={{ color: COLORS.purple, mb: 2 }} size={48} />
          <Typography color={COLORS.textMuted}>Cargando datos del alumno...</Typography>
        </Box>
      </Box>
    );
  }

  if (error || !student) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.bg, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="error">Error al cargar datos del alumno</Typography>
      </Box>
    );
  }

  const studentName = student.user?.fullName || `${student.firstName} ${student.lastName}`;
  const studentInitial = studentName.charAt(0).toUpperCase();

  const reloadData = () => {
    setLoading(true);
    getStudentById(id)
      .then((data) => setStudent(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
    
    setLoadingMacros(true);
    getAllMacroCycles()
      .then((allMacros) => setMacros(allMacros.filter(m => m.studentId == id)))
      .finally(() => setLoadingMacros(false));
  };

  return (
    <Box sx={{ backgroundColor: COLORS.bg, pb: 4 }}>
      {/* Header Premium */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderBottom: `1px solid ${COLORS.border}`,
        px: { xs: 2, md: 4 },
        py: 3,
      }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: COLORS.textMuted } }}>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', color: COLORS.textMuted, cursor: 'pointer' }}
            onClick={() => navigate('/coach/dashboard')}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Dashboard
          </Link>
          <Typography sx={{ display: 'flex', alignItems: 'center', color: COLORS.purple }}>
            <PersonIcon sx={{ mr: 0.5, fontSize: 18 }} />
            {studentName}
          </Typography>
        </Breadcrumbs>

        {/* Main Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar 
            sx={{ 
              width: 72, 
              height: 72, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: 28,
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
            }}
          >
            {studentInitial}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color={COLORS.text}>
              {studentName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={student.isActive ? '✅ Activo' : '❌ Inactivo'} 
                size="small"
                sx={{ 
                  backgroundColor: student.isActive ? 'rgba(76,206,172,0.2)' : 'rgba(244,67,54,0.2)',
                  color: student.isActive ? COLORS.green : '#f44336',
                  fontWeight: 600,
                }}
              />
              {student.sport?.name && (
                <Chip 
                  icon={<FitnessCenterIcon sx={{ fontSize: 16 }} />}
                  label={student.sport.name} 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(168,85,247,0.2)',
                    color: COLORS.purple,
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: COLORS.purple },
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Tabs de navegación */}
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            mt: 3,
            '& .MuiTab-root': { 
              color: COLORS.textMuted, 
              fontWeight: 600, 
              textTransform: 'none', 
              fontSize: 15,
              minHeight: 48,
              '&:hover': {
                color: COLORS.text,
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            },
            '& .Mui-selected': { 
              color: '#fff !important',
            },
            '& .MuiTabs-indicator': { 
              backgroundColor: COLORS.orange,
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Información" />
          <Tab icon={<FitnessCenterIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Entrenamiento" />
          <Tab icon={<RestaurantIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Nutrición" />
          <Tab icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Config" />
        </Tabs>
      </Box>

      {/* Content según Tab activo */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        
        {/* ===================== TAB 0: INFORMACIÓN ===================== */}
        <Fade in={activeTab === 0} timeout={300} unmountOnExit>
          <Grid container spacing={3} sx={{ display: activeTab === 0 ? 'flex' : 'none' }}>
            
            {/* COLUMNA 1: Datos Personales + Plan Deportivo */}
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2.5, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(168,85,247,0.05) 100%)',
                border: '1px solid rgba(102,126,234,0.2)',
                height: '100%',
              }}>
                {/* Datos Personales */}
                <Typography variant="subtitle2" color={COLORS.textMuted} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 18 }} /> Datos Personales
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EmailIcon sx={{ color: COLORS.blue, fontSize: 18 }} />
                    <Typography fontSize={13} color={COLORS.text}>
                      {student.user?.email || student.email || '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PhoneIcon sx={{ color: COLORS.green, fontSize: 18 }} />
                    <Typography fontSize={13} color={COLORS.text}>
                      {student.user?.phone || student.phone || '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CakeIcon sx={{ color: COLORS.pink, fontSize: 18 }} />
                    <Typography fontSize={13} color={COLORS.text}>
                      {student.birthDate ? new Date(student.birthDate).toLocaleDateString() : '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarTodayIcon sx={{ color: COLORS.orange, fontSize: 18 }} />
                    <Typography fontSize={13} color={COLORS.text}>
                      Alta: {student.startDate ? new Date(student.startDate).toLocaleDateString() : '-'}
                    </Typography>
                  </Box>
                </Box>

                {/* Separador */}
                <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2.5, mt: 1 }}>
                  <Typography variant="subtitle2" color={COLORS.textMuted} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FitnessCenterIcon sx={{ fontSize: 18 }} /> Plan Deportivo
                  </Typography>
                  
                  {student.sport ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Chip
                        icon={<FitnessCenterIcon sx={{ fontSize: 16 }} />}
                        label={student.sport.name}
                        sx={{
                          backgroundColor: 'rgba(168,85,247,0.2)',
                          color: COLORS.purple,
                          border: '1px solid rgba(168,85,247,0.4)',
                          '& .MuiChip-icon': { color: COLORS.purple },
                          fontSize: 14,
                          fontWeight: 600,
                          height: 32,
                          width: 'fit-content',
                        }}
                      />
                      {student.sportPlan && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                          <Typography fontSize={12} color={COLORS.textMuted}>
                            📋 {student.sportPlan.name}
                          </Typography>
                          <Typography fontSize={13} fontWeight={600} color={COLORS.green}>
                            💰 ${student.sportPlan.monthlyFee}/mes
                          </Typography>
                          <Typography fontSize={12} color={COLORS.orange}>
                            🔄 {student.sportPlan.weeklyFrequency}x/semana
                          </Typography>
                          {student.sportPlan.description && (
                            <Typography fontSize={11} color={COLORS.textMuted} fontStyle="italic" mt={1}>
                              {student.sportPlan.description}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography fontSize={13} color={COLORS.textMuted}>
                      Sin disciplina asignada
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* COLUMNA 2: Estadísticas de Asistencia - DATOS REALES */}
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2.5, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(104,112,250,0.1) 0%, rgba(104,112,250,0.05) 100%)',
                border: '1px solid rgba(104,112,250,0.2)',
                height: '100%',
              }}>
                <Typography variant="subtitle2" color={COLORS.textMuted} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📅 Estadísticas de Asistencia
                </Typography>
                
                {loadingHistory ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={32} sx={{ color: COLORS.blue }} />
                  </Box>
                ) : trainingHistory?.stats ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                      <Typography variant="h2" fontWeight="bold" color={COLORS.blue}>
                        {trainingHistory.stats.sessionsThisMonth}
                      </Typography>
                      <Typography fontSize={12} color={COLORS.textMuted}>
                        Entrenamientos este mes
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1.5, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                          <Typography variant="h4" fontWeight="bold" color={COLORS.orange}>
                            {trainingHistory.stats.currentStreak}
                          </Typography>
                          <Typography fontSize={11} color={COLORS.textMuted}>
                            Racha actual 🔥
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1.5, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                          <Typography variant="h4" fontWeight="bold" color={COLORS.green}>
                            {trainingHistory.stats.daysSinceLastSession !== null 
                              ? `${trainingHistory.stats.daysSinceLastSession}d`
                              : '-'}
                          </Typography>
                          <Typography fontSize={11} color={COLORS.textMuted}>
                            Última visita
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ 
                      p: 1.5, 
                      background: trainingHistory.stats.sessionsThisMonth >= 8 
                        ? 'rgba(76,206,172,0.1)' 
                        : 'rgba(255,152,0,0.1)', 
                      borderRadius: 2,
                      border: trainingHistory.stats.sessionsThisMonth >= 8 
                        ? '1px solid rgba(76,206,172,0.2)'
                        : '1px solid rgba(255,152,0,0.2)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <Typography fontSize={12} color={COLORS.text}>
                        Total: {trainingHistory.stats.totalSessions} sesiones
                      </Typography>
                      <Chip 
                        label={trainingHistory.stats.sessionsThisMonth >= 12 
                          ? "🏆 Excelente" 
                          : trainingHistory.stats.sessionsThisMonth >= 8
                            ? "✅ Constante"
                            : trainingHistory.stats.sessionsThisMonth >= 4
                              ? "📈 Regular"
                              : "⚠️ Irregular"
                        }
                        size="small"
                        sx={{ 
                          backgroundColor: trainingHistory.stats.sessionsThisMonth >= 8 
                            ? 'rgba(76,206,172,0.3)'
                            : 'rgba(255,152,0,0.3)', 
                          color: trainingHistory.stats.sessionsThisMonth >= 8 
                            ? COLORS.green
                            : COLORS.orange,
                          fontSize: 11,
                          height: 24,
                          fontWeight: 600,
                        }} 
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, color: COLORS.textMuted }}>
                    <Typography fontSize={32} mb={1}>📊</Typography>
                    <Typography fontSize={13}>Sin datos de asistencia</Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* COLUMNA 3: Notas del Alumno */}
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 2.5, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,152,0,0.05) 100%)',
                border: '1px solid rgba(255,152,0,0.2)',
                height: '100%',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" color={COLORS.textMuted} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    💬 Notas del Alumno
                  </Typography>
                  <Chip 
                    label={`${studentNotes.length} notas`}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255,152,0,0.2)', 
                      color: COLORS.orange,
                      fontSize: 11,
                      height: 24,
                    }} 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 350, overflowY: 'auto' }}>
                  {studentNotes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography fontSize={32} mb={1}>📝</Typography>
                      <Typography fontSize={13} color={COLORS.textMuted}>
                        El alumno no ha dejado notas en sus entrenamientos
                      </Typography>
                    </Box>
                  ) : (
                    studentNotes.map((note, idx) => {
                      // Colores alternados para las notas
                      const colors = [COLORS.orange, COLORS.blue, COLORS.green, COLORS.purple, COLORS.red];
                      const borderColor = colors[idx % colors.length];
                      
                      // Calcular tiempo relativo
                      const noteDate = new Date(note.date);
                      const now = new Date();
                      const diffMs = now - noteDate;
                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      let timeAgo = '';
                      if (diffDays > 30) {
                        timeAgo = `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
                      } else if (diffDays > 0) {
                        timeAgo = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
                      } else if (diffHours > 0) {
                        timeAgo = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
                      } else {
                        timeAgo = 'Hace un momento';
                      }

                      return (
                        <Box 
                          key={note.id}
                          onClick={() => handleOpenNoteDetail(note)}
                          sx={{ 
                            p: 1.5, 
                            borderRadius: 2, 
                            background: 'rgba(0,0,0,0.2)',
                            borderLeft: `3px solid ${borderColor}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: 'rgba(0,0,0,0.3)',
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <Typography fontSize={13} color={COLORS.text} sx={{ mb: 0.5 }}>
                            "{note.note}"
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography fontSize={10} color={COLORS.textMuted}>
                              🏋️ {note.exerciseName} - Set {note.setNumber}
                              {note.load > 0 && ` • ${note.load}kg`}
                            </Typography>
                            <Typography fontSize={10} color={COLORS.textMuted}>
                              {timeAgo}
                            </Typography>
                          </Box>
                          <Typography fontSize={9} color={COLORS.orange} sx={{ mt: 0.5 }}>
                            Ver detalle →
                          </Typography>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            </Grid>

          </Grid>
        </Fade>

        {/* ===================== TAB 1: ENTRENAMIENTO ===================== */}
        <Fade in={activeTab === 1} timeout={300} unmountOnExit>
          <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
            {/* Macro-ciclo actual destacado - MEJORADO */}
            {macros.length > 0 && (() => {
              const macro = macros[0];
              const startDate = macro.startDate ? new Date(macro.startDate) : new Date();
              const endDate = macro.endDate ? new Date(macro.endDate) : new Date();
              const today = new Date();
              const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
              const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
              const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
              const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
              const currentWeek = Math.ceil(elapsedDays / 7);
              const totalWeeks = Math.ceil(totalDays / 7);
              
              return (
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,152,0,0.1) 100%)',
                  border: `2px solid ${COLORS.gold}`,
                  borderRadius: 3,
                  mb: 3,
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontSize={24}>🔥</Typography>
                        <Typography variant="h6" fontWeight="bold" color={COLORS.gold}>
                          Macro-ciclo Actual
                        </Typography>
                      </Box>
                      <Chip 
                        label={`Semana ${currentWeek} de ${totalWeeks}`}
                        sx={{ 
                          backgroundColor: 'rgba(255,215,0,0.2)', 
                          color: COLORS.gold,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      p: 2.5, 
                      background: 'rgba(0,0,0,0.3)', 
                      borderRadius: 2,
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color={COLORS.text}>
                            {macro.name}
                          </Typography>
                          <Typography fontSize={13} color={COLORS.textMuted} mt={0.5}>
                            📅 {startDate.toLocaleDateString()} → {endDate.toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Box
                            onClick={() => navigate(`/coach/macrocycle/${macro.id}`)}
                            sx={{
                              px: 2, py: 1,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': { transform: 'translateY(-2px)' },
                            }}
                          >
                            <Typography fontSize={13} fontWeight={600} color="#fff">
                              👁️ Ver Rutina
                            </Typography>
                          </Box>
                          <Box
                            onClick={() => navigate(`/coach/macrocycle/${macro.id}`)}
                            sx={{
                              px: 2, py: 1,
                              borderRadius: 2,
                              background: 'rgba(255,255,255,0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': { background: 'rgba(255,255,255,0.2)' },
                            }}
                          >
                            <Typography fontSize={13} fontWeight={600} color={COLORS.text}>
                              ✏️ Editar
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Barra de progreso */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography fontSize={12} color={COLORS.textMuted}>Progreso</Typography>
                          <Typography fontSize={12} fontWeight={600} color={COLORS.gold}>{Math.round(progress)}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: COLORS.gold,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>

                      {/* Stats rápidos */}
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                            <Typography variant="h5" fontWeight="bold" color={COLORS.blue}>{elapsedDays}</Typography>
                            <Typography fontSize={10} color={COLORS.textMuted}>Días transcurridos</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                            <Typography variant="h5" fontWeight="bold" color={COLORS.orange}>{remainingDays}</Typography>
                            <Typography fontSize={10} color={COLORS.textMuted}>Días restantes</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center', p: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                            <Typography variant="h5" fontWeight="bold" color={COLORS.green}>{totalWeeks}</Typography>
                            <Typography fontSize={10} color={COLORS.textMuted}>Semanas totales</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Cards de acceso rápido - MEJORADAS */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Card Progreso */}
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(104,112,250,0.15) 0%, rgba(104,112,250,0.05) 100%)',
                  border: `1px solid rgba(104,112,250,0.3)`,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  height: '100%',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: COLORS.blue },
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography fontSize={24}>📈</Typography>
                      <Typography fontWeight={600} color={COLORS.text}>Progreso</Typography>
                    </Box>
                    
                    <Box sx={{ background: 'rgba(0,0,0,0.2)', borderRadius: 2, p: 1.5, mb: 1.5 }}>
                      <Typography fontSize={11} color={COLORS.textMuted}>Último PR registrado</Typography>
                      <Typography fontSize={14} fontWeight={600} color={COLORS.blue}>
                        Press Banca: 80kg
                      </Typography>
                      <Typography fontSize={11} color={COLORS.green}>+5kg vs mes anterior</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography fontSize={11} color={COLORS.textMuted}>3 PRs este mes</Typography>
                      <Typography fontSize={12} color={COLORS.blue} fontWeight={600}>Ver más →</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card Historial - DATOS REALES */}
              <Grid item xs={12} sm={4}>
                <Card 
                  onClick={() => setShowHistoryModal(true)}
                  sx={{ 
                    background: 'linear-gradient(135deg, rgba(76,206,172,0.15) 0%, rgba(76,206,172,0.05) 100%)',
                    border: `1px solid rgba(76,206,172,0.3)`,
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '100%',
                    '&:hover': { transform: 'translateY(-2px)', borderColor: COLORS.green },
                  }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography fontSize={24}>📋</Typography>
                      <Typography fontWeight={600} color={COLORS.text}>Historial</Typography>
                    </Box>
                    
                    {loadingHistory ? (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress size={20} sx={{ color: COLORS.green }} />
                      </Box>
                    ) : trainingHistory?.stats ? (
                      <>
                        <Box sx={{ background: 'rgba(0,0,0,0.2)', borderRadius: 2, p: 1.5, mb: 1.5 }}>
                          <Typography fontSize={11} color={COLORS.textMuted}>Última sesión</Typography>
                          <Typography fontSize={14} fontWeight={600} color={COLORS.green}>
                            {trainingHistory.stats.lastSessionMuscleGroups?.join(' + ') || trainingHistory.stats.lastSessionName || 'Sin sesiones'}
                          </Typography>
                          <Typography fontSize={11} color={COLORS.textMuted}>
                            {trainingHistory.stats.daysSinceLastSession !== null 
                              ? trainingHistory.stats.daysSinceLastSession === 0 
                                ? 'Hoy' 
                                : trainingHistory.stats.daysSinceLastSession === 1
                                  ? 'Ayer'
                                  : `Hace ${trainingHistory.stats.daysSinceLastSession} días`
                              : '-'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography fontSize={11} color={COLORS.textMuted}>
                            {trainingHistory.stats.sessionsThisMonth} sesiones este mes
                          </Typography>
                          <Typography fontSize={12} color={COLORS.green} fontWeight={600}>Ver más →</Typography>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ background: 'rgba(0,0,0,0.2)', borderRadius: 2, p: 1.5 }}>
                        <Typography fontSize={13} color={COLORS.textMuted} textAlign="center">
                          Sin entrenamientos registrados
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Card Configuración */}
              <Grid item xs={12} sm={4}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(255,152,0,0.15) 0%, rgba(255,152,0,0.05) 100%)',
                  border: `1px solid rgba(255,152,0,0.3)`,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  height: '100%',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: COLORS.orange },
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography fontSize={24}>⚙️</Typography>
                      <Typography fontWeight={600} color={COLORS.text}>Preferencias</Typography>
                    </Box>
                    
                    <Box sx={{ background: 'rgba(0,0,0,0.2)', borderRadius: 2, p: 1.5, mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography fontSize={11} color={COLORS.textMuted}>Días</Typography>
                        <Typography fontSize={12} color={COLORS.text}>Lun, Mié, Vie</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography fontSize={11} color={COLORS.textMuted}>Horario</Typography>
                        <Typography fontSize={12} color={COLORS.text}>Mañana 🌅</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontSize={11} color={COLORS.textMuted}>Duración</Typography>
                        <Typography fontSize={12} color={COLORS.text}>60-90 min</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Typography fontSize={12} color={COLORS.orange} fontWeight={600}>Editar →</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Card de Cardio */}
            <Card 
              onClick={cardioSummary?.totalSessions > 0 ? handleOpenCardioModal : undefined}
              sx={{ 
                background: 'linear-gradient(135deg, rgba(76,206,172,0.15) 0%, rgba(76,206,172,0.05) 100%)',
                border: `1px solid rgba(76,206,172,0.3)`,
                borderRadius: 3,
                mb: 3,
                cursor: cardioSummary?.totalSessions > 0 ? 'pointer' : 'default',
                transition: 'all 0.2s',
                '&:hover': cardioSummary?.totalSessions > 0 ? {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(76,206,172,0.2)',
                } : {},
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontSize={24}>🏃</Typography>
                    <Typography fontWeight={600} color={COLORS.text}>Cardio esta semana</Typography>
                    {cardioSummary?.totalSessions > 0 && (
                      <Typography fontSize={12} color={COLORS.textMuted}>
                        (click para ver detalle)
                      </Typography>
                    )}
                  </Box>
                  {cardioSummary?.totalSessions > 0 && (
                    <Chip 
                      label={`${cardioSummary.totalSessions} sesión${cardioSummary.totalSessions > 1 ? 'es' : ''}`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(76,206,172,0.2)',
                        color: COLORS.green,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                
                {cardioSummary?.totalSessions > 0 ? (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box sx={{ flex: 1, p: 1.5, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={700} color={COLORS.green}>
                          {formatDuration(cardioSummary.totalMinutes)}
                        </Typography>
                        <Typography fontSize={10} color={COLORS.textMuted}>Tiempo total</Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 1.5, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={700} color={COLORS.blue}>
                          {cardioSummary.averagePerDay} min
                        </Typography>
                        <Typography fontSize={10} color={COLORS.textMuted}>Promedio/día</Typography>
                      </Box>
                      {cardioSummary.totalCalories > 0 && (
                        <Box sx={{ flex: 1, p: 1.5, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h5" fontWeight={700} color={COLORS.orange}>
                            {cardioSummary.totalCalories}
                          </Typography>
                          <Typography fontSize={10} color={COLORS.textMuted}>kcal quemadas</Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {/* Por tipo de actividad */}
                    {cardioSummary.byActivity?.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {cardioSummary.byActivity.map((activity) => {
                          const info = getActivityInfo(activity.type);
                          return (
                            <Chip
                              key={activity.type}
                              label={`${info.emoji} ${info.label}: ${formatDuration(activity.minutes)} (${activity.percent}%)`}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: COLORS.text,
                                fontSize: 11,
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                    <Typography fontSize={32} mb={1}>🚶</Typography>
                    <Typography fontSize={13} color={COLORS.textMuted}>
                      Sin actividad aeróbica esta semana
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Lista de Macro-ciclos */}
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(30,30,47,0.9) 0%, rgba(21,21,33,0.9) 100%)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontSize={24}>🏋️</Typography>
                    <Typography variant="h6" fontWeight="bold" color={COLORS.text}>
                      Todos los Macro-ciclos
                    </Typography>
                  </Box>
                  {macros.length > 0 && (
                    <Chip 
                      label={`${macros.length} rutina${macros.length > 1 ? 's' : ''}`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255,215,0,0.2)',
                        color: COLORS.gold,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                {loadingMacros ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: COLORS.gold }} size={32} />
                  </Box>
                ) : macros.length === 0 && !showRoutineWizard ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6, 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: 3,
                  }}>
                    <Box sx={{ fontSize: 48, mb: 2 }}>🏃‍♂️</Box>
                    <Typography color={COLORS.textMuted} mb={2}>
                      No hay rutinas para este alumno
                    </Typography>
                    <Box
                      onClick={() => setShowRoutineWizard(true)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
                        },
                      }}
                    >
                      <Typography fontWeight={600} color="#fff">
                        🚀 Crear Primera Rutina
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {macros.map((macro, index) => {
                      const startDate = macro.startDate ? new Date(macro.startDate) : new Date();
                      const endDate = macro.endDate ? new Date(macro.endDate) : new Date();
                      const today = new Date();
                      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                      const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
                      const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
                      
                      // Determinar estado
                      let status = 'active';
                      let statusLabel = '🔥 Activo';
                      let statusColor = COLORS.green;
                      let borderColor = COLORS.gold;
                      
                      if (today < startDate) {
                        status = 'upcoming';
                        statusLabel = '📅 Próximo';
                        statusColor = COLORS.blue;
                        borderColor = COLORS.blue;
                      } else if (today > endDate) {
                        status = 'finished';
                        statusLabel = '✅ Finalizado';
                        statusColor = COLORS.textMuted;
                        borderColor = 'rgba(255,255,255,0.2)';
                      }
                      
                      const isFirst = index === 0;
                      
                      return (
                        <Box
                          key={macro.id}
                          onClick={() => navigate(`/coach/macrocycle/${macro.id}`)}
                          sx={{
                            minWidth: 240,
                            maxWidth: 300,
                            flex: '1 1 240px',
                            p: 2,
                            borderRadius: 3,
                            background: isFirst 
                              ? 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,152,0,0.05) 100%)'
                              : 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
                            border: `2px solid ${borderColor}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: isFirst 
                                ? `0 8px 24px rgba(255,215,0,0.2)` 
                                : `0 8px 24px rgba(0,0,0,0.3)`,
                            },
                          }}
                        >
                          {/* Badge de estado */}
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                          }}>
                            <Chip 
                              label={statusLabel}
                              size="small"
                              sx={{ 
                                backgroundColor: `${statusColor}22`,
                                color: statusColor,
                                fontSize: 10,
                                height: 22,
                                fontWeight: 600,
                              }}
                            />
                          </Box>

                          <Typography variant="h6" fontWeight="bold" color={isFirst ? COLORS.gold : COLORS.text} mb={1} pr={8}>
                            {macro.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                            <Typography fontSize={12} color={COLORS.textMuted}>
                              📅 {startDate.toLocaleDateString()} → {endDate.toLocaleDateString()}
                            </Typography>
                          </Box>

                          {/* Mini barra de progreso */}
                          {status === 'active' && (
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography fontSize={10} color={COLORS.textMuted}>Progreso</Typography>
                                <Typography fontSize={10} fontWeight={600} color={COLORS.gold}>{Math.round(progress)}%</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: COLORS.gold,
                                    borderRadius: 2,
                                  },
                                }}
                              />
                            </Box>
                          )}
                          
                          {status === 'finished' && (
                            <Typography fontSize={11} color={COLORS.green} fontWeight={600}>
                              ✓ Completado al 100%
                            </Typography>
                          )}
                          
                          {status === 'upcoming' && (
                            <Typography fontSize={11} color={COLORS.blue}>
                              Comienza en {Math.ceil((startDate - today) / (1000 * 60 * 60 * 24))} días
                            </Typography>
                          )}
                        </Box>
                      );
                    })}

                    {/* Card Nueva Rutina */}
              {!showRoutineWizard && (
                      <Box
                        onClick={() => setShowRoutineWizard(true)}
                        sx={{
                          minWidth: 220,
                          maxWidth: 280,
                          minHeight: 120,
                          p: 2,
                          borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: '2px dashed rgba(255,255,255,0.3)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
                          },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 36, color: '#fff', mb: 1 }} />
                        <Typography fontWeight={600} color="#fff">Nueva Rutina</Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Fade>

        {/* ===================== TAB 2: NUTRICIÓN ===================== */}
        <Fade in={activeTab === 2} timeout={300} unmountOnExit>
          <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
            {/* Botones de acción */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
              <Chip
                label="✏️ Editar Macros"
                onClick={() => setShowNutritionProfileModal(true)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: 'rgba(104,112,250,0.15)',
                  color: COLORS.blue,
                  border: '1px solid rgba(104,112,250,0.3)',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: 'rgba(104,112,250,0.25)' },
                }}
              />
              <Chip
                label={loadingNutrition ? "⏳ Cargando..." : "🔄 Actualizar"}
                onClick={() => !loadingNutrition && reloadNutritionData()}
                sx={{
                  cursor: loadingNutrition ? 'wait' : 'pointer',
                  backgroundColor: 'rgba(76,206,172,0.15)',
                  color: COLORS.green,
                  border: '1px solid rgba(76,206,172,0.3)',
                  '&:hover': { backgroundColor: 'rgba(76,206,172,0.25)' },
                }}
              />
            </Box>
            
            {loadingNutrition ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress sx={{ color: COLORS.green }} />
              </Box>
            ) : (
              <>
                {/* Fila superior: 3 cards */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  
                  {/* Card 1: Evolución de Peso */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(76,206,172,0.15) 0%, rgba(76,206,172,0.05) 100%)',
                      border: '1px solid rgba(76,206,172,0.3)',
                      height: '100%',
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" color={COLORS.textMuted} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          ⚖️ Evolución de Peso
                        </Typography>
                        {weightHistory.length >= 2 && (() => {
                          const diff = weightHistory[0].weight - weightHistory[weightHistory.length - 1].weight;
                          return (
                            <Chip
                              label={`${diff > 0 ? '+' : ''}${diff.toFixed(1)}kg`}
                              size="small"
                              sx={{
                                backgroundColor: diff < 0 ? 'rgba(76,206,172,0.2)' : diff > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                                color: diff < 0 ? COLORS.green : diff > 0 ? '#ef4444' : COLORS.text,
                                fontSize: 11,
                                height: 22,
                                fontWeight: 600,
                              }}
                            />
                          );
                        })()}
                      </Box>
                      
                      {/* Gráfico de peso */}
                      {weightHistory.length > 0 ? (
                        <Box>
                          {/* Peso actual destacado */}
                          <Box sx={{ textAlign: 'center', mb: 2, p: 1.5, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                            <Typography variant="h3" fontWeight="bold" color={COLORS.green}>
                              {weightHistory[0]?.weight}
                            </Typography>
                            <Typography fontSize={12} color={COLORS.textMuted}>kg actuales</Typography>
                          </Box>
                          
                          <ResponsiveContainer width="100%" height={120}>
                            <LineChart
                              data={[...weightHistory].reverse().map(w => ({
                                fecha: new Date(w.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
                                peso: Number(w.weight),
                              }))}
                              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis 
                                dataKey="fecha" 
                                stroke={COLORS.textMuted} 
                                fontSize={9}
                                tickLine={false}
                              />
                              <YAxis 
                                stroke={COLORS.textMuted} 
                                fontSize={9}
                                tickLine={false}
                                axisLine={false}
                                domain={['dataMin - 1', 'dataMax + 1']}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#1a1a2e',
                                  border: `1px solid ${COLORS.border}`,
                                  borderRadius: 8,
                                  color: COLORS.text,
                                  fontSize: 12,
                                }}
                                formatter={(value) => [`${value}kg`, 'Peso']}
                              />
                              <Line
                                type="monotone"
                                dataKey="peso"
                                stroke={COLORS.green}
                                strokeWidth={2}
                                dot={{ fill: COLORS.green, strokeWidth: 1, r: 3 }}
                                activeDot={{ r: 5, fill: COLORS.green }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4, color: COLORS.textMuted }}>
                          <Typography fontSize={40} mb={1}>⚖️</Typography>
                          <Typography fontSize={13}>Sin registros de peso</Typography>
                          <Typography fontSize={11} mt={1}>El alumno puede registrar su peso desde "Mi Progreso"</Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Card 2: Hoy */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(104,112,250,0.15) 0%, rgba(104,112,250,0.05) 100%)',
                      border: '1px solid rgba(104,112,250,0.3)',
                      height: '100%',
                    }}>
                      <Typography variant="subtitle2" color={COLORS.textMuted} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        📊 Hoy
                      </Typography>
                      
                      {nutritionToday?.consumed ? (() => {
                        const consumedCal = nutritionToday.consumed.calories || 0;
                        const targetCal = nutritionToday.targets?.calories || nutritionProfile?.targetDailyCalories || 2000;
                        const percentCal = nutritionToday.progress?.calories || Math.round((consumedCal / targetCal) * 100);
                        
                        const protein = nutritionToday.consumed.protein || 0;
                        const carbs = nutritionToday.consumed.carbs || 0;
                        const fat = nutritionToday.consumed.fat || 0;
                        
                        const targetProtein = nutritionToday.targets?.protein || nutritionProfile?.targetProteinGrams || 150;
                        const targetCarbs = nutritionToday.targets?.carbs || nutritionProfile?.targetCarbsGrams || 200;
                        const targetFat = nutritionToday.targets?.fat || nutritionProfile?.targetFatGrams || 70;
                        
                        const percentProtein = Math.round((protein / targetProtein) * 100);
                        const percentCarbs = Math.round((carbs / targetCarbs) * 100);
                        const percentFat = Math.round((fat / targetFat) * 100);
                        
                        const entriesCount = Object.values(nutritionToday.entriesByMeal || {}).flat().length;
                        
                        return (
                          <Box>
                            {/* Calorías totales */}
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                              <Typography variant="h3" fontWeight="bold" color={percentCal >= 90 ? COLORS.green : percentCal >= 70 ? COLORS.orange : '#ef4444'}>
                                {consumedCal}
                              </Typography>
                              <Typography fontSize={12} color={COLORS.textMuted}>
                                de {targetCal} kcal ({percentCal}%)
                              </Typography>
                            </Box>
                            
                            {/* Barras de macros con colores */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              {/* Proteína */}
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography fontSize={11} color="#ef4444" fontWeight={600}>Proteína</Typography>
                                  <Typography fontSize={11} color={COLORS.text}>{protein}g / {targetProtein}g</Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, percentProtein)}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(239,68,68,0.2)',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: '#ef4444',
                                      borderRadius: 3,
                                    },
                                  }}
                                />
                              </Box>
                              
                              {/* Carbohidratos */}
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography fontSize={11} color={COLORS.blue} fontWeight={600}>Carbohidratos</Typography>
                                  <Typography fontSize={11} color={COLORS.text}>{carbs}g / {targetCarbs}g</Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, percentCarbs)}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(104,112,250,0.2)',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: COLORS.blue,
                                      borderRadius: 3,
                                    },
                                  }}
                                />
                              </Box>
                              
                              {/* Grasas */}
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography fontSize={11} color={COLORS.orange} fontWeight={600}>Grasas</Typography>
                                  <Typography fontSize={11} color={COLORS.text}>{fat}g / {targetFat}g</Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, percentFat)}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(255,152,0,0.2)',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: COLORS.orange,
                                      borderRadius: 3,
                                    },
                                  }}
                                />
                              </Box>
                            </Box>
                            
                            <Typography fontSize={11} color={COLORS.textMuted} mt={2} textAlign="center">
                              {entriesCount} comidas registradas
                            </Typography>
                          </Box>
                        );
                      })() : (
                        <Box sx={{ textAlign: 'center', py: 3, color: COLORS.textMuted }}>
                          <Typography fontSize={32} mb={1}>🍽️</Typography>
                          <Typography fontSize={13}>Sin registros hoy</Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Card 3: Esta Semana */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255,152,0,0.15) 0%, rgba(255,152,0,0.05) 100%)',
                      border: '1px solid rgba(255,152,0,0.3)',
                      height: '100%',
                    }}>
                      <Typography variant="subtitle2" color={COLORS.textMuted} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        📈 Esta Semana
                      </Typography>
                      
                      {nutritionWeek?.days?.length > 0 ? (() => {
                        const daysWithData = nutritionWeek.days.filter(d => d.consumed?.calories > 0);
                        const adherence = Math.round((daysWithData.length / 7) * 100);
                        const avgCalories = nutritionWeek.weeklyAverages?.calories || 0;
                        const avgProtein = nutritionWeek.weeklyAverages?.protein || 0;
                        
                        return (
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="h4" fontWeight="bold" color={adherence >= 70 ? COLORS.green : COLORS.orange}>
                                  {adherence}%
                                </Typography>
                                <Typography fontSize={10} color={COLORS.textMuted}>Adherencia</Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center', flex: 1, borderLeft: `1px solid ${COLORS.border}` }}>
                                <Typography variant="h4" fontWeight="bold" color={COLORS.text}>
                                  {daysWithData.length}
                                </Typography>
                                <Typography fontSize={10} color={COLORS.textMuted}>Días c/registro</Typography>
                              </Box>
                            </Box>
                            
                            <Box sx={{ background: 'rgba(0,0,0,0.2)', borderRadius: 2, p: 1.5, mb: 2 }}>
                              <Typography fontSize={11} color={COLORS.textMuted} mb={0.5}>Promedio diario</Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography fontSize={13} color={COLORS.text}>{avgCalories} kcal</Typography>
                                <Typography fontSize={13} color="#ef4444">{avgProtein}g prot</Typography>
                              </Box>
                            </Box>
                            
                            {/* Mini barras por día */}
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              {nutritionWeek.days.map((day, idx) => {
                                const target = nutritionProfile?.targetDailyCalories || 2000;
                                const dayCalories = day.consumed?.calories || 0;
                                const percent = Math.min(100, Math.round((dayCalories / target) * 100));
                                return (
                                  <Box key={idx} sx={{ flex: 1, maxWidth: 30 }}>
                                    <Box sx={{ 
                                      height: 40, 
                                      background: 'rgba(255,255,255,0.1)', 
                                      borderRadius: 1,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'flex-end',
                                      overflow: 'hidden',
                                    }}>
                                      <Box sx={{ 
                                        height: `${percent}%`, 
                                        background: percent >= 80 ? COLORS.green : percent >= 50 ? COLORS.orange : percent > 0 ? '#ef4444' : 'transparent',
                                        borderRadius: 1,
                                        transition: 'height 0.3s',
                                      }} />
                                    </Box>
                                    <Typography fontSize={9} color={COLORS.textMuted} textAlign="center" mt={0.5}>
                                      {['L', 'M', 'X', 'J', 'V', 'S', 'D'][idx]}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        );
                      })() : (
                        <Box sx={{ textAlign: 'center', py: 3, color: COLORS.textMuted }}>
                          <Typography fontSize={32} mb={1}>📅</Typography>
                          <Typography fontSize={13}>Sin datos esta semana</Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Fila de alertas y acciones */}
                <Grid container spacing={2}>
                  {/* Alertas */}
                  <Grid item xs={12} md={8}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 3,
                      background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${COLORS.border}`,
                    }}>
                      <Typography variant="subtitle2" color={COLORS.textMuted} mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        ⚠️ Alertas y Observaciones
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* Generar alertas basadas en datos */}
                        {(() => {
                          const alerts = [];
                          
                          if (!nutritionProfile) {
                            alerts.push({ type: 'warning', text: 'Sin objetivos nutricionales configurados', icon: '⚙️' });
                          }
                          
                          if (nutritionToday?.consumed && nutritionToday.consumed.calories > 0) {
                            const proteinTarget = nutritionProfile?.targetProteinGrams || 150;
                            const proteinConsumed = nutritionToday.consumed.protein || 0;
                            if (proteinConsumed < proteinTarget * 0.7) {
                              alerts.push({ type: 'danger', text: `Proteína baja hoy (${Math.round((proteinConsumed/proteinTarget)*100)}% del objetivo)`, icon: '🥩' });
                            }
                            
                            const caloriesTarget = nutritionToday.targets?.calories || nutritionProfile?.targetDailyCalories || 2000;
                            const caloriesConsumed = nutritionToday.consumed.calories || 0;
                            if (caloriesConsumed > caloriesTarget * 1.2) {
                              alerts.push({ type: 'warning', text: `Exceso calórico hoy (+${Math.round(caloriesConsumed - caloriesTarget)} kcal)`, icon: '📈' });
                            }
                          } else {
                            alerts.push({ type: 'info', text: 'No hay comidas registradas hoy', icon: '🍽️' });
                          }
                          
                          if (nutritionWeek?.days) {
                            const daysWithData = nutritionWeek.days.filter(d => d.consumed?.calories > 0);
                            if (daysWithData.length < 4) {
                              alerts.push({ type: 'warning', text: `Bajo registro semanal (${daysWithData.length}/7 días)`, icon: '📅' });
                            }
                          }
                          
                          if (alerts.length === 0) {
                            alerts.push({ type: 'success', text: '¡Todo en orden! El alumno está siguiendo su plan.', icon: '✅' });
                          }
                          
                          return alerts.map((alert, idx) => (
                            <Box 
                              key={idx}
                              sx={{ 
                                p: 1.5, 
                                borderRadius: 2, 
                                background: alert.type === 'danger' ? 'rgba(239,68,68,0.1)' 
                                  : alert.type === 'warning' ? 'rgba(255,152,0,0.1)'
                                  : alert.type === 'success' ? 'rgba(76,206,172,0.1)'
                                  : 'rgba(104,112,250,0.1)',
                                borderLeft: `3px solid ${
                                  alert.type === 'danger' ? '#ef4444' 
                                  : alert.type === 'warning' ? COLORS.orange
                                  : alert.type === 'success' ? COLORS.green
                                  : COLORS.blue
                                }`,
                              }}
                            >
                              <Typography fontSize={13} color={COLORS.text}>
                                {alert.icon} {alert.text}
                              </Typography>
                            </Box>
                          ));
                        })()}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Acceso rápido */}
                  <Grid item xs={12} md={4}>
                    <Box
                      onClick={() => navigate(`/coach/alumno/${student.id}/nutricion`)}
                      sx={{ 
                        p: 2.5, 
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0.05) 100%)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': { 
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(168,85,247,0.3)',
                        },
                      }}
                    >
                      <Typography fontSize={40} mb={1}>📊</Typography>
                      <Typography fontWeight={600} color={COLORS.text} mb={0.5}>
                        Ver Historial Completo
                      </Typography>
                      <Typography fontSize={12} color={COLORS.textMuted}>
                        Día, semana, comidas detalladas
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </Fade>

        {/* ===================== TAB 3: CONFIGURACIÓN ===================== */}
        <Fade in={activeTab === 3} timeout={300} unmountOnExit>
          <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d15 100%)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
            }}>
              <CardContent>
                <StudentPermissions 
                  studentId={student?.id} 
                  onUpdate={() => {
                    // Opcionalmente recargar datos si es necesario
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        </Fade>

      </Box>

      {/* Routine Wizard */}
      {showRoutineWizard && (
        <RoutineWizard
          studentId={student.id}
          studentName={studentName}
          onCancel={() => setShowRoutineWizard(false)}
          onComplete={() => {
            setShowRoutineWizard(false);
            reloadData();
          }}
        />
      )}

      {/* Modal Historial de Entrenamientos */}
      {showHistoryModal && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Overlay */}
          <Box
            onClick={() => setShowHistoryModal(false)}
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(4px)',
            }}
          />
          
          {/* Modal Content */}
          <Box
            sx={{
              position: 'relative',
              width: '90%',
              maxWidth: 800,
              maxHeight: '85vh',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d15 100%)',
              borderRadius: 3,
              border: `1px solid ${COLORS.border}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header con Tabs */}
            <Box sx={{ 
              borderBottom: `1px solid ${COLORS.border}`,
              background: 'linear-gradient(135deg, rgba(76,206,172,0.15) 0%, rgba(76,206,172,0.05) 100%)',
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography fontSize={28}>📋</Typography>
                  <Typography variant="h6" fontWeight="bold" color={COLORS.text}>
                    Historial de Entrenamientos
                  </Typography>
                </Box>
                <IconButton onClick={() => setShowHistoryModal(false)} sx={{ color: COLORS.textMuted }}>
                  ✕
                </IconButton>
              </Box>
              
              {/* Tabs */}
              <Tabs
                value={historyTab}
                onChange={(e, v) => setHistoryTab(v)}
                sx={{
                  px: 2,
                  '& .MuiTabs-indicator': { backgroundColor: COLORS.green },
                  '& .MuiTab-root': { color: COLORS.textMuted, textTransform: 'none', fontWeight: 500 },
                  '& .Mui-selected': { color: '#fff' },
                }}
              >
                <Tab label="📅 Sesiones" />
                <Tab label="🏋️ Ejercicios" />
                <Tab label="📈 Gráficos" />
              </Tabs>
            </Box>

            {/* Contenido */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              
              {/* TAB 0: Por Sesión */}
              {historyTab === 0 && (
                <>
                  {loadingHistory ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={32} sx={{ color: COLORS.green }} />
                    </Box>
                  ) : !trainingHistory?.sessions?.length ? (
                    <Box sx={{ textAlign: 'center', py: 6, color: COLORS.textMuted }}>
                      <Typography fontSize={48} mb={2}>🏃‍♂️</Typography>
                      <Typography>No hay entrenamientos registrados</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {trainingHistory.sessions.map((session, index) => (
                        <Box
                          key={session.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: index === 0 
                              ? 'linear-gradient(135deg, rgba(76,206,172,0.15) 0%, rgba(76,206,172,0.05) 100%)'
                              : 'rgba(0,0,0,0.3)',
                            border: index === 0 
                              ? `1px solid rgba(76,206,172,0.3)`
                              : `1px solid ${COLORS.border}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box>
                              <Typography fontWeight={600} color={COLORS.text}>{session.nombre}</Typography>
                              <Typography fontSize={12} color={COLORS.textMuted}>{session.macrocycleName}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography fontSize={13} fontWeight={600} color={index === 0 ? COLORS.green : COLORS.text}>
                                {new Date(session.fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </Typography>
                              {index === 0 && <Chip label="Última" size="small" sx={{ backgroundColor: 'rgba(76,206,172,0.2)', color: COLORS.green, fontSize: 10, height: 18 }} />}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                            {session.muscleGroups?.map((mg, i) => (
                              <Chip key={i} label={mg} size="small" sx={{ backgroundColor: 'rgba(104,112,250,0.15)', color: COLORS.blue, fontSize: 11, height: 22 }} />
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, fontSize: 11, color: COLORS.textMuted }}>
                            <span>🏋️ {session.totalExercises} ejercicios</span>
                            <span>✅ {session.completedSets}/{session.totalSets} sets</span>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              )}

              {/* TAB 1: Por Ejercicio */}
              {historyTab === 1 && (
                <>
                  {loadingExercises ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={32} sx={{ color: COLORS.green }} />
                    </Box>
                  ) : !exerciseHistory?.exercises?.length ? (
                    <Box sx={{ textAlign: 'center', py: 6, color: COLORS.textMuted }}>
                      <Typography fontSize={48} mb={2}>🏋️</Typography>
                      <Typography>No hay ejercicios registrados</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {exerciseHistory.exercises.map((exercise) => (
                        <Box
                          key={exercise.catalogId}
                          sx={{
                            borderRadius: 2,
                            background: 'rgba(0,0,0,0.3)',
                            border: `1px solid ${COLORS.border}`,
                            overflow: 'hidden',
                          }}
                        >
                          {/* Header del ejercicio */}
                          <Box
                            onClick={() => setExpandedExercise(expandedExercise === exercise.catalogId ? null : exercise.catalogId)}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.2s',
                              '&:hover': { background: 'rgba(255,255,255,0.03)' },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box>
                                <Typography fontWeight={600} color={COLORS.text}>{exercise.name}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  <Chip label={exercise.muscleGroup} size="small" sx={{ backgroundColor: 'rgba(104,112,250,0.15)', color: COLORS.blue, fontSize: 10, height: 20 }} />
                                  <Typography fontSize={11} color={COLORS.textMuted}>{exercise.totalSessions} sesiones</Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {exercise.bestLoad > 0 && (
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography fontSize={11} color={COLORS.textMuted}>Mejor carga</Typography>
                                  <Typography fontWeight={700} color={COLORS.gold}>{exercise.bestLoad}kg</Typography>
                                </Box>
                              )}
                              {exercise.progression !== 0 && (
                                <Chip
                                  label={`${exercise.progression > 0 ? '+' : ''}${exercise.progression}kg`}
                                  size="small"
                                  sx={{
                                    backgroundColor: exercise.progression > 0 ? 'rgba(76,206,172,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: exercise.progression > 0 ? COLORS.green : '#ef4444',
                                    fontWeight: 600,
                                    fontSize: 11,
                                  }}
                                />
                              )}
                              <Typography color={COLORS.textMuted}>{expandedExercise === exercise.catalogId ? '▲' : '▼'}</Typography>
                            </Box>
                          </Box>

                          {/* Detalle expandido */}
                          {expandedExercise === exercise.catalogId && (
                            <Box sx={{ px: 2, pb: 2, borderTop: `1px solid ${COLORS.border}` }}>
                              {exercise.sessions.map((session, idx) => (
                                <Box key={idx} sx={{ py: 1.5, borderBottom: idx < exercise.sessions.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography fontSize={12} color={COLORS.textMuted}>
                                      {new Date(session.fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </Typography>
                                    <Typography fontSize={11} color={COLORS.textMuted}>{session.dayName}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {session.sets.map((set, setIdx) => (
                                      <Chip
                                        key={setIdx}
                                        label={`${set.reps}×${set.load}kg`}
                                        size="small"
                                        sx={{
                                          backgroundColor: set.status === 'completed' ? 'rgba(76,206,172,0.15)' : 'rgba(255,255,255,0.05)',
                                          color: set.status === 'completed' ? COLORS.green : COLORS.textMuted,
                                          fontSize: 11,
                                          height: 24,
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              )}

              {/* TAB 2: Gráficos */}
              {historyTab === 2 && (
                <>
                  {loadingExercises ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={32} sx={{ color: COLORS.green }} />
                    </Box>
                  ) : !exerciseHistory?.exercises?.length ? (
                    <Box sx={{ textAlign: 'center', py: 6, color: COLORS.textMuted }}>
                      <Typography fontSize={48} mb={2}>📈</Typography>
                      <Typography>No hay datos para graficar</Typography>
                    </Box>
                  ) : (
                    <Box>
                      {/* Selector de ejercicio */}
                      <Box sx={{ mb: 3 }}>
                        <Typography fontSize={12} color={COLORS.textMuted} mb={1}>
                          Selecciona un ejercicio para ver su evolución:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {exerciseHistory.exercises
                            .filter(ex => ex.sessions.length >= 2)
                            .map((exercise) => (
                              <Chip
                                key={exercise.catalogId}
                                label={exercise.name}
                                onClick={() => setSelectedChartExercise(exercise)}
                                sx={{
                                  backgroundColor: selectedChartExercise?.catalogId === exercise.catalogId 
                                    ? 'rgba(76,206,172,0.3)' 
                                    : 'rgba(255,255,255,0.05)',
                                  color: selectedChartExercise?.catalogId === exercise.catalogId 
                                    ? COLORS.green 
                                    : COLORS.text,
                                  border: selectedChartExercise?.catalogId === exercise.catalogId 
                                    ? `1px solid ${COLORS.green}` 
                                    : `1px solid ${COLORS.border}`,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': { backgroundColor: 'rgba(76,206,172,0.15)' },
                                }}
                              />
                            ))}
                        </Box>
                        {exerciseHistory.exercises.filter(ex => ex.sessions.length >= 2).length === 0 && (
                          <Typography fontSize={12} color={COLORS.textMuted} mt={1}>
                            ⚠️ Se necesitan al menos 2 sesiones por ejercicio para ver gráficos
                          </Typography>
                        )}
                      </Box>

                      {/* Gráfico */}
                      {selectedChartExercise && (
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          background: 'rgba(0,0,0,0.3)', 
                          border: `1px solid ${COLORS.border}`,
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                              <Typography fontWeight={600} color={COLORS.text}>
                                {selectedChartExercise.name}
                              </Typography>
                              <Typography fontSize={12} color={COLORS.textMuted}>
                                Evolución de carga máxima
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {selectedChartExercise.progression !== 0 && (
                                <Chip
                                  label={`${selectedChartExercise.progression > 0 ? '↑' : '↓'} ${Math.abs(selectedChartExercise.progression)}kg`}
                                  size="small"
                                  sx={{
                                    backgroundColor: selectedChartExercise.progression > 0 ? 'rgba(76,206,172,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: selectedChartExercise.progression > 0 ? COLORS.green : '#ef4444',
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                              <Chip
                                label={`🏆 ${selectedChartExercise.bestLoad}kg`}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(255,215,0,0.2)',
                                  color: COLORS.gold,
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          </Box>

                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart
                              data={[...selectedChartExercise.sessions]
                                .reverse()
                                .map(session => ({
                                  fecha: new Date(session.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
                                  maxLoad: Math.max(...session.sets.map(s => s.load)),
                                  avgLoad: Math.round(session.sets.reduce((acc, s) => acc + s.load, 0) / session.sets.length),
                                  totalSets: session.sets.length,
                                }))}
                              margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis 
                                dataKey="fecha" 
                                stroke={COLORS.textMuted} 
                                fontSize={11}
                                tickLine={false}
                              />
                              <YAxis 
                                stroke={COLORS.textMuted} 
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                unit="kg"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#1a1a2e',
                                  border: `1px solid ${COLORS.border}`,
                                  borderRadius: 8,
                                  color: COLORS.text,
                                }}
                                formatter={(value, name) => [
                                  `${value}kg`,
                                  name === 'maxLoad' ? 'Carga máxima' : 'Carga promedio'
                                ]}
                              />
                              <Legend 
                                formatter={(value) => value === 'maxLoad' ? 'Carga máxima' : 'Carga promedio'}
                                wrapperStyle={{ fontSize: 11 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="maxLoad"
                                stroke={COLORS.green}
                                strokeWidth={3}
                                dot={{ fill: COLORS.green, strokeWidth: 2, r: 5 }}
                                activeDot={{ r: 7, fill: COLORS.green }}
                              />
                              <Line
                                type="monotone"
                                dataKey="avgLoad"
                                stroke={COLORS.blue}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ fill: COLORS.blue, strokeWidth: 2, r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>

                          {/* Detalle por sesión debajo del gráfico */}
                          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${COLORS.border}` }}>
                            <Typography fontSize={11} color={COLORS.textMuted} mb={1}>Detalle por sesión:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {[...selectedChartExercise.sessions].reverse().map((session, idx) => (
                                <Box 
                                  key={idx}
                                  sx={{ 
                                    p: 1, 
                                    borderRadius: 1, 
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${COLORS.border}`,
                                    minWidth: 100,
                                  }}
                                >
                                  <Typography fontSize={10} color={COLORS.textMuted}>
                                    {new Date(session.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                  </Typography>
                                  <Typography fontSize={13} fontWeight={600} color={COLORS.green}>
                                    {Math.max(...session.sets.map(s => s.load))}kg
                                  </Typography>
                                  <Typography fontSize={10} color={COLORS.textMuted}>
                                    {session.sets.length} sets
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {/* Mensaje si no hay ejercicio seleccionado */}
                      {!selectedChartExercise && exerciseHistory.exercises.filter(ex => ex.sessions.length >= 2).length > 0 && (
                        <Box sx={{ textAlign: 'center', py: 4, color: COLORS.textMuted }}>
                          <Typography fontSize={32} mb={1}>👆</Typography>
                          <Typography fontSize={13}>Selecciona un ejercicio arriba para ver su gráfico</Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Modal de Perfil Nutricional */}
      {showNutritionProfileModal && (
        <NutritionProfileCard
          studentId={parseInt(id)}
          studentName={student ? `${student.nombre} ${student.apellido}` : ''}
          isOpen={true}
          onClose={() => setShowNutritionProfileModal(false)}
          onSave={(newProfile) => {
            setNutritionProfile(newProfile);
            setShowNutritionProfileModal(false);
            // Recargar datos de nutrición para reflejar los cambios
            reloadNutritionData();
          }}
        />
      )}

      {/* Modal de Detalle Cardio */}
      {showCardioModal && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.85)',
            p: 2,
          }}
          onClick={() => setShowCardioModal(false)}
        >
          <Box
            sx={{
              backgroundColor: COLORS.card,
              borderRadius: 3,
              width: '100%',
              maxWidth: 600,
              maxHeight: '85vh',
              overflow: 'auto',
              border: `1px solid ${COLORS.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box sx={{ 
              p: 2.5, 
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(76,206,172,0.15) 0%, transparent 100%)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography fontSize={28}>🏃</Typography>
                <Box>
                  <Typography variant="h6" fontWeight={700} color={COLORS.text}>
                    Detalle de Cardio
                  </Typography>
                  <Typography fontSize={12} color={COLORS.textMuted}>
                    Últimos 7 días
                  </Typography>
                </Box>
              </Box>
              <Button 
                onClick={() => setShowCardioModal(false)}
                sx={{ minWidth: 'auto', color: COLORS.textMuted, fontSize: 20 }}
              >
                ✕
              </Button>
            </Box>

            {/* Contenido */}
            <Box sx={{ p: 2.5 }}>
              {loadingCardioDetails ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: COLORS.green }} />
                  <Typography color={COLORS.textMuted} mt={2}>Cargando...</Typography>
                </Box>
              ) : (
                <>
                  {/* Actividades trackeadas (GPS) */}
                  {cardioDetails.tracked?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography fontSize={12} color={COLORS.green} fontWeight={600} mb={1.5}>
                        📍 ACTIVIDADES GPS ({cardioDetails.tracked.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {cardioDetails.tracked.map((activity) => {
                          const info = getTrackedActivityInfo(activity.type);
                          return (
                            <Box
                              key={activity.id}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${COLORS.green}33`,
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Typography fontSize={28}>{info.emoji}</Typography>
                                  <Box>
                                    <Typography fontWeight={600} color={COLORS.text}>
                                      {info.label}
                                    </Typography>
                                    <Typography fontSize={12} color={COLORS.textMuted}>
                                      {new Date(activity.date).toLocaleDateString('es-AR', { 
                                        weekday: 'short', 
                                        day: 'numeric', 
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Chip 
                                  label={activity.trackingMode === 'gps' ? '📍 GPS' : '✋ Manual'}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: `${COLORS.green}22`,
                                    color: COLORS.green,
                                    fontSize: 10,
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', gap: 3, mt: 1.5, pt: 1.5, borderTop: `1px solid ${COLORS.border}` }}>
                                <Box>
                                  <Typography fontSize={18} fontWeight={700} color={COLORS.blue}>
                                    {activity.durationMinutes} min
                                  </Typography>
                                  <Typography fontSize={10} color={COLORS.textMuted}>Duración</Typography>
                                </Box>
                                {activity.distanceKm > 0 && (
                                  <Box>
                                    <Typography fontSize={18} fontWeight={700} color={COLORS.green}>
                                      {activity.distanceKm} km
                                    </Typography>
                                    <Typography fontSize={10} color={COLORS.textMuted}>Distancia</Typography>
                                  </Box>
                                )}
                                {activity.calories > 0 && (
                                  <Box>
                                    <Typography fontSize={18} fontWeight={700} color={COLORS.orange}>
                                      {activity.calories} kcal
                                    </Typography>
                                    <Typography fontSize={10} color={COLORS.textMuted}>Calorías</Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {/* Actividades manuales (formulario) */}
                  {cardioDetails.cardioLog?.length > 0 && (
                    <Box>
                      <Typography fontSize={12} color={COLORS.orange} fontWeight={600} mb={1.5}>
                        ✍️ REGISTROS MANUALES ({cardioDetails.cardioLog.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {cardioDetails.cardioLog.map((log) => {
                          const info = getActivityInfo(log.activityType);
                          const intensity = INTENSITY_LEVELS[log.intensity];
                          return (
                            <Box
                              key={log.id}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${COLORS.orange}33`,
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Typography fontSize={28}>{info.emoji}</Typography>
                                  <Box>
                                    <Typography fontWeight={600} color={COLORS.text}>
                                      {info.label}
                                    </Typography>
                                    <Typography fontSize={12} color={COLORS.textMuted}>
                                      {new Date(log.date).toLocaleDateString('es-AR', { 
                                        weekday: 'short', 
                                        day: 'numeric', 
                                        month: 'short',
                                      })}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Chip 
                                  label={intensity?.label || 'Media'}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: `${intensity?.color || COLORS.orange}22`,
                                    color: intensity?.color || COLORS.orange,
                                    fontSize: 10,
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', gap: 3, mt: 1.5, pt: 1.5, borderTop: `1px solid ${COLORS.border}` }}>
                                <Box>
                                  <Typography fontSize={18} fontWeight={700} color={COLORS.blue}>
                                    {formatDuration(log.durationMinutes)}
                                  </Typography>
                                  <Typography fontSize={10} color={COLORS.textMuted}>Duración</Typography>
                                </Box>
                                {log.distanceKm > 0 && (
                                  <Box>
                                    <Typography fontSize={18} fontWeight={700} color={COLORS.green}>
                                      {log.distanceKm} km
                                    </Typography>
                                    <Typography fontSize={10} color={COLORS.textMuted}>Distancia</Typography>
                                  </Box>
                                )}
                                {log.caloriesBurned > 0 && (
                                  <Box>
                                    <Typography fontSize={18} fontWeight={700} color={COLORS.orange}>
                                      {log.caloriesBurned} kcal
                                    </Typography>
                                    <Typography fontSize={10} color={COLORS.textMuted}>Calorías</Typography>
                                  </Box>
                                )}
                              </Box>
                              {log.notes && (
                                <Typography fontSize={12} color={COLORS.textMuted} mt={1.5} fontStyle="italic">
                                  📝 {log.notes}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {/* Sin actividades */}
                  {(!cardioDetails.tracked?.length && !cardioDetails.cardioLog?.length) && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography fontSize={48} mb={2}>🏃‍♂️</Typography>
                      <Typography color={COLORS.textMuted}>
                        No hay actividades registradas en los últimos 7 días
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* ===================== MODAL DE DETALLE DE NOTA ===================== */}
      {showNoteDetailModal && selectedNote && (
        <Box
          onClick={() => setShowNoteDetailModal(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: COLORS.card,
              borderRadius: 3,
              width: '100%',
              maxWidth: 550,
              maxHeight: '85vh',
              overflow: 'auto',
              border: `1px solid ${COLORS.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box sx={{ 
              p: 2.5, 
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(255,152,0,0.15) 0%, transparent 100%)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography fontSize={28}>📝</Typography>
                <Box>
                  <Typography variant="h6" fontWeight={700} color={COLORS.text}>
                    Nota del Alumno
                  </Typography>
                  <Typography fontSize={12} color={COLORS.textMuted}>
                    {selectedNote.exerciseName}
                  </Typography>
                </Box>
              </Box>
              <Button 
                onClick={() => setShowNoteDetailModal(false)}
                sx={{ minWidth: 'auto', color: COLORS.textMuted, fontSize: 20 }}
              >
                ✕
              </Button>
            </Box>

            {/* Contenido */}
            <Box sx={{ p: 2.5 }}>
              {/* La nota */}
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                background: 'rgba(255,152,0,0.1)',
                borderLeft: `4px solid ${COLORS.orange}`,
                mb: 3,
              }}>
                <Typography fontSize={16} color={COLORS.text} fontStyle="italic">
                  "{selectedNote.note}"
                </Typography>
                <Typography fontSize={11} color={COLORS.textMuted} mt={1}>
                  Set {selectedNote.setNumber} • {selectedNote.load > 0 ? `${selectedNote.load}kg` : 'Sin carga'}
                </Typography>
              </Box>

              {loadingNoteDetail ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: COLORS.orange }} />
                  <Typography color={COLORS.textMuted} mt={2}>Cargando ejercicio...</Typography>
                </Box>
              ) : noteExerciseDetail ? (
                <>
                  {/* Información del ejercicio */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography fontSize={11} color={COLORS.orange} fontWeight={600}>
                      🏋️ {noteExerciseDetail.exerciseCatalog?.name || selectedNote.exerciseName}
                    </Typography>
                    <Chip 
                      label={`${noteExerciseDetail.sets?.length || 0} sets`} 
                      size="small"
                      sx={{ 
                        fontSize: 10, 
                        height: 20, 
                        backgroundColor: 'rgba(255,152,0,0.2)', 
                        color: COLORS.orange 
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 2,
                    p: 1.5,
                  }}>
                    {/* Header de la tabla */}
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '40px 1fr 1fr 1fr 1fr', 
                      gap: 1,
                      pb: 1,
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}>
                      <Typography fontSize={10} color={COLORS.textMuted} fontWeight={600}>Set</Typography>
                      <Typography fontSize={10} color={COLORS.textMuted} fontWeight={600}>Reps</Typography>
                      <Typography fontSize={10} color={COLORS.textMuted} fontWeight={600}>Carga</Typography>
                      <Typography fontSize={10} color={COLORS.textMuted} fontWeight={600}>RIR</Typography>
                      <Typography fontSize={10} color={COLORS.textMuted} fontWeight={600}>RPE</Typography>
                    </Box>

                    {/* Sets */}
                    {noteExerciseDetail.sets?.map((set, idx) => {
                      const isHighlighted = set.id === selectedNote.id;
                      return (
                        <Box 
                          key={set.id || idx}
                          sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: '40px 1fr 1fr 1fr 1fr', 
                            gap: 1,
                            py: 0.75,
                            px: 1,
                            borderRadius: 1,
                            background: isHighlighted ? 'rgba(255,152,0,0.2)' : 'transparent',
                            border: isHighlighted ? `1px solid ${COLORS.orange}` : '1px solid transparent',
                            position: 'relative',
                          }}
                        >
                          <Typography fontSize={12} color={isHighlighted ? COLORS.orange : COLORS.text} fontWeight={isHighlighted ? 700 : 400}>
                            {idx + 1}
                          </Typography>
                          <Typography fontSize={12} color={COLORS.text}>
                            {set.reps || '-'}
                          </Typography>
                          <Typography fontSize={12} color={COLORS.text}>
                            {set.load > 0 ? `${set.load}kg` : '-'}
                          </Typography>
                          <Typography fontSize={12} color={COLORS.text}>
                            {set.realRir ?? set.rir ?? '-'}
                          </Typography>
                          <Typography fontSize={12} color={COLORS.text}>
                            {set.rpe ?? '-'}
                          </Typography>
                          
                          {/* Indicador de nota */}
                          {set.notes && (
                            <Box sx={{ 
                              position: 'absolute', 
                              right: -8, 
                              top: '50%', 
                              transform: 'translateY(-50%)',
                              fontSize: 10,
                            }}>
                              💬
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Botón para ir al microciclo */}
                  <Button
                    onClick={() => {
                      window.open(`/coach/microcycle/${selectedNote.microcycleId}`, '_blank');
                    }}
                    variant="outlined"
                    fullWidth
                    sx={{
                      mt: 2.5,
                      borderColor: COLORS.border,
                      color: COLORS.textMuted,
                      '&:hover': {
                        borderColor: COLORS.orange,
                        color: COLORS.orange,
                        background: 'rgba(255,152,0,0.1)',
                      },
                    }}
                  >
                    Ver microciclo completo →
                  </Button>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color={COLORS.textMuted} fontSize={13}>
                    No se pudo cargar el detalle del ejercicio
                  </Typography>
                  <Button
                    onClick={() => {
                      window.open(`/coach/microcycle/${selectedNote.microcycleId}`, '_blank');
                    }}
                    variant="outlined"
                    sx={{
                      mt: 2,
                      borderColor: COLORS.orange,
                      color: COLORS.orange,
                    }}
                  >
                    Ir al microciclo →
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StudentDetail;
