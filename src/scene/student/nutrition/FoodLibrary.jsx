import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { tokens } from '../../../theme';
import { getFoodItems, getCategories, createFoodItem, updateFoodItem, deleteFoodItem } from '../../../api/nutritionApi';

const CATEGORY_LABELS = {
  carnes_pescados: '🥩 Carnes y Pescados',
  frutas_verduras: '🥗 Frutas y Verduras',
  legumbres: '🫘 Legumbres',
  cereales_varios: '🥣 Cereales y Varios',
  lacteos: '🥛 Lácteos',
  aceites_grasas: '🫒 Aceites y Grasas',
  suplementos: '💪 Suplementos',
  otros: '📦 Otros',
};

const FoodLibrary = ({ studentId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'otros',
    proteinPer100g: '',
    carbsPer100g: '',
    fatPer100g: '',
  });

  useEffect(() => {
    loadData();
  }, [studentId]);

  useEffect(() => {
    searchFoods();
  }, [searchText, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [foodsData, categoriesData] = await Promise.all([
        getFoodItems(studentId),
        getCategories(),
      ]);
      setFoods(foodsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = async () => {
    try {
      const filters = {};
      if (searchText) filters.search = searchText;
      if (selectedCategory) filters.category = selectedCategory;
      
      const data = await getFoodItems(studentId, filters);
      setFoods(data);
    } catch (error) {
      console.error('Error searching foods:', error);
    }
  };

  const handleOpenDialog = (food = null) => {
    if (food) {
      setEditingFood(food);
      setFormData({
        name: food.name,
        category: food.category,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
      });
    } else {
      setEditingFood(null);
      setFormData({
        name: '',
        category: 'otros',
        proteinPer100g: '',
        carbsPer100g: '',
        fatPer100g: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFood(null);
    setFormData({
      name: '',
      category: 'otros',
      proteinPer100g: '',
      carbsPer100g: '',
      fatPer100g: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: formData.name,
        category: formData.category,
        proteinPer100g: parseFloat(formData.proteinPer100g) || 0,
        carbsPer100g: parseFloat(formData.carbsPer100g) || 0,
        fatPer100g: parseFloat(formData.fatPer100g) || 0,
      };

      if (editingFood) {
        await updateFoodItem(editingFood.id, data);
      } else {
        await createFoodItem(studentId, data);
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error saving food:', error);
    }
  };

  const handleDelete = async (foodId) => {
    if (window.confirm('¿Estás seguro de eliminar este alimento?')) {
      try {
        await deleteFoodItem(foodId);
        loadData();
      } catch (error) {
        console.error('Error deleting food:', error);
      }
    }
  };

  const calculateCalories = () => {
    const p = parseFloat(formData.proteinPer100g) || 0;
    const c = parseFloat(formData.carbsPer100g) || 0;
    const f = parseFloat(formData.fatPer100g) || 0;
    return ((p * 4) + (c * 4) + (f * 9)).toFixed(1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con búsqueda y botón agregar */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <TextField
          placeholder="Buscar alimento..."
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
            flex: 1,
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              color: colors.grey[100],
              '& fieldset': { borderColor: colors.grey[600] },
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: colors.grey[400] }}>Categoría</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Categoría"
            sx={{
              color: colors.grey[100],
              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.grey[600] },
            }}
          >
            <MenuItem value="">Todas</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {CATEGORY_LABELS[cat.value] || cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: colors.orangeAccent[500],
            '&:hover': { backgroundColor: colors.orangeAccent[600] },
          }}
        >
          Nuevo Alimento
        </Button>
      </Box>

      {/* Lista de alimentos */}
      <Typography variant="body2" color={colors.grey[400]} mb={2}>
        {foods.length} alimentos encontrados
      </Typography>

      <Grid container spacing={2}>
        {foods.map((food) => (
          <Grid item xs={12} sm={6} md={4} key={food.id}>
            <Card
              sx={{
                backgroundColor: colors.primary[600],
                height: '100%',
                '&:hover': {
                  backgroundColor: colors.primary[550],
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold" color={colors.grey[100]}>
                      {food.name}
                    </Typography>
                    <Chip
                      label={CATEGORY_LABELS[food.category] || food.category}
                      size="small"
                      sx={{
                        backgroundColor: colors.primary[500],
                        color: colors.grey[300],
                        fontSize: '10px',
                        mt: 0.5,
                      }}
                    />
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(food)}
                      sx={{ color: colors.blueAccent[400] }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(food.id)}
                      sx={{ color: colors.redAccent[400] }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box mt={2} display="flex" justifyContent="space-between">
                  <Box textAlign="center">
                    <Typography variant="body2" color={colors.blueAccent[400]} fontWeight="bold">
                      {food.proteinPer100g}g
                    </Typography>
                    <Typography variant="caption" color={colors.grey[400]}>P</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="body2" color={colors.orangeAccent[400]} fontWeight="bold">
                      {food.carbsPer100g}g
                    </Typography>
                    <Typography variant="caption" color={colors.grey[400]}>H</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="body2" color={colors.redAccent[400]} fontWeight="bold">
                      {food.fatPer100g}g
                    </Typography>
                    <Typography variant="caption" color={colors.grey[400]}>G</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="body2" color={colors.greenAccent[400]} fontWeight="bold">
                      {food.caloriesPer100g}
                    </Typography>
                    <Typography variant="caption" color={colors.grey[400]}>kcal</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {foods.length === 0 && (
        <Box textAlign="center" p={4}>
          <Typography color={colors.grey[400]}>
            No se encontraron alimentos. ¡Agregá el primero!
          </Typography>
        </Box>
      )}

      {/* Modal personalizado para crear/editar alimento */}
      {dialogOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDialog();
          }}
        >
          <div
            style={{
              backgroundColor: colors.primary[500],
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${colors.grey[700]}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" color={colors.grey[100]} fontWeight="bold">
                {editingFood ? 'Editar Alimento' : 'Nuevo Alimento'}
              </Typography>
              <IconButton onClick={handleCloseDialog} sx={{ color: colors.grey[400] }}>
                ✕
              </IconButton>
            </Box>

            {/* Content */}
            <Box
              sx={{
                p: 2,
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <TextField
                label="Nombre del alimento"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                autoComplete="off"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: colors.grey[100],
                    '& fieldset': { borderColor: colors.grey[600] },
                  },
                  '& .MuiInputLabel-root': { color: colors.grey[400] },
                }}
              />

              {/* Categoría con Chips */}
              <Box>
                <Typography variant="subtitle2" color={colors.grey[400]} mb={1}>
                  Categoría:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categories.map((cat) => (
                    <Chip
                      key={cat.value}
                      label={CATEGORY_LABELS[cat.value] || cat.label}
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      sx={{
                        backgroundColor: formData.category === cat.value
                          ? colors.orangeAccent[600]
                          : colors.primary[600],
                        color: formData.category === cat.value
                          ? '#fff'
                          : colors.grey[300],
                        fontWeight: formData.category === cat.value ? 'bold' : 'normal',
                        '&:hover': {
                          backgroundColor: formData.category === cat.value
                            ? colors.orangeAccent[700]
                            : colors.primary[550],
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Typography variant="subtitle2" color={colors.grey[300]} mt={1}>
                Valores por 100g:
              </Typography>

              <Box display="flex" gap={2} flexWrap="wrap">
                <TextField
                  label="Proteínas (g)"
                  type="number"
                  inputMode="decimal"
                  value={formData.proteinPer100g}
                  onChange={(e) => setFormData({ ...formData, proteinPer100g: e.target.value })}
                  autoComplete="off"
                  sx={{
                    flex: 1,
                    minWidth: '80px',
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': { borderColor: colors.grey[600] },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[400] },
                  }}
                />
                <TextField
                  label="Hidratos (g)"
                  type="number"
                  inputMode="decimal"
                  value={formData.carbsPer100g}
                  onChange={(e) => setFormData({ ...formData, carbsPer100g: e.target.value })}
                  autoComplete="off"
                  sx={{
                    flex: 1,
                    minWidth: '80px',
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': { borderColor: colors.grey[600] },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[400] },
                  }}
                />
                <TextField
                  label="Grasas (g)"
                  type="number"
                  inputMode="decimal"
                  value={formData.fatPer100g}
                  onChange={(e) => setFormData({ ...formData, fatPer100g: e.target.value })}
                  autoComplete="off"
                  sx={{
                    flex: 1,
                    minWidth: '80px',
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': { borderColor: colors.grey[600] },
                    },
                    '& .MuiInputLabel-root': { color: colors.grey[400] },
                  }}
                />
              </Box>

              <Card sx={{ backgroundColor: colors.primary[600] }}>
                <CardContent>
                  <Typography variant="body2" color={colors.grey[400]}>
                    Calorías calculadas:
                  </Typography>
                  <Typography variant="h5" color={colors.greenAccent[400]} fontWeight="bold">
                    {calculateCalories()} kcal / 100g
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${colors.grey[700]}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              <Button onClick={handleCloseDialog} sx={{ color: colors.grey[300] }}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={!formData.name}
                sx={{
                  backgroundColor: colors.orangeAccent[500],
                  '&:hover': { backgroundColor: colors.orangeAccent[600] },
                }}
              >
                {editingFood ? 'Guardar' : 'Crear'}
              </Button>
            </Box>
          </div>
        </div>
      )}
    </Box>
  );
};

export default FoodLibrary;

