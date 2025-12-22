import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuthStore } from '../../../hooks';
import { getFoodItems, createRecipe, updateRecipe } from '../../../api/nutritionApi';

const COLORS = {
  background: '#1a1a2e',
  card: '#16213e',
  cardLight: '#1f2b47',
  border: 'rgba(255,255,255,0.1)',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.7)',
  textDim: 'rgba(255,255,255,0.5)',
  green: '#4cceac',
  greenDark: '#2e7c67',
  orange: '#ff9800',
  blue: '#6870fa',
  red: '#ef4444',
  protein: '#ef5350',
  carbs: '#42a5f5',
  fat: '#ffa726',
};

const steps = ['Información', 'Ingredientes'];

const NewRecipePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = useAuthStore();
  const studentId = student?.id;

  // Verificar si estamos editando
  const editingRecipe = location.state?.recipe || null;

  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadFoodItems();
    if (editingRecipe) {
      setName(editingRecipe.name);
      setDescription(editingRecipe.description || '');
      setIngredients(
        editingRecipe.ingredients?.map((ing) => ({
          foodItemId: ing.foodItemId,
          foodItem: ing.foodItem,
          quantityGrams: ing.quantityGrams,
        })) || []
      );
    }
  }, [editingRecipe]);

  const loadFoodItems = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const data = await getFoodItems(studentId);
      setFoodItems(data);
    } catch (err) {
      console.error('Error loading foods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = (foodItem) => {
    if (ingredients.some((i) => i.foodItemId === foodItem.id)) {
      return; // Ya está agregado
    }
    setIngredients([
      ...ingredients,
      {
        foodItemId: foodItem.id,
        foodItem: foodItem,
        quantityGrams: 100,
      },
    ]);
    setSearchTerm('');
  };

  const handleRemoveIngredient = (foodItemId) => {
    setIngredients(ingredients.filter((i) => i.foodItemId !== foodItemId));
  };

  const handleQuantityChange = (foodItemId, quantity) => {
    setIngredients(
      ingredients.map((i) =>
        i.foodItemId === foodItemId ? { ...i, quantityGrams: parseInt(quantity) || 0 } : i
      )
    );
  };

  const calculateTotals = () => {
    let totalGrams = 0;
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    ingredients.forEach((ing) => {
      const qty = ing.quantityGrams;
      totalGrams += qty;
      totalCalories += (Number(ing.foodItem.caloriesPer100g) / 100) * qty;
      totalProtein += (Number(ing.foodItem.proteinPer100g) / 100) * qty;
      totalFat += (Number(ing.foodItem.fatPer100g) / 100) * qty;
      totalCarbs += (Number(ing.foodItem.carbsPer100g) / 100) * qty;
    });

    return {
      totalGrams,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
    };
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!name.trim()) {
        setError('El nombre es obligatorio');
        return;
      }
      setError(null);
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(-1);
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSave = async () => {
    if (ingredients.length === 0) {
      setError('Agregá al menos un ingrediente');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const recipeData = {
        name: name.trim(),
        description: description.trim() || undefined,
        ingredients: ingredients.map((i) => ({
          foodItemId: i.foodItemId,
          quantityGrams: i.quantityGrams,
        })),
      };

      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, recipeData);
      } else {
        await createRecipe(studentId, recipeData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la receta');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Filtrar alimentos disponibles
  const filteredFoods = foodItems
    .filter((food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 8);

  const totals = calculateTotals();

  if (!studentId) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: COLORS.textMuted }}>
        Cargando...
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      pb: 4,
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        p: 2,
        borderBottom: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.card,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <IconButton onClick={handleBack} sx={{ color: COLORS.text }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700} color={COLORS.text}>
          🍳 {editingRecipe ? 'Editar Receta' : 'Nueva Receta'}
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ p: 2, backgroundColor: COLORS.card, borderBottom: `1px solid ${COLORS.border}` }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    color: activeStep >= index ? COLORS.orange : COLORS.textDim,
                    '&.Mui-completed': { color: COLORS.green },
                    '&.Mui-active': { color: COLORS.orange },
                  },
                }}
              >
                <Typography 
                  fontSize={12} 
                  color={activeStep >= index ? COLORS.text : COLORS.textDim}
                  fontWeight={activeStep === index ? 700 : 400}
                >
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
        {/* Success Message */}
        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ 
              mb: 3, 
              backgroundColor: 'rgba(76, 206, 172, 0.15)',
              color: COLORS.green,
              '& .MuiAlert-icon': { color: COLORS.green },
            }}
          >
            ✅ ¡Receta {editingRecipe ? 'actualizada' : 'creada'} correctamente!
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: COLORS.red,
              '& .MuiAlert-icon': { color: COLORS.red },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Step 1: Información básica */}
        {activeStep === 0 && (
          <Box>
            <Box sx={{ 
              p: 2, 
              backgroundColor: COLORS.card,
              borderRadius: 3,
              mb: 2,
            }}>
              <Typography fontSize={12} color={COLORS.textMuted} mb={2} fontWeight={600}>
                📝 INFORMACIÓN DE LA RECETA
              </Typography>

              <TextField
                fullWidth
                label="Nombre de la receta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Pancakes de avena"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: COLORS.cardLight,
                    '& fieldset': { borderColor: COLORS.border },
                    '&:hover fieldset': { borderColor: COLORS.orange },
                    '&.Mui-focused fieldset': { borderColor: COLORS.orange },
                  },
                  '& .MuiInputLabel-root': { color: COLORS.textMuted },
                  '& .MuiInputBase-input': { color: COLORS.text },
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Receta alta en proteína perfecta para el desayuno"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: COLORS.cardLight,
                    '& fieldset': { borderColor: COLORS.border },
                    '&:hover fieldset': { borderColor: COLORS.orange },
                    '&.Mui-focused fieldset': { borderColor: COLORS.orange },
                  },
                  '& .MuiInputLabel-root': { color: COLORS.textMuted },
                  '& .MuiInputBase-input': { color: COLORS.text },
                }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleNext}
              disabled={!name.trim()}
              sx={{
                py: 1.5,
                backgroundColor: COLORS.orange,
                fontWeight: 700,
                fontSize: 14,
                '&:hover': { backgroundColor: '#e68900' },
                '&.Mui-disabled': { 
                  backgroundColor: COLORS.cardLight,
                  color: COLORS.textDim,
                },
              }}
            >
              SIGUIENTE: AGREGAR INGREDIENTES →
            </Button>
          </Box>
        )}

        {/* Step 2: Ingredientes */}
        {activeStep === 1 && (
          <Box>
            {/* Buscar alimento */}
            <Box sx={{ 
              p: 2, 
              backgroundColor: COLORS.card,
              borderRadius: 3,
              mb: 2,
            }}>
              <Typography fontSize={12} color={COLORS.textMuted} mb={1} fontWeight={600}>
                🔍 BUSCAR INGREDIENTES
              </Typography>

              <TextField
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar alimento..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: COLORS.cardLight,
                    '& fieldset': { borderColor: COLORS.border },
                  },
                  '& .MuiInputBase-input': { color: COLORS.text },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: COLORS.textMuted }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Lista de alimentos filtrados */}
              {searchTerm && (
                <Box
                  sx={{
                    mt: 1,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 2,
                    backgroundColor: COLORS.cardLight,
                  }}
                >
                  {loading ? (
                    <Box p={2} textAlign="center">
                      <CircularProgress size={20} sx={{ color: COLORS.orange }} />
                    </Box>
                  ) : filteredFoods.length === 0 ? (
                    <Typography p={2} color={COLORS.textDim} textAlign="center" fontSize={13}>
                      No se encontraron alimentos
                    </Typography>
                  ) : (
                    filteredFoods.map((food) => (
                      <Box
                        key={food.id}
                        onClick={() => handleAddIngredient(food)}
                        sx={{
                          p: 1.5,
                          cursor: 'pointer',
                          borderBottom: `1px solid ${COLORS.border}`,
                          '&:hover': { backgroundColor: COLORS.card },
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Typography color={COLORS.text} fontSize={14} fontWeight={500}>
                          {food.name}
                        </Typography>
                        <Typography color={COLORS.textDim} fontSize={11}>
                          {food.caloriesPer100g} kcal | P: {food.proteinPer100g}g | H: {food.carbsPer100g}g | G: {food.fatPer100g}g
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              )}
            </Box>

            {/* Ingredientes agregados */}
            <Box sx={{ 
              p: 2, 
              backgroundColor: COLORS.card,
              borderRadius: 3,
              mb: 2,
            }}>
              <Typography fontSize={12} color={COLORS.textMuted} mb={2} fontWeight={600}>
                🥗 INGREDIENTES ({ingredients.length})
              </Typography>

              {ingredients.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  backgroundColor: COLORS.cardLight,
                  borderRadius: 2,
                  border: `2px dashed ${COLORS.border}`,
                }}>
                  <Typography color={COLORS.textDim} fontSize={14}>
                    Buscá y agregá ingredientes arriba
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {ingredients.map((ing) => (
                    <Box
                      key={ing.foodItemId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.5,
                        mb: 1,
                        backgroundColor: COLORS.cardLight,
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography color={COLORS.text} fontSize={14} fontWeight={500}>
                          {ing.foodItem.name}
                        </Typography>
                      </Box>
                      <TextField
                        type="number"
                        size="small"
                        value={ing.quantityGrams}
                        onChange={(e) => handleQuantityChange(ing.foodItemId, e.target.value)}
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                        sx={{
                          width: '70px',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: COLORS.card,
                            '& fieldset': { borderColor: COLORS.border },
                          },
                          '& .MuiInputBase-input': {
                            color: COLORS.text,
                            padding: '6px',
                            fontSize: 14,
                          },
                        }}
                      />
                      <Typography color={COLORS.textMuted} fontSize={12}>
                        g
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveIngredient(ing.foodItemId)}
                        sx={{ color: COLORS.red }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Totales */}
            {ingredients.length > 0 && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: COLORS.greenDark,
                borderRadius: 3,
                mb: 3,
              }}>
                <Typography fontSize={12} color={COLORS.text} mb={1.5} fontWeight={600}>
                  📊 TOTALES DE LA RECETA ({totals.totalGrams}g)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${totals.totalCalories} kcal`}
                    size="small"
                    sx={{ 
                      backgroundColor: COLORS.green, 
                      color: '#000',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={`P: ${totals.totalProtein}g`}
                    size="small"
                    sx={{ 
                      backgroundColor: COLORS.protein, 
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={`H: ${totals.totalCarbs}g`}
                    size="small"
                    sx={{ 
                      backgroundColor: COLORS.carbs, 
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={`G: ${totals.totalFat}g`}
                    size="small"
                    sx={{ 
                      backgroundColor: COLORS.fat, 
                      color: '#000',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{
                  flex: 1,
                  py: 1.5,
                  color: COLORS.textMuted,
                  borderColor: COLORS.border,
                  fontWeight: 600,
                  '&:hover': { 
                    borderColor: COLORS.textMuted,
                    backgroundColor: COLORS.cardLight,
                  },
                }}
              >
                ← ATRÁS
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || ingredients.length === 0}
                sx={{
                  flex: 1,
                  py: 1.5,
                  backgroundColor: COLORS.green,
                  color: '#000',
                  fontWeight: 700,
                  '&:hover': { backgroundColor: '#3db892' },
                  '&.Mui-disabled': { 
                    backgroundColor: COLORS.cardLight,
                    color: COLORS.textDim,
                  },
                }}
              >
                {saving ? (
                  <CircularProgress size={20} sx={{ color: '#000' }} />
                ) : editingRecipe ? (
                  'GUARDAR CAMBIOS'
                ) : (
                  'CREAR RECETA ✓'
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NewRecipePage;

