import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  InputAdornment,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { tokens } from '../../../theme';
import { getFoodItems, createRecipe, updateRecipe } from '../../../api/nutritionApi';

const CreateRecipeModal = ({ open, onClose, studentId, editingRecipe, onSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: info básica, 2: ingredientes

  useEffect(() => {
    if (open) {
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
      } else {
        resetForm();
      }
    }
  }, [open, editingRecipe]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setIngredients([]);
    setSearchTerm('');
    setStep(1);
    setError(null);
  };

  const loadFoodItems = async () => {
    try {
      setLoading(true);
      const data = await getFoodItems(studentId);
      setFoodItems(data);
    } catch (err) {
      setError('Error al cargar alimentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = (foodItem) => {
    // Verificar si ya está agregado
    if (ingredients.some((i) => i.foodItemId === foodItem.id)) {
      return;
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

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
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

      let result;
      if (editingRecipe) {
        result = await updateRecipe(editingRecipe.id, recipeData);
      } else {
        result = await createRecipe(studentId, recipeData);
      }

      onSuccess(result);
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
    .slice(0, 10);

  const totals = calculateTotals();

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Backdrop */}
      <Box
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
        }}
      />

      {/* Modal */}
      <Box
        sx={{
          position: 'relative',
          marginTop: isMobile ? '0' : '5vh',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: isMobile ? '100%' : '90%',
          maxWidth: '600px',
          height: isMobile ? '100%' : 'auto',
          maxHeight: isMobile ? '100%' : '90vh',
          backgroundColor: colors.primary[500],
          borderRadius: isMobile ? 0 : '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: `1px solid ${colors.grey[700]}`,
          }}
        >
          <Typography variant="h5" fontWeight="bold" color={colors.grey[100]}>
            {editingRecipe ? '✏️ Editar Receta' : '🍳 Nueva Receta'}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: colors.grey[300] }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Paso 1: Info básica */}
          {step === 1 && (
            <Box>
              <TextField
                fullWidth
                label="Nombre de la receta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Pancakes proteicos"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.primary[400],
                  },
                  '& .MuiInputLabel-root': { color: colors.grey[400] },
                  '& .MuiInputBase-input': { color: colors.grey[100] },
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu receta..."
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.primary[400],
                  },
                  '& .MuiInputLabel-root': { color: colors.grey[400] },
                  '& .MuiInputBase-input': { color: colors.grey[100] },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                sx={{
                  backgroundColor: colors.orangeAccent[500],
                  py: 1.5,
                  fontWeight: 'bold',
                }}
              >
                Siguiente: Agregar Ingredientes
              </Button>
            </Box>
          )}

          {/* Paso 2: Ingredientes */}
          {step === 2 && (
            <Box>
              <Button
                size="small"
                onClick={() => setStep(1)}
                sx={{ mb: 2, color: colors.grey[300] }}
              >
                ← Volver a editar nombre
              </Button>

              {/* Buscar alimento */}
              <Typography variant="subtitle2" color={colors.grey[300]} mb={1}>
                Buscar alimento para agregar:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.primary[400],
                  },
                  '& .MuiInputBase-input': { color: colors.grey[100] },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.grey[400] }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Lista de alimentos filtrados */}
              {searchTerm && (
                <Box
                  sx={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    mb: 2,
                    border: `1px solid ${colors.grey[700]}`,
                    borderRadius: '4px',
                  }}
                >
                  {loading ? (
                    <Box p={2} textAlign="center">
                      <CircularProgress size={20} />
                    </Box>
                  ) : filteredFoods.length === 0 ? (
                    <Typography p={2} color={colors.grey[500]} textAlign="center">
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
                          borderBottom: `1px solid ${colors.grey[700]}`,
                          '&:hover': {
                            backgroundColor: colors.primary[400],
                          },
                          '&:last-child': {
                            borderBottom: 'none',
                          },
                        }}
                      >
                        <Typography color={colors.grey[100]} fontSize="14px">
                          {food.name}
                        </Typography>
                        <Typography color={colors.grey[500]} fontSize="12px">
                          {food.caloriesPer100g} kcal | P: {food.proteinPer100g}g | G: {food.fatPer100g}g | H: {food.carbsPer100g}g
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              )}

              <Divider sx={{ my: 2, borderColor: colors.grey[700] }} />

              {/* Ingredientes agregados */}
              <Typography variant="subtitle2" color={colors.grey[300]} mb={1}>
                Ingredientes ({ingredients.length}):
              </Typography>

              {ingredients.length === 0 ? (
                <Typography color={colors.grey[500]} textAlign="center" py={3}>
                  Buscá y agregá ingredientes arriba
                </Typography>
              ) : (
                <Box sx={{ mb: 2 }}>
                  {ingredients.map((ing) => (
                    <Box
                      key={ing.foodItemId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        mb: 1,
                        backgroundColor: colors.primary[400],
                        borderRadius: '8px',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography color={colors.grey[100]} fontSize="14px">
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
                          width: '80px',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: colors.primary[500],
                          },
                          '& .MuiInputBase-input': {
                            color: colors.grey[100],
                            padding: '8px',
                          },
                        }}
                      />
                      <Typography color={colors.grey[400]} fontSize="12px">
                        g
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveIngredient(ing.foodItemId)}
                        sx={{ color: colors.redAccent[400] }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Totales */}
              {ingredients.length > 0 && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: colors.greenAccent[900],
                    borderRadius: '8px',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2" color={colors.grey[100]} mb={1}>
                    📊 Totales de la receta ({totals.totalGrams}g):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${totals.totalCalories} kcal`}
                      size="small"
                      sx={{ backgroundColor: colors.greenAccent[700], color: '#fff' }}
                    />
                    <Chip
                      label={`P: ${totals.totalProtein}g`}
                      size="small"
                      sx={{ backgroundColor: colors.blueAccent[700], color: '#fff' }}
                    />
                    <Chip
                      label={`G: ${totals.totalFat}g`}
                      size="small"
                      sx={{ backgroundColor: colors.redAccent[700], color: '#fff' }}
                    />
                    <Chip
                      label={`H: ${totals.totalCarbs}g`}
                      size="small"
                      sx={{ backgroundColor: colors.orangeAccent[700], color: '#fff' }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Footer */}
        {step === 2 && (
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${colors.grey[700]}`,
              display: 'flex',
              gap: 2,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{
                color: colors.grey[300],
                borderColor: colors.grey[600],
              }}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              disabled={saving || ingredients.length === 0}
              sx={{
                backgroundColor: colors.greenAccent[600],
                fontWeight: 'bold',
              }}
            >
              {saving ? <CircularProgress size={20} /> : editingRecipe ? 'Guardar Cambios' : 'Crear Receta'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CreateRecipeModal;

