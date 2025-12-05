import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Button,
  Chip,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TodayIcon from '@mui/icons-material/Today';
import { tokens } from '../../../theme';
import { getNutritionDashboard, deleteFoodLogEntry } from '../../../api/nutritionApi';
import AddFoodModal from './AddFoodModal';
import NutritionAlerts from './NutritionAlerts';

const MacroProgress = ({ label, current, target, color, unit = 'g' }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOver = current > target;

  return (
    <Box sx={{ mb: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={0.5}>
        <Typography variant="body2" color={colors.grey[300]}>
          {label}
        </Typography>
        <Typography 
          variant="body2" 
          fontWeight="bold"
          color={isOver ? colors.redAccent[400] : colors.grey[100]}
        >
          {Math.round(current)}{unit} / {target}{unit}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: colors.primary[600],
          '& .MuiLinearProgress-bar': {
            backgroundColor: isOver ? colors.redAccent[400] : color,
            borderRadius: 5,
          },
        }}
      />
      <Typography variant="caption" color={colors.grey[400]} textAlign="right" display="block">
        {Math.round(percentage)}%
      </Typography>
    </Box>
  );
};

const MealCard = ({ mealName, entries, totals, onDelete, onAddFood, colors, isMobile }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card
      sx={{
        backgroundColor: colors.primary[600],
        mb: 2,
        borderRadius: '8px',
      }}
    >
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        {/* Header de la comida */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          onClick={() => setExpanded(!expanded)}
          sx={{ cursor: 'pointer' }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold" color={colors.orangeAccent[400]}>
              🍽️ {mealName}
            </Typography>
            <Chip
              label={`${entries.length} items`}
              size="small"
              sx={{
                backgroundColor: colors.primary[500],
                color: colors.grey[300],
                fontSize: '11px',
              }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color={colors.grey[300]}>
              {Math.round(totals?.calories || 0)} kcal
            </Typography>
            <IconButton size="small" sx={{ color: colors.grey[300] }}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          {/* Tabla de alimentos */}
          {entries.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2, backgroundColor: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: colors.grey[400], borderColor: colors.primary[500] }}>
                      Alimento
                    </TableCell>
                    <TableCell align="right" sx={{ color: colors.grey[400], borderColor: colors.primary[500] }}>
                      Cant.
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
                    <TableCell align="right" sx={{ color: colors.grey[400], borderColor: colors.primary[500] }}>
                      Kcal
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.primary[500] }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell sx={{ color: colors.grey[100], borderColor: colors.primary[500] }}>
                        {entry.recipe ? (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <span>🍳</span>
                            <span>{entry.recipe.name}</span>
                          </Box>
                        ) : (
                          entry.foodItem?.name || 'Alimento'
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ color: colors.grey[300], borderColor: colors.primary[500] }}>
                        {entry.quantityGrams}g
                      </TableCell>
                      <TableCell align="right" sx={{ color: colors.redAccent[400], borderColor: colors.primary[500] }}>
                        {Number(entry.protein).toFixed(1)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: colors.blueAccent[400], borderColor: colors.primary[500] }}>
                        {Number(entry.carbs).toFixed(1)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: colors.orangeAccent[400], borderColor: colors.primary[500] }}>
                        {Number(entry.fat).toFixed(1)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: colors.greenAccent[400], borderColor: colors.primary[500], fontWeight: 'bold' }}>
                        {Math.round(entry.calories)}
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.primary[500] }}>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(entry.id)}
                          sx={{ color: colors.redAccent[400] }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Fila de totales */}
                  <TableRow>
                    <TableCell colSpan={2} sx={{ color: colors.grey[100], fontWeight: 'bold', borderColor: colors.primary[500] }}>
                      TOTALES
                    </TableCell>
                    <TableCell align="right" sx={{ color: colors.redAccent[400], fontWeight: 'bold', borderColor: colors.primary[500] }}>
                      {Number(totals?.protein || 0).toFixed(1)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: colors.blueAccent[400], fontWeight: 'bold', borderColor: colors.primary[500] }}>
                      {Number(totals?.carbs || 0).toFixed(1)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: colors.orangeAccent[400], fontWeight: 'bold', borderColor: colors.primary[500] }}>
                      {Number(totals?.fat || 0).toFixed(1)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: colors.greenAccent[400], fontWeight: 'bold', borderColor: colors.primary[500] }}>
                      {Math.round(totals?.calories || 0)}
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.primary[500] }}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                mt: 2,
                p: 2,
                textAlign: 'center',
                backgroundColor: colors.primary[500],
                borderRadius: '8px',
              }}
            >
              <Typography variant="body2" color={colors.grey[400]}>
                No hay alimentos registrados
              </Typography>
            </Box>
          )}

          {/* Botón agregar */}
          <Button
            startIcon={<AddIcon />}
            onClick={() => onAddFood(mealName)}
            sx={{
              mt: 2,
              color: colors.orangeAccent[400],
              borderColor: colors.orangeAccent[400],
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
              },
            }}
            variant="outlined"
            size="small"
            fullWidth
          >
            Agregar alimento
          </Button>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const DailyTracker = ({ studentId, profile }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [studentId, selectedDate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getNutritionDashboard(studentId, selectedDate);
      setDashboard(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await deleteFoodLogEntry(entryId);
      loadDashboard();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleAddFood = (mealName) => {
    setSelectedMeal(mealName);
    setAddFoodOpen(true);
  };

  const handleFoodAdded = () => {
    setAddFoodOpen(false);
    setSelectedMeal(null);
    loadDashboard();
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((dateOnly - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === -1) return 'Ayer';
    if (diffDays === 1) return 'Mañana';
    
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const consumed = dashboard?.consumed || { calories: 0, protein: 0, fat: 0, carbs: 0 };
  const targets = dashboard?.targets || profile || { calories: 2000, protein: 150, fat: 60, carbs: 200 };

  return (
    <Box>
      {/* Selector de fecha */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={2}
        mb={3}
      >
        <IconButton onClick={() => changeDate(-1)} sx={{ color: colors.grey[300] }}>
          <NavigateBeforeIcon />
        </IconButton>
        <Box textAlign="center">
          <Typography variant="h5" fontWeight="bold" color={colors.grey[100]}>
            {formatDate(selectedDate)}
          </Typography>
          <Typography variant="caption" color={colors.grey[400]}>
            {selectedDate}
          </Typography>
        </Box>
        <IconButton onClick={() => changeDate(1)} sx={{ color: colors.grey[300] }}>
          <NavigateNextIcon />
        </IconButton>
        {selectedDate !== new Date().toISOString().split('T')[0] && (
          <IconButton onClick={goToToday} sx={{ color: colors.orangeAccent[400] }}>
            <TodayIcon />
          </IconButton>
        )}
      </Box>

      {/* Alertas inteligentes (solo para el día actual) */}
      {selectedDate === new Date().toISOString().split('T')[0] && (
        <NutritionAlerts
          consumed={consumed}
          targets={targets}
          entriesCount={Object.values(dashboard?.entriesByMeal || {}).flat().length}
        />
      )}

      {/* Resumen de macros */}
      <Card
        sx={{
          backgroundColor: colors.primary[600],
          mb: 3,
          borderRadius: '12px',
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} mb={2}>
            📊 Resumen del día
          </Typography>

          {/* Calorías principal */}
          <Box textAlign="center" mb={3}>
            <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[400]}>
              {Math.round(consumed.calories)}
            </Typography>
            <Typography variant="body2" color={colors.grey[400]}>
              de {targets.calories || targets.targetDailyCalories || 2000} kcal
            </Typography>
          </Box>

          {/* Barras de progreso - Proteína=Rojo, Carbos=Azul, Grasa=Amarillo */}
          <MacroProgress
            label="Proteínas 🥩"
            current={consumed.protein}
            target={targets.protein || targets.targetProteinGrams || 150}
            color={colors.redAccent[400]}
          />
          <MacroProgress
            label="Hidratos 💧"
            current={consumed.carbs}
            target={targets.carbs || targets.targetCarbsGrams || 200}
            color={colors.blueAccent[400]}
          />
          <MacroProgress
            label="Grasas 🧈"
            current={consumed.fat}
            target={targets.fat || targets.targetFatGrams || 60}
            color={colors.orangeAccent[400]}
          />
        </CardContent>
      </Card>

      {/* Comidas del día */}
      <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} mb={2}>
        🍽️ Comidas
      </Typography>

      {dashboard?.entriesByMeal && Object.keys(dashboard.entriesByMeal).length > 0 ? (
        Object.entries(dashboard.entriesByMeal).map(([mealName, entries]) => (
          <MealCard
            key={mealName}
            mealName={mealName}
            entries={entries}
            totals={dashboard.mealTotals?.[mealName]}
            onDelete={handleDeleteEntry}
            onAddFood={handleAddFood}
            colors={colors}
            isMobile={isMobile}
          />
        ))
      ) : (
        <Card
          sx={{
            backgroundColor: colors.primary[600],
            borderRadius: '8px',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body1" color={colors.grey[400]} mb={2}>
            No hay comidas registradas para este día
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddFood('Desayuno')}
            sx={{
              backgroundColor: colors.orangeAccent[500],
              '&:hover': {
                backgroundColor: colors.orangeAccent[600],
              },
            }}
          >
            Agregar primera comida
          </Button>
        </Card>
      )}

      {/* Modal para agregar alimento */}
      <AddFoodModal
        open={addFoodOpen}
        onClose={() => setAddFoodOpen(false)}
        onSuccess={handleFoodAdded}
        studentId={studentId}
        selectedMeal={selectedMeal}
        selectedDate={selectedDate}
      />
    </Box>
  );
};

export default DailyTracker;

