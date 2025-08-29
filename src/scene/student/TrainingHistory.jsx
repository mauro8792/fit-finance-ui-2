import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Stack,
  Chip,
  Grid,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  FitnessCenter as WorkoutIcon,
  DateRange as CalendarIcon,
  TrendingUp as ProgressIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { useAuthStore } from '../../hooks';

const TrainingHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { student } = useAuthStore();
  const isMobile = useMediaQuery('(max-width:768px)');

  // Fetch historial de entrenamientos
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const token = localStorage.getItem('token');
        
        // ✅ CORREGIDO: Usar student.id en lugar de user.id
        // El endpoint espera studentId, no userId
        const studentId = student?.id;
        if (!studentId) {
          throw new Error('No se encontraron datos del estudiante');
        }
        
        // Obtener macrociclos del estudiante
        const macrosResponse = await fetch(`${apiUrl}/macrocycle/student/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!macrosResponse.ok) {
          throw new Error('Error al cargar macrociclos');
        }
        
        const macros = await macrosResponse.json();
        console.log('📊 Macrociclos encontrados:', macros);
        
        // Para cada macrociclo, obtener mesociclos y microciclos con días entrenados
        const historialCompleto = [];
        
        for (const macro of macros) {
          // Obtener mesociclos
          const mesosResponse = await fetch(`${apiUrl}/mesocycle/macrocycle/${macro.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (mesosResponse.ok) {
            const mesos = await mesosResponse.json();
            
            for (const meso of mesos) {
              // Obtener microciclos
              const microsResponse = await fetch(`${apiUrl}/microcycle/mesocycle/${meso.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (microsResponse.ok) {
                const micros = await microsResponse.json();
                
                for (const micro of micros) {
                  // Filtrar días que tienen fecha (fueron entrenados)
                  const diasEntrenados = micro.days
                    .filter(day => day.fecha && !day.esDescanso)
                    .map(day => ({
                      ...day,
                      macrociclo: macro.nombre,
                      mesociclo: meso.nombre,
                      microciclo: micro.name,
                      totalEjercicios: day.exercises?.length || 0,
                      totalSets: day.exercises?.reduce((total, ex) => total + (ex.sets?.length || 0), 0) || 0
                    }));
                  
                  historialCompleto.push(...diasEntrenados);
                }
              }
            }
          }
        }
        
        // ✅ Ordenar por fecha (más reciente primero) - CORREGIDO para zona horaria
        historialCompleto.sort((a, b) => {
          const dateA = new Date(a.fecha + 'T12:00:00');
          const dateB = new Date(b.fecha + 'T12:00:00');
          return dateB - dateA;
        });
        
        setHistoryData(historialCompleto);
        console.log('📅 Historial completo:', historialCompleto);
        
      } catch (err) {
        console.error('Error cargando historial:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (student?.id) {
      fetchHistory();
    }
  }, [student?.id]);

  // Función para formatear fecha (CORREGIDA para evitar problemas de zona horaria)
  const formatDate = (dateString) => {
    // ✅ Agregar 'T12:00:00' para evitar problemas de zona horaria
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para obtener días desde la fecha (CORREGIDA)
  const getDaysAgo = (dateString) => {
    // ✅ Agregar 'T12:00:00' para evitar problemas de zona horaria
    const date = new Date(dateString + 'T12:00:00');
    const today = new Date();
    // ✅ Comparar solo las fechas, no las horas
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = Math.abs(todayOnly - dateOnly);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ayer';
    if (diffDays === 0) return 'Hoy';
    return `Hace ${diffDays} días`;
  };

  // Estadísticas generales
  const stats = {
    totalDias: historyData.length,
    ultimoEntrenamiento: historyData[0]?.fecha,
    ejerciciosTotal: historyData.reduce((total, day) => total + day.totalEjercicios, 0),
    setsTotal: historyData.reduce((total, day) => total + day.totalSets, 0)
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="h6" ml={2}>Cargando historial...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6">Error al cargar historial</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 2 : 3}>
      {/* Header */}
      <Box mb={3}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold" 
          color="primary"
          mb={1}
        >
          📅 Mi Historial de Entrenamientos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Revisa todos tus entrenamientos realizados con fechas y estadísticas
        </Typography>
      </Box>

      {/* Estadísticas generales */}
      {historyData.length > 0 && (
        <Grid container spacing={2} mb={4}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: '#1976d2', color: 'white' }}>
              <CardContent sx={{ py: 2 }}>
                <CompleteIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">{stats.totalDias}</Typography>
                <Typography variant="body2">Días entrenados</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: '#4caf50', color: 'white' }}>
              <CardContent sx={{ py: 2 }}>
                <WorkoutIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">{stats.ejerciciosTotal}</Typography>
                <Typography variant="body2">Ejercicios</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: '#ff9800', color: 'white' }}>
              <CardContent sx={{ py: 2 }}>
                <ProgressIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">{stats.setsTotal}</Typography>
                <Typography variant="body2">Sets totales</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: '#9c27b0', color: 'white' }}>
              <CardContent sx={{ py: 2 }}>
                <CalendarIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {stats.ultimoEntrenamiento ? getDaysAgo(stats.ultimoEntrenamiento) : 'N/A'}
                </Typography>
                <Typography variant="body2">Último entrenamiento</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Lista de entrenamientos */}
      {historyData.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <WorkoutIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" mb={1}>
              No hay entrenamientos registrados
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comienza a entrenar y registra tus sets para ver tu historial aquí
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {historyData.map((day, index) => (
            <Card 
              key={`${day.id}-${index}`} 
              sx={{ 
                border: '2px solid #f0f0f0',
                '&:hover': { 
                  border: '2px solid #1976d2',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {day.nombre || `Día ${day.dia}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {day.macrociclo} → {day.mesociclo} → {day.microciclo}
                    </Typography>
                  </Box>
                  
                  <Box textAlign="right">
                    <Chip 
                      label={getDaysAgo(day.fecha)}
                      color="primary" 
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(day.fecha)}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip 
                    icon={<WorkoutIcon />}
                    label={`${day.totalEjercicios} ejercicios`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    icon={<ProgressIcon />}
                    label={`${day.totalSets} sets`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    icon={<CompleteIcon />}
                    label="Completado"
                    color="success"
                    size="small"
                  />
                </Box>

                {/* Lista de ejercicios */}
                {day.exercises && day.exercises.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Ejercicios realizados:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {day.exercises.map((exercise, exIndex) => (
                        <Chip 
                          key={exercise.id || exIndex}
                          label={exercise.nombre}
                          size="small"
                          sx={{ 
                            bgcolor: '#e3f2fd', 
                            color: '#1976d2',
                            fontWeight: 'medium',
                            '& .MuiChip-label': {
                              color: '#1976d2'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default TrainingHistory;
