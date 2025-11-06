import { useState, useEffect, useMemo } from 'react';
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
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  FitnessCenter as WorkoutIcon,
  DateRange as CalendarIcon,
  TrendingUp as ProgressIcon,
  CheckCircle as CompleteIcon,
  ShowChart as ChartIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useAuthStore } from '../../hooks';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrainingHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [viewMode, setViewMode] = useState(0); // 0 = Progreso, 1 = Lista
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleItems, setVisibleItems] = useState(5); // Para "cargar más"
  const { student } = useAuthStore();
  const isMobile = useMediaQuery('(max-width:768px)');

  // Debug: log cuando cambia selectedExercise
  useEffect(() => {
    console.log('🔄 selectedExercise cambió a:', selectedExercise);
  }, [selectedExercise]);

  // Fetch historial de entrenamientos
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const token = localStorage.getItem('token');
        
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
          const mesosResponse = await fetch(`${apiUrl}/mesocycle/macrocycle/${macro.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (mesosResponse.ok) {
            const mesos = await mesosResponse.json();
            
            for (const meso of mesos) {
              const microsResponse = await fetch(`${apiUrl}/microcycle/mesocycle/${meso.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (microsResponse.ok) {
                const micros = await microsResponse.json();
                
                for (const micro of micros) {
                  // Filtrar días que tienen fecha (fueron entrenados)
                  const diasEntrenados = micro.days
                    .filter(day => day.fecha && !day.esDescanso)
                    .map(day => {
                      const exercises = day.exercises || [];
                      return {
                        ...day,
                        exercises: exercises,
                        macrociclo: macro.nombre,
                        mesociclo: meso.nombre,
                        microciclo: micro.name,
                        totalEjercicios: exercises.length,
                        totalSets: exercises.reduce((total, ex) => {
                          const sets = ex.sets || [];
                          return total + sets.length;
                        }, 0)
                      };
                    });
                  
                  historialCompleto.push(...diasEntrenados);
                }
              }
            }
          }
        }
        
        // Ordenar por fecha (más reciente primero)
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

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para obtener días desde la fecha
  const getDaysAgo = (dateString) => {
    const date = new Date(dateString + 'T12:00:00');
    const today = new Date();
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = Math.abs(todayOnly - dateOnly);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ayer';
    if (diffDays === 0) return 'Hoy';
    return `Hace ${diffDays} días`;
  };

  // Extraer todos los ejercicios únicos con sus datos de progreso
  const exerciseProgress = useMemo(() => {
    const exerciseMap = new Map();
    
    historyData.forEach(day => {
      if (!day.exercises) return;
      
      day.exercises.forEach(exercise => {
        // Obtener nombre desde el catálogo
        const exerciseName = exercise.exerciseCatalog?.name || exercise.nombre || exercise.name;
        if (!exerciseName) return;
        
        const sets = exercise.sets || [];
        const validSets = sets.filter(s => s && (s.load || 0) > 0);
        
        if (validSets.length > 0) {
          if (!exerciseMap.has(exerciseName)) {
            exerciseMap.set(exerciseName, []);
          }
          
          const maxLoad = Math.max(...validSets.map(s => s.load || 0));
          const avgLoad = validSets.reduce((sum, s) => sum + (s.load || 0), 0) / validSets.length;
          const maxReps = Math.max(...validSets.map(s => s.reps || 0));
          const totalVolume = validSets.reduce((sum, s) => sum + ((s.load || 0) * (s.reps || 0)), 0);
          const avgRir = validSets.some(s => (s.actualRir || 0) > 0)
            ? validSets.filter(s => (s.actualRir || 0) > 0).reduce((sum, s) => sum + (s.actualRir || 0), 0) / validSets.filter(s => (s.actualRir || 0) > 0).length
            : null;
          
          exerciseMap.get(exerciseName).push({
            fecha: day.fecha,
            dia: day.nombre || `Día ${day.dia}`,
            microciclo: day.microciclo,
            maxLoad,
            avgLoad,
            maxReps,
            totalVolume,
            avgRir,
            sets: validSets.length,
            dateObj: new Date(day.fecha + 'T12:00:00')
          });
        }
      });
    });
    
    // Ordenar cada ejercicio por fecha
    exerciseMap.forEach((sessions) => {
      sessions.sort((a, b) => a.dateObj - b.dateObj);
    });
    
    console.log('✅ Ejercicios procesados:', Array.from(exerciseMap.keys()));
    return exerciseMap;
  }, [historyData]);

  // Obtener lista de ejercicios únicos
  const uniqueExercises = useMemo(() => {
    const exercises = Array.from(exerciseProgress.keys()).sort();
    console.log('📋 uniqueExercises:', exercises);
    return exercises;
  }, [exerciseProgress]);

  // Filtrar ejercicios según término de búsqueda
  const filteredExercises = useMemo(() => {
    if (!searchTerm.trim()) return uniqueExercises;
    return uniqueExercises.filter(exercise => 
      exercise.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueExercises, searchTerm]);

  // Historial visible con "cargar más"
  const visibleHistory = useMemo(() => {
    return historyData.slice(0, visibleItems);
  }, [historyData, visibleItems]);

  const hasMore = visibleItems < historyData.length;

  // Datos del ejercicio seleccionado
  const selectedExerciseData = useMemo(() => {
    if (!selectedExercise || !exerciseProgress.has(selectedExercise)) {
      return [];
    }
    return exerciseProgress.get(selectedExercise) || [];
  }, [selectedExercise, exerciseProgress]);

  // Calcular estadísticas de progreso del ejercicio seleccionado
  const progressStats = useMemo(() => {
    if (!selectedExerciseData || selectedExerciseData.length === 0) {
      return null;
    }
    
    const firstSession = selectedExerciseData[0];
    const lastSession = selectedExerciseData[selectedExerciseData.length - 1];
    const bestSession = selectedExerciseData.reduce((best, current) => 
      (current.totalVolume || 0) > (best.totalVolume || 0) ? current : best
    );
    
    const loadImprovement = (lastSession.maxLoad || 0) - (firstSession.maxLoad || 0);
    const loadImprovementPercent = (firstSession.maxLoad || 0) > 0 
      ? ((loadImprovement / firstSession.maxLoad) * 100).toFixed(1)
      : '0.0';
    
    const volumeImprovement = (lastSession.totalVolume || 0) - (firstSession.totalVolume || 0);
    const volumeImprovementPercent = (firstSession.totalVolume || 0) > 0
      ? ((volumeImprovement / firstSession.totalVolume) * 100).toFixed(1)
      : '0.0';
    
    return {
      firstSession,
      lastSession,
      bestSession,
      loadImprovement,
      loadImprovementPercent,
      volumeImprovement,
      volumeImprovementPercent,
      totalSessions: selectedExerciseData.length
    };
  }, [selectedExerciseData]);

  // Estadísticas generales
  const stats = {
    totalDias: historyData.length,
    ultimoEntrenamiento: historyData[0]?.fecha,
    ejerciciosTotal: historyData.reduce((total, day) => total + day.totalEjercicios, 0),
    setsTotal: historyData.reduce((total, day) => total + day.totalSets, 0)
  };

  // Componente para gráfico con Chart.js (mucho más profesional y animado)
  const ProgressChart = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No hay datos suficientes para mostrar el gráfico
          </Typography>
        </Box>
      );
    }
    
    const chartData = {
      labels: data.map((session, index) => {
        // Extraer nombre del día (ej: "Día 3")
        const dayName = session.dia || `Día ${index + 1}`;
        // Extraer número de microciclo (ej: "Microciclo 1" -> "M1")
        const microMatch = session.microciclo?.match(/\d+/);
        const microNum = microMatch ? `M${microMatch[0]}` : '';
        return microNum ? `${dayName} - ${microNum}` : dayName;
      }),
      datasets: [
        {
          label: 'Volumen Total (kg)',
          data: data.map(session => session.totalVolume),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4caf50',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 9,
          pointHoverBackgroundColor: '#388e3c',
          pointHoverBorderWidth: 3,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: isMobile ? 1.2 : 2,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#fff',
            font: {
              size: 12,
              weight: 'bold'
            },
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#2196f3',
          borderWidth: 2,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const sessionData = data[context.dataIndex];
              return `Volumen: ${context.parsed.y.toFixed(0)} kg`;
            },
            afterLabel: function(context) {
              const sessionData = data[context.dataIndex];
              return [
                `Carga máx: ${sessionData.maxLoad} kg`,
                `Sets: ${sessionData.totalSets}`,
                `Reps máx: ${sessionData.maxReps}`,
                `Día: ${sessionData.dia}`,
                `Microciclo: ${sessionData.microciclo}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false,
          },
          ticks: {
            color: '#999',
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false,
          },
          ticks: {
            color: '#999',
            font: {
              size: 11
            },
            callback: function(value) {
              return value + ' kg';
            }
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart'
      }
    };

    return <Line data={chartData} options={options} />;
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
          {viewMode === 0 
            ? 'Analiza tu progreso por ejercicio con gráficos y estadísticas detalladas'
            : 'Revisa todos tus entrenamientos realizados con fechas y estadísticas'
          }
        </Typography>
      </Box>

      {/* Tabs para cambiar vista */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)}>
          <Tab icon={<ChartIcon />} iconPosition="start" label="Progreso por Ejercicio" />
          <Tab icon={<CalendarIcon />} iconPosition="start" label="Lista de Entrenamientos" />
        </Tabs>
      </Box>

      {/* Contenido según vista */}
      {viewMode === 0 ? (
        // VISTA DE PROGRESO
        <>
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
                    <Typography variant="h5" fontWeight="bold">{uniqueExercises.length}</Typography>
                    <Typography variant="body2">Ejercicios únicos</Typography>
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

          {/* Selector de ejercicio - Botón simple */}
          {uniqueExercises.length > 0 && (
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Typography variant="body2" color="white" mb={2} textAlign="center">
                  {selectedExercise ? 'Ejercicio seleccionado:' : 'Selecciona un ejercicio'}
                    </Typography>
                    
                <Button
                  variant="contained"
                      fullWidth
                  size="large"
                  onClick={() => setOpenDialog(true)}
                  sx={{
                    bgcolor: 'white',
                    color: '#667eea',
                    fontWeight: 'bold',
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.2s'
                  }}
                  startIcon={<ChartIcon />}
                >
                  {selectedExercise || 'Elegir Ejercicio'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Modal simple para seleccionar ejercicio */}
          {openDialog && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '500px',
                height: '80vh',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Header */}
                <div style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0
                }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>📊 Selecciona un Ejercicio</h3>
                  <button 
                    onClick={() => {
                      setOpenDialog(false);
                      setSearchTerm('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      fontSize: '24px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '30px',
                      height: '30px'
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Buscador */}
                <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
                  <input
                    type="text"
                      placeholder="Buscar ejercicio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                    {filteredExercises?.length || 0} ejercicios disponibles
                  </p>
                </div>

                {/* Lista de ejercicios */}
                <div style={{
                  flex: '1 1 0',
                  overflowY: 'scroll',
                  backgroundColor: 'white',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  {(() => {
                    console.log('📋 Renderizando lista, filteredExercises:', filteredExercises);
                    console.log('📋 Tipo:', typeof filteredExercises, 'Es array?', Array.isArray(filteredExercises));
                    console.log('📋 Longitud:', filteredExercises?.length);
                    
                    if (!filteredExercises || filteredExercises.length === 0) {
                      return (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                          <p style={{ color: '#999', margin: 0 }}>
                            {searchTerm ? 'No se encontraron ejercicios' : 'No hay ejercicios disponibles'}
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <div style={{ width: '100%' }}>
                        {filteredExercises.map((exercise, index) => {
                          console.log(`Renderizando ejercicio ${index}:`, exercise);
                          return (
                            <div
                              key={`exercise-${index}-${exercise}`}
                              onClick={() => {
                                console.log('✅ Seleccionado:', exercise);
                                setSelectedExercise(exercise);
                                setOpenDialog(false);
                                setSearchTerm('');
                              }}
                              onMouseEnter={(e) => {
                                if (selectedExercise !== exercise) {
                                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedExercise !== exercise) {
                                  e.currentTarget.style.backgroundColor = 'white';
                                }
                              }}
                              style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid #e0e0e0',
                                cursor: 'pointer',
                                backgroundColor: selectedExercise === exercise ? '#e3f2fd' : 'white',
                                color: selectedExercise === exercise ? '#1976d2' : '#333',
                                fontSize: '16px',
                                fontWeight: selectedExercise === exercise ? 'bold' : 'normal',
                                minHeight: '50px',
                                display: 'block',
                                width: '100%',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {selectedExercise === exercise && '✓ '}{exercise}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Análisis de progreso del ejercicio seleccionado */}
          {selectedExercise && selectedExerciseData.length > 0 && progressStats && (
            <Stack spacing={3}>
              {/* Estadísticas de progreso */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Mejora de Volumen
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="#4caf50">
                        {progressStats.volumeImprovement > 0 ? '+' : ''}{progressStats.volumeImprovement.toFixed(0)} kg
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({progressStats.volumeImprovementPercent}%)
                      </Typography>
                      <Typography variant="body2" mt={1}>
                        <strong>Primera sesión:</strong> {progressStats.firstSession.totalVolume.toFixed(0)} kg
                      </Typography>
                      <Typography variant="body2">
                        <strong>Última sesión:</strong> {progressStats.lastSession.totalVolume.toFixed(0)} kg
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Card sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', border: '1px solid #ff9800' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Mejor Sesión (Mayor Volumen)
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="#ff9800">
                        {progressStats.bestSession.totalVolume.toFixed(0)} kg
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {progressStats.bestSession.dia} - {progressStats.bestSession.microciclo}
                      </Typography>
                      <Typography variant="body2" mt={1}>
                        <strong>Carga máx:</strong> {progressStats.bestSession.maxLoad} kg
                      </Typography>
                      <Typography variant="body2">
                        <strong>Reps máx:</strong> {progressStats.bestSession.maxReps}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Card sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)', border: '1px solid #9c27b0' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Total Sesiones
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                        {progressStats.totalSessions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sesiones registradas
                      </Typography>
                      <Typography variant="body2" mt={1}>
                        <strong>Promedio volumen:</strong> {(selectedExerciseData.reduce((sum, s) => sum + s.totalVolume, 0) / selectedExerciseData.length).toFixed(0)} kg
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Gráfico de progreso */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    📈 Evolución de Volumen (Tonelaje)
                  </Typography>
                  <Box sx={{ p: isMobile ? 1 : 2 }}>
                    <ProgressChart data={selectedExerciseData} />
                  </Box>
                </CardContent>
              </Card>

              {/* Tabla detallada */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    📊 Detalle de Sesiones
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Fecha</strong></TableCell>
                          <TableCell><strong>Día</strong></TableCell>
                          <TableCell><strong>Microciclo</strong></TableCell>
                          <TableCell align="right"><strong>Carga Máx</strong></TableCell>
                          <TableCell align="right"><strong>Carga Prom</strong></TableCell>
                          <TableCell align="right"><strong>Reps Máx</strong></TableCell>
                          <TableCell align="right"><strong>Volumen</strong></TableCell>
                          <TableCell align="right"><strong>Sets</strong></TableCell>
                          {selectedExerciseData.some(d => d.avgRir !== null) && (
                            <TableCell align="right"><strong>RIR Prom</strong></TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedExerciseData.map((session, index) => (
                          <TableRow 
                            key={index}
                            sx={{ 
                              '&:nth-of-type(odd)': { bgcolor: 'rgba(0,0,0,0.02)' },
                              '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' }
                            }}
                          >
                            <TableCell>
                              {new Date(session.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </TableCell>
                            <TableCell>{session.dia}</TableCell>
                            <TableCell>{session.microciclo}</TableCell>
                            <TableCell align="right"><strong>{session.maxLoad}</strong> kg</TableCell>
                            <TableCell align="right">{Math.round(session.avgLoad)} kg</TableCell>
                            <TableCell align="right">{session.maxReps}</TableCell>
                            <TableCell align="right">{Math.round(session.totalVolume)} kg</TableCell>
                            <TableCell align="right">{session.sets}</TableCell>
                            {selectedExerciseData.some(d => d.avgRir !== null) && (
                              <TableCell align="right">
                                {session.avgRir !== null ? session.avgRir.toFixed(1) : '-'}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Stack>
          )}

          {selectedExercise && selectedExerciseData.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" mb={1}>
                  ⚠️ No hay datos suficientes para este ejercicio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Este ejercicio no tiene sets registrados con carga.
                </Typography>
              </CardContent>
            </Card>
          )}

          {!selectedExercise && uniqueExercises.length > 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <ChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" mb={1}>
                  Selecciona un ejercicio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Elige un ejercicio del menú superior para ver su progreso detallado
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        // VISTA DE LISTA
        <>
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
              {visibleHistory.map((day, index) => (
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
                              label={exercise.exerciseCatalog?.name || exercise.nombre || 'Ejercicio'}
                              size="small"
                              sx={{ 
                                bgcolor: '#e3f2fd', 
                                color: '#1976d2',
                                fontWeight: 'medium'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Botón Cargar Más */}
              {hasMore && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setVisibleItems(prev => prev + 5)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    Ver Más Entrenamientos ({historyData.length - visibleItems} restantes)
                  </Button>
                </Box>
              )}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
};

export default TrainingHistory;
