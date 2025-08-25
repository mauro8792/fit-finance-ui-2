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
  Divider
} from '@mui/material';
import {
  Group as GroupIcon,
  SportsSoccer as SportsIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  FitnessCenter as FitnessCenterIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { Header } from '../../components';

const CoachDashboard = () => {
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
  const activeSports = [...new Set(students.map(s => s.sport?.name).filter(Boolean))];
  const totalSports = activeSports.length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} sx={{ color: '#FFB300' }} />
        <Typography variant="h6" sx={{ ml: 2, color: '#fff' }}>
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar los datos del dashboard
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Header 
        title={`¡Hola, ${user?.fullName || 'Coach'}!`} 
        subtitle="Gestiona a tus alumnos y rutinas desde aquí" 
      />

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={6} 
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)',
              color: '#000',
              borderRadius: 3,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {totalStudents}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Alumnos Activos
                </Typography>
              </Box>
              <GroupIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={6} 
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #70d8bd 0%, #4db6ac 100%)',
              color: '#000',
              borderRadius: 3,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {totalSports}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Deportes
                </Typography>
              </Box>
              <SportsIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={6} 
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #90caf9 0%, #42a5f5 100%)',
              color: '#000',
              borderRadius: 3,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {students.filter(s => s.routines?.length > 0).length}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Con Rutinas
                </Typography>
              </Box>
              <FitnessCenterIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Sección de Mis Alumnos */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#FFB300', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
          <GroupIcon sx={{ mr: 1 }} />
          Mis Alumnos ({totalStudents})
        </Typography>
        
        {totalStudents === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', background: '#1e1e1e' }}>
            <GroupIcon sx={{ fontSize: 64, color: '#666', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes alumnos asignados aún
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cuando tengas alumnos asignados, aparecerán aquí
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {students.map((student) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={student.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)',
                    border: '1px solid #333',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(255, 179, 0, 0.2)',
                      borderColor: '#FFB300',
                    }
                  }}
                  onClick={() => navigate(`/coach/alumno/${student.id}`)}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header del alumno */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#FFB300', 
                          color: '#000',
                          width: 48, 
                          height: 48,
                          fontWeight: 700,
                          mr: 2 
                        }}
                      >
                        {(student.user?.fullName || student.firstName)?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, lineHeight: 1.2 }}>
                          {student.user?.fullName || `${student.firstName} ${student.lastName}`}
                        </Typography>
                        {student.sport && (
                          <Chip 
                            label={student.sport.name}
                            size="small"
                            sx={{ 
                              mt: 0.5,
                              bgcolor: '#70d8bd',
                              color: '#000',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2, borderColor: '#333' }} />

                    {/* Información del alumno */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, color: '#FFB300', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.85rem' }}>
                          {student.user?.email || student.email || 'Sin email'}
                        </Typography>
                      </Box>
                      
                      {student.routines?.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AssignmentIcon sx={{ fontSize: 16, color: '#70d8bd', mr: 1 }} />
                          <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.85rem' }}>
                            {student.routines.length} rutina(s) asignada(s)
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/coach/alumno/${student.id}`);
                        }}
                        sx={{
                          bgcolor: '#FFB300',
                          color: '#000',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          '&:hover': { bgcolor: '#FF8F00' }
                        }}
                      >
                        Ver Detalle
                      </Button>
                      
                      <Tooltip title="Ver rutinas">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Aquí puedes agregar la navegación a rutinas
                          }}
                          sx={{ color: '#70d8bd' }}
                        >
                          <FitnessCenterIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Deportes activos */}
      {activeSports.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ color: '#FFB300', fontWeight: 600, mb: 2 }}>
            Deportes que entrenas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {activeSports.map((sport, index) => (
              <Chip
                key={index}
                label={sport}
                variant="outlined"
                sx={{
                  borderColor: '#70d8bd',
                  color: '#70d8bd',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(112, 216, 189, 0.1)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CoachDashboard;
