import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BlenderIcon from '@mui/icons-material/Blender';
import CheckIcon from '@mui/icons-material/Check';
import { useTheme } from '@mui/material';
import { tokens } from '../../../theme';
import { getFoodItems, getRecipes } from '../../../api/nutritionApi';
import { useNutritionCache } from './NutritionDashboard';

const FoodSearchModal = ({ open, onClose, onAdd, studentId, cartItems, cachedFoods, cachedRecipes }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Intentar usar el contexto de caché (puede ser null si se usa fuera del dashboard)
  const nutritionCache = useNutritionCache();

  const [tabValue, setTabValue] = useState(0);
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Item seleccionado para agregar
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIsRecipe, setSelectedIsRecipe] = useState(false);
  const [quantity, setQuantity] = useState('100');

  useEffect(() => {
    if (open && studentId) {
      setSearchText('');
      setSelectedItem(null);
      setQuantity('100');
      
      // Usar datos cacheados si están disponibles (desde props o contexto)
      const cached = {
        foods: cachedFoods || nutritionCache?.foods,
        recipes: cachedRecipes || nutritionCache?.recipes,
      };
      
      if (cached.foods?.length > 0 || cached.recipes?.length > 0) {
        // Usar caché
        setFoods(cached.foods || []);
        setFilteredFoods(cached.foods || []);
        setRecipes(cached.recipes || []);
        setFilteredRecipes(cached.recipes || []);
        setLoading(false);
      } else {
        // Cargar desde API
        setLoading(true);
        Promise.all([
          getFoodItems(studentId),
          getRecipes(studentId),
        ])
          .then(([foodsData, recipesData]) => {
            setFoods(foodsData || []);
            setFilteredFoods(foodsData || []);
            setRecipes(recipesData || []);
            setFilteredRecipes(recipesData || []);
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      }
    }
  }, [open, studentId, cachedFoods, cachedRecipes, nutritionCache]);

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

  const handleSelectItem = (item, isRecipe) => {
    setSelectedItem(item);
    setSelectedIsRecipe(isRecipe);
    // Cantidad por defecto según si es receta o alimento
    setQuantity(isRecipe ? String(item.totalGrams || 100) : '100');
  };

  const handleConfirmAdd = () => {
    if (selectedItem) {
      const qty = parseInt(quantity) || 100;
      onAdd(selectedItem, selectedIsRecipe, qty);
      setSelectedItem(null);
      setSearchText('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    setSearchText('');
    onClose();
  };

  // Verificar si un item ya está en el carrito
  const isInCart = (item, isRecipe) => {
    return cartItems.some(ci => 
      isRecipe ? ci.recipeId === item.id : ci.foodItemId === item.id
    );
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: colors.primary[500],
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: colors.primary[600],
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${colors.primary[400]}`,
        }}>
          <Typography variant="subtitle1" color={colors.grey[100]} fontWeight="bold">
            {selectedItem ? '¿Cuántos gramos?' : 'Buscar alimento'}
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: colors.grey[400] }}>
            <CloseIcon />
          </IconButton>
        </div>

        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : selectedItem ? (
          /* ========== Vista de cantidad ========== */
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              backgroundColor: colors.primary[600],
              borderRadius: '12px',
              p: 2,
              mb: 3,
            }}>
              <Typography variant="body1" color={colors.grey[100]} fontWeight="bold" sx={{ mb: 0.5 }}>
                {selectedIsRecipe && <BlenderIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle', color: colors.blueAccent[400] }} />}
                {selectedItem.name}
              </Typography>
              <Typography variant="caption" color={colors.grey[400]}>
                P:{selectedItem.proteinPer100g}g | H:{selectedItem.carbsPer100g}g | G:{selectedItem.fatPer100g}g | {selectedItem.caloriesPer100g}kcal/100g
              </Typography>
            </Box>

            <Typography variant="body2" color={colors.grey[300]} sx={{ mb: 1, textAlign: 'center' }}>
              Cantidad en gramos
            </Typography>
            
            <TextField
              type="text"
              inputMode="numeric"
              fullWidth
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d+$/.test(val)) {
                  setQuantity(val);
                }
              }}
              inputProps={{ 
                style: { 
                  textAlign: 'center', 
                  fontSize: '28px', 
                  fontWeight: 'bold',
                  padding: '16px',
                } 
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: colors.primary[400],
                  borderRadius: '12px',
                  '& fieldset': { borderColor: colors.orangeAccent[500] },
                  '&:hover fieldset': { borderColor: colors.orangeAccent[400] },
                  '&.Mui-focused fieldset': { borderColor: colors.orangeAccent[400] },
                },
                '& .MuiInputBase-input': {
                  color: colors.grey[100],
                },
              }}
            />

            {/* Calculadora de macros */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              mb: 3,
              p: 1.5,
              backgroundColor: colors.primary[600],
              borderRadius: '8px',
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color={colors.grey[400]}>Kcal</Typography>
                <Typography variant="body2" color={colors.greenAccent[400]} fontWeight="bold">
                  {Math.round(selectedItem.caloriesPer100g * ((parseInt(quantity) || 0) / 100))}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color={colors.grey[400]}>Prot</Typography>
                <Typography variant="body2" color={colors.redAccent[400]} fontWeight="bold">
                  {Math.round(selectedItem.proteinPer100g * ((parseInt(quantity) || 0) / 100) * 10) / 10}g
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color={colors.grey[400]}>Carbs</Typography>
                <Typography variant="body2" color={colors.blueAccent[400]} fontWeight="bold">
                  {Math.round(selectedItem.carbsPer100g * ((parseInt(quantity) || 0) / 100) * 10) / 10}g
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color={colors.grey[400]}>Grasa</Typography>
                <Typography variant="body2" color={colors.orangeAccent[400]} fontWeight="bold">
                  {Math.round(selectedItem.fatPer100g * ((parseInt(quantity) || 0) / 100) * 10) / 10}g
                </Typography>
              </Box>
            </Box>

            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setSelectedItem(null)}
                sx={{
                  color: colors.grey[300],
                  borderColor: colors.grey[600],
                  py: 1.5,
                }}
              >
                Volver
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<CheckIcon />}
                onClick={handleConfirmAdd}
                disabled={!quantity || parseInt(quantity) < 1}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: colors.greenAccent[700],
                  },
                }}
              >
                Agregar
              </Button>
            </Box>
          </Box>
        ) : (
          /* ========== Vista de búsqueda ========== */
          <>
            {/* Tabs */}
            <Box sx={{ borderBottom: `1px solid ${colors.primary[400]}` }}>
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
                <Tab icon={<RestaurantIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={`Alimentos (${filteredFoods.length})`} />
                <Tab icon={<BlenderIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={`Recetas (${filteredRecipes.length})`} />
              </Tabs>
            </Box>

            {/* Buscador */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${colors.primary[400]}` }}>
              <TextField
                fullWidth
                placeholder={tabValue === 0 ? "Buscar alimento..." : "Buscar receta..."}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="small"
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.primary[400],
                    borderRadius: '8px',
                    '& fieldset': { borderColor: colors.grey[600] },
                  },
                  '& .MuiInputBase-input': {
                    color: colors.grey[100],
                  },
                }}
              />
            </Box>

            {/* Lista de items */}
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto',
              minHeight: '200px',
            }}>
              {tabValue === 0 ? (
                filteredFoods.length > 0 ? (
                  filteredFoods.map((food) => {
                    const inCart = isInCart(food, false);
                    return (
                      <Box
                        key={food.id}
                        onClick={() => handleSelectItem(food, false)}
                        sx={{
                          p: 1.5,
                          px: 2,
                          borderBottom: `1px solid ${colors.primary[600]}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          backgroundColor: inCart ? colors.greenAccent[900] : 'transparent',
                          '&:hover': {
                            backgroundColor: inCart ? colors.greenAccent[800] : colors.primary[600],
                          },
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color={colors.grey[100]} fontWeight="500">
                            {food.name}
                            {inCart && <CheckIcon sx={{ fontSize: 14, ml: 1, color: colors.greenAccent[400] }} />}
                          </Typography>
                          <Typography variant="caption" color={colors.grey[400]}>
                            P:{food.proteinPer100g}g | H:{food.carbsPer100g}g | G:{food.fatPer100g}g | {food.caloriesPer100g}kcal
                          </Typography>
                        </Box>
                        <AddIcon sx={{ color: colors.orangeAccent[400], fontSize: 20 }} />
                      </Box>
                    );
                  })
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color={colors.grey[400]}>No se encontraron alimentos</Typography>
                  </Box>
                )
              ) : (
                filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe) => {
                    const inCart = isInCart(recipe, true);
                    return (
                      <Box
                        key={recipe.id}
                        onClick={() => handleSelectItem(recipe, true)}
                        sx={{
                          p: 1.5,
                          px: 2,
                          borderBottom: `1px solid ${colors.primary[600]}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          backgroundColor: inCart ? colors.greenAccent[900] : 'transparent',
                          '&:hover': {
                            backgroundColor: inCart ? colors.greenAccent[800] : colors.primary[600],
                          },
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color={colors.grey[100]} fontWeight="500" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BlenderIcon sx={{ fontSize: 14, color: colors.blueAccent[400] }} />
                            {recipe.name}
                            {inCart && <CheckIcon sx={{ fontSize: 14, ml: 1, color: colors.greenAccent[400] }} />}
                          </Typography>
                          <Typography variant="caption" color={colors.grey[400]}>
                            {recipe.totalGrams}g • P:{Math.round(recipe.proteinPer100g)}g | H:{Math.round(recipe.carbsPer100g)}g | G:{Math.round(recipe.fatPer100g)}g
                          </Typography>
                        </Box>
                        <AddIcon sx={{ color: colors.blueAccent[400], fontSize: 20 }} />
                      </Box>
                    );
                  })
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <BlenderIcon sx={{ fontSize: 40, color: colors.grey[600], mb: 1 }} />
                    <Typography color={colors.grey[400]}>No tenés recetas</Typography>
                  </Box>
                )
              )}
            </Box>
          </>
        )}
      </div>
    </div>
  );
};

export default FoodSearchModal;

