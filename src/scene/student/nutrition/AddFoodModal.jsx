import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  useTheme,
  InputAdornment,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BlenderIcon from '@mui/icons-material/Blender';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { tokens } from '../../../theme';
import { getFoodItems, getMealTypes, addFoodLogEntry, getRecipes } from '../../../api/nutritionApi';

const AddFoodModal = ({ open, onClose, onSuccess, studentId, selectedMeal, selectedDate }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [tabValue, setTabValue] = useState(0); // 0: Alimentos, 1: Recetas
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('');

  // Paso actual: 1 = seleccionar comida, 2 = agregar alimentos
  const [step, setStep] = useState(1);
  
  // Estado del carrito - lista de items a agregar
  const [cartItems, setCartItems] = useState([]);
  // Item siendo editado (para cambiar cantidad)
  const [editingItem, setEditingItem] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(100);
  // Carrito expandido/colapsado
  const [cartExpanded, setCartExpanded] = useState(false);

  useEffect(() => {
    if (open && studentId) {
      setCartItems([]);
      setEditingItem(null);
      setSearchText('');
      setError(null);
      setSelectedMealType('');
      setTabValue(0);
      setStep(1); // Resetear al paso 1
      setCartExpanded(false); // Carrito colapsado por defecto
      
      setLoading(true);
      Promise.all([
        getFoodItems(studentId),
        getMealTypes(studentId),
        getRecipes(studentId),
      ])
        .then(([foodsData, mealTypesData, recipesData]) => {
          setFoods(foodsData || []);
          setFilteredFoods(foodsData || []);
          setRecipes(recipesData || []);
          setFilteredRecipes(recipesData || []);
          
          // Si no hay meal types configurados, usar tipos por defecto
          const defaultMealTypes = [
            { id: 'desayuno', name: 'Desayuno' },
            { id: 'almuerzo', name: 'Almuerzo' },
            { id: 'merienda', name: 'Merienda' },
            { id: 'cena', name: 'Cena' },
            { id: 'snack', name: 'Snack' },
          ];
          const meals = (mealTypesData && mealTypesData.length > 0) ? mealTypesData : defaultMealTypes;
          setMealTypes(meals);
          
          // Si viene un meal preseleccionado, usarlo y saltar al paso 2
          if (selectedMeal && meals) {
            const found = meals.find(m => m.name === selectedMeal);
            if (found) {
              setSelectedMealType(found.id);
              setStep(2); // Saltar al paso 2 si ya viene preseleccionado
            }
          }
        })
        .catch(err => {
          console.error('Error loading data:', err);
          setFoods([]);
          setMealTypes([]);
          setRecipes([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, studentId, selectedMeal]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredFoods(foods);
      setFilteredRecipes(recipes);
    } else {
      const searchLower = searchText.toLowerCase();
      setFilteredFoods(foods.filter(food => 
        food.name.toLowerCase().includes(searchLower)
      ));
      setFilteredRecipes(recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchLower)
      ));
    }
  }, [searchText, foods, recipes]);

  // Agregar item al carrito con cantidad por defecto
  const handleAddToCart = (item, isRecipe = false) => {
    const existingIndex = cartItems.findIndex(ci => 
      isRecipe ? ci.recipeId === item.id : ci.foodItemId === item.id
    );
    
    if (existingIndex >= 0) {
      // Ya existe, aumentar cantidad
      const updated = [...cartItems];
      updated[existingIndex].quantityGrams += 100;
      setCartItems(updated);
    } else {
      // Agregar nuevo
      const newItem = {
        id: Date.now(), // ID temporal para el carrito
        item: item,
        isRecipe: isRecipe,
        foodItemId: isRecipe ? null : item.id,
        recipeId: isRecipe ? item.id : null,
        quantityGrams: isRecipe ? (item.totalGrams || 100) : 100,
      };
      setCartItems([...cartItems, newItem]);
    }
    setSearchText(''); // Limpiar búsqueda para seguir agregando
  };

  // Eliminar item del carrito
  const handleRemoveFromCart = (cartItemId) => {
    setCartItems(cartItems.filter(ci => ci.id !== cartItemId));
  };

  // Actualizar cantidad de un item
  const handleUpdateQuantity = (cartItemId, newQuantity) => {
    setCartItems(cartItems.map(ci => 
      ci.id === cartItemId ? { ...ci, quantityGrams: newQuantity } : ci
    ));
  };

  // Calcular totales del carrito
  const calculateCartTotals = () => {
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

  // Guardar todos los items del carrito
  const handleSaveAll = async () => {
    if (cartItems.length === 0) {
      setError('Agregá al menos un alimento');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      // Guardar cada item
      for (const cartItem of cartItems) {
        const qty = parseInt(cartItem.quantityGrams) || 1; // Mínimo 1g
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
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving:', err);
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateCartTotals();
  const itemsInCart = cartItems.length;

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: colors.primary[500],
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: colors.primary[600],
          color: colors.grey[100],
          padding: '12px 16px',
          flexShrink: 0,
          borderBottom: `1px solid ${colors.primary[400]}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🍎 Agregar Alimentos</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.grey[300],
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px'
            }}
          >
            ×
          </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <CircularProgress />
          </div>
        ) : step === 1 ? (
          /* ========== PASO 1: Seleccionar tipo de comida ========== */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              padding: '24px 16px', 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography variant="h6" color={colors.grey[100]} sx={{ mb: 1, textAlign: 'center' }}>
                ¿A qué comida querés agregar?
              </Typography>
              <Typography variant="body2" color={colors.grey[400]} sx={{ mb: 3, textAlign: 'center' }}>
                Seleccioná el momento del día
              </Typography>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
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
              </div>
            </div>
            
            {/* Footer paso 1 */}
            <div style={{ 
              borderTop: `1px solid ${colors.primary[400]}`,
              padding: '12px 16px',
              backgroundColor: colors.primary[600]
            }}>
              <Button 
                onClick={onClose}
                variant="outlined"
                fullWidth
                sx={{ 
                  color: colors.grey[300],
                  borderColor: colors.grey[600],
                  minHeight: '44px',
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          /* ========== PASO 2: Agregar alimentos ========== */
          <>
            {/* Header con comida seleccionada */}
            <div style={{ 
              padding: '8px 16px', 
              backgroundColor: colors.orangeAccent[700],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <Typography variant="body2" color="#fff" fontWeight="bold">
                📍 {mealTypes.find(m => m.id === selectedMealType)?.name || 'Sin especificar'}
              </Typography>
              <Button 
                size="small" 
                onClick={() => setStep(1)}
                sx={{ color: '#fff', fontSize: '12px', textTransform: 'none' }}
              >
                Cambiar ↩
              </Button>
            </div>

            {/* Tabs para cambiar entre Alimentos y Recetas */}
            <Box sx={{ 
              borderBottom: `1px solid ${colors.primary[400]}`, 
              backgroundColor: colors.primary[600],
              flexShrink: 0 
            }}>
              <Tabs
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                variant="fullWidth"
                sx={{
                  minHeight: '42px',
                  '& .MuiTab-root': {
                    color: colors.grey[400],
                    fontWeight: '600',
                    fontSize: '13px',
                    minHeight: '42px',
                  },
                  '& .Mui-selected': {
                    color: colors.orangeAccent[400],
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: colors.orangeAccent[500],
                  },
                }}
              >
                <Tab icon={<RestaurantIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Alimentos (${filteredFoods.length})`} />
                <Tab icon={<BlenderIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Recetas (${filteredRecipes.length})`} />
              </Tabs>
            </Box>

            {/* Buscador */}
            <div style={{ padding: '12px 16px', backgroundColor: colors.primary[600], borderBottom: `1px solid ${colors.primary[400]}`, flexShrink: 0 }}>
              <input
                type="text"
                placeholder={tabValue === 0 ? "Buscar alimento..." : "Buscar receta..."}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: `1px solid ${colors.grey[600]}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: colors.primary[500],
                  color: colors.grey[100],
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '12px center',
                  backgroundSize: '16px 16px'
                }}
              />
            </div>

            {/* Lista de alimentos o recetas scrolleable */}
            <div style={{
              flex: '1 1 0',
              overflowY: 'scroll',
              backgroundColor: colors.primary[500],
              WebkitOverflowScrolling: 'touch',
              minHeight: 0,
            }}>
              {tabValue === 0 ? (
                // ALIMENTOS
                filteredFoods.length > 0 ? (
                  <div style={{ width: '100%' }}>
                    {filteredFoods.map((food) => {
                      const inCart = cartItems.find(ci => ci.foodItemId === food.id);
                      return (
                      <div
                        key={food.id}
                        style={{
                            padding: '12px 16px',
                          borderBottom: `1px solid ${colors.primary[600]}`,
                            backgroundColor: inCart ? colors.greenAccent[900] : colors.primary[500],
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '15px', 
                              color: colors.grey[100], 
                              fontWeight: '500', 
                              marginBottom: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}>
                          {food.name}
                              {inCart && (
                                <Chip 
                                  size="small" 
                                  label={`${inCart.quantityGrams}g`}
                                  sx={{ 
                                    height: '20px',
                                    fontSize: '11px',
                                    backgroundColor: colors.greenAccent[600],
                                    color: '#fff',
                                  }}
                                />
                              )}
                        </div>
                            <div style={{ fontSize: '11px', color: colors.grey[400] }}>
                          P:{food.proteinPer100g}g | H:{food.carbsPer100g}g | G:{food.fatPer100g}g | {food.caloriesPer100g}kcal
                        </div>
                      </div>
                          <IconButton
                            onClick={() => handleAddToCart(food, false)}
                            sx={{
                              backgroundColor: inCart ? colors.greenAccent[600] : colors.orangeAccent[600],
                              color: '#fff',
                              width: '36px',
                              height: '36px',
                              '&:hover': {
                                backgroundColor: inCart ? colors.greenAccent[700] : colors.orangeAccent[700],
                              },
                            }}
                          >
                            <AddIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: colors.grey[400], margin: 0 }}>
                      No se encontraron alimentos
                    </p>
                  </div>
                )
              ) : (
                // RECETAS
                filteredRecipes.length > 0 ? (
                  <div style={{ width: '100%' }}>
                    {filteredRecipes.map((recipe) => {
                      const inCart = cartItems.find(ci => ci.recipeId === recipe.id);
                      return (
                      <div
                        key={recipe.id}
                        style={{
                            padding: '12px 16px',
                          borderBottom: `1px solid ${colors.primary[600]}`,
                            backgroundColor: inCart ? colors.greenAccent[900] : colors.primary[500],
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '15px', 
                              color: colors.grey[100], 
                              fontWeight: '500', 
                              marginBottom: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}>
                              <BlenderIcon sx={{ fontSize: 16, color: colors.blueAccent[400] }} />
                          {recipe.name}
                              {inCart && (
                                <Chip 
                                  size="small" 
                                  label={`${inCart.quantityGrams}g`}
                                  sx={{ 
                                    height: '20px',
                                    fontSize: '11px',
                                    backgroundColor: colors.greenAccent[600],
                                    color: '#fff',
                                  }}
                                />
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: colors.grey[400] }}>
                              {recipe.totalGrams}g • P:{Math.round(recipe.proteinPer100g)}g | H:{Math.round(recipe.carbsPer100g)}g | G:{Math.round(recipe.fatPer100g)}g | {Math.round(recipe.caloriesPer100g)}kcal/100g
                            </div>
                        </div>
                          <IconButton
                            onClick={() => handleAddToCart(recipe, true)}
                            sx={{
                              backgroundColor: inCart ? colors.greenAccent[600] : colors.blueAccent[600],
                              color: '#fff',
                              width: '36px',
                              height: '36px',
                              '&:hover': {
                                backgroundColor: inCart ? colors.greenAccent[700] : colors.blueAccent[700],
                              },
                            }}
                          >
                            <AddIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <BlenderIcon sx={{ fontSize: 48, color: colors.grey[600], mb: 1 }} />
                    <p style={{ color: colors.grey[400], margin: 0 }}>
                      No tenés recetas creadas
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Carrito - Items agregados (colapsable) */}
            {cartItems.length > 0 && (
              <div style={{ 
                borderTop: `2px solid ${colors.greenAccent[600]}`,
                backgroundColor: colors.primary[600],
                flexShrink: 0,
              }}>
                {/* Header del carrito - clickeable para expandir/colapsar */}
                <div 
                  onClick={() => setCartExpanded(!cartExpanded)}
                  style={{
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: colors.primary[600],
                  }}
                >
                  <Typography variant="subtitle2" color={colors.grey[100]} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon sx={{ fontSize: 16, color: colors.greenAccent[400] }} />
                    AGREGADOS ({itemsInCart})
                    <span style={{ fontSize: '12px', color: colors.grey[400] }}>
                      {cartExpanded ? '▼' : '▲ Editar'}
                    </span>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap' }}>
                    <Chip size="small" label={`${totals.calories} kcal`} sx={{ backgroundColor: colors.greenAccent[700], color: '#fff', fontSize: '10px', height: '20px' }} />
                    <Chip size="small" label={`P: ${totals.protein}g`} sx={{ backgroundColor: colors.redAccent[700], color: '#fff', fontSize: '10px', height: '20px' }} />
                    <Chip size="small" label={`H: ${totals.carbs}g`} sx={{ backgroundColor: colors.blueAccent[700], color: '#fff', fontSize: '10px', height: '20px' }} />
                    <Chip size="small" label={`G: ${totals.fat}g`} sx={{ backgroundColor: colors.orangeAccent[700], color: '#fff', fontSize: '10px', height: '20px' }} />
                  </Box>
                </div>

                {/* Lista de items - solo visible cuando está expandido */}
                {cartExpanded && (
                  <div style={{ 
                    maxHeight: '30vh', 
                    overflowY: 'auto',
                    borderTop: `1px solid ${colors.primary[400]}`,
                    padding: '6px 12px',
                  }}>
                    {cartItems.map((cartItem) => (
                      <div 
                        key={cartItem.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 8px',
                          marginBottom: '4px',
                          backgroundColor: colors.primary[500],
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            color={colors.grey[100]}
                            sx={{ 
                              fontSize: '13px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {cartItem.isRecipe && <BlenderIcon sx={{ fontSize: 12, color: colors.blueAccent[400], mr: 0.5, verticalAlign: 'middle' }} />}
                            {cartItem.item.name}
                          </Typography>
                        </div>
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
                          inputProps={{ style: { textAlign: 'center', padding: '3px' } }}
                          sx={{
                            width: '60px',
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: colors.primary[400],
                              '& fieldset': { borderColor: colors.grey[600] },
                            },
                            '& .MuiInputBase-input': {
                              color: colors.grey[100],
                              fontSize: '12px',
                            },
                          }}
                        />
                        <Typography variant="caption" color={colors.grey[400]} sx={{ fontSize: '11px' }}>g</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFromCart(cartItem.id)}
                          sx={{ color: colors.redAccent[400], padding: '2px' }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ 
          borderTop: `1px solid ${colors.primary[400]}`,
          padding: '12px 16px',
          display: 'flex',
          gap: '12px',
          flexShrink: 0,
          backgroundColor: colors.primary[600]
        }}>
              <Button 
            onClick={onClose}
                variant="outlined"
                fullWidth
                disabled={saving}
                sx={{ 
                  color: colors.grey[300],
                  borderColor: colors.grey[600],
              minHeight: '44px',
                }}
              >
            Cancelar
              </Button>
              <Button
            onClick={handleSaveAll}
            disabled={cartItems.length === 0 || saving}
                variant="contained"
                fullWidth
            startIcon={saving ? <CircularProgress size={18} /> : <CheckIcon />}
                sx={{ 
                  bgcolor: colors.greenAccent[600], 
              minHeight: '44px',
              fontWeight: 'bold',
                  '&:hover': { bgcolor: colors.greenAccent[700] },
              '&.Mui-disabled': {
                bgcolor: colors.grey[700],
                color: colors.grey[500],
              },
                }}
              >
            {saving ? 'Guardando...' : `Guardar ${itemsInCart} item${itemsInCart !== 1 ? 's' : ''}`}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AddFoodModal;
