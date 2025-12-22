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
  LinearProgress,
  Chip,
  useMediaQuery,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { financeApi } from '../../api';

const COLORS = {
  green: '#4cceac',
  orange: '#ff9800',
  red: '#ef4444',
  blue: '#6870fa',
  purple: '#a855f7',
  yellow: '#fbbf24',
  textMuted: '#888',
  text: '#e0e0e0',
  card: '#1a1a2e',
  // Colores para macros
  calories: '#ff9800',
  protein: '#ef4444',
  carbs: '#6870fa',
  fat: '#fbbf24',
};

const NutritionWeeklyChart = ({ studentId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Calcular inicio de semana (lunes)
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - daysFromMonday);
        const weekStartStr = monday.toISOString().split('T')[0];
        
        const { data: response } = await financeApi.get(`/nutrition/weekly/${studentId}?weekStart=${weekStartStr}`);
        setData(response);
      } catch (err) {
        console.error('Error fetching nutrition data:', err);
        setError('Error al cargar datos de nutrición');
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

  if (!data?.days) {
    return (
      <Alert severity="info" sx={{ bgcolor: 'rgba(33,150,243,0.1)' }}>
        No hay datos de nutrición disponibles
      </Alert>
    );
  }

  const daysWithData = data.days.filter(d => d.consumed?.calories > 0);
  const hasSomeData = daysWithData.length > 0;

  if (!hasSomeData) {
    return (
      <Alert severity="info" sx={{ bgcolor: 'rgba(33,150,243,0.1)' }}>
        El alumno no ha registrado comidas esta semana
      </Alert>
    );
  }

  // Preparar datos para el gráfico de barras
  const chartData = data.days.map((day) => ({
    name: day.dayName.substring(0, 3),
    Calorías: day.consumed.calories,
    Proteína: day.consumed.protein,
    Carbos: day.consumed.carbs,
    Grasas: day.consumed.fat,
  }));

  // Calcular cumplimiento de objetivos
  const targets = data.targets || { dailyCalories: 2000, protein: 150, carbs: 200, fat: 70 };
  const avgCals = data.weeklyAverages?.calories || 0;
  const avgProtein = data.weeklyAverages?.protein || 0;
  const avgCarbs = data.weeklyAverages?.carbs || 0;
  const avgFat = data.weeklyAverages?.fat || 0;

  const calCompliance = Math.min(100, Math.round((avgCals / targets.dailyCalories) * 100));
  const proteinCompliance = Math.min(100, Math.round((avgProtein / targets.protein) * 100));
  const carbsCompliance = Math.min(100, Math.round((avgCarbs / targets.carbs) * 100));
  const fatCompliance = Math.min(100, Math.round((avgFat / targets.fat) * 100));

  const getComplianceColor = (value) => {
    if (value >= 90) return COLORS.green;
    if (value >= 70) return COLORS.orange;
    return COLORS.red;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: COLORS.card,
            p: 1.5,
            borderRadius: 1,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Typography fontSize={13} fontWeight="bold" color={COLORS.text} mb={0.5}>
            {label}
          </Typography>
          {payload.map((item, idx) => (
            <Typography key={idx} fontSize={11} color={item.color}>
              {item.name}: {item.value}{item.name === 'Calorías' ? ' kcal' : 'g'}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        flexDirection: isMobile ? 'column' : 'row',
        mb: 2, 
        gap: 1 
      }}>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} color={COLORS.text} fontWeight="bold">
          🍽️ Nutrición Semanal
        </Typography>
        <Chip
          label={`${daysWithData.length}/7 días registrados`}
          size="small"
          sx={{
            backgroundColor: daysWithData.length >= 5 ? 'rgba(76,206,172,0.2)' : daysWithData.length >= 3 ? 'rgba(255,152,0,0.2)' : 'rgba(244,67,54,0.2)',
            color: daysWithData.length >= 5 ? COLORS.green : daysWithData.length >= 3 ? COLORS.orange : COLORS.red,
            fontWeight: 600,
            fontSize: isMobile ? 11 : 13,
          }}
        />
      </Box>

      {/* Tabla de cumplimiento */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: 1.5, 
        mb: 2 
      }}>
        {/* Calorías */}
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: 'rgba(255,152,0,0.1)',
          border: '1px solid rgba(255,152,0,0.2)',
        }}>
          <Typography fontSize={11} color={COLORS.textMuted}>Calorías</Typography>
          <Typography fontSize={16} fontWeight="bold" color={COLORS.calories}>
            {avgCals} <span style={{ fontSize: 11, fontWeight: 400 }}>/{targets.dailyCalories}</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={calCompliance}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255,152,0,0.2)',
                '& .MuiLinearProgress-bar': { backgroundColor: COLORS.calories },
              }}
            />
            <Typography fontSize={10} color={getComplianceColor(calCompliance)} fontWeight={600}>
              {calCompliance}%
            </Typography>
          </Box>
        </Box>

        {/* Proteína */}
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
        }}>
          <Typography fontSize={11} color={COLORS.textMuted}>Proteína</Typography>
          <Typography fontSize={16} fontWeight="bold" color={COLORS.protein}>
            {avgProtein}g <span style={{ fontSize: 11, fontWeight: 400 }}>/{targets.protein}g</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={proteinCompliance}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(239,68,68,0.2)',
                '& .MuiLinearProgress-bar': { backgroundColor: COLORS.protein },
              }}
            />
            <Typography fontSize={10} color={getComplianceColor(proteinCompliance)} fontWeight={600}>
              {proteinCompliance}%
            </Typography>
          </Box>
        </Box>

        {/* Carbos */}
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: 'rgba(104,112,250,0.1)',
          border: '1px solid rgba(104,112,250,0.2)',
        }}>
          <Typography fontSize={11} color={COLORS.textMuted}>Carbohidratos</Typography>
          <Typography fontSize={16} fontWeight="bold" color={COLORS.carbs}>
            {avgCarbs}g <span style={{ fontSize: 11, fontWeight: 400 }}>/{targets.carbs}g</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={carbsCompliance}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(104,112,250,0.2)',
                '& .MuiLinearProgress-bar': { backgroundColor: COLORS.carbs },
              }}
            />
            <Typography fontSize={10} color={getComplianceColor(carbsCompliance)} fontWeight={600}>
              {carbsCompliance}%
            </Typography>
          </Box>
        </Box>

        {/* Grasas */}
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.2)',
        }}>
          <Typography fontSize={11} color={COLORS.textMuted}>Grasas</Typography>
          <Typography fontSize={16} fontWeight="bold" color={COLORS.fat}>
            {avgFat}g <span style={{ fontSize: 11, fontWeight: 400 }}>/{targets.fat}g</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={fatCompliance}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(251,191,36,0.2)',
                '& .MuiLinearProgress-bar': { backgroundColor: COLORS.fat },
              }}
            />
            <Typography fontSize={10} color={getComplianceColor(fatCompliance)} fontWeight={600}>
              {fatCompliance}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Gráfico de barras por día */}
      <Box sx={{ height: isMobile ? 160 : 220, mb: 2, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: isMobile ? 5 : 10, left: isMobile ? -25 : -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: COLORS.textMuted, fontSize: isMobile ? 9 : 11 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis 
              yAxisId="cal"
              orientation="left"
              tick={{ fill: COLORS.textMuted, fontSize: isMobile ? 8 : 10 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
              width={isMobile ? 30 : 40}
            />
            <YAxis 
              yAxisId="macro"
              orientation="right"
              tick={{ fill: COLORS.textMuted, fontSize: 10 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickFormatter={(v) => `${v}g`}
              hide={isMobile}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            {!isMobile && (
              <Legend 
                wrapperStyle={{ fontSize: 10, color: COLORS.textMuted }}
                iconSize={8}
              />
            )}
            <ReferenceLine 
              yAxisId="cal"
              y={targets.dailyCalories} 
              stroke={COLORS.orange} 
              strokeDasharray="3 3" 
            />
            <Bar yAxisId="cal" dataKey="Calorías" fill={COLORS.calories} radius={[4, 4, 0, 0]} barSize={isMobile ? 8 : 20} />
            <Bar yAxisId="macro" dataKey="Proteína" fill={COLORS.protein} radius={[4, 4, 0, 0]} barSize={isMobile ? 5 : 12} />
            <Bar yAxisId="macro" dataKey="Carbos" fill={COLORS.carbs} radius={[4, 4, 0, 0]} barSize={isMobile ? 5 : 12} />
            <Bar yAxisId="macro" dataKey="Grasas" fill={COLORS.fat} radius={[4, 4, 0, 0]} barSize={isMobile ? 5 : 12} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Período */}
      <Typography fontSize={11} color={COLORS.textMuted} textAlign="center">
        Semana: {data.weekStart} al {data.weekEnd}
      </Typography>
    </Box>
  );
};

export default NutritionWeeklyChart;

