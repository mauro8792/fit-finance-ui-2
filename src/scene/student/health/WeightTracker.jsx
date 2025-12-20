import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { tokens } from '../../../theme';
import fitFinanceApi from '../../../api/fitFinanceApi';

// Helper para obtener la fecha LOCAL actual (sin problemas de UTC)
const getLocalDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Formatear fecha a DD/MM/AAAA (para mostrar)
const formatDateDisplay = (date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

// Formatear fecha a YYYY-MM-DD para el API (sin UTC, usando fecha local)
const formatDateForApi = (date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Obtener nombre del día
const getDayName = (date) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

// Obtener nombre del mes
const getMonthName = (date) => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[date.getMonth()];
};

// Helper para formatear fecha a DD/MM/YYYY (sin problemas de UTC) - para el historial
const formatDateToDDMMYYYY = (dateInput) => {
  if (!dateInput) return '';
  
  let dateString = dateInput;
  
  // Si es un objeto Date, usar componentes locales
  if (dateInput instanceof Date) {
    const day = String(dateInput.getDate()).padStart(2, '0');
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const year = dateInput.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  // Si viene en formato YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ, parsear directamente
  if (typeof dateString === 'string' && dateString.includes('-')) {
    const datePart = dateString.split('T')[0]; // Tomar solo la parte de fecha si viene con hora
    const [year, month, day] = datePart.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }
  
  // Si ya viene en formato DD/MM/YYYY, devolverlo tal cual
  return dateString;
};

const WeightTracker = ({ studentId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [weightLogs, setWeightLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [formData, setFormData] = useState({
    weight: '',
    notes: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const today = getLocalDate();
  
  // Verificar si la fecha seleccionada es hoy
  const isSelectedToday = selectedDate.getDate() === today.getDate() && 
                          selectedDate.getMonth() === today.getMonth() && 
                          selectedDate.getFullYear() === today.getFullYear();

  // Navegar fecha
  const goToPreviousDay = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1));
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
    if (nextDay <= today) {
      setSelectedDate(nextDay);
    }
  };

  useEffect(() => {
    fetchWeightData();
  }, [studentId]);

  const fetchWeightData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [logsRes, statsRes] = await Promise.all([
        fitFinanceApi.get(`/health/weight/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fitFinanceApi.get(`/health/weight/${studentId}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setWeightLogs(logsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching weight data:', err);
      setError('Error al cargar los datos de peso');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.weight) {
      setError('Por favor ingresa tu peso');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Convertir Date a YYYY-MM-DD para el backend (usando fecha local)
      const dateString = formatDateForApi(selectedDate);
      
      await fitFinanceApi.post(
        `/health/weight/${studentId}`,
        {
          date: dateString,
          weight: parseFloat(formData.weight),
          notes: formData.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Peso registrado exitosamente');
      setFormData({
        weight: '',
        notes: '',
      });
      setSelectedDate(getLocalDate());
      setShowForm(false);
      fetchWeightData();
    } catch (err) {
      console.error('Error saving weight:', err);
      setError('Error al guardar el peso');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
      const token = localStorage.getItem('token');
      await fitFinanceApi.delete(`/health/weight/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Registro eliminado exitosamente');
      fetchWeightData();
    } catch (err) {
      console.error('Error deleting weight:', err);
      setError('Error al eliminar el registro');
    }
  };

  // Preparar datos para el gráfico
  const chartData = [...weightLogs]
    .reverse()
    .map((log) => {
      const dateStr = formatDateToDDMMYYYY(log.date);
      // Para el gráfico, mostrar solo día/mes
      const dateParts = dateStr.split('/');
      return {
        date: `${dateParts[0]}/${dateParts[1]}`,
        dateFull: dateStr, // Para el tooltip completo
        peso: parseFloat(log.weight),
      };
    });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Mensajes */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Estadísticas */}
      {stats && stats.currentWeight && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ backgroundColor: colors.primary[400] }}>
              <CardContent>
                <Typography variant="caption" color={colors.grey[300]}>
                  Peso Actual
                </Typography>
                <Typography variant="h4" fontWeight="bold" color={colors.orangeAccent[500]}>
                  {stats.currentWeight} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ backgroundColor: colors.primary[400] }}>
              <CardContent>
                <Typography variant="caption" color={colors.grey[300]}>
                  Peso Inicial
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.initialWeight} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ backgroundColor: colors.primary[400] }}>
              <CardContent>
                <Typography variant="caption" color={colors.grey[300]}>
                  Cambio Total
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={
                    stats.weightChange > 0
                      ? colors.greenAccent[500]
                      : stats.weightChange < 0
                      ? colors.redAccent[500]
                      : colors.grey[100]
                  }
                >
                  {stats.weightChange > 0 && '+'}
                  {stats.weightChange} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ backgroundColor: colors.primary[400] }}>
              <CardContent>
                <Typography variant="caption" color={colors.grey[300]}>
                  Tendencia 7d
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={
                    stats.weeklyTrend > 0
                      ? colors.greenAccent[500]
                      : stats.weeklyTrend < 0
                      ? colors.redAccent[500]
                      : colors.grey[100]
                  }
                >
                  {stats.weeklyTrend !== null ? (
                    <>
                      {stats.weeklyTrend > 0 && '+'}
                      {stats.weeklyTrend.toFixed(1)} kg
                    </>
                  ) : (
                    'N/A'
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Botón Agregar */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(!showForm)}
          sx={{
            backgroundColor: colors.orangeAccent[500],
            '&:hover': { backgroundColor: colors.orangeAccent[600] },
          }}
        >
          {showForm ? 'Cancelar' : 'Registrar Peso'}
        </Button>
      </Box>

      {/* Formulario */}
      {showForm && (
        <Card sx={{ backgroundColor: colors.primary[400], mb: 3 }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Selector de Fecha con flechas */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color={colors.grey[300]} mb={1}>
                  📅 Fecha
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: colors.primary[500],
                  borderRadius: 2,
                  p: 1,
                  border: `1px solid ${colors.grey[700]}`,
                }}>
                  <IconButton 
                    onClick={goToPreviousDay}
                    sx={{ color: colors.grey[100] }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="h5" fontWeight={700} color={colors.grey[100]}>
                      {formatDateDisplay(selectedDate)}
                    </Typography>
                    <Typography variant="caption" color={colors.grey[400]}>
                      {getDayName(selectedDate)}, {selectedDate.getDate()} de {getMonthName(selectedDate)}
                    </Typography>
                  </Box>
                  
                  <IconButton 
                    onClick={goToNextDay}
                    disabled={isSelectedToday}
                    sx={{ 
                      color: isSelectedToday ? colors.grey[700] : colors.grey[100],
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Peso (kg)"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    inputProps={{ step: '0.1', min: '0' }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Notas (opcional)"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: colors.greenAccent[600],
                      '&:hover': { backgroundColor: colors.greenAccent[700] },
                    }}
                  >
                    Guardar
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Gráfico */}
      {chartData.length > 0 && (
        <Card sx={{ backgroundColor: colors.primary[400], mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Evolución de Peso
            </Typography>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[700]} />
                <XAxis dataKey="date" stroke={colors.grey[300]} />
                <YAxis stroke={colors.grey[300]} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.primary[500],
                    border: `1px solid ${colors.grey[700]}`,
                  }}
                  formatter={(value, name) => [value + ' kg', 'Peso']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0] && payload[0].payload.dateFull) {
                      return `Fecha: ${payload[0].payload.dateFull}`;
                    }
                    return `Fecha: ${label}`;
                  }}
                />
                <ReferenceLine
                  y={stats?.initialWeight}
                  stroke={colors.blueAccent[500]}
                  strokeDasharray="5 5"
                  label={{ value: 'Inicio', fill: colors.blueAccent[500] }}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke={colors.orangeAccent[500]}
                  strokeWidth={3}
                  dot={{ fill: colors.orangeAccent[500], r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      <Card sx={{ backgroundColor: colors.primary[400] }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Historial de Peso
          </Typography>
          {weightLogs.length === 0 ? (
            <Typography color={colors.grey[300]}>
              No hay registros de peso aún. ¡Comienza registrando tu peso hoy!
            </Typography>
          ) : (
            <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
              {weightLogs.map((log) => (
                <Box
                  key={log.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    mb: 1,
                    backgroundColor: colors.primary[500],
                    borderRadius: '8px',
                  }}
                >
                  <Box>
                    <Typography fontWeight="bold">
                      {formatDateToDDMMYYYY(log.date)}
                    </Typography>
                    <Typography variant="h5" color={colors.orangeAccent[500]}>
                      {log.weight} kg
                    </Typography>
                    {log.notes && (
                      <Typography variant="caption" color={colors.grey[300]}>
                        {log.notes}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    onClick={() => handleDelete(log.id)}
                    sx={{ color: colors.redAccent[500] }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default WeightTracker;

