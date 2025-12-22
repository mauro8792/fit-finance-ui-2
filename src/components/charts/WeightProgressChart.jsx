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

const WeightProgressChart = ({ studentId, studentName }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: response } = await financeApi.get(`/health/weight/${studentId}/weekly-stats?weeks=8`);
        setData(response);
      } catch (err) {
        console.error('Error fetching weight stats:', err);
        setError('Error al cargar estadísticas de peso');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} sx={{ color: COLORS.green }} />
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
        No hay datos de peso suficientes para mostrar estadísticas
      </Alert>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.weeks.map((week) => ({
    name: `S${week.weekNumber}`,
    peso: week.averageWeight,
    variation: week.variationGrams,
  }));

  // Calcular dominio Y para mejor visualización
  const weights = data.weeks.map((w) => w.averageWeight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const padding = (maxWeight - minWeight) * 0.2 || 2;

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
          <Typography fontSize={14} color={COLORS.green} fontWeight="bold" mt={0.5}>
            {item.peso} kg (prom.)
          </Typography>
          {weekData?.variationGrams !== null && (
            <Typography 
              fontSize={12} 
              color={weekData.variationGrams < 0 ? COLORS.green : weekData.variationGrams > 0 ? COLORS.red : COLORS.textMuted}
            >
              {weekData.variationGrams > 0 ? '+' : ''}{weekData.variationGrams}g vs anterior
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  const formatVariation = (grams) => {
    if (grams === null || grams === undefined) return '-';
    const sign = grams > 0 ? '+' : '';
    return `${sign}${grams}g`;
  };

  const formatPercent = (percent) => {
    if (percent === null || percent === undefined) return '-';
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent}%`;
  };

  const getVariationColor = (value) => {
    if (value === null || value === undefined || value === 0) return COLORS.textMuted;
    return value < 0 ? COLORS.green : COLORS.red;
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {/* Header con resumen */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        flexDirection: isMobile ? 'column' : 'row',
        mb: 2, 
        gap: 1 
      }}>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} color={COLORS.text} fontWeight="bold">
          ⚖️ Evolución de Peso Semanal
        </Typography>
        
        {data.summary && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography fontSize={isMobile ? 10 : 11} color={COLORS.textMuted}>Actual</Typography>
              <Typography fontSize={isMobile ? 14 : 16} fontWeight="bold" color={COLORS.text}>
                {data.summary.currentWeight}kg
              </Typography>
            </Box>
            {data.summary.totalChange !== null && (
              <Chip
                icon={data.summary.totalChange < 0 ? <TrendingDownIcon /> : <TrendingUpIcon />}
                label={`${data.summary.totalChange > 0 ? '+' : ''}${(data.summary.totalChange / 1000).toFixed(1)}kg total`}
                size="small"
                sx={{
                  backgroundColor: data.summary.totalChange < 0 ? 'rgba(76,206,172,0.2)' : data.summary.totalChange > 0 ? 'rgba(244,67,54,0.2)' : 'rgba(255,255,255,0.1)',
                  color: data.summary.totalChange < 0 ? COLORS.green : data.summary.totalChange > 0 ? COLORS.red : COLORS.text,
                  fontWeight: 600,
                  fontSize: isMobile ? 11 : 13,
                  '& .MuiChip-icon': { 
                    color: data.summary.totalChange < 0 ? COLORS.green : COLORS.red,
                  },
                }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Gráfico de línea */}
      <Box sx={{ height: isMobile ? 150 : 200, mb: 2, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: isMobile ? -25 : -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: COLORS.textMuted, fontSize: isMobile ? 9 : 11 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis 
              domain={[minWeight - padding, maxWeight + padding]}
              tick={{ fill: COLORS.textMuted, fontSize: isMobile ? 8 : 10 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickFormatter={(value) => `${value}kg`}
              width={isMobile ? 35 : 45}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="peso" 
              stroke={COLORS.green} 
              strokeWidth={2}
              dot={{ fill: COLORS.green, strokeWidth: 2, r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6, fill: COLORS.green }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Tabla de semanas (estilo Excel del cliente) */}
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
                Tasa
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ bgcolor: COLORS.card, color: COLORS.textMuted, fontSize: 11, py: 1 }} align="center">
                  Registros
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
                  bgcolor: week.variationGrams < 0 
                    ? 'rgba(76,206,172,0.05)' 
                    : week.variationGrams > 0 
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
                  {week.averageWeight}kg
                </TableCell>
                <TableCell 
                  sx={{ color: getVariationColor(week.variationGrams), fontSize: 12, fontWeight: 600, py: 1 }} 
                  align="right"
                >
                  {formatVariation(week.variationGrams)}
                </TableCell>
                <TableCell 
                  sx={{ color: getVariationColor(week.variationPercent), fontSize: 12, fontWeight: 600, py: 1 }} 
                  align="right"
                >
                  {formatPercent(week.variationPercent)}
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ color: COLORS.textMuted, fontSize: 11, py: 1 }} align="center">
                    {week.recordCount}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Resumen footer */}
      {data.summary?.avgWeeklyChange !== null && (
        <Box sx={{ 
          mt: 2, 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: 'rgba(255,255,255,0.03)',
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize={10} color={COLORS.textMuted}>Prom. semanal</Typography>
            <Typography 
              fontSize={13} 
              fontWeight="bold" 
              color={getVariationColor(data.summary.avgWeeklyChange)}
            >
              {data.summary.avgWeeklyChange > 0 ? '+' : ''}{data.summary.avgWeeklyChange}g
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize={10} color={COLORS.textMuted}>Total semanas</Typography>
            <Typography fontSize={13} fontWeight="bold" color={COLORS.text}>
              {data.summary.totalWeeks}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography fontSize={10} color={COLORS.textMuted}>Registros</Typography>
            <Typography fontSize={13} fontWeight="bold" color={COLORS.text}>
              {data.summary.totalRecords}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WeightProgressChart;

