import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  useTheme,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import { tokens } from '../../../theme';
import { getFoodItems, getMealTypes, addFoodLogEntry } from '../../../api/nutritionApi';

const AddFoodModal = ({ open, onClose, onSuccess, studentId, selectedMeal, selectedDate }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);

  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [selectedMealType, setSelectedMealType] = useState('');

  // Cargar datos cuando se abre
  useEffect(() => {
    if (open && studentId) {
      setSelectedFood(null);
      setQuantity(100);
      setSearchText('');
      setError(null);
      
      setLoading(true);
      Promise.all([
        getFoodItems(studentId),
        getMealTypes(studentId),
      ])
        .then(([foodsData, mealTypesData]) => {
          setFoods(foodsData || []);
          setFilteredFoods(foodsData || []);
          setMealTypes(mealTypesData || []);
          
          // Pre-seleccionar meal type
          if (selectedMeal && mealTypesData) {
            const found = mealTypesData.find(m => m.name === selectedMeal);
            if (found) setSelectedMealType(found.id);
          }
        })
        .catch(err => {
          console.error('Error loading data:', err);
          setFoods([]);
          setMealTypes([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, studentId, selectedMeal]);

  // Filtrar alimentos
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredFoods(foods);
    } else {
      const filtered = foods.filter(food => 
        food.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredFoods(filtered);
    }
  }, [searchText, foods]);

  const calculateMacros = () => {
    if (!selectedFood || !quantity) return null;
    const factor = quantity / 100;
    return {
      calories: (selectedFood.caloriesPer100g * factor).toFixed(1),
      protein: (selectedFood.proteinPer100g * factor).toFixed(1),
      carbs: (selectedFood.carbsPer100g * factor).toFixed(1),
      fat: (selectedFood.fatPer100g * factor).toFixed(1),
    };
  };

  const handleSave = async () => {
    if (!selectedFood || !quantity) {
      setError('Seleccioná un alimento y una cantidad');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      await addFoodLogEntry(studentId, {
        date: selectedDate,
        foodItemId: selectedFood.id,
        quantityGrams: parseInt(quantity),
        mealTypeId: selectedMealType || undefined,
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving:', err);
      setError('Error al guardar: ' + (err.message || 'Intenta de nuevo'));
    } finally {
      setSaving(false);
    }
  };

  const macros = calculateMacros();
  const canSave = selectedFood && quantity > 0;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { 
          bgcolor: colors.primary[500],
          maxHeight: '90vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }
      }}
    >
      {/* Header */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: colors.primary[600],
          borderBottom: `1px solid ${colors.primary[400]}`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, color: colors.grey[100] }}>
            🍎 Agregar Alimento
          </Typography>
          <IconButton edge="end" onClick={onClose} sx={{ color: colors.grey[300] }}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
        {selectedMeal && (
          <Box px={2} pb={1}>
            <Typography variant="body2" color={colors.orangeAccent[400]}>
              para {selectedMeal}
            </Typography>
          </Box>
        )}
      </AppBar>

      {/* Content */}
      <Box sx={{ p: 2, overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* PASO 1: Seleccionar alimento */}
            {!selectedFood ? (
              <>
                <TextField
                  fullWidth
                  label="Buscar alimento"
                  placeholder="Escribe para filtrar..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: colors.grey[400] }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': { borderColor: colors.grey[600] },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[400] },
                  }}
                />

                <Typography variant="caption" color={colors.grey[400]} mb={1} display="block">
                  Tocá un alimento para seleccionarlo:
                </Typography>

                <Box sx={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  bgcolor: colors.primary[600],
                  borderRadius: 1,
                  mb: 2,
                }}>
                  {filteredFoods.length > 0 ? (
                    filteredFoods.slice(0, 30).map((food) => (
                      <Box
                        key={food.id}
                        onClick={() => {
                          console.log('🍎 Seleccionado:', food.name);
                          setSelectedFood(food);
                        }}
                        sx={{
                          p: 1.5,
                          cursor: 'pointer',
                          borderBottom: `1px solid ${colors.primary[500]}`,
                          '&:active': { 
                            bgcolor: colors.orangeAccent[700],
                          },
                        }}
                      >
                        <Typography variant="body2" color={colors.grey[100]} fontWeight="500">
                          {food.name}
                        </Typography>
                        <Typography variant="caption" color={colors.grey[400]}>
                          P:{food.proteinPer100g}g | H:{food.carbsPer100g}g | G:{food.fatPer100g}g | {food.caloriesPer100g}kcal
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Box p={2} textAlign="center">
                      <Typography variant="body2" color={colors.grey[400]}>
                        {foods.length === 0 
                          ? '⚠️ No hay alimentos cargados'
                          : 'No se encontraron alimentos'
                        }
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            ) : (
              /* PASO 2: Completar cantidad */
              <>
                {/* Alimento seleccionado */}
                <Box sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: colors.orangeAccent[700], 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color={colors.grey[100]}>
                      {selectedFood.name}
                    </Typography>
                    <Typography variant="caption" color={colors.grey[200]}>
                      {selectedFood.caloriesPer100g} kcal / 100g
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    onClick={() => setSelectedFood(null)}
                    sx={{ color: colors.grey[100] }}
                  >
                    Cambiar
                  </Button>
                </Box>

                {/* Cantidad */}
                <Typography variant="subtitle2" color={colors.grey[100]} mb={1}>
                  ¿Cuántos gramos?
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  size="small"
                  inputProps={{ min: 1 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">g</InputAdornment>,
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': { borderColor: colors.grey[600] },
                    },
                  }}
                />

                {/* Chips rápidos */}
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  {[50, 100, 150, 200, 250].map((g) => (
                    <Chip
                      key={g}
                      label={`${g}g`}
                      onClick={() => setQuantity(g)}
                      variant={parseInt(quantity) === g ? 'filled' : 'outlined'}
                      size="small"
                      sx={{
                        color: parseInt(quantity) === g ? colors.primary[500] : colors.grey[300],
                        bgcolor: parseInt(quantity) === g ? colors.orangeAccent[500] : 'transparent',
                        borderColor: colors.grey[600],
                      }}
                    />
                  ))}
                </Box>

                {/* Momento de comida */}
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: colors.grey[400] }}>Momento</InputLabel>
                  <Select
                    value={selectedMealType}
                    label="Momento"
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    sx={{
                      color: colors.grey[100],
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.grey[600] },
                    }}
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    {mealTypes.map((mt) => (
                      <MenuItem key={mt.id} value={mt.id}>{mt.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Preview de macros */}
                {macros && (
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: colors.primary[600], 
                    borderRadius: 1,
                    textAlign: 'center',
                  }}>
                    <Typography variant="caption" color={colors.grey[400]} display="block" mb={1}>
                      Por {quantity}g consumirás:
                    </Typography>
                    <Box display="flex" justifyContent="space-around" mb={1}>
                      <Box>
                        <Typography variant="h6" color={colors.blueAccent[400]}>{macros.protein}g</Typography>
                        <Typography variant="caption" color={colors.grey[400]}>P</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" color={colors.orangeAccent[400]}>{macros.carbs}g</Typography>
                        <Typography variant="caption" color={colors.grey[400]}>H</Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" color={colors.redAccent[400]}>{macros.fat}g</Typography>
                        <Typography variant="caption" color={colors.grey[400]}>G</Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5" color={colors.greenAccent[400]} fontWeight="bold">
                      {macros.calories} kcal
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>

      {/* Footer con botones */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${colors.primary[400]}`,
          bgcolor: colors.primary[600],
          display: 'flex',
          gap: 2,
        }}
      >
        <Button 
          onClick={onClose} 
          variant="outlined"
          fullWidth
          disabled={saving}
          sx={{ 
            color: colors.grey[300],
            borderColor: colors.grey[600],
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canSave || saving}
          variant="contained"
          fullWidth
          startIcon={saving ? <CircularProgress size={20} /> : <CheckIcon />}
          sx={{ 
            bgcolor: colors.greenAccent[600], 
            '&:hover': { bgcolor: colors.greenAccent[700] },
            '&.Mui-disabled': { bgcolor: colors.grey[700], color: colors.grey[500] },
          }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </Box>
    </Drawer>
  );
};

export default AddFoodModal;
