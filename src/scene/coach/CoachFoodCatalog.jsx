import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as FoodIcon,
  Public as GlobalIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  getCoachFoodItems,
  createCoachFoodItem,
  updateCoachFoodItem,
  deleteCoachFoodItem,
  initializeCoachCatalog,
  getCategories,
} from '../../api/nutritionApi';

const CATEGORY_LABELS = {
  carnes_pescados: '🥩 Carnes y Pescados',
  frutas_verduras: '🥗 Frutas y Verduras',
  legumbres: '🫘 Legumbres',
  cereales_varios: '🌾 Cereales',
  lacteos: '🥛 Lácteos',
  aceites_grasas: '🫒 Aceites y Grasas',
  suplementos: '💊 Suplementos',
  otros: '📦 Otros',
};

const CoachFoodCatalog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'otros',
    carbsPer100g: '',
    proteinPer100g: '',
    fatPer100g: '',
    portionGrams: 100,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFoods();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [foodsData, categoriesData] = await Promise.all([
        getCoachFoodItems(),
        getCategories(),
      ]);
      setFoods(foodsData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Error al cargar el catálogo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFoods = async () => {
    try {
      const data = await getCoachFoodItems({
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
      });
      setFoods(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (food = null) => {
    if (food) {
      setEditingFood(food);
      setFormData({
        name: food.name,
        category: food.category,
        carbsPer100g: food.carbsPer100g,
        proteinPer100g: food.proteinPer100g,
        fatPer100g: food.fatPer100g,
        portionGrams: food.portionGrams,
      });
    } else {
      setEditingFood(null);
      setFormData({
        name: '',
        category: 'otros',
        carbsPer100g: '',
        proteinPer100g: '',
        fatPer100g: '',
        portionGrams: 100,
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingFood(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const payload = {
        ...formData,
        carbsPer100g: parseFloat(formData.carbsPer100g) || 0,
        proteinPer100g: parseFloat(formData.proteinPer100g) || 0,
        fatPer100g: parseFloat(formData.fatPer100g) || 0,
        portionGrams: parseInt(formData.portionGrams) || 100,
      };

      if (editingFood) {
        await updateCoachFoodItem(editingFood.id, payload);
        setSuccess('Alimento actualizado');
      } else {
        await createCoachFoodItem(payload);
        setSuccess('Alimento creado');
      }

      handleCloseModal();
      loadFoods();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar';
      setError(msg);
    }
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm('¿Eliminar este alimento del catálogo?')) return;
    
    try {
      await deleteCoachFoodItem(foodId);
      setSuccess('Alimento eliminado');
      loadFoods();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  const calculateCalories = () => {
    const p = parseFloat(formData.proteinPer100g) || 0;
    const c = parseFloat(formData.carbsPer100g) || 0;
    const f = parseFloat(formData.fatPer100g) || 0;
    return ((p * 4) + (c * 4) + (f * 9)).toFixed(0);
  };

  const handleInitialize = async () => {
    if (!window.confirm('¿Inicializar el catálogo con ~60 alimentos predefinidos?')) return;
    
    try {
      setInitializing(true);
      setError('');
      const result = await initializeCoachCatalog();
      setSuccess(`✅ Se crearon ${result.created} alimentos en tu catálogo`);
      loadFoods();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al inicializar';
      setError(msg);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff', mb: 1 }}>
          🍽️ Mi Catálogo de Alimentos
        </Typography>
        <Typography variant="body2" sx={{ color: '#aaa' }}>
          Estos alimentos estarán disponibles para <strong>todos tus alumnos</strong>
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
      )}

      {/* Filtros y Agregar */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3, 
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <TextField
          placeholder="Buscar alimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 200, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#aaa' }} />
              </InputAdornment>
            ),
            sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#aaa' }}>Categoría</InputLabel>
          <Select
            value={categoryFilter}
            label="Categoría"
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }}
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
          onClick={() => handleOpenModal()}
          sx={{
            bgcolor: '#ff9800',
            '&:hover': { bgcolor: '#f57c00' },
          }}
        >
          Nuevo Alimento
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Chip
          icon={<GlobalIcon />}
          label={`${foods.length} alimentos en tu catálogo`}
          sx={{ bgcolor: 'rgba(255,152,0,0.2)', color: '#ff9800' }}
        />
      </Box>

      {/* Lista de Alimentos */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#ff9800' }} />
        </Box>
      ) : foods.length === 0 ? (
        <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 4, textAlign: 'center' }}>
          <FoodIcon sx={{ fontSize: 60, color: '#666', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#aaa' }}>
            No hay alimentos en tu catálogo
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
            Agregá alimentos para que tus alumnos los puedan usar
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={initializing ? <CircularProgress size={20} color="inherit" /> : <FoodIcon />}
              onClick={handleInitialize}
              disabled={initializing}
              sx={{ 
                bgcolor: '#4caf50', 
                '&:hover': { bgcolor: '#388e3c' },
                minWidth: 200,
              }}
            >
              {initializing ? 'Cargando...' : '🚀 Cargar 60+ alimentos base'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
              sx={{ color: '#ff9800', borderColor: '#ff9800' }}
            >
              Agregar manualmente
            </Button>
          </Box>
          
          <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 2 }}>
            💡 Los alimentos base incluyen carnes, frutas, verduras, cereales y más
          </Typography>
        </Card>
      ) : isMobile ? (
        // ========== VISTA MOBILE: CARDS ==========
        <Grid container spacing={2}>
          {foods.map((food) => (
            <Grid item xs={12} sm={6} key={food.id}>
              <Card sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,152,0,0.3)',
                '&:hover': { borderColor: '#ff9800' },
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#fff' }}>
                      {food.name}
                    </Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenModal(food)}>
                        <EditIcon sx={{ fontSize: 18, color: '#aaa' }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(food.id)}>
                        <DeleteIcon sx={{ fontSize: 18, color: '#f44336' }} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Chip
                    label={CATEGORY_LABELS[food.category] || food.category}
                    size="small"
                    sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)', color: '#aaa' }}
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#888' }}>Prot</Typography>
                      <Typography variant="body2" sx={{ color: '#4fc3f7' }}>{food.proteinPer100g}g</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#888' }}>Carbs</Typography>
                      <Typography variant="body2" sx={{ color: '#ffb74d' }}>{food.carbsPer100g}g</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#888' }}>Grasas</Typography>
                      <Typography variant="body2" sx={{ color: '#f48fb1' }}>{food.fatPer100g}g</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#888' }}>Kcal</Typography>
                      <Typography variant="body2" sx={{ color: '#fff' }}>{food.caloriesPer100g}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // ========== VISTA DESKTOP: TABLA ==========
        <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(255,152,0,0.1)' }}>
                <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>Alimento</TableCell>
                <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>Categoría</TableCell>
                <TableCell align="center" sx={{ color: '#4fc3f7', fontWeight: 'bold' }}>Prot (g)</TableCell>
                <TableCell align="center" sx={{ color: '#ffb74d', fontWeight: 'bold' }}>Carbs (g)</TableCell>
                <TableCell align="center" sx={{ color: '#f48fb1', fontWeight: 'bold' }}>Grasas (g)</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>Kcal</TableCell>
                <TableCell align="center" sx={{ color: '#aaa' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {foods.map((food) => (
                <TableRow 
                  key={food.id}
                  sx={{ 
                    '&:hover': { bgcolor: 'rgba(255,152,0,0.05)' },
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{food.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={CATEGORY_LABELS[food.category]?.split(' ')[0] || food.category}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#aaa', fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#4fc3f7' }}>{food.proteinPer100g}</TableCell>
                  <TableCell align="center" sx={{ color: '#ffb74d' }}>{food.carbsPer100g}</TableCell>
                  <TableCell align="center" sx={{ color: '#f48fb1' }}>{food.fatPer100g}</TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 500 }}>{food.caloriesPer100g}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenModal(food)}>
                        <EditIcon sx={{ fontSize: 18, color: '#aaa' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => handleDelete(food.id)}>
                        <DeleteIcon sx={{ fontSize: 18, color: '#f44336' }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Crear/Editar */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a1a2e', color: '#fff' }}>
          {editingFood ? '✏️ Editar Alimento' : '➕ Nuevo Alimento'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1a1a2e' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nombre del alimento"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#aaa' } }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#aaa' }}>Categoría</InputLabel>
              <Select
                value={formData.category}
                label="Categoría"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                sx={{ color: '#fff' }}
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" sx={{ color: '#ff9800', mt: 1 }}>
              Valores por cada 100g:
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField
                label="Proteínas (g)"
                type="number"
                value={formData.proteinPer100g}
                onChange={(e) => setFormData({ ...formData, proteinPer100g: e.target.value })}
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{ sx: { color: '#4fc3f7' } }}
                InputLabelProps={{ sx: { color: '#aaa' } }}
              />
              <TextField
                label="Carbos (g)"
                type="number"
                value={formData.carbsPer100g}
                onChange={(e) => setFormData({ ...formData, carbsPer100g: e.target.value })}
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{ sx: { color: '#ffb74d' } }}
                InputLabelProps={{ sx: { color: '#aaa' } }}
              />
              <TextField
                label="Grasas (g)"
                type="number"
                value={formData.fatPer100g}
                onChange={(e) => setFormData({ ...formData, fatPer100g: e.target.value })}
                inputProps={{ min: 0, step: 0.1 }}
                InputProps={{ sx: { color: '#f48fb1' } }}
                InputLabelProps={{ sx: { color: '#aaa' } }}
              />
            </Box>

            <Box sx={{ 
              bgcolor: 'rgba(255,152,0,0.1)', 
              p: 2, 
              borderRadius: 1,
              textAlign: 'center',
            }}>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                Calorías calculadas:
              </Typography>
              <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {calculateCalories()} kcal
              </Typography>
            </Box>

            <TextField
              label="Porción estándar (g)"
              type="number"
              value={formData.portionGrams}
              onChange={(e) => setFormData({ ...formData, portionGrams: e.target.value })}
              inputProps={{ min: 1 }}
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#aaa' } }}
              helperText="Porción sugerida para el alumno"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1a1a2e', p: 2 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#aaa' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name}
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
          >
            {editingFood ? 'Guardar Cambios' : 'Crear Alimento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoachFoodCatalog;

