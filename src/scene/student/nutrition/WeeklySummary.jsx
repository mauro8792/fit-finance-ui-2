import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TodayIcon from '@mui/icons-material/Today';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { tokens } from '../../../theme';
import { getWeeklySummary } from '../../../api/nutritionApi';

const WeeklySummary = ({ studentId, profile }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return monday.toISOString().split('T')[0];
  });

  useEffect(() => {
    loadSummary();
  }, [studentId, weekStart]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await getWeeklySummary(studentId, weekStart);
      setSummary(data);
    } catch (error) {
      console.error('Error loading weekly summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeWeek = (weeks) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + weeks * 7);
    setWeekStart(date.toISOString().split('T')[0]);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    setWeekStart(monday.toISOString().split('T')[0]);
  };

  const formatWeekRange = () => {
    if (!summary) return '';
    const start = new Date(summary.weekStart + 'T00:00:00');
    const end = new Date(summary.weekEnd + 'T00:00:00');
    return `${start.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`;
  };

  const getProgressColor = (value, target) => {
    if (!target) return colors.grey[400];
    const percentage = (value / target) * 100;
    if (percentage < 70) return colors.redAccent[400];
    if (percentage > 110) return colors.redAccent[400];
    if (percentage >= 90 && percentage <= 110) return colors.greenAccent[400];
    return colors.orangeAccent[400];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const targets = summary?.targets || profile || {};

  return (
    <Box>
      {/* Selector de semana */}
      <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => changeWeek(-1)} sx={{ color: colors.grey[300] }}>
          <NavigateBeforeIcon />
        </IconButton>
        <Box textAlign="center">
          <Typography variant="h5" fontWeight="bold" color={colors.grey[100]}>
            {formatWeekRange()}
          </Typography>
          <Typography variant="caption" color={colors.grey[400]}>
            Semana del {weekStart}
          </Typography>
        </Box>
        <IconButton onClick={() => changeWeek(1)} sx={{ color: colors.grey[300] }}>
          <NavigateNextIcon />
        </IconButton>
        <IconButton onClick={goToCurrentWeek} sx={{ color: colors.orangeAccent[400] }}>
          <TodayIcon />
        </IconButton>
      </Box>

      {/* Resumen semanal */}
      <Card sx={{ backgroundColor: colors.primary[600], mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} mb={2}>
            📊 Totales de la semana
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={3} justifyContent="center">
            <Box textAlign="center">
              <Typography variant="h4" color={colors.greenAccent[400]} fontWeight="bold">
                {Math.round(summary?.weeklyTotals?.calories || 0)}
              </Typography>
              <Typography variant="caption" color={colors.grey[400]}>
                Kcal totales
              </Typography>
              {targets.weeklyCalories && (
                <Typography variant="body2" color={colors.grey[300]}>
                  / {targets.weeklyCalories}
                </Typography>
              )}
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color={colors.redAccent[400]} fontWeight="bold">
                {Math.round(summary?.weeklyTotals?.protein || 0)}g
              </Typography>
              <Typography variant="caption" color={colors.grey[400]}>
                Proteínas 🥩
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color={colors.blueAccent[400]} fontWeight="bold">
                {Math.round(summary?.weeklyTotals?.carbs || 0)}g
              </Typography>
              <Typography variant="caption" color={colors.grey[400]}>
                Hidratos 💧
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color={colors.orangeAccent[400]} fontWeight="bold">
                {Math.round(summary?.weeklyTotals?.fat || 0)}g
              </Typography>
              <Typography variant="caption" color={colors.grey[400]}>
                Grasas 🧈
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Promedios diarios */}
      <Card sx={{ backgroundColor: colors.primary[600], mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} mb={2}>
            📈 Promedio diario
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={3} justifyContent="center">
            <Box textAlign="center">
              <Typography 
                variant="h4" 
                fontWeight="bold"
                color={getProgressColor(
                  summary?.weeklyAverages?.calories, 
                  targets.dailyCalories || targets.targetDailyCalories
                )}
              >
                {Math.round(summary?.weeklyAverages?.calories || 0)}
              </Typography>
              <Typography variant="caption" color={colors.grey[400]}>
                Kcal/día
              </Typography>
              {(targets.dailyCalories || targets.targetDailyCalories) && (
                <Typography variant="body2" color={colors.grey[300]}>
                  objetivo: {targets.dailyCalories || targets.targetDailyCalories}
                </Typography>
              )}
            </Box>
            <Box textAlign="center">
              <Typography 
                variant="h4" 
                fontWeight="bold"
                color={getProgressColor(
                  summary?.weeklyAverages?.protein, 
                  targets.protein || targets.targetProteinGrams
                )}
              >
                {Math.round(summary?.weeklyAverages?.protein || 0)}g
              </Typography>
              <Typography variant="caption" color={colors.grey[400]}>
                Proteínas/día
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography 
                variant="h4" 
                fontWeight="bold"
                color={getProgressColor(
                  summary?.weeklyAverages?.carbs, 
                  targets.carbs || targets.targetCarbsGrams
                )}
              >
                {Math.round(summary?.weeklyAverages?.carbs || 0)}g
              </Typography>
              <Typography variant="caption" color={colors.grey[400]}>
                Hidratos/día
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography 
                variant="h4" 
                fontWeight="bold"
                color={getProgressColor(
                  summary?.weeklyAverages?.fat, 
                  targets.fat || targets.targetFatGrams
                )}
              >
                {Math.round(summary?.weeklyAverages?.fat || 0)}g
              </Typography>
              <Typography variant="caption" color={colors.grey[400]}>
                Grasas/día
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Gráfico de Calorías por día */}
      <Card sx={{ backgroundColor: colors.primary[600], mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} mb={2}>
            📊 Calorías por día
          </Typography>
          
          <Box sx={{ width: '100%', height: isMobile ? 200 : 280 }}>
            <ResponsiveContainer>
              <BarChart
                data={summary?.days?.map(day => ({
                  name: day.dayName?.substring(0, 3) || day.date?.substring(8, 10),
                  calorias: Math.round(day.consumed?.calories || 0),
                  objetivo: targets.dailyCalories || targets.targetDailyCalories || 0,
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[700]} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: colors.grey[400], fontSize: 11 }}
                  axisLine={{ stroke: colors.grey[600] }}
                />
                <YAxis 
                  tick={{ fill: colors.grey[400], fontSize: 11 }}
                  axisLine={{ stroke: colors.grey[600] }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: colors.primary[500], 
                    border: `1px solid ${colors.grey[600]}`,
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: colors.grey[100] }}
                />
                <ReferenceLine 
                  y={targets.dailyCalories || targets.targetDailyCalories || 0} 
                  stroke={colors.greenAccent[400]} 
                  strokeDasharray="5 5"
                  label={{ 
                    value: 'Objetivo', 
                    fill: colors.greenAccent[400], 
                    fontSize: 10,
                    position: 'right'
                  }}
                />
                <Bar 
                  dataKey="calorias" 
                  fill={colors.orangeAccent[500]}
                  radius={[4, 4, 0, 0]}
                  name="Calorías"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Gráfico de Macros tendencia */}
      <Card sx={{ backgroundColor: colors.primary[600], mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} mb={2}>
            📈 Tendencia de Macros
          </Typography>
          
          <Box sx={{ width: '100%', height: isMobile ? 200 : 280 }}>
            <ResponsiveContainer>
              <AreaChart
                data={summary?.days?.map(day => ({
                  name: day.dayName?.substring(0, 3) || day.date?.substring(8, 10),
                  proteinas: Math.round(day.consumed?.protein || 0),
                  carbos: Math.round(day.consumed?.carbs || 0),
                  grasas: Math.round(day.consumed?.fat || 0),
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[700]} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: colors.grey[400], fontSize: 11 }}
                  axisLine={{ stroke: colors.grey[600] }}
                />
                <YAxis 
                  tick={{ fill: colors.grey[400], fontSize: 11 }}
                  axisLine={{ stroke: colors.grey[600] }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: colors.primary[500], 
                    border: `1px solid ${colors.grey[600]}`,
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: colors.grey[100] }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 11, color: colors.grey[300] }}
                />
                <Area 
                  type="monotone" 
                  dataKey="proteinas" 
                  stackId="1"
                  stroke={colors.redAccent[400]} 
                  fill={colors.redAccent[400]}
                  fillOpacity={0.6}
                  name="Proteínas 🥩 (g)"
                />
                <Area 
                  type="monotone" 
                  dataKey="carbos" 
                  stackId="1"
                  stroke={colors.blueAccent[400]} 
                  fill={colors.blueAccent[400]}
                  fillOpacity={0.6}
                  name="Carbos 💧 (g)"
                />
                <Area 
                  type="monotone" 
                  dataKey="grasas" 
                  stackId="1"
                  stroke={colors.orangeAccent[400]} 
                  fill={colors.orangeAccent[400]}
                  fillOpacity={0.6}
                  name="Grasas 🧈 (g)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla por día */}
      <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} mb={2}>
        📅 Detalle por día
      </Typography>

      <TableContainer component={Paper} sx={{ backgroundColor: colors.primary[600] }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: colors.grey[400], borderColor: colors.primary[500] }}>
                Día
              </TableCell>
              <TableCell align="right" sx={{ color: colors.grey[400], borderColor: colors.primary[500] }}>
                Kcal
              </TableCell>
              <TableCell align="right" sx={{ color: colors.grey[400], borderColor: colors.primary[500] }}>
                P
              </TableCell>
              <TableCell align="right" sx={{ color: colors.grey[400], borderColor: colors.primary[500] }}>
                H
              </TableCell>
              <TableCell align="right" sx={{ color: colors.grey[400], borderColor: colors.primary[500] }}>
                G
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary?.days?.map((day) => (
              <TableRow 
                key={day.date}
                sx={{
                  backgroundColor: day.consumed.calories > 0 ? 'transparent' : colors.primary[700],
                }}
              >
                <TableCell sx={{ color: colors.grey[100], borderColor: colors.primary[500] }}>
                  <Typography variant="body2" fontWeight="bold">
                    {day.dayName}
                  </Typography>
                  <Typography variant="caption" color={colors.grey[400]}>
                    {day.date}
                  </Typography>
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    color: day.consumed.calories > 0 
                      ? getProgressColor(day.consumed.calories, targets.dailyCalories || targets.targetDailyCalories)
                      : colors.grey[600],
                    borderColor: colors.primary[500],
                    fontWeight: 'bold',
                  }}
                >
                  {Math.round(day.consumed.calories)}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    color: day.consumed.calories > 0 ? colors.redAccent[400] : colors.grey[600],
                    borderColor: colors.primary[500],
                  }}
                >
                  {Math.round(day.consumed.protein)}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    color: day.consumed.calories > 0 ? colors.blueAccent[400] : colors.grey[600],
                    borderColor: colors.primary[500],
                  }}
                >
                  {Math.round(day.consumed.carbs)}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    color: day.consumed.calories > 0 ? colors.orangeAccent[400] : colors.grey[600],
                    borderColor: colors.primary[500],
                  }}
                >
                  {Math.round(day.consumed.fat)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WeeklySummary;

