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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BlenderIcon from '@mui/icons-material/Blender';
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

  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [selectedMealType, setSelectedMealType] = useState('');

  // El item seleccionado puede ser un alimento o una receta
  const selectedItem = selectedFood || selectedRecipe;
  const isRecipe = !!selectedRecipe;

  useEffect(() => {
    if (open && studentId) {
      setSelectedFood(null);
      setSelectedRecipe(null);
      setQuantity(100);
      setSearchText('');
      setError(null);
      setSelectedMealType('');
      setTabValue(0);
      
      setLoading(true);
      Promise.all([
        getFoodItems(studentId),
        getMealTypes(studentId),
        getRecipes(studentId),
      ])
        .then(([foodsData, mealTypesData, recipesData]) => {
          setFoods(foodsData || []);
          setFilteredFoods(foodsData || []);
          setMealTypes(mealTypesData || []);
          setRecipes(recipesData || []);
          setFilteredRecipes(recipesData || []);
          
          if (selectedMeal && mealTypesData) {
            const found = mealTypesData.find(m => m.name === selectedMeal);
            if (found) setSelectedMealType(found.id);
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

  const calculateMacros = () => {
    if (!selectedItem || !quantity) return null;
    const factor = quantity / 100;
    return {
      calories: (selectedItem.caloriesPer100g * factor).toFixed(1),
      protein: (selectedItem.proteinPer100g * factor).toFixed(1),
      carbs: (selectedItem.carbsPer100g * factor).toFixed(1),
      fat: (selectedItem.fatPer100g * factor).toFixed(1),
    };
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setSelectedRecipe(null);
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setSelectedFood(null);
    // Para recetas, sugerir el total de gramos como cantidad inicial
    setQuantity(recipe.totalGrams || 100);
  };

  const handleBack = () => {
    setSelectedFood(null);
    setSelectedRecipe(null);
  };

  const handleSave = async () => {
    if (!selectedItem || !quantity) {
      setError('Seleccioná un alimento o receta y una cantidad');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const entryData = {
        date: selectedDate,
        quantityGrams: parseInt(quantity),
        mealTypeId: selectedMealType || undefined,
      };

      if (isRecipe) {
        entryData.recipeId = selectedRecipe.id;
      } else {
        entryData.foodItemId = selectedFood.id;
      }

      await addFoodLogEntry(studentId, entryData);
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving:', err);
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const macros = calculateMacros();

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
        height: '85vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: colors.primary[600],
          color: colors.grey[100],
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          borderBottom: `1px solid ${colors.primary[400]}`
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>🍎 Agregar Alimento</h3>
            {selectedMeal && (
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: colors.orangeAccent[400] }}>
                para {selectedMeal}
              </p>
            )}
          </div>
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

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <CircularProgress />
          </div>
        ) : !selectedItem ? (
          /* PASO 1: Seleccionar alimento o receta */
          <>
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
            <div style={{ padding: '16px', backgroundColor: colors.primary[600], borderBottom: `1px solid ${colors.primary[400]}`, flexShrink: 0 }}>
              <input
                type="text"
                placeholder={tabValue === 0 ? "Buscar alimento..." : "Buscar receta..."}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
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
              WebkitOverflowScrolling: 'touch'
            }}>
              {tabValue === 0 ? (
                // ALIMENTOS
                filteredFoods.length > 0 ? (
                  <div style={{ width: '100%' }}>
                    {filteredFoods.map((food) => (
                      <div
                        key={food.id}
                        onClick={() => handleSelectFood(food)}
                        style={{
                          padding: '16px 20px',
                          borderBottom: `1px solid ${colors.primary[600]}`,
                          cursor: 'pointer',
                          backgroundColor: colors.primary[500],
                          minHeight: '60px',
                          display: 'block',
                          width: '100%',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary[600]}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary[500]}
                      >
                        <div style={{ fontSize: '16px', color: colors.grey[100], fontWeight: '500', marginBottom: '4px' }}>
                          {food.name}
                        </div>
                        <div style={{ fontSize: '12px', color: colors.grey[400] }}>
                          P:{food.proteinPer100g}g | H:{food.carbsPer100g}g | G:{food.fatPer100g}g | {food.caloriesPer100g}kcal
                        </div>
                      </div>
                    ))}
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
                    {filteredRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        onClick={() => handleSelectRecipe(recipe)}
                        style={{
                          padding: '16px 20px',
                          borderBottom: `1px solid ${colors.primary[600]}`,
                          cursor: 'pointer',
                          backgroundColor: colors.primary[500],
                          minHeight: '60px',
                          display: 'block',
                          width: '100%',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary[600]}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary[500]}
                      >
                        <div style={{ fontSize: '16px', color: colors.grey[100], fontWeight: '500', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BlenderIcon sx={{ fontSize: 16, color: colors.orangeAccent[400] }} />
                          {recipe.name}
                        </div>
                        <div style={{ fontSize: '12px', color: colors.grey[400] }}>
                          {recipe.totalGrams}g total • P:{Math.round(recipe.proteinPer100g)}g | H:{Math.round(recipe.carbsPer100g)}g | G:{Math.round(recipe.fatPer100g)}g | {Math.round(recipe.caloriesPer100g)}kcal/100g
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <BlenderIcon sx={{ fontSize: 48, color: colors.grey[600], mb: 1 }} />
                    <p style={{ color: colors.grey[400], margin: 0 }}>
                      No tenés recetas creadas
                    </p>
                    <p style={{ color: colors.grey[500], margin: '8px 0 0 0', fontSize: '12px' }}>
                      Creá recetas desde la pestaña "Recetas"
                    </p>
                  </div>
                )
              )}
            </div>
          </>
        ) : (
          /* PASO 2: Completar cantidad */
          <div style={{ 
            flex: '1 1 0',
            overflowY: 'auto',
            padding: '16px 20px',
            WebkitOverflowScrolling: 'touch'
          }}>
            {/* Alimento o receta seleccionada */}
            <Box sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: isRecipe ? colors.blueAccent[700] : colors.orangeAccent[700], 
              borderRadius: 1,
            }}>
              <Typography variant="subtitle1" fontWeight="bold" color={colors.grey[100]} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isRecipe && <BlenderIcon sx={{ fontSize: 18 }} />}
                {selectedItem.name}
              </Typography>
              <Typography variant="caption" color={colors.grey[200]}>
                {Math.round(selectedItem.caloriesPer100g)} kcal / 100g
                {isRecipe && ` • Receta de ${selectedItem.totalGrams}g`}
              </Typography>
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
                  sx={{
                    color: parseInt(quantity) === g ? '#ffffff' : colors.grey[300],
                    bgcolor: parseInt(quantity) === g ? colors.greenAccent[600] : 'transparent',
                    borderColor: parseInt(quantity) === g ? colors.greenAccent[600] : colors.grey[600],
                    borderWidth: parseInt(quantity) === g ? '2px' : '1px',
                    minHeight: '32px',
                    fontWeight: parseInt(quantity) === g ? 'bold' : 'normal',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Box>

            {/* Momento de comida */}
            <Typography variant="caption" color={colors.grey[400]} mb={0.5} display="block">
              Momento de la comida:
            </Typography>
            <Box sx={{ mb: 2 }}>
              {mealTypes.map((mt) => (
                <Chip
                  key={mt.id}
                  label={mt.name}
                  onClick={() => setSelectedMealType(mt.id)}
                  variant={selectedMealType === mt.id ? 'filled' : 'outlined'}
                  sx={{
                    mr: 1,
                    mb: 1,
                    color: selectedMealType === mt.id ? '#ffffff' : colors.grey[300],
                    bgcolor: selectedMealType === mt.id ? colors.greenAccent[600] : 'transparent',
                    borderColor: selectedMealType === mt.id ? colors.greenAccent[600] : colors.grey[600],
                    borderWidth: selectedMealType === mt.id ? '2px' : '1px',
                    minHeight: '36px',
                    fontWeight: selectedMealType === mt.id ? 'bold' : 'normal',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
              <Chip
                label="Sin especificar"
                onClick={() => setSelectedMealType('')}
                variant={selectedMealType === '' ? 'filled' : 'outlined'}
                sx={{
                  mr: 1,
                  mb: 1,
                  color: selectedMealType === '' ? '#ffffff' : colors.grey[300],
                  bgcolor: selectedMealType === '' ? colors.greenAccent[600] : 'transparent',
                  borderColor: selectedMealType === '' ? colors.greenAccent[600] : colors.grey[600],
                  borderWidth: selectedMealType === '' ? '2px' : '1px',
                  minHeight: '36px',
                  fontWeight: selectedMealType === '' ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                }}
              />
            </Box>

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
                    <Typography variant="h6" color={colors.redAccent[400]}>{macros.protein}g</Typography>
                    <Typography variant="caption" color={colors.grey[400]}>P 🥩</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color={colors.blueAccent[400]}>{macros.carbs}g</Typography>
                    <Typography variant="caption" color={colors.grey[400]}>H 💧</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color={colors.orangeAccent[400]}>{macros.fat}g</Typography>
                    <Typography variant="caption" color={colors.grey[400]}>G 🧈</Typography>
                  </Box>
                </Box>
                <Typography variant="h5" color={colors.greenAccent[400]} fontWeight="bold">
                  {macros.calories} kcal
                </Typography>
              </Box>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          borderTop: `1px solid ${colors.primary[400]}`,
          padding: '16px 20px',
          display: 'flex',
          gap: '12px',
          flexShrink: 0,
          backgroundColor: colors.primary[600]
        }}>
          {selectedItem ? (
            <>
              <Button 
                onClick={handleBack}
                variant="outlined"
                fullWidth
                disabled={saving}
                sx={{ 
                  color: colors.grey[300],
                  borderColor: colors.grey[600],
                  minHeight: '48px',
                }}
              >
                Volver
              </Button>
              <Button
                onClick={handleSave}
                disabled={!selectedItem || !quantity || saving}
                variant="contained"
                fullWidth
                startIcon={saving ? <CircularProgress size={20} /> : <CheckIcon />}
                sx={{ 
                  bgcolor: colors.greenAccent[600], 
                  minHeight: '48px',
                  '&:hover': { bgcolor: colors.greenAccent[700] },
                }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </>
          ) : (
            <Button 
              onClick={onClose}
              variant="outlined"
              fullWidth
              sx={{ 
                color: colors.grey[300],
                borderColor: colors.grey[600],
                minHeight: '48px',
              }}
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFoodModal;
