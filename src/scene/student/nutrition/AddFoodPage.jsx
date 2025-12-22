import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BlenderIcon from '@mui/icons-material/Blender';
import { useTheme } from '@mui/material';
import { tokens } from '../../../theme';
import { getMealTypes, addFoodLogEntry, getFoodItems, getRecipes } from '../../../api/nutritionApi';
import FoodSearchModal from './FoodSearchModal';

const AddFoodPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();

  // Datos que vienen de la navegación
  const { studentId, selectedMeal, selectedDate } = location.state || {};

  const [mealTypes, setMealTypes] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [step, setStep] = useState(selectedMeal ? 2 : 1); // 1: elegir comida, 2: carrito
  const [cartItems, setCartItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal de búsqueda
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  
  // Caché local de alimentos y recetas
  const [cachedFoods, setCachedFoods] = useState([]);
  const [cachedRecipes, setCachedRecipes] = useState([]);

  useEffect(() => {
    if (!studentId) {
      navigate(-1);
      return;
    }

    setLoading(true);
    
    // Cargar todo en paralelo: meal types, alimentos y recetas
    Promise.all([
      getMealTypes(studentId),
      getFoodItems(studentId),
      getRecipes(studentId),
    ])
      .then(([mealTypesData, foodsData, recipesData]) => {
        // Meal types
        const defaultMealTypes = [
          { id: 'desayuno', name: 'Desayuno' },
          { id: 'almuerzo', name: 'Almuerzo' },
          { id: 'merienda', name: 'Merienda' },
          { id: 'cena', name: 'Cena' },
          { id: 'snack', name: 'Snack' },
        ];
        const meals = (mealTypesData && mealTypesData.length > 0) ? mealTypesData : defaultMealTypes;
        setMealTypes(meals);

        // Cachear alimentos y recetas
        setCachedFoods(foodsData || []);
        setCachedRecipes(recipesData || []);

        // Si viene preseleccionado
        if (selectedMeal) {
          const found = meals.find(m => m.name === selectedMeal);
          if (found) {
            setSelectedMealType(found.id);
            setStep(2);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId, selectedMeal, navigate]);

  // Agregar item al carrito (desde el modal)
  const handleAddToCart = (item, isRecipe, quantity) => {
    const existingIndex = cartItems.findIndex(ci => 
      isRecipe ? ci.recipeId === item.id : ci.foodItemId === item.id
    );
    
    if (existingIndex >= 0) {
      // Ya existe, actualizar cantidad
      const updated = [...cartItems];
      updated[existingIndex].quantityGrams = quantity;
      setCartItems(updated);
    } else {
      // Agregar nuevo
      const newItem = {
        id: Date.now(),
        item: item,
        isRecipe: isRecipe,
        foodItemId: isRecipe ? null : item.id,
        recipeId: isRecipe ? item.id : null,
        quantityGrams: quantity,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  // Eliminar item del carrito
  const handleRemoveFromCart = (cartItemId) => {
    setCartItems(cartItems.filter(ci => ci.id !== cartItemId));
  };

  // Actualizar cantidad
  const handleUpdateQuantity = (cartItemId, newQuantity) => {
    setCartItems(cartItems.map(ci => 
      ci.id === cartItemId ? { ...ci, quantityGrams: newQuantity } : ci
    ));
  };

  // Calcular totales
  const calculateTotals = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    cartItems.forEach(ci => {
      const qty = parseInt(ci.quantityGrams) || 0;
      const factor = qty / 100;
      totalCalories += ci.item.caloriesPer100g * factor;
      totalProtein += ci.item.proteinPer100g * factor;
      totalCarbs += ci.item.carbsPer100g * factor;
      totalFat += ci.item.fatPer100g * factor;
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    };
  };

  // Guardar todo
  const handleSaveAll = async () => {
    if (cartItems.length === 0) {
      setError('Agregá al menos un alimento');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      for (const cartItem of cartItems) {
        const qty = parseInt(cartItem.quantityGrams) || 1;
        const entryData = {
          date: selectedDate,
          quantityGrams: qty,
          mealTypeId: selectedMealType || undefined,
        };

        if (cartItem.isRecipe) {
          entryData.recipeId = cartItem.recipeId;
        } else {
          entryData.foodItemId = cartItem.foodItemId;
        }

        await addFoodLogEntry(studentId, entryData);
      }
      
      navigate(-1); // Volver atrás
    } catch (err) {
      console.error('Error saving:', err);
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();
  const mealName = mealTypes.find(m => m.id === selectedMealType)?.name || 'Sin especificar';

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: colors.primary[500],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: colors.primary[500],
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: colors.primary[600],
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderBottom: `1px solid ${colors.primary[400]}`,
      }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: colors.grey[100] }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" color={colors.grey[100]}>
          🍎 Agregar Alimentos
        </Typography>
      </Box>

      {step === 1 ? (
        /* ========== PASO 1: Seleccionar comida ========== */
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}>
          <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 1, textAlign: 'center' }}>
            ¿A qué comida querés agregar?
          </Typography>
          <Typography variant="body2" color={colors.grey[400]} sx={{ mb: 3, textAlign: 'center' }}>
            Seleccioná el momento del día
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1.5, 
            width: '100%',
            maxWidth: '300px',
          }}>
            {mealTypes.map((mt) => (
              <Button
                key={mt.id}
                variant="contained"
                fullWidth
                onClick={() => {
                  setSelectedMealType(mt.id);
                  setStep(2);
                }}
                sx={{
                  backgroundColor: colors.primary[400],
                  color: colors.grey[100],
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: colors.orangeAccent[600],
                  },
                }}
              >
                {mt.name === 'Desayuno' && '🌅 '}
                {mt.name === 'Media Mañana' && '☕ '}
                {mt.name === 'Almuerzo' && '🍽️ '}
                {mt.name === 'Merienda' && '🍪 '}
                {mt.name === 'Cena' && '🌙 '}
                {mt.name === 'Snack' && '🍿 '}
                {mt.name}
              </Button>
            ))}
          </Box>
        </Box>
      ) : (
        /* ========== PASO 2: Carrito ========== */
        <>
          {/* Comida seleccionada */}
          <Box sx={{ 
            p: 1.5, 
            backgroundColor: colors.orangeAccent[700],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Typography variant="body2" color="#fff" fontWeight="bold">
              📍 {mealName}
            </Typography>
            <Button 
              size="small" 
              onClick={() => setStep(1)}
              sx={{ color: '#fff', fontSize: '12px', textTransform: 'none' }}
            >
              Cambiar ↩
            </Button>
          </Box>

          {/* Contenido principal */}
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
            {/* Carrito */}
            <Box sx={{ 
              backgroundColor: colors.primary[600],
              borderRadius: '12px',
              p: 2,
              mb: 2,
            }}>
              <Typography variant="subtitle1" color={colors.grey[100]} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 2,
              }}>
                <ShoppingCartIcon sx={{ color: colors.greenAccent[400] }} />
                Tu selección
              </Typography>

              {cartItems.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  color: colors.grey[400],
                }}>
                  <Typography variant="body2">
                    No hay alimentos agregados
                  </Typography>
                  <Typography variant="caption">
                    Tocá el botón de abajo para agregar
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {cartItems.map((cartItem) => (
                    <Box 
                      key={cartItem.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.5,
                        backgroundColor: colors.primary[500],
                        borderRadius: '8px',
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          color={colors.grey[100]}
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          {cartItem.isRecipe && <BlenderIcon sx={{ fontSize: 14, color: colors.blueAccent[400] }} />}
                          {cartItem.item.name}
                        </Typography>
                        <Typography variant="caption" color={colors.grey[400]}>
                          {Math.round(cartItem.item.caloriesPer100g * (cartItem.quantityGrams / 100))} kcal
                        </Typography>
                      </Box>
                      <TextField
                        type="text"
                        inputMode="numeric"
                        size="small"
                        value={cartItem.quantityGrams}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d+$/.test(val)) {
                            handleUpdateQuantity(cartItem.id, val === '' ? '' : parseInt(val));
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!val || val < 1) {
                            handleUpdateQuantity(cartItem.id, 1);
                          }
                        }}
                        inputProps={{ style: { textAlign: 'center', padding: '6px' } }}
                        sx={{
                          width: '70px',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: colors.primary[400],
                            '& fieldset': { borderColor: colors.grey[600] },
                          },
                          '& .MuiInputBase-input': {
                            color: colors.grey[100],
                            fontSize: '14px',
                          },
                        }}
                      />
                      <Typography variant="caption" color={colors.grey[400]}>g</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFromCart(cartItem.id)}
                        sx={{ color: colors.redAccent[400] }}
                      >
                        <DeleteIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Botón agregar */}
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => setSearchModalOpen(true)}
              sx={{
                py: 1.5,
                borderColor: colors.orangeAccent[500],
                color: colors.orangeAccent[400],
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: colors.orangeAccent[400],
                  backgroundColor: 'rgba(255,152,0,0.1)',
                },
              }}
            >
              Agregar alimento
            </Button>

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
          </Box>

          {/* Footer fijo con totales */}
          <Box sx={{ 
            borderTop: `1px solid ${colors.primary[400]}`,
            backgroundColor: colors.primary[600],
            p: 2,
          }}>
            {/* Totales */}
            {cartItems.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 1, 
                mb: 2,
                flexWrap: 'wrap',
              }}>
                <Chip 
                  label={`${totals.calories} kcal`} 
                  sx={{ backgroundColor: colors.greenAccent[700], color: '#fff', fontWeight: 'bold' }} 
                />
                <Chip 
                  label={`P: ${totals.protein}g`} 
                  sx={{ backgroundColor: colors.redAccent[700], color: '#fff' }} 
                />
                <Chip 
                  label={`H: ${totals.carbs}g`} 
                  sx={{ backgroundColor: colors.blueAccent[700], color: '#fff' }} 
                />
                <Chip 
                  label={`G: ${totals.fat}g`} 
                  sx={{ backgroundColor: colors.orangeAccent[700], color: '#fff' }} 
                />
              </Box>
            )}

            {/* Botón guardar */}
            <Button
              variant="contained"
              fullWidth
              disabled={cartItems.length === 0 || saving}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
              onClick={handleSaveAll}
              sx={{
                py: 1.5,
                backgroundColor: colors.greenAccent[600],
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: colors.greenAccent[700],
                },
                '&.Mui-disabled': {
                  backgroundColor: colors.grey[700],
                  color: colors.grey[500],
                },
              }}
            >
              {saving ? 'Guardando...' : `Guardar ${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`}
            </Button>
          </Box>
        </>
      )}

      {/* Modal de búsqueda - con datos cacheados */}
      <FoodSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onAdd={handleAddToCart}
        studentId={studentId}
        cartItems={cartItems}
        cachedFoods={cachedFoods}
        cachedRecipes={cachedRecipes}
      />
    </Box>
  );
};

export default AddFoodPage;

