import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useMediaQuery,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { financeApi } from '../../api';

const COLORS = {
  green: '#4cceac',
  orange: '#ff9800',
  red: '#f44336',
  blue: '#6870fa',
  textMuted: '#888',
  text: '#e0e0e0',
  card: '#1a1a2e',
};

const StepsProgressChart = ({ studentId, studentName }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: response } = await financeApi.get(`/cardio/${studentId}/steps-weekly-stats?weeks=8`);
      setData(response);
      setNewGoal(response.dailyGoal?.toString() || '8000');
    } catch (err) {
      console.error('Error fetching steps stats:', err);
      setError('Error al cargar estadísticas de pasos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  const handleSaveGoal = async () => {
    try {
      setSavingGoal(true);
      await financeApi.put(`/cardio/${studentId}/steps-goal`, {
        dailyStepsGoal: parseInt(newGoal),
      });
      setEditingGoal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving goal:', err);
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} sx={{ color: COLORS.orange }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ bgcolor: 'rgba(244,67,54,0.1)' }}>
        {error}
      </Alert>
    );
  }

  if (!data?.hasData) {
    return (
      <Alert severity="info" sx={{ bgcolor: 'rgba(33,150,243,0.1)' }}>
        No hay datos de pasos suficientes para mostrar estadísticas
      </Alert>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.weeks.map((week) => ({
    name: `S${week.weekNumber}`,
    pasos: week.averageSteps,
    variation: week.variationSteps,
  }));

  // Calcular dominio Y para mejor visualización
  const steps = data.weeks.map((w) => w.averageSteps);
  const minSteps = Math.min(...steps);
  const maxSteps = Math.max(...steps);
  const padding = (maxSteps - minSteps) * 0.2 || 1000;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const weekData = data.weeks.find((w) => `S${w.weekNumber}` === item.name);
      return (
        <Box
          sx={{
            bgcolor: COLORS.card,
            p: 1.5,
            borderRadius: 1,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Typography fontSize={13} fontWeight="bold" color={COLORS.text}>
            Semana {weekData?.weekNumber}
          </Typography>
          <Typography fontSize={11} color={COLORS.textMuted}>
            {weekData?.weekStart} - {weekData?.weekEnd}
          </Typography>
          <Typography fontSize={14} color={COLORS.orange} fontWeight="bold" mt={0.5}>
            {item.pasos?.toLocaleString()} pasos/día (prom.)
          </Typography>
          <Typography fontSize={12} color={COLORS.textMuted}>
            Total: {weekData?.totalSteps?.toLocaleString()} | Días: {weekData?.daysWithData}
          </Typography>
          {weekData?.variationSteps !== null && (
            <Typography 
              fontSize={12} 
              color={weekData.variationSteps > 0 ? COLORS.green : weekData.variationSteps < 0 ? COLORS.red : COLORS.textMuted}
            >
              {weekData.variationSteps > 0 ? '+' : ''}{weekData.variationSteps?.toLocaleString()} vs anterior
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  const formatVariation = (steps) => {
    if (steps === null || steps === undefined) return '-';
    const sign = steps > 0 ? '+' : '';
    return `${sign}${steps?.toLocaleString()}`;
  };

  const formatPercent = (percent) => {
    if (percent === null || percent === undefined) return '-';
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent}%`;
  };

  const getVariationColor = (value) => {
    if (value === null || value === undefined || value === 0) return COLORS.textMuted;
    // Para pasos: subir es bueno (verde), bajar es malo (rojo) - opuesto al peso
    return value > 0 ? COLORS.green : COLORS.red;
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {/* Header con resumen y objetivo editable */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        flexDirection: isMobile ? 'column' : 'row',
        mb: 2, 
        gap: 1 
      }}>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} color={COLORS.text} fontWeight="bold">
          🚶 Evolución de Pasos Semanal
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Objetivo editable */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingGoal ? (
              <>
                <TextField
                  size="small"
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  sx={{
                    width: 100,
                    '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  }}
                />
                <IconButton 
                  size="small" 
                  onClick={handleSaveGoal} 
                  disabled={savingGoal}
                  sx={{ color: COLORS.green }}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <Typography fontSize={isMobile ? 10 : 11} color={COLORS.textMuted}>
                  Meta: <strong style={{ color: COLORS.orange }}>{data.dailyGoal?.toLocaleString()}</strong>/día
                </Typography>
                <Tooltip title="Editar objetivo">
                  <IconButton size="small" onClick={() => setEditingGoal(true)} sx={{ color: COLORS.textMuted }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>

          {data.summary && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={isMobile ? 10 : 11} color={COLORS.textMuted}>Actual</Typography>
                <Typography fontSize={isMobile ? 14 : 16} fontWeight="bold" color={COLORS.text}>
                  {data.summary.currentAverage?.toLocaleString()}
                </Typography>
              </Box>
              {data.summary.totalChange !== null && (
                <Chip
                  icon={data.summary.totalChange > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`${data.summary.totalChange > 0 ? '+' : ''}${data.summary.totalChange?.toLocaleString()} total`}
                  size="small"
                  sx={{
                    backgroundColor: data.summary.totalChange > 0 ? 'rgba(76,206,172,0.2)' : data.summary.totalChange < 0 ? 'rgba(244,67,54,0.2)' : 'rgba(255,255,255,0.1)',
                    color: data.summary.totalChange > 0 ? COLORS.green : data.summary.totalChange < 0 ? COLORS.red : COLORS.text,
                    fontWeight: 600,
                    fontSize: isMobile ? 11 : 13,
                    '& .MuiChip-icon': { 
                      color: data.summary.totalChange > 0 ? COLORS.green : COLORS.red,
                    },
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Gráfico de línea */}
      <Box sx={{ height: isMobile ? 150 : 200, mb: 2, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: isMobile ? -15 : -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: COLORS.textMuted, fontSize: isMobile ? 9 : 11 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis 
              domain={[Math.max(0, minSteps - padding), maxSteps + padding]}
              tick={{ fill: COLORS.textMuted, fontSize: isMobile ? 8 : 10 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
              width={isMobile ? 35 : 45}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={data.dailyGoal} 
              stroke={COLORS.orange} 
              strokeDasharray="5 5" 
              label={isMobile ? null : { value: 'Meta', fill: COLORS.orange, fontSize: 10, position: 'right' }}
            />
            <Line 
              type="monotone" 
              dataKey="pasos" 
              stroke={COLORS.orange} 
              strokeWidth={2}
              dot={{ fill: COLORS.orange, strokeWidth: 2, r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6, fill: COLORS.orange }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Tabla de semanas */}
      <TableContainer sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: COLORS.card, color: COLORS.textMuted, fontSize: 11, py: 1 }}>
                Semana
              </TableCell>
              <TableCell sx={{ bgcolor: COLORS.card, color: COLORS.textMuted, fontSize: 11, py: 1 }} align="right">
                Promedio
              </TableCell>
              <TableCell sx={{ bgcolor: COLORS.card, color: COLORS.textMuted, fontSize: 11, py: 1 }} align="right">
                Variación
              </TableCell>
              <TableCell sx={{ bgcolor: COLORS.card, color: COLORS.textMuted, fontSize: 11, py: 1 }} align="right">
                Cumplim.
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ bgcolor: COLORS.card, color: COLORS.textMuted, fontSize: 11, py: 1 }} align="center">
                  Días
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.weeks.map((week) => (
              <TableRow 
                key={week.weekNumber}
                sx={{ 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                  bgcolor: week.variationSteps > 0 
                    ? 'rgba(76,206,172,0.05)' 
                    : week.variationSteps < 0 
                    ? 'rgba(244,67,54,0.05)' 
                    : 'transparent',
                }}
              >
                <TableCell sx={{ color: COLORS.text, fontSize: 12, py: 1 }}>
                  <Box>
                    <Typography fontSize={12} fontWeight={600}>S{week.weekNumber}</Typography>
                    <Typography fontSize={10} color={COLORS.textMuted}>
                      {week.weekStart?.slice(5)} - {week.weekEnd?.slice(5)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: COLORS.text, fontSize: 13, fontWeight: 600, py: 1 }} align="right">
                  {week.averageSteps?.toLocaleString()}
                </TableCell>
                <TableCell 
                  sx={{ color: getVariationColor(week.variationSteps), fontSize: 12, fontWeight: 600, py: 1 }} 
                  align="right"
                >
                  {formatVariation(week.variationSteps)}
                </TableCell>
                <TableCell 
                  sx={{ 
                    color: week.complianceRate >= 70 ? COLORS.green : week.complianceRate >= 40 ? COLORS.orange : COLORS.red, 
                    fontSize: 12, 
                    fontWeight: 600, 
                    py: 1 
                  }} 
                  align="right"
                >
                  {week.complianceRate}%
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ color: COLORS.textMuted, fontSize: 11, py: 1 }} align="center">
                    {week.daysAchieved}/{week.daysWithData}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Resumen footer */}
      {data.summary && (
        <Box sx={{ 
          mt: 2, 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: 'rgba(255,255,255,0.03)',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 1,
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize={10} color={COLORS.textMuted}>Prom. semanal</Typography>
            <Typography 
              fontSize={13} 
              fontWeight="bold" 
              color={getVariationColor(data.summary.avgWeeklyChange)}
            >
              {data.summary.avgWeeklyChange > 0 ? '+' : ''}{data.summary.avgWeeklyChange?.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize={10} color={COLORS.textMuted}>Total pasos</Typography>
            <Typography fontSize={13} fontWeight="bold" color={COLORS.text}>
              {data.summary.totalSteps?.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize={10} color={COLORS.textMuted}>Cumplimiento</Typography>
            <Typography 
              fontSize={13} 
              fontWeight="bold" 
              color={data.summary.overallComplianceRate >= 70 ? COLORS.green : data.summary.overallComplianceRate >= 40 ? COLORS.orange : COLORS.red}
            >
              {data.summary.overallComplianceRate}%
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize={10} color={COLORS.textMuted}>Semanas</Typography>
            <Typography fontSize={13} fontWeight="bold" color={COLORS.text}>
              {data.summary.totalWeeks}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StepsProgressChart;

