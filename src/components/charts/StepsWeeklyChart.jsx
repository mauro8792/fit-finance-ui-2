import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Alert,
  IconButton,
  Tooltip,
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
  ReferenceLine,
  Cell,
} from 'recharts';
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

const StepsWeeklyChart = ({ studentId, studentName }) => {
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
      const { data: response } = await financeApi.get(`/cardio/${studentId}/steps-weekly`);
      setData(response);
      setNewGoal(response.dailyGoal?.toString() || '8000');
    } catch (err) {
      console.error('Error fetching steps data:', err);
      setError('Error al cargar datos de pasos');
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
      fetchData(); // Recargar datos
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

  if (!data || !data.stepsByDay) {
    return (
      <Alert severity="info" sx={{ bgcolor: 'rgba(33,150,243,0.1)' }}>
        No hay datos de pasos disponibles
      </Alert>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.stepsByDay.map((day) => ({
    ...day,
    name: day.dayShort,
    fill: day.achieved ? COLORS.green : day.steps > 0 ? COLORS.orange : 'rgba(255,255,255,0.1)',
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
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
            {item.day} ({item.date})
          </Typography>
          <Typography fontSize={12} color={item.achieved ? COLORS.green : COLORS.orange}>
            {item.steps.toLocaleString()} pasos
          </Typography>
          <Typography fontSize={11} color={COLORS.textMuted}>
            Objetivo: {item.goal.toLocaleString()} ({item.percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {/* Header con objetivo editable */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: 1,
        mb: 2 
      }}>
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} color={COLORS.text} fontWeight="bold">
          🚶 Pasos Semanales
        </Typography>
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
              <Typography fontSize={isMobile ? 11 : 13} color={COLORS.textMuted}>
                Objetivo: <strong style={{ color: COLORS.orange }}>{data.dailyGoal?.toLocaleString()}</strong> pasos/día
              </Typography>
              <Tooltip title="Editar objetivo">
                <IconButton size="small" onClick={() => setEditingGoal(true)} sx={{ color: COLORS.textMuted }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      {/* Gráfico de barras */}
      <Box sx={{ height: isMobile ? 150 : 200, mb: 2, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: isMobile ? -25 : -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: COLORS.textMuted, fontSize: isMobile ? 9 : 11 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis 
              tick={{ fill: COLORS.textMuted, fontSize: isMobile ? 8 : 10 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
              width={isMobile ? 30 : 40}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={data.dailyGoal} 
              stroke={COLORS.orange} 
              strokeDasharray="5 5" 
              label={isMobile ? null : { value: 'Meta', fill: COLORS.orange, fontSize: 10, position: 'right' }}
            />
            <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Resumen */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
          gap: 1,
          p: isMobile ? 1.5 : 2,
          borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.03)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontSize={11} color={COLORS.textMuted}>Total</Typography>
          <Typography fontSize={15} fontWeight="bold" color={COLORS.text}>
            {data.totalSteps?.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontSize={11} color={COLORS.textMuted}>Promedio</Typography>
          <Typography fontSize={15} fontWeight="bold" color={COLORS.text}>
            {data.averageSteps?.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontSize={11} color={COLORS.textMuted}>Días ok</Typography>
          <Typography fontSize={15} fontWeight="bold" color={COLORS.green}>
            {data.daysAchieved}/{data.daysWithData}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontSize={11} color={COLORS.textMuted}>Cumplimiento</Typography>
          <Typography 
            fontSize={15} 
            fontWeight="bold" 
            color={data.complianceRate >= 70 ? COLORS.green : data.complianceRate >= 40 ? COLORS.orange : COLORS.red}
          >
            {data.complianceRate}%
          </Typography>
        </Box>
      </Box>

      {/* Período */}
      <Typography fontSize={11} color={COLORS.textMuted} textAlign="center" mt={1}>
        Semana: {data.weekStart} al {data.weekEnd}
      </Typography>
    </Box>
  );
};

export default StepsWeeklyChart;

