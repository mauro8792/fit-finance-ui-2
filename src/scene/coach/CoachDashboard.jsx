import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  Group as GroupIcon,
  FitnessCenter as FitnessCenterIcon,
  Restaurant as RestaurantIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
  DirectionsRun as CardioIcon,
  Scale as ScaleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ArrowForward as ArrowIcon,
  LibraryBooks as LibraryIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const CoachDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, getCoachStudentsData, status } = useAuthStore();
  const coachUserId = user?.id;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (status !== 'authenticated' || !coachUserId) return;
    setLoading(true);
    getCoachStudentsData(coachUserId)
      .then((data) => {
        setStudents(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [coachUserId, getCoachStudentsData, status]);

  // Estadísticas calculadas
  const totalStudents = students.length;
  const studentsWithRoutines = students.filter(s => s.macrocycles?.length > 0).length;
  const studentsWithoutRoutines = totalStudents - studentsWithRoutines;
  
  // Simular datos de actividad (en el futuro vendrán del backend)
  const recentActivity = students.slice(0, 5).map(s => ({
    student: s,
    type: ['training', 'nutrition', 'cardio', 'weight'][Math.floor(Math.random() * 4)],
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  })).sort((a, b) => b.date - a.date);

  // Alertas
  const alerts = [];
  if (studentsWithoutRoutines > 0) {
    alerts.push({
      type: 'warning',
      icon: <FitnessCenterIcon />,
      message: `${studentsWithoutRoutines} alumno(s) sin rutina asignada`,
      action: () => navigate('/coach/templates'),
    });
  }
  // Podrías agregar más alertas basadas en datos reales

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        gap: 2,
      }}>
        <CircularProgress size={60} sx={{ color: '#FFB300' }} />
        <Typography variant="body1" sx={{ color: '#aaa' }}>
          Cargando tu dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error al cargar el dashboard</Alert>
      </Box>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'training': return <FitnessCenterIcon sx={{ color: '#4fc3f7' }} />;
      case 'nutrition': return <RestaurantIcon sx={{ color: '#66bb6a' }} />;
      case 'cardio': return <CardioIcon sx={{ color: '#ff7043' }} />;
      case 'weight': return <ScaleIcon sx={{ color: '#ab47bc' }} />;
      default: return <CheckIcon sx={{ color: '#aaa' }} />;
    }
  };

  const getActivityText = (type) => {
    switch (type) {
      case 'training': return 'completó entrenamiento';
      case 'nutrition': return 'registró comidas';
      case 'cardio': return 'hizo cardio';
      case 'weight': return 'registró peso';
      default: return 'actividad';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}
        >
          ¡Hola, {user?.fullName?.split(' ')[0] || 'Coach'}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: '#888' }}>
          {new Date().toLocaleDateString('es-AR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </Typography>
      </Box>

      {/* ========== SECCIÓN 1: STATS RÁPIDOS ========== */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Paper sx={{
            p: 2,
            background: 'linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)',
            borderRadius: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700, color: '#000' }}>
                  {totalStudents}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#000', opacity: 0.8 }}>
                  Alumnos
                </Typography>
              </Box>
              <GroupIcon sx={{ fontSize: isMobile ? 36 : 48, color: '#000', opacity: 0.3 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} md={3}>
          <Paper sx={{
            p: 2,
            background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
            borderRadius: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700, color: '#000' }}>
                  {studentsWithRoutines}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#000', opacity: 0.8 }}>
                  Con Rutinas
                </Typography>
              </Box>
              <FitnessCenterIcon sx={{ fontSize: isMobile ? 36 : 48, color: '#000', opacity: 0.3 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} md={3}>
          <Paper sx={{
            p: 2,
            background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
            borderRadius: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700, color: '#000' }}>
                  {Math.round((studentsWithRoutines / Math.max(totalStudents, 1)) * 100)}%
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#000', opacity: 0.8 }}>
                  Cobertura
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: isMobile ? 36 : 48, color: '#000', opacity: 0.3 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} md={3}>
          <Paper sx={{
            p: 2,
            background: studentsWithoutRoutines > 0 
              ? 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)'
              : 'linear-gradient(135deg, #9ccc65 0%, #7cb342 100%)',
            borderRadius: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700, color: '#000' }}>
                  {studentsWithoutRoutines}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#000', opacity: 0.8 }}>
                  Pendientes
                </Typography>
              </Box>
              <WarningIcon sx={{ fontSize: isMobile ? 36 : 48, color: '#000', opacity: 0.3 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ========== GRID PRINCIPAL ========== */}
      <Grid container spacing={3}>
        
        {/* ========== COLUMNA IZQUIERDA ========== */}
        <Grid item xs={12} md={8}>
          
          {/* ALERTAS Y PENDIENTES */}
          {alerts.length > 0 && (
            <Card sx={{ 
              mb: 3, 
              bgcolor: 'rgba(255,152,0,0.05)', 
              border: '1px solid rgba(255,152,0,0.2)',
              borderRadius: 3,
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#FFB300', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon /> Pendientes
                </Typography>
                {alerts.map((alert, idx) => (
                  <Box 
                    key={idx}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 1.5,
                      mb: 1,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                    }}
                    onClick={alert.action}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: '#FFB300' }}>{alert.icon}</Box>
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        {alert.message}
                      </Typography>
                    </Box>
                    <ArrowIcon sx={{ color: '#666' }} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* MIS ALUMNOS */}
          <Card sx={{ 
            bgcolor: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon sx={{ color: '#FFB300' }} /> Mis Alumnos ({totalStudents})
                </Typography>
              </Box>

              {totalStudents === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <GroupIcon sx={{ fontSize: 48, color: '#444', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: '#666' }}>
                    No tenés alumnos asignados aún
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {students.slice(0, isMobile ? 4 : 6).map((student) => (
                    <Grid item xs={6} sm={4} key={student.id}>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: 'rgba(255,255,255,0.03)',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: '1px solid transparent',
                          '&:hover': { 
                            bgcolor: 'rgba(255,179,0,0.1)',
                            borderColor: 'rgba(255,179,0,0.3)',
                          },
                        }}
                        onClick={() => navigate(`/coach/alumno/${student.id}`)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Avatar sx={{ 
                            bgcolor: '#FFB300', 
                            color: '#000', 
                            width: 36, 
                            height: 36,
                            fontSize: 14,
                            fontWeight: 700,
                          }}>
                            {(student.user?.fullName || student.firstName)?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box sx={{ overflow: 'hidden' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#fff', 
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {(student.user?.fullName || `${student.firstName}`).split(' ')[0]}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#888' }}>
                              {student.sport?.name || 'Sin deporte'}
                            </Typography>
                          </Box>
                        </Box>
                        {student.macrocycles?.length > 0 ? (
                          <Chip 
                            label="Con rutina" 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(76,175,80,0.2)', 
                              color: '#66bb6a',
                              fontSize: 10,
                              height: 20,
                            }} 
                          />
                        ) : (
                          <Chip 
                            label="Sin rutina" 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(239,83,80,0.2)', 
                              color: '#ef5350',
                              fontSize: 10,
                              height: 20,
                            }} 
                          />
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ========== COLUMNA DERECHA ========== */}
        <Grid item xs={12} md={4}>
          
          {/* ACCESOS RÁPIDOS */}
          <Card sx={{ 
            mb: 3, 
            bgcolor: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                ⚡ Accesos Rápidos
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={() => navigate('/coach/templates')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    color: '#FFB300', 
                    borderColor: 'rgba(255,179,0,0.3)',
                    '&:hover': { borderColor: '#FFB300', bgcolor: 'rgba(255,179,0,0.1)' },
                  }}
                >
                  Nueva Plantilla
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RestaurantIcon />}
                  fullWidth
                  onClick={() => navigate('/coach/food-catalog')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    color: '#66bb6a', 
                    borderColor: 'rgba(102,187,106,0.3)',
                    '&:hover': { borderColor: '#66bb6a', bgcolor: 'rgba(102,187,106,0.1)' },
                  }}
                >
                  Mi Catálogo de Alimentos
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LibraryIcon />}
                  fullWidth
                  onClick={() => navigate('/coach/exercise-catalog')}
                  sx={{ 
                    justifyContent: 'flex-start',
                    color: '#4fc3f7', 
                    borderColor: 'rgba(79,195,247,0.3)',
                    '&:hover': { borderColor: '#4fc3f7', bgcolor: 'rgba(79,195,247,0.1)' },
                  }}
                >
                  Catálogo de Ejercicios
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* ACTIVIDAD RECIENTE */}
          <Card sx={{ 
            bgcolor: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ color: '#FFB300' }} /> Actividad Reciente
              </Typography>
              
              {recentActivity.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Sin actividad reciente
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentActivity.slice(0, 5).map((activity, idx) => (
                    <ListItem 
                      key={idx}
                      sx={{ 
                        px: 0, 
                        py: 1,
                        borderBottom: idx < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        {getActivityIcon(activity.type)}
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ color: '#fff' }}>
                            <strong>
                              {(activity.student.user?.fullName || activity.student.firstName).split(' ')[0]}
                            </strong>{' '}
                            {getActivityText(activity.type)}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {activity.date.toLocaleDateString('es-AR', { 
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ========== TIP DEL DÍA (MOBILE) ========== */}
      {isMobile && (
        <Card sx={{ 
          mt: 3,
          bgcolor: 'rgba(255,179,0,0.05)', 
          border: '1px solid rgba(255,179,0,0.2)',
          borderRadius: 3,
        }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ color: '#FFB300', fontWeight: 600, mb: 0.5 }}>
              💡 Tip del día
            </Typography>
            <Typography variant="body2" sx={{ color: '#aaa' }}>
              Revisá regularmente el progreso de tus alumnos para ajustar sus rutinas según su evolución.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CoachDashboard;
