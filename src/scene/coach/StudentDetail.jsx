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
import { useAuthStore } from '../../hooks';
import RoutineWizard from './RoutineWizard';
import { useRoutineStore } from '../../hooks/useRoutineStore';
import NutritionProfileCard from './NutritionProfileCard';

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
    <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.bg }}>
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
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          {/* Card Información Personal */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.1) 100%)',
              border: `1px solid rgba(102,126,234,0.3)`,
              borderRadius: 3,
              height: '100%',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonIcon sx={{ color: COLORS.blue }} />
                  <Typography variant="h6" fontWeight="bold" color={COLORS.text}>
                    Información Personal
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 36, height: 36, borderRadius: 2, 
                      background: 'rgba(104,112,250,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <EmailIcon sx={{ color: COLORS.blue, fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography fontSize={11} color={COLORS.textMuted}>Email</Typography>
                      <Typography fontSize={14} color={COLORS.text} fontWeight={500}>
                        {student.user?.email || student.email || '-'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 36, height: 36, borderRadius: 2, 
                      background: 'rgba(76,206,172,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <PhoneIcon sx={{ color: COLORS.green, fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography fontSize={11} color={COLORS.textMuted}>Teléfono</Typography>
                      <Typography fontSize={14} color={COLORS.text} fontWeight={500}>
                        {student.user?.phone || student.phone || '-'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 36, height: 36, borderRadius: 2, 
                      background: 'rgba(236,72,153,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CakeIcon sx={{ color: COLORS.pink, fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography fontSize={11} color={COLORS.textMuted}>Nacimiento</Typography>
                      <Typography fontSize={14} color={COLORS.text} fontWeight={500}>
                        {student.birthDate ? new Date(student.birthDate).toLocaleDateString() : '-'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 36, height: 36, borderRadius: 2, 
                      background: 'rgba(255,152,0,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CalendarTodayIcon sx={{ color: COLORS.orange, fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography fontSize={11} color={COLORS.textMuted}>Fecha de Alta</Typography>
                      <Typography fontSize={14} color={COLORS.text} fontWeight={500}>
                        {student.startDate ? new Date(student.startDate).toLocaleDateString() : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Card Información Deportiva */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.1) 100%)',
              border: `1px solid rgba(168,85,247,0.3)`,
              borderRadius: 3,
              height: '100%',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FitnessCenterIcon sx={{ color: COLORS.purple }} />
                  <Typography variant="h6" fontWeight="bold" color={COLORS.text}>
                    Plan Deportivo
                  </Typography>
                </Box>

                {student.sport ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.2) 100%)',
                      borderRadius: 3,
                      px: 3, py: 2, mb: 2,
                    }}>
                      <Typography variant="h5" fontWeight="bold" color={COLORS.purple}>
                        {student.sport.name}
                      </Typography>
                    </Box>

                    {student.sportPlan ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ 
                          background: 'rgba(0,0,0,0.2)', 
                          borderRadius: 2, 
                          p: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <Typography fontSize={13} color={COLORS.textMuted}>Plan</Typography>
                          <Typography fontSize={14} fontWeight={600} color={COLORS.text}>
                            {student.sportPlan.name}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          background: 'rgba(0,0,0,0.2)', 
                          borderRadius: 2, 
                          p: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <Typography fontSize={13} color={COLORS.textMuted}>Precio</Typography>
                          <Typography fontSize={14} fontWeight={600} color={COLORS.green}>
                            ${student.sportPlan.monthlyFee}/mes
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          background: 'rgba(0,0,0,0.2)', 
                          borderRadius: 2, 
                          p: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <Typography fontSize={13} color={COLORS.textMuted}>Frecuencia</Typography>
                          <Typography fontSize={14} fontWeight={600} color={COLORS.orange}>
                            {student.sportPlan.weeklyFrequency}x/semana
                          </Typography>
                        </Box>
                        {student.sportPlan.description && (
                          <Typography fontSize={12} color={COLORS.textMuted} fontStyle="italic" mt={1}>
                            {student.sportPlan.description}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography fontSize={13} color={COLORS.textMuted}>
                        Precio base: ${student.sport.monthlyFee}/mes
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, color: COLORS.textMuted }}>
                    <FitnessCenterIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                    <Typography>Sin disciplina asignada</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Card Nutrición */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(76,206,172,0.15) 0%, rgba(56,249,215,0.1) 100%)',
              border: `1px solid rgba(76,206,172,0.3)`,
              borderRadius: 3,
              height: '100%',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <RestaurantIcon sx={{ color: COLORS.green }} />
                  <Typography variant="h6" fontWeight="bold" color={COLORS.text}>
                    Objetivos Nutricionales
                  </Typography>
                </Box>

                <NutritionProfileCard 
                  studentId={student.id} 
                  studentName={studentName}
                />

                <Box
                  onClick={() => navigate(`/coach/alumno/${student.id}/nutricion`)}
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Typography fontSize={13} fontWeight={600} color={COLORS.text}>
                    📊 Ver Historial Completo
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Rutinas */}
          <Grid item xs={12}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(30,30,47,0.9) 0%, rgba(21,21,33,0.9) 100%)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ fontSize: 24 }}>🏋️</Box>
                    <Typography variant="h6" fontWeight="bold" color={COLORS.gold}>
                      Rutinas (Macro-ciclos)
                    </Typography>
                  </Box>
                  {macros.length > 0 && !showRoutineWizard && (
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
                    {macros.map(macro => (
                      <Box
                        key={macro.id}
                        onClick={() => navigate(`/coach/macrocycle/${macro.id}`)}
                        sx={{
                          minWidth: 220,
                          maxWidth: 280,
                          p: 2,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
                          border: `2px solid ${COLORS.gold}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: `0 8px 24px rgba(255,215,0,0.2)`,
                            borderColor: '#ffed4a',
                          },
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" color={COLORS.gold} mb={1}>
                          {macro.name}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography fontSize={12} color={COLORS.textMuted}>
                            📅 Inicio: {macro.startDate ? new Date(macro.startDate).toLocaleDateString() : '-'}
                          </Typography>
                          <Typography fontSize={12} color={COLORS.textMuted}>
                            🏁 Fin: {macro.endDate ? new Date(macro.endDate).toLocaleDateString() : '-'}
                          </Typography>
                        </Box>
                        {macro.observaciones && (
                          <Typography fontSize={11} color={COLORS.textMuted} mt={1} fontStyle="italic">
                            {macro.observaciones}
                          </Typography>
                        )}
                      </Box>
                    ))}

                    {/* Card Nueva Rutina */}
              {!showRoutineWizard && (
                      <Box
                        onClick={() => setShowRoutineWizard(true)}
                        sx={{
                          minWidth: 220,
                          maxWidth: 280,
                          minHeight: 140,
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
                            borderColor: 'rgba(255,255,255,0.6)',
                          },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 36, color: '#fff', mb: 1 }} />
                        <Typography fontWeight={600} color="#fff">
                    Nueva Rutina
                        </Typography>
                        <Typography fontSize={11} color="rgba(255,255,255,0.7)">
                    Crear macrociclo
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
    </Box>
  );
};

export default StudentDetail;
