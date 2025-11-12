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

// Helper para obtener la fecha de hoy en formato YYYY-MM-DD (sin problemas de UTC)
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper para formatear fecha a DD/MM/YYYY (sin problemas de UTC)
const formatDateToDDMMYYYY = (dateInput) => {
  if (!dateInput) return '';
  
  let dateString = dateInput;
  
  // Si es un objeto Date, convertir a string ISO primero
  if (dateInput instanceof Date) {
    // Usar UTC para evitar problemas de timezone
    const year = dateInput.getUTCFullYear();
    const month = String(dateInput.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateInput.getUTCDate()).padStart(2, '0');
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
  // Helper para obtener la fecha de hoy en formato DD/MM/YYYY
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  // Helper para convertir DD/MM/YYYY a YYYY-MM-DD
  const convertToBackendFormat = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Helper para validar formato DD/MM/YYYY
  const isValidDate = (dateStr) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateStr)) return false;
    const [, day, month, year] = dateStr.match(regex);
    const d = new Date(year, month - 1, day);
    return d.getDate() == day && d.getMonth() == month - 1 && d.getFullYear() == year;
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: getTodayDateString(), // DD/MM/YYYY
    weight: '',
    notes: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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


  const handleDateChange = (e) => {
    let value = e.target.value;
    
    // Remover caracteres no numéricos excepto /
    value = value.replace(/[^\d/]/g, '');
    
    // Aplicar máscara DD/MM/YYYY
    if (value.length <= 2) {
      // Solo día
      setFormData({ ...formData, date: value });
    } else if (value.length <= 5) {
      // Día y mes
      const parts = value.split('/');
      if (parts.length === 1 && value.length === 2) {
        setFormData({ ...formData, date: value + '/' });
      } else if (parts.length === 2) {
        setFormData({ ...formData, date: value });
      }
    } else {
      // Día, mes y año
      const parts = value.split('/');
      if (parts.length === 2 && value.length === 5) {
        setFormData({ ...formData, date: value + '/' });
      } else if (parts.length === 3) {
        // Limitar año a 4 dígitos
        const [day, month, year] = parts;
        const limitedYear = year.substring(0, 4);
        setFormData({ ...formData, date: `${day}/${month}/${limitedYear}` });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.weight) {
      setError('Por favor ingresa tu peso');
      return;
    }

    if (!isValidDate(formData.date)) {
      setError('Por favor ingresa una fecha válida en formato DD/MM/YYYY');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Convertir DD/MM/YYYY a YYYY-MM-DD para el backend
      const dateString = convertToBackendFormat(formData.date);
      
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
              date: getTodayDateString(),
              weight: '',
              notes: '',
            });
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
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Fecha"
                    value={formData.date}
                    onChange={handleDateChange}
                    placeholder="DD/MM/YYYY"
                    helperText="Formato: DD/MM/YYYY (ej: 16/11/2025)"
                    required
                    inputProps={{
                      maxLength: 10,
                    }}
                  />
                </Grid>
                  <Grid item xs={12} sm={4}>
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
                  <Grid item xs={12} sm={4}>
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

