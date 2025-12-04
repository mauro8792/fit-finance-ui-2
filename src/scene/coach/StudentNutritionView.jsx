import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  LinearProgress,
  Chip,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TodayIcon from '@mui/icons-material/Today';
import WarningIcon from '@mui/icons-material/Warning';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
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
import { getNutritionDashboard, getWeeklySummary, getNutritionProfile } from '../../api/nutritionApi';
import { useAuthStore } from '../../hooks';

const COLORS = {
  bg: '#0d0d0d',
  card: '#1e1e2f',
  cardDark: '#151521',
  text: '#e0e0e0',
  textMuted: '#858585',
  border: '#333',
  green: '#4cceac',
  orange: '#ff9800',
  blue: '#6870fa',
  red: '#f44336',
};

const StudentNutritionView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { getStudentById } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewTab, setViewTab] = useState(0);

  useEffect(() => {
    loadStudentInfo();
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      loadNutritionData();
    }
  }, [studentId, selectedDate]);

  const loadStudentInfo = async () => {
    try {
      const studentData = await getStudentById(studentId);
      setStudent(studentData);
    } catch (error) {
      console.error('Error loading student:', error);
    }
  };

  const loadNutritionData = async () => {
    try {
      setLoading(true);
      const [profileRes, dashboardRes, weeklyRes] = await Promise.all([
        getNutritionProfile(studentId).catch(() => null),
        getNutritionDashboard(studentId, selectedDate).catch(() => null),
        getWeeklySummary(studentId).catch(() => null),
      ]);
      setProfile(profileRes);
      setTodayData(dashboardRes);
      setWeeklyData(weeklyRes);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const getProgressStatus = (consumed, target) => {
    if (!target) return { status: 'sin objetivo', color: COLORS.textMuted, icon: '❓', pct: 0 };
    const percentage = (consumed / target) * 100;
    if (percentage < 70) return { status: 'bajo', color: COLORS.red, icon: '⚠️', pct: percentage };
    if (percentage > 115) return { status: 'exceso', color: COLORS.red, icon: '🔴', pct: percentage };
    if (percentage >= 90 && percentage <= 110) return { status: 'en objetivo', color: COLORS.green, icon: '✅', pct: percentage };
    return { status: 'cerca', color: COLORS.orange, icon: '🟡', pct: percentage };
  };

  const targets = todayData?.targets || profile || {};
  const consumed = todayData?.consumed || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const caloriesStatus = getProgressStatus(consumed.calories, targets.calories || targets.targetDailyCalories);
  const studentName = student?.user?.fullName || student?.firstName || 'Alumno';
  const studentInitial = studentName.charAt(0).toUpperCase();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.bg }}>
      {/* Header Premium */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        px: { xs: 2, md: 4 },
        py: 2,
      }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: COLORS.textMuted } }}>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', color: COLORS.textMuted, cursor: 'pointer' }}
            onClick={() => navigate('/coach/dashboard')}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Dashboard
          </Link>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', color: COLORS.textMuted, cursor: 'pointer' }}
            onClick={() => navigate(`/coach/alumno/${studentId}`)}
          >
            <PersonIcon sx={{ mr: 0.5, fontSize: 18 }} />
            {studentName}
          </Link>
          <Typography sx={{ display: 'flex', alignItems: 'center', color: COLORS.orange }}>
            <RestaurantIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Nutrición
          </Typography>
        </Breadcrumbs>

        {/* Main Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: 24,
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
              }}
            >
              {studentInitial}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" color={COLORS.text}>
                {studentName}
              </Typography>
              <Typography variant="body2" color={COLORS.textMuted}>
                Seguimiento Nutricional
              </Typography>
            </Box>
          </Box>

          {/* Stats rápidos */}
          <Box sx={{ display: 'flex', gap: 2, ml: 'auto', flexWrap: 'wrap' }}>
            <Box sx={{ 
              display: 'flex', alignItems: 'center', gap: 1,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 2, px: 2, py: 1,
            }}>
              <LocalFireDepartmentIcon sx={{ color: caloriesStatus.color, fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" color={caloriesStatus.color}>
                  {Math.round(consumed.calories)} kcal
                </Typography>
                <Typography variant="caption" color={COLORS.textMuted}>
                  de {targets.calories || targets.targetDailyCalories || '?'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ 
              display: 'flex', alignItems: 'center', gap: 1,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 2, px: 2, py: 1,
            }}>
              <FitnessCenterIcon sx={{ color: COLORS.blue, fontSize: 24 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color={COLORS.blue}>
                  {Math.round(consumed.protein)}g
                </Typography>
                <Typography variant="caption" color={COLORS.textMuted}>Proteína</Typography>
              </Box>
            </Box>

            {caloriesStatus.pct > 0 && (
              <Chip 
                label={`${Math.round(caloriesStatus.pct)}%`}
                sx={{ 
                  backgroundColor: caloriesStatus.color + '22',
                  color: caloriesStatus.color,
                  fontWeight: 700, fontSize: 16, height: 40,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs 
          value={viewTab} 
          onChange={(e, v) => setViewTab(v)}
          sx={{ 
            mt: 2,
            '& .MuiTab-root': { color: COLORS.textMuted, fontWeight: 600, textTransform: 'none', fontSize: 14 },
            '& .Mui-selected': { color: COLORS.orange },
            '& .MuiTabs-indicator': { backgroundColor: COLORS.orange },
          }}
        >
          <Tab label="📅 Día" />
          <Tab label="📊 Semana" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Sin perfil warning */}
        {!profile && !loading && (
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)',
            border: '1px solid rgba(239,68,68,0.3)',
            mb: 3, borderRadius: 3,
          }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon sx={{ color: '#ef4444', fontSize: 32 }} />
              <Box>
                <Typography color="#ef4444" fontWeight="bold">Sin objetivos configurados</Typography>
                <Typography color={COLORS.textMuted} fontSize={13}>
                  Configurá los objetivos nutricionales desde la ficha del alumno
                </Typography>
              </Box>
              <Button 
                variant="outlined" size="small"
                onClick={() => navigate(`/coach/alumno/${studentId}`)}
                sx={{ ml: 'auto', color: '#ef4444', borderColor: '#ef4444', '&:hover': { backgroundColor: 'rgba(239,68,68,0.1)' } }}
              >
                Configurar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Selector de fecha - Solo en tab Día */}
        {viewTab === 0 && (
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            mb: 3, borderRadius: 3,
          }}>
            <CardContent>
              <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
                <IconButton 
                  onClick={() => changeDate(-1)} 
                  sx={{ color: COLORS.text, backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
                <Box textAlign="center" sx={{ minWidth: 220 }}>
                  <Typography variant="h5" fontWeight="bold" color={COLORS.text}>
                    {formatDate(selectedDate)}
                  </Typography>
                  <Typography variant="body2" color={COLORS.textMuted}>{selectedDate}</Typography>
                </Box>
                <IconButton 
                  onClick={() => changeDate(1)} 
                  sx={{ color: COLORS.text, backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                  <NavigateNextIcon />
                </IconButton>
                {selectedDate !== new Date().toISOString().split('T')[0] && (
                  <Button 
                    startIcon={<TodayIcon />} onClick={goToToday}
                    variant="contained" size="small"
                    sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' }}
                  >
                    Hoy
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={8}>
            <Box textAlign="center">
              <CircularProgress sx={{ color: COLORS.orange, mb: 2 }} size={48} />
              <Typography color={COLORS.textMuted}>Cargando datos...</Typography>
            </Box>
          </Box>
        ) : (
          <>
            {/* TAB 0: Vista Diaria */}
            {viewTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  {/* Resumen del día */}
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(30,30,47,0.9) 0%, rgba(21,21,33,0.9) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3, mb: 3,
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color={COLORS.text} mb={2}>
                        🎯 Resumen del día
                      </Typography>

                      <Box sx={{ textAlign: 'center', p: 3, background: 'rgba(0,0,0,0.3)', borderRadius: 3, mb: 3 }}>
                        <Typography variant="h2" fontWeight="bold" color={caloriesStatus.color}>
                          {Math.round(consumed.calories)}
                        </Typography>
                        <Typography color={COLORS.textMuted}>
                          de {targets.calories || targets.targetDailyCalories || '?'} kcal objetivo
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((consumed.calories / (targets.calories || targets.targetDailyCalories || 1)) * 100, 100)}
                          sx={{
                            mt: 2, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': { backgroundColor: caloriesStatus.color, borderRadius: 6 },
                          }}
                        />
                      </Box>

                      <Grid container spacing={2}>
                        {[
                          { label: 'Proteínas', key: 'protein', targetKey: 'targetProteinGrams', color: COLORS.blue, icon: '🥩' },
                          { label: 'Carbos', key: 'carbs', targetKey: 'targetCarbsGrams', color: COLORS.orange, icon: '🍞' },
                          { label: 'Grasas', key: 'fat', targetKey: 'targetFatGrams', color: COLORS.red, icon: '🥑' },
                        ].map((macro) => {
                          const value = consumed[macro.key] || 0;
                          const target = targets[macro.key] || targets[macro.targetKey] || 0;
                          const pct = target ? Math.round((value / target) * 100) : 0;
                          return (
                            <Grid item xs={4} key={macro.key}>
                              <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(0,0,0,0.3)', borderRadius: 2, border: `1px solid ${macro.color}33` }}>
                                <Typography fontSize={20} mb={0.5}>{macro.icon}</Typography>
                                <Typography variant="h5" fontWeight="bold" color={macro.color}>
                                  {Math.round(value)}g
                                </Typography>
                                <Typography fontSize={11} color={COLORS.textMuted}>{macro.label}</Typography>
                                <Typography fontSize={10} color={COLORS.textMuted}>
                                  {target ? `${pct}% de ${target}g` : 'Sin objetivo'}
                                </Typography>
                                <LinearProgress
                                  variant="determinate" value={Math.min(pct, 100)}
                                  sx={{ mt: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { backgroundColor: macro.color } }}
                                />
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Comidas del día */}
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(30,30,47,0.9) 0%, rgba(21,21,33,0.9) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color={COLORS.text} mb={2}>
                        🍽️ Comidas del día
                      </Typography>

                      {todayData?.entriesByMeal && Object.keys(todayData.entriesByMeal).length > 0 ? (
                        Object.entries(todayData.entriesByMeal).map(([mealName, entries]) => (
                          <Box key={mealName} mb={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Typography fontWeight="bold" color={COLORS.orange}>{mealName}</Typography>
                              <Chip label={`${entries.length} items`} size="small" sx={{ backgroundColor: 'rgba(255,152,0,0.2)', color: COLORS.orange, fontSize: 11 }} />
                            </Box>
                            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ color: COLORS.textMuted, borderColor: 'rgba(255,255,255,0.1)', fontSize: 11 }}>Alimento</TableCell>
                                    <TableCell align="right" sx={{ color: COLORS.textMuted, borderColor: 'rgba(255,255,255,0.1)', fontSize: 11 }}>Cant.</TableCell>
                                    <TableCell align="right" sx={{ color: COLORS.blue, borderColor: 'rgba(255,255,255,0.1)', fontSize: 11 }}>P</TableCell>
                                    <TableCell align="right" sx={{ color: COLORS.orange, borderColor: 'rgba(255,255,255,0.1)', fontSize: 11 }}>C</TableCell>
                                    <TableCell align="right" sx={{ color: COLORS.red, borderColor: 'rgba(255,255,255,0.1)', fontSize: 11 }}>G</TableCell>
                                    <TableCell align="right" sx={{ color: COLORS.green, borderColor: 'rgba(255,255,255,0.1)', fontSize: 11 }}>Kcal</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {entries.map((entry, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell sx={{ color: COLORS.text, borderColor: 'rgba(255,255,255,0.05)', fontSize: 12 }}>
                                        {entry.recipe ? `🍳 ${entry.recipe.name}` : entry.foodItem?.name || 'Alimento'}
                                      </TableCell>
                                      <TableCell align="right" sx={{ color: COLORS.textMuted, borderColor: 'rgba(255,255,255,0.05)', fontSize: 12 }}>{entry.quantityGrams}g</TableCell>
                                      <TableCell align="right" sx={{ color: COLORS.blue, borderColor: 'rgba(255,255,255,0.05)', fontSize: 12 }}>{Math.round(entry.protein)}</TableCell>
                                      <TableCell align="right" sx={{ color: COLORS.orange, borderColor: 'rgba(255,255,255,0.05)', fontSize: 12 }}>{Math.round(entry.carbs)}</TableCell>
                                      <TableCell align="right" sx={{ color: COLORS.red, borderColor: 'rgba(255,255,255,0.05)', fontSize: 12 }}>{Math.round(entry.fat)}</TableCell>
                                      <TableCell align="right" sx={{ color: COLORS.green, fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.05)', fontSize: 12 }}>{Math.round(entry.calories)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 6, color: COLORS.textMuted, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                          <RestaurantIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                          <Typography>No hay comidas registradas este día</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(30,30,47,0.9) 0%, rgba(21,21,33,0.9) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3, height: '100%',
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color={COLORS.text} mb={2}>
                        📊 Calorías de la semana
                      </Typography>
                      
                      <Box sx={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <BarChart
                            data={weeklyData?.days?.map(day => ({
                              name: day.dayName?.substring(0, 3) || day.date?.substring(8, 10),
                              calorias: Math.round(day.consumed?.calories || 0),
                            })) || []}
                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 12 }} />
                            <YAxis tick={{ fill: COLORS.textMuted, fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }} />
                            <ReferenceLine y={targets.calories || targets.targetDailyCalories || 0} stroke={COLORS.green} strokeDasharray="5 5" label={{ value: 'Objetivo', fill: COLORS.green, fontSize: 11 }} />
                            <Bar dataKey="calorias" fill={COLORS.orange} radius={[6, 6, 0, 0]} name="Calorías" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* TAB 1: Vista Semanal */}
            {viewTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(30,30,47,0.9) 0%, rgba(21,21,33,0.9) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color={COLORS.text} mb={2}>
                        🔥 Calorías - Últimos 7 días
                      </Typography>
                      
                      <Box sx={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                          <BarChart
                            data={weeklyData?.days?.map(day => ({
                              name: day.dayName || day.date?.substring(5, 10),
                              calorias: Math.round(day.consumed?.calories || 0),
                            })) || []}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 12 }} />
                            <YAxis tick={{ fill: COLORS.textMuted, fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }} />
                            <ReferenceLine y={targets.calories || targets.targetDailyCalories || 0} stroke={COLORS.green} strokeDasharray="5 5" label={{ value: `Objetivo: ${targets.calories || targets.targetDailyCalories || 0} kcal`, fill: COLORS.green, fontSize: 12, position: 'right' }} />
                            <Bar dataKey="calorias" fill={COLORS.orange} radius={[8, 8, 0, 0]} name="Calorías consumidas" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(30,30,47,0.9) 0%, rgba(21,21,33,0.9) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color={COLORS.text} mb={2}>
                        📈 Distribución de Macros
                      </Typography>
                      
                      <Box sx={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <AreaChart
                            data={weeklyData?.days?.map(day => ({
                              name: day.dayName?.substring(0, 3) || '',
                              proteinas: Math.round(day.consumed?.protein || 0),
                              carbos: Math.round(day.consumed?.carbs || 0),
                              grasas: Math.round(day.consumed?.fat || 0),
                            })) || []}
                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 12 }} />
                            <YAxis tick={{ fill: COLORS.textMuted, fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8 }} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Area type="monotone" dataKey="proteinas" stackId="1" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.6} name="🥩 Proteínas" />
                            <Area type="monotone" dataKey="carbos" stackId="1" stroke={COLORS.orange} fill={COLORS.orange} fillOpacity={0.6} name="🍞 Carbos" />
                            <Area type="monotone" dataKey="grasas" stackId="1" stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.6} name="🥑 Grasas" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, rgba(30,30,47,0.9) 0%, rgba(21,21,33,0.9) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3, height: '100%',
                  }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color={COLORS.text} mb={3}>
                        📋 Resumen Semanal
                      </Typography>
                      
                      {weeklyData?.totals ? (
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255,152,0,0.2) 0%, rgba(255,152,0,0.05) 100%)', borderRadius: 2, textAlign: 'center' }}>
                              <Typography variant="h4" fontWeight="bold" color={COLORS.orange}>
                                {Math.round(weeklyData.totals.calories || 0)}
                              </Typography>
                              <Typography fontSize={12} color={COLORS.textMuted}>Calorías totales</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ p: 2, background: 'linear-gradient(135deg, rgba(76,206,172,0.2) 0%, rgba(76,206,172,0.05) 100%)', borderRadius: 2, textAlign: 'center' }}>
                              <Typography variant="h4" fontWeight="bold" color={COLORS.green}>
                                {Math.round((weeklyData.totals.calories || 0) / 7)}
                              </Typography>
                              <Typography fontSize={12} color={COLORS.textMuted}>Promedio diario</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ p: 2, background: 'linear-gradient(135deg, rgba(104,112,250,0.2) 0%, rgba(104,112,250,0.05) 100%)', borderRadius: 2, textAlign: 'center' }}>
                              <Typography variant="h5" fontWeight="bold" color={COLORS.blue}>
                                {Math.round(weeklyData.totals.protein || 0)}g
                              </Typography>
                              <Typography fontSize={11} color={COLORS.textMuted}>🥩 Proteína</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255,152,0,0.2) 0%, rgba(255,152,0,0.05) 100%)', borderRadius: 2, textAlign: 'center' }}>
                              <Typography variant="h5" fontWeight="bold" color={COLORS.orange}>
                                {Math.round(weeklyData.totals.carbs || 0)}g
                              </Typography>
                              <Typography fontSize={11} color={COLORS.textMuted}>🍞 Carbos</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ p: 2, background: 'linear-gradient(135deg, rgba(244,67,54,0.2) 0%, rgba(244,67,54,0.05) 100%)', borderRadius: 2, textAlign: 'center' }}>
                              <Typography variant="h5" fontWeight="bold" color={COLORS.red}>
                                {Math.round(weeklyData.totals.fat || 0)}g
                              </Typography>
                              <Typography fontSize={11} color={COLORS.textMuted}>🥑 Grasas</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4, color: COLORS.textMuted }}>
                          <Typography>No hay datos esta semana</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default StudentNutritionView;
